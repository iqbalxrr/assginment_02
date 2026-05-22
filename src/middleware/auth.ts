import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_devpulse_123';

export interface UserTokenPayload {
  id: number;
  name: string;
  role: 'contributor' | 'maintainer';
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: UserTokenPayload;
    }
  }
}

/**
 * Middleware to require authenticated user (JWT present and valid).
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError('Authentication token is missing');
  }

  // Support both "Authorization: <token>" and "Authorization: Bearer <token>"
  let token = authHeader;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!isUserTokenPayload(decoded)) {
      throw new UnauthorizedError('Invalid authentication token structure');
    }

    req.user = decoded;
    next();
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Authentication token has expired');
    }
    throw new UnauthorizedError('Invalid authentication token');
  }
}

function isUserTokenPayload(decoded: string | JwtPayload): decoded is UserTokenPayload {
  if (typeof decoded === 'string') {
    return false;
  }

  const role = decoded.role;

  return (
    typeof decoded.id === 'number' &&
    typeof decoded.name === 'string' &&
    (role === 'contributor' || role === 'maintainer')
  );
}

/**
 * Middleware to require a maintainer role.
 */
export function requireMaintainer(req: Request, res: Response, next: NextFunction): void {
  // First ensure user is authenticated
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (req.user.role !== 'maintainer') {
    throw new ForbiddenError('Access forbidden: maintainer privileges required');
  }

  next();
}
