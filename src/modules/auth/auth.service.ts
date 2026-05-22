import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { pool } from '../../db';
import { BadRequestError, ConflictError, UnauthorizedError } from '../../utils/errors';
import { LoginInput, LoginResult, SignupInput, UserPayload } from './auth.interface';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_devpulse_123';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Creates a new user in the database.
 */
export async function register(input: SignupInput): Promise<UserPayload> {
  const { name, email, password, role = 'contributor' } = input;

  if (!name || !email || !password) {
    throw new BadRequestError('Name, email, and password must be provided');
  }

  // 1. Check if email is already taken
  const checkEmailQuery = 'SELECT id FROM users WHERE email = $1';
  const checkResult = await pool.query(checkEmailQuery, [email.toLowerCase().trim()]);
  
  if (checkResult.rows.length > 0) {
    throw new ConflictError('An account with this email address already exists');
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. Insert user
  const insertQuery = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
  `;
  const result = await pool.query(insertQuery, [
    name.trim(),
    email.toLowerCase().trim(),
    hashedPassword,
    role,
  ]);

  return result.rows[0];
}

/**
 * Authenticates a user and returns a signed JWT token along with user info.
 */
export async function login(input: LoginInput): Promise<LoginResult> {
  const { email, password } = input;

  if (!email || !password) {
    throw new BadRequestError('Email and password must be provided');
  }

  // 1. Find user by email
  const findQuery = 'SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = $1';
  const result = await pool.query(findQuery, [email.toLowerCase().trim()]);

  if (result.rows.length === 0) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const userRow = result.rows[0];

  // 2. Compare passwords
  const passwordMatch = await bcrypt.compare(password, userRow.password);
  if (!passwordMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // 3. Generate token containing id, name, and role
  const payload = {
    id: userRow.id,
    name: userRow.name,
    role: userRow.role,
  };

  const signOptions: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  const token = jwt.sign(payload, JWT_SECRET, signOptions);

  return {
    token,
    user: {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      role: userRow.role,
      created_at: userRow.created_at,
      updated_at: userRow.updated_at,
    },
  };
}
