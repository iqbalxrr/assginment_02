import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpError } from '../utils/errors';
import { sendError } from '../utils/response';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
type DatabaseError = {
  code?: string;
  detail?: string;
  message?: string;
  stack?: string;
};

/**
 * Higher-order function that wraps asynchronous Express route handlers
 * to catch errors and forward them to the centralized error handler.
 */
export const asyncHandler = (fn: AsyncRouteHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Centralized Express Error Handling Middleware.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If headers already sent, delegate to standard Express handler
  if (res.headersSent) {
    return next(err);
  }

  // 1. Check if error is a known custom HTTP Error
  if (err instanceof HttpError) {
    sendError(res, err.message, err.errors, err.statusCode);
    return;
  }

  // 2. Handle specific PostgreSQL Database Errors
  // Check for unique constraint violation (error code '23505')
  const dbError = err as DatabaseError;

  if (dbError.code === '23505') {
    sendError(
      res,
      'A database constraint conflict occurred (e.g., duplicate record)',
      dbError.detail || null,
      StatusCodes.CONFLICT
    );
    return;
  }

  // Check for foreign key violation (error code '23503')
  if (dbError.code === '23503') {
    sendError(
      res,
      'A related database record was not found or has dependent records',
      dbError.detail || null,
      StatusCodes.BAD_REQUEST
    );
    return;
  }

  // Check for invalid input syntax/types (error code '22P02')
  if (dbError.code === '22P02') {
    sendError(
      res,
      'Invalid data format provided to the database',
      process.env.NODE_ENV === 'development' ? dbError.message : null,
      StatusCodes.BAD_REQUEST
    );
    return;
  }

  // 3. Handle Unexpected Server/System Errors
  // Log the raw error stack locally for maintainer diagnosis
  console.error('UNEXPECTED SYSTEM ERROR:', err);

  const errorMessage = process.env.NODE_ENV === 'production'
    ? 'An unexpected internal server error occurred.'
    : dbError.message || 'Internal Server Error';

  const errorDetails = process.env.NODE_ENV === 'production'
    ? null
    : dbError.stack || err;

  sendError(res, errorMessage, errorDetails, StatusCodes.INTERNAL_SERVER_ERROR);
}
