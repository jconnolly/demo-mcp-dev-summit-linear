import { pool } from './pool';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        identifier VARCHAR(10) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS labels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE issue_status AS ENUM (
          'backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'
        );
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE issue_priority AS ENUM (
          'no_priority', 'urgent', 'high', 'medium', 'low'
        );
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        identifier VARCHAR(20) NOT NULL UNIQUE,
        title VARCHAR(500) NOT NULL,
        description TEXT DEFAULT '',
        status issue_status NOT NULL DEFAULT 'backlog',
        priority issue_priority NOT NULL DEFAULT 'no_priority',
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        sequence_number INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS issue_labels (
        issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
        label_id INTEGER REFERENCES labels(id) ON DELETE CASCADE,
        PRIMARY KEY (issue_id, label_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        author_name VARCHAR(100) NOT NULL DEFAULT 'You',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Seed default team
    await client.query(`
      INSERT INTO teams (name, identifier)
      VALUES ('Engineering', 'ENG')
      ON CONFLICT (identifier) DO NOTHING;
    `);

    // Seed default labels
    await client.query(`
      INSERT INTO labels (name, color, team_id)
      SELECT l.name, l.color, t.id
      FROM (VALUES
        ('Bug', '#EB5757'),
        ('Feature', '#26B5CE'),
        ('Improvement', '#4CB782'),
        ('Documentation', '#F2994A'),
        ('Design', '#9B51E0')
      ) AS l(name, color)
      CROSS JOIN teams t WHERE t.identifier = 'ENG'
      ON CONFLICT DO NOTHING;
    `);

    // Seed sample issues
    await client.query(`
      INSERT INTO issues (identifier, title, description, status, priority, team_id, sequence_number)
      SELECT i.identifier, i.title, i.description, i.status::issue_status, i.priority::issue_priority, t.id, i.seq
      FROM (VALUES
        ('ENG-1', 'Set up authentication flow', 'Implement JWT-based auth with refresh tokens. Need login, logout, and token refresh endpoints.', 'in_progress', 'high', 1),
        ('ENG-2', 'Design system: Button component', 'Create reusable Button component with all variants: primary, secondary, ghost, danger.', 'todo', 'medium', 2),
        ('ENG-3', 'Fix memory leak in WebSocket handler', 'Production is showing increasing memory usage. Traced to WebSocket connections not being cleaned up.', 'in_progress', 'urgent', 3),
        ('ENG-4', 'Add pagination to issues API', 'The issues endpoint returns all records. Add cursor-based pagination.', 'backlog', 'medium', 4),
        ('ENG-5', 'Update onboarding documentation', 'The README is outdated. Update with new setup steps and environment variables.', 'done', 'low', 5),
        ('ENG-6', 'Migrate to Postgres 16', 'Current Postgres 14 reaches EOL. Plan and execute migration to Postgres 16.', 'backlog', 'high', 6),
        ('ENG-7', 'Add dark mode support', 'Users have requested dark mode. Implement using CSS custom properties.', 'todo', 'medium', 7),
        ('ENG-8', 'Performance audit: dashboard load time', 'Dashboard takes 4s to load. Profile and optimize to under 1s.', 'cancelled', 'high', 8)
      ) AS i(identifier, title, description, status, priority, seq)
      CROSS JOIN teams t WHERE t.identifier = 'ENG'
      ON CONFLICT (identifier) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
