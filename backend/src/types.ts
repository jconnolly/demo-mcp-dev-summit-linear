export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
export type IssuePriority = 'no_priority' | 'urgent' | 'high' | 'medium' | 'low';

export interface Team {
  id: number;
  name: string;
  identifier: string;
  created_at: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  team_id: number;
}

export interface Issue {
  id: number;
  identifier: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  team_id: number;
  sequence_number: number;
  created_at: string;
  updated_at: string;
  labels?: Label[];
}

export interface Comment {
  id: number;
  issue_id: number;
  body: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIssueBody {
  title: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  label_ids?: number[];
}

export interface UpdateIssueBody {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  label_ids?: number[];
}
