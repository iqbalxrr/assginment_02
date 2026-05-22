import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const connectionString = process.env.CONNECTIONSTRING || process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : undefined,
});

export const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request')),
        status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
        reporter_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users
    `);

    await pool.query(`
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_issues_updated_at ON issues
    `);

    await pool.query(`
      CREATE TRIGGER update_issues_updated_at
      BEFORE UPDATE ON issues
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);

    await pool.query(`
      INSERT INTO users (id, name, email, password, role, created_at, updated_at)
      VALUES
        (
          1,
          'John Contributor',
          'john@devpulse.com',
          '$2b$10$rxo5IfXdq8458I0ZPhh0duGabeMDGbsgUXLcF2uMJpvnXMxJ.I9Q2',
          'contributor',
          '2026-05-22T12:00:00Z',
          '2026-05-22T12:00:00Z'
        ),
        (
          2,
          'Alice Maintainer',
          'alice@devpulse.com',
          '$2b$10$rxo5IfXdq8458I0ZPhh0duGabeMDGbsgUXLcF2uMJpvnXMxJ.I9Q2',
          'maintainer',
          '2026-05-22T12:00:00Z',
          '2026-05-22T12:00:00Z'
        ),
        (
          3,
          'Bob Other',
          'bob@devpulse.com',
          '$2b$10$rxo5IfXdq8458I0ZPhh0duGabeMDGbsgUXLcF2uMJpvnXMxJ.I9Q2',
          'contributor',
          '2026-05-22T12:00:00Z',
          '2026-05-22T12:00:00Z'
        )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        updated_at = EXCLUDED.updated_at
    `);

    await pool.query(`
      INSERT INTO issues (id, title, description, type, status, reporter_id, created_at, updated_at)
      VALUES
        (
          45,
          'Database connection timeout',
          'Pool exhausts after 50+ concurrent queries, causing 500 errors',
          'bug',
          'open',
          1,
          '2026-05-22T12:00:00Z',
          '2026-05-22T12:00:00Z'
        ),
        (
          46,
          'Bug 2',
          'Repro steps...',
          'bug',
          'in_progress',
          2,
          '2026-05-22T12:00:00Z',
          '2026-05-22T12:00:00Z'
        )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        type = EXCLUDED.type,
        status = EXCLUDED.status,
        reporter_id = EXCLUDED.reporter_id,
        updated_at = EXCLUDED.updated_at
    `);

    await pool.query(`
      SELECT setval('users_id_seq', GREATEST((SELECT MAX(id) FROM users), 1))
    `);

    await pool.query(`
      SELECT setval('issues_id_seq', GREATEST((SELECT MAX(id) FROM issues), 1))
    `);

    console.log('Database connected sucessfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
