import { StatusCodes } from 'http-status-codes';

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly errors: unknown;

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = 'Bad Request', errors?: unknown) {
    super(message, StatusCodes.BAD_REQUEST, errors);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = 'Unauthorized', errors?: unknown) {
    super(message, StatusCodes.UNAUTHORIZED, errors);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = 'Forbidden', errors?: unknown) {
    super(message, StatusCodes.FORBIDDEN, errors);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = 'Not Found', errors?: unknown) {
    super(message, StatusCodes.NOT_FOUND, errors);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string = 'Conflict', errors?: unknown) {
    super(message, StatusCodes.CONFLICT, errors);
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string = 'Internal Server Error', errors?: unknown) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, errors);
  }
}
