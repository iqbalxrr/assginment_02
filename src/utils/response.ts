import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export interface SuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
}

/**
 * Sends a standardized success response.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = StatusCodes.OK
): Response {
  const responsePayload: SuccessResponse<T> = {
    success: true,
    data,
  };
  
  if (message) {
    responsePayload.message = message;
  }
  
  return res.status(statusCode).json(responsePayload);
}

/**
 * Sends a standardized error response.
 */
export function sendError(
  res: Response,
  message: string,
  errors?: unknown,
  statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR
): Response {
  const responsePayload: ErrorResponse = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    responsePayload.errors = errors;
  }

  return res.status(statusCode).json(responsePayload);
}
