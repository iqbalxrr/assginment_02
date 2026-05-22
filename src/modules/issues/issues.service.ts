import { pool } from '../../db';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '../../utils/errors';
import {
  CreateIssueInput,
  IssuePayload,
  IssuesFilters,
  IssueWithReporterPayload,
  UpdateIssueInput,
} from './issues.interface';

type QueryValue = string | number | string[];

/**
 * Creates a new issue in the database.
 */
export async function createIssue(input: CreateIssueInput): Promise<IssuePayload> {
  const { title, description, type, reporter_id } = input;

  // Validate reporter_id exists
  const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [reporter_id]);
  if (userCheck.rows.length === 0) {
    throw new BadRequestError(`Reporter user with ID ${reporter_id} does not exist`);
  }

  const queryText = `
    INSERT INTO issues (title, description, type, status, reporter_id)
    VALUES ($1, $2, $3, 'open', $4)
    RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
  `;
  const result = await pool.query(queryText, [title.trim(), description.trim(), type, reporter_id]);
  
  return result.rows[0];
}

/**
 * Retrieves all issues with optional filtering and sorting.
 * Implements in-memory user joining to satisfy strict No-JOIN raw SQL requirements.
 */
export async function getAllIssues(filters: IssuesFilters): Promise<IssueWithReporterPayload[]> {
  const { sort = 'newest', type, status } = filters;

  let queryText = 'SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues';
  const queryParams: QueryValue[] = [];
  const whereClauses: string[] = [];

  if (type) {
    queryParams.push(type);
    whereClauses.push(`type = $${queryParams.length}`);
  }

  if (status) {
    queryParams.push(status);
    whereClauses.push(`status = $${queryParams.length}`);
  }

  if (whereClauses.length > 0) {
    queryText += ' WHERE ' + whereClauses.join(' AND ');
  }

  if (sort === 'oldest') {
    queryText += ' ORDER BY created_at ASC';
  } else {
    queryText += ' ORDER BY created_at DESC';
  }

  const issuesResult = await pool.query(queryText, queryParams);
  const issues = issuesResult.rows as IssuePayload[];

  if (issues.length === 0) {
    return [];
  }

  // 1. Gather all unique reporter IDs
  const reporterIds = Array.from(new Set(issues.map(i => i.reporter_id)));

  // 2. Fetch reporter details in a batch query (No JOINs allowed)
  const usersQuery = `
    SELECT id, name, role 
    FROM users 
    WHERE id = ANY($1)
  `;
  const usersResult = await pool.query(usersQuery, [reporterIds]);
  
  // 3. Map user records by their ID for O(1) lookup
  const usersMap = new Map<number, { id: number; name: string; role: 'contributor' | 'maintainer' }>();
  usersResult.rows.forEach(u => {
    usersMap.set(u.id, {
      id: u.id,
      name: u.name,
      role: u.role,
    });
  });

  // 4. Merge details in-memory
  return issues.map(issue => {
    const reporter = usersMap.get(issue.reporter_id) || {
      id: issue.reporter_id,
      name: 'Unknown User',
      role: 'contributor' as const,
    };

    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };
  });
}

/**
 * Retrieves a single issue by ID and merges reporter details in-memory.
 */
export async function getIssueById(id: number): Promise<IssueWithReporterPayload> {
  const issueQuery = 'SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues WHERE id = $1';
  const issueResult = await pool.query(issueQuery, [id]);

  if (issueResult.rows.length === 0) {
    throw new NotFoundError(`Issue with ID ${id} not found`);
  }

  const issue = issueResult.rows[0] as IssuePayload;

  // Fetch reporter details (No JOINs allowed)
  const userQuery = 'SELECT id, name, role FROM users WHERE id = $1';
  const userResult = await pool.query(userQuery, [issue.reporter_id]);

  const reporter = userResult.rows.length > 0
    ? userResult.rows[0]
    : { id: issue.reporter_id, name: 'Unknown User', role: 'contributor' };

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
}

/**
 * Updates an issue according to user authorization levels.
 */
export async function updateIssue(
  id: number,
  input: UpdateIssueInput,
  user: { id: number; role: 'contributor' | 'maintainer' }
): Promise<IssuePayload> {
  const { title, description, type, status } = input;

  // 1. Fetch current issue details to check permissions and status
  const findQuery = 'SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues WHERE id = $1';
  const findResult = await pool.query(findQuery, [id]);

  if (findResult.rows.length === 0) {
    throw new NotFoundError(`Issue with ID ${id} not found`);
  }

  const issue = findResult.rows[0] as IssuePayload;

  // 2. Enforce Role-based permissions
  if (user.role === 'contributor') {
    // Contributor can only update their own issue
    if (issue.reporter_id !== user.id) {
      throw new ForbiddenError('You can only update your own issues');
    }

    // Contributor can only update if status is 'open'
    if (issue.status !== 'open') {
      throw new ConflictError('Cannot update issue that has already been started or resolved');
    }

    // Contributor cannot change the workflow status
    if (status !== undefined && status !== issue.status) {
      throw new ForbiddenError('Only maintainers can update issue workflow status');
    }
  }

  // 3. Construct update query dynamically
  const fields: string[] = [];
  const values: QueryValue[] = [];

  if (title !== undefined) {
    values.push(title.trim());
    fields.push(`title = $${values.length}`);
  }

  if (description !== undefined) {
    values.push(description.trim());
    fields.push(`description = $${values.length}`);
  }

  if (type !== undefined) {
    values.push(type);
    fields.push(`type = $${values.length}`);
  }

  // Maintainers are allowed to change the status
  if (status !== undefined && user.role === 'maintainer') {
    values.push(status);
    fields.push(`status = $${values.length}`);
  }

  // If no fields are being updated, return the existing issue
  if (fields.length === 0) {
    return issue;
  }

  // Add issue id as the last parameter
  values.push(id);
  const updateQuery = `
    UPDATE issues
    SET ${fields.join(', ')}
    WHERE id = $${values.length}
    RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
  `;

  const updateResult = await pool.query(updateQuery, values);
  return updateResult.rows[0];
}

/**
 * Permanently deletes an issue (Maintainers only).
 */
export async function deleteIssue(id: number, user: { id: number; role: 'contributor' | 'maintainer' }): Promise<void> {
  // double check role (middleware enforces this as well)
  if (user.role !== 'maintainer') {
    throw new ForbiddenError('Only maintainers are authorized to delete issues');
  }

  const findQuery = 'SELECT id FROM issues WHERE id = $1';
  const findResult = await pool.query(findQuery, [id]);

  if (findResult.rows.length === 0) {
    throw new NotFoundError(`Issue with ID ${id} not found`);
  }

  const deleteQuery = 'DELETE FROM issues WHERE id = $1';
  await pool.query(deleteQuery, [id]);
}
