import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { CreateIssueBody, UpdateIssueBody } from '../types';

const router = Router();

// GET /api/issues - list all issues with labels
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, priority, search } = req.query;

    let query = `
      SELECT
        i.*,
        COALESCE(
          json_agg(
            json_build_object('id', l.id, 'name', l.name, 'color', l.color)
          ) FILTER (WHERE l.id IS NOT NULL),
          '[]'
        ) AS labels
      FROM issues i
      LEFT JOIN issue_labels il ON il.issue_id = i.id
      LEFT JOIN labels l ON l.id = il.label_id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (status) {
      params.push(status);
      query += ` AND i.status = $${params.length}`;
    }
    if (priority) {
      params.push(priority);
      query += ` AND i.priority = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (i.title ILIKE $${params.length} OR i.description ILIKE $${params.length})`;
    }

    query += ` GROUP BY i.id ORDER BY i.sequence_number ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/issues/:id - get single issue with labels and comments
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const issueResult = await pool.query(
      `SELECT
        i.*,
        COALESCE(
          json_agg(
            json_build_object('id', l.id, 'name', l.name, 'color', l.color)
          ) FILTER (WHERE l.id IS NOT NULL),
          '[]'
        ) AS labels
      FROM issues i
      LEFT JOIN issue_labels il ON il.issue_id = i.id
      LEFT JOIN labels l ON l.id = il.label_id
      WHERE i.id = $1
      GROUP BY i.id`,
      [id]
    );

    if (issueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const commentsResult = await pool.query(
      `SELECT * FROM comments WHERE issue_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    const issue = {
      ...issueResult.rows[0],
      comments: commentsResult.rows,
    };

    res.json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/issues - create issue
router.post('/', async (req: Request<object, object, CreateIssueBody>, res: Response) => {
  const client = await pool.connect();
  try {
    const { title, description = '', status = 'backlog', priority = 'no_priority', label_ids = [] } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    await client.query('BEGIN');

    // Get team (use first team)
    const teamResult = await client.query('SELECT * FROM teams LIMIT 1');
    if (teamResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(500).json({ error: 'No team found' });
    }
    const team = teamResult.rows[0];

    // Get next sequence number
    const seqResult = await client.query(
      'SELECT COALESCE(MAX(sequence_number), 0) + 1 AS next_seq FROM issues WHERE team_id = $1',
      [team.id]
    );
    const seqNumber = seqResult.rows[0].next_seq;
    const identifier = `${team.identifier}-${seqNumber}`;

    const issueResult = await client.query(
      `INSERT INTO issues (identifier, title, description, status, priority, team_id, sequence_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [identifier, title.trim(), description, status, priority, team.id, seqNumber]
    );

    const issue = issueResult.rows[0];

    if (label_ids.length > 0) {
      const labelValues = label_ids.map((lid, idx) => `($1, $${idx + 2})`).join(', ');
      await client.query(
        `INSERT INTO issue_labels (issue_id, label_id) VALUES ${labelValues} ON CONFLICT DO NOTHING`,
        [issue.id, ...label_ids]
      );
    }

    await client.query('COMMIT');

    // Return with labels
    const fullIssue = await pool.query(
      `SELECT i.*,
        COALESCE(json_agg(json_build_object('id', l.id, 'name', l.name, 'color', l.color)) FILTER (WHERE l.id IS NOT NULL), '[]') AS labels
       FROM issues i
       LEFT JOIN issue_labels il ON il.issue_id = i.id
       LEFT JOIN labels l ON l.id = il.label_id
       WHERE i.id = $1
       GROUP BY i.id`,
      [issue.id]
    );

    res.status(201).json(fullIssue.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PUT /api/issues/:id - update issue
router.put('/:id', async (req: Request<{ id: string }, object, UpdateIssueBody>, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { title, description, status, priority, label_ids } = req.body;

    await client.query('BEGIN');

    // Build dynamic update
    const updates: string[] = ['updated_at = NOW()'];
    const params: unknown[] = [];

    if (title !== undefined) {
      params.push(title.trim());
      updates.push(`title = $${params.length}`);
    }
    if (description !== undefined) {
      params.push(description);
      updates.push(`description = $${params.length}`);
    }
    if (status !== undefined) {
      params.push(status);
      updates.push(`status = $${params.length}`);
    }
    if (priority !== undefined) {
      params.push(priority);
      updates.push(`priority = $${params.length}`);
    }

    params.push(id);
    const result = await client.query(
      `UPDATE issues SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (label_ids !== undefined) {
      await client.query('DELETE FROM issue_labels WHERE issue_id = $1', [id]);
      if (label_ids.length > 0) {
        const labelValues = label_ids.map((lid, idx) => `($1, $${idx + 2})`).join(', ');
        await client.query(
          `INSERT INTO issue_labels (issue_id, label_id) VALUES ${labelValues} ON CONFLICT DO NOTHING`,
          [id, ...label_ids]
        );
      }
    }

    await client.query('COMMIT');

    const fullIssue = await pool.query(
      `SELECT i.*,
        COALESCE(json_agg(json_build_object('id', l.id, 'name', l.name, 'color', l.color)) FILTER (WHERE l.id IS NOT NULL), '[]') AS labels
       FROM issues i
       LEFT JOIN issue_labels il ON il.issue_id = i.id
       LEFT JOIN labels l ON l.id = il.label_id
       WHERE i.id = $1
       GROUP BY i.id`,
      [id]
    );

    res.json(fullIssue.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// DELETE /api/issues/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM issues WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json({ message: 'Issue deleted', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/issues/:id/comments
router.post('/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { body, author_name = 'You' } = req.body;

    if (!body?.trim()) {
      return res.status(400).json({ error: 'Comment body is required' });
    }

    const issueExists = await pool.query('SELECT id FROM issues WHERE id = $1', [id]);
    if (issueExists.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const result = await pool.query(
      'INSERT INTO comments (issue_id, body, author_name) VALUES ($1, $2, $3) RETURNING *',
      [id, body.trim(), author_name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
