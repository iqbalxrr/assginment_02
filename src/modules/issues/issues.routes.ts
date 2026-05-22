import { Router } from 'express';
import {
  createIssueHandler,
  getAllIssuesHandler,
  getIssueByIdHandler,
  updateIssueHandler,
  deleteIssueHandler,
} from './issues.controller';
import { requireAuth, requireMaintainer } from '../../middleware/auth';
import { validateCreateIssue, validateUpdateIssue } from '../../middleware/validator';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

// POST /api/issues - Create a new issue (bug/feature request)
router.post('/', requireAuth, validateCreateIssue, asyncHandler(createIssueHandler));

// GET /api/issues - Retrieve all issues with sorting and filters (Public)
router.get('/', asyncHandler(getAllIssuesHandler));

// GET /api/issues/:id - Retrieve full details of a specific issue (Public)
router.get('/:id', asyncHandler(getIssueByIdHandler));

// PATCH /api/issues/:id - Update an issue (Auth required)
router.patch('/:id', requireAuth, validateUpdateIssue, asyncHandler(updateIssueHandler));

// DELETE /api/issues/:id - Delete an issue (Maintainer only)
router.delete('/:id', requireAuth, requireMaintainer, asyncHandler(deleteIssueHandler));

export default router;
