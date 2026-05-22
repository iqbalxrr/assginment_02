import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/response';

/**
 * Handles user registration.
 */
export async function signupHandler(req: Request, res: Response): Promise<void> {
  const { name, email, password, role } = req.body;
  
  const user = await authService.register({
    name,
    email,
    password,
    role,
  });

  sendSuccess(res, user, 'User registered successfully', StatusCodes.CREATED);
}

/**
 * Handles user login and session JWT issuance.
 */
export async function loginHandler(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const result = await authService.login({
    email,
    password,
  });

  sendSuccess(res, result, 'Login successful', StatusCodes.OK);
}
