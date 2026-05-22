import { Router } from 'express';
import { signupHandler, loginHandler } from './auth.controller';
import { validateSignup, validateLogin } from '../../middleware/validator';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

// POST /api/auth/signup - Register user
router.post('/signup', validateSignup, asyncHandler(signupHandler));

// POST /api/auth/login - Log in user
router.post('/login', validateLogin, asyncHandler(loginHandler));

export default router;
