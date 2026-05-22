export interface IssuePayload {
  id: number;
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
  status: 'open' | 'in_progress' | 'resolved';
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface IssueWithReporterPayload {
  id: number;
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
  status: 'open' | 'in_progress' | 'resolved';
  reporter: {
    id: number;
    name: string;
    role: 'contributor' | 'maintainer';
  };
  created_at: Date;
  updated_at: Date;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
  reporter_id: number;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  type?: 'bug' | 'feature_request';
  status?: 'open' | 'in_progress' | 'resolved';
}

export interface IssuesFilters {
  sort?: 'newest' | 'oldest';
  type?: 'bug' | 'feature_request';
  status?: 'open' | 'in_progress' | 'resolved';
}
