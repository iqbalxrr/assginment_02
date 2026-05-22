import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as issuesService from './issues.service';
import { sendSuccess } from '../../utils/response';
import { BadRequestError } from '../../utils/errors';
import { IssuesFilters } from './issues.interface';

/**
 * Handles creating a new issue.
 */
export async function createIssueHandler(req: Request, res: Response): Promise<void> {
  const { title, description, type } = req.body;
  
  if (!req.user || !req.user.id) {
    throw new BadRequestError('User details missing from authenticated request');
  }

  const issue = await issuesService.createIssue({
    title,
    description,
    type,
    reporter_id: req.user.id,
  });

  sendSuccess(res, issue, 'Issue created successfully', StatusCodes.CREATED);
}

/**
 * Handles fetching all issues.
 */
export async function getAllIssuesHandler(req: Request, res: Response): Promise<void> {
  const { sort, type, status } = req.query;

  // Type assertions/validations for filters
  const filters: IssuesFilters = {};
  
  if (sort === 'newest' || sort === 'oldest') {
    filters.sort = sort;
  }
  
  if (type === 'bug' || type === 'feature_request') {
    filters.type = type;
  }

  if (status === 'open' || status === 'in_progress' || status === 'resolved') {
    filters.status = status;
  }

  const issues = await issuesService.getAllIssues(filters);
  sendSuccess(res, issues);
}

/**
 * Handles fetching a single issue by ID.
 */
export async function getIssueByIdHandler(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    throw new BadRequestError('Issue ID must be a valid integer');
  }

  const issue = await issuesService.getIssueById(id);
  sendSuccess(res, issue);
}

/**
 * Handles updating an issue.
 */
export async function updateIssueHandler(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    throw new BadRequestError('Issue ID must be a valid integer');
  }

  if (!req.user) {
    throw new BadRequestError('User details missing from authenticated request');
  }

  const { title, description, type, status } = req.body;

  const updatedIssue = await issuesService.updateIssue(
    id,
    { title, description, type, status },
    req.user
  );

  sendSuccess(res, updatedIssue, 'Issue updated successfully');
}

/**
 * Handles deleting an issue.
 */
export async function deleteIssueHandler(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    throw new BadRequestError('Issue ID must be a valid integer');
  }

  if (!req.user) {
    throw new BadRequestError('User details missing from authenticated request');
  }

  await issuesService.deleteIssue(id, req.user);
  sendSuccess(res, null, 'Issue deleted successfully');
}
