import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';

/**
 * Validates signup requests.
 */
export function validateSignup(req: Request, res: Response, next: NextFunction): void {
  const { name, email, password, role } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new BadRequestError('Name must be a non-empty string');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    throw new BadRequestError('A valid email address must be provided');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new BadRequestError('Password must be at least 6 characters long');
  }

  if (role !== undefined && role !== 'contributor' && role !== 'maintainer') {
    throw new BadRequestError('Role must be either "contributor" or "maintainer"');
  }

  next();
}

/**
 * Validates login requests.
 */
export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    throw new BadRequestError('Email must be provided');
  }

  if (!password || typeof password !== 'string') {
    throw new BadRequestError('Password must be provided');
  }

  next();
}

/**
 * Validates issue creation requests.
 */
export function validateCreateIssue(req: Request, res: Response, next: NextFunction): void {
  const { title, description, type } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new BadRequestError('Title must be a non-empty string');
  }

  if (title.length > 150) {
    throw new BadRequestError('Title must not exceed 150 characters');
  }

  if (!description || typeof description !== 'string') {
    throw new BadRequestError('Description must be provided');
  }

  if (description.trim().length < 20) {
    throw new BadRequestError('Description must be at least 20 characters long');
  }

  if (!type || (type !== 'bug' && type !== 'feature_request')) {
    throw new BadRequestError('Type must be either "bug" or "feature_request"');
  }

  next();
}

/**
 * Validates issue update requests.
 */
export function validateUpdateIssue(req: Request, res: Response, next: NextFunction): void {
  const { title, description, type, status } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new BadRequestError('Title must be a non-empty string');
    }
    if (title.length > 150) {
      throw new BadRequestError('Title must not exceed 150 characters');
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string') {
      throw new BadRequestError('Description must be a string');
    }
    if (description.trim().length < 20) {
      throw new BadRequestError('Description must be at least 20 characters long');
    }
  }

  if (type !== undefined && type !== 'bug' && type !== 'feature_request') {
    throw new BadRequestError('Type must be either "bug" or "feature_request"');
  }

  if (status !== undefined && status !== 'open' && status !== 'in_progress' && status !== 'resolved') {
    throw new BadRequestError('Status must be one of: "open", "in_progress", "resolved"');
  }

  next();
}
