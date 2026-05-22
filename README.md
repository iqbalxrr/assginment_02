# DevPulse

Internal Tech Issue and Feature Tracker API.

DevPulse is a backend API for software teams to report bugs, request features, and manage issue progress.

## Live Links

- GitHub Repository: `https://github.com/yourusername/devpulse`
- Live Backend: `https://devpulse-api.vercel.app`
- Interview Video: `https://drive.google.com/...`

Replace these links with your real public submission links before submitting.

## Features

- User signup and login
- Password hashing with bcrypt
- JWT based authentication
- Contributor and maintainer roles
- Create bug reports and feature requests
- Public issue list and issue details
- Optional issue sorting and filtering
- Contributor can update own open issues
- Maintainer can update, change status, delete, and view system metrics
- PostgreSQL with raw `pg` queries only
- No ORM, no query builder, and no SQL JOIN

## Tech Stack

- Node.js 24.x or higher
- TypeScript
- Express.js
- PostgreSQL
- Native `pg` driver
- Raw SQL
- bcrypt
- jsonwebtoken
- http-status-codes

## What Was Used For Each Part

| Requirement / Work | What I Used | Main Files |
| --- | --- | --- |
| Server setup | Node.js, Express.js, TypeScript | `src/server.ts`, `src/app.ts` |
| Modular routing | Express Router with separate modules | `src/modules/auth`, `src/modules/issues`, `src/modules/metrics` |
| Database connection | PostgreSQL with native `pg` Pool | `src/db/index.ts`, `src/config/db.ts` |
| Database schema | Raw SQL `CREATE TABLE`, checks, timestamps, triggers | `src/db/index.ts` |
| SQL queries | Direct `pool.query()` calls only | `src/modules/auth/auth.service.ts`, `src/modules/issues/issues.service.ts`, `src/modules/metrics/metrics.controller.ts` |
| No JOIN rule | Reporter data is fetched separately and merged in application logic | `src/modules/issues/issues.service.ts` |
| Password hashing | `bcrypt` with 10 salt rounds | `src/modules/auth/auth.service.ts` |
| Login token | `jsonwebtoken` signed JWT with user `id`, `name`, and `role` | `src/modules/auth/auth.service.ts` |
| Authentication middleware | JWT verification from `Authorization` header | `src/middleware/auth.ts` |
| Role authorization | Maintainer-only middleware and service-level permission checks | `src/middleware/auth.ts`, `src/modules/issues/issues.service.ts` |
| Request validation | Custom Express validation middleware | `src/middleware/validator.ts` |
| Standard responses | Reusable success and error response helpers | `src/utils/response.ts` |
| Error handling | Centralized error middleware and custom HTTP errors | `src/middleware/errorHandler.ts`, `src/utils/errors.ts` |
| Issue CRUD | Create, read, update, delete issue logic | `src/modules/issues/issues.controller.ts`, `src/modules/issues/issues.service.ts` |
| Sorting and filtering | Query params for `sort`, `type`, and `status` | `src/modules/issues/issues.controller.ts`, `src/modules/issues/issues.service.ts` |
| Internal metrics | Maintainer-only system metrics endpoint | `src/modules/metrics` |
| CORS and security headers | `cors` and `helmet` middleware | `src/app.ts` |
| Environment variables | `.env` locally and Vercel environment variables in deployment | `.env.example`, `src/db/index.ts` |
| Vercel deployment | Serverless entry point for Express app | `api/index.ts`, `vercel.json` |

## Project Structure

```txt
src/
  app.ts                     Express app and route mounting
  server.ts                  Local server bootstrap
  config/                    Shared configuration exports
  db/                        PostgreSQL pool and database initialization
  middleware/                Auth, validation, and error middleware
  modules/
    auth/                    Signup and login module
    issues/                  Issue tracking module
    metrics/                 Maintainer metrics module
  utils/                     Response and error helpers
api/
  index.ts                   Vercel serverless entry point
```

## Local Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development
CONNECTIONSTRING=postgres://user:password@host/dbname?sslmode=require
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

Run the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Public | Register a user |
| POST | `/api/auth/login` | Public | Login and receive JWT |

Signup request body:

```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

Login request body:

```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

### Issues

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/issues` | Authenticated | Create an issue |
| GET | `/api/issues` | Public | Get all issues |
| GET | `/api/issues/:id` | Public | Get single issue |
| PATCH | `/api/issues/:id` | Authenticated | Update issue fields |
| DELETE | `/api/issues/:id` | Maintainer only | Delete an issue |

Create issue request body:

```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50 plus concurrent queries, causing 500 errors",
  "type": "bug"
}
```

Update issue request body:

```json
{
  "title": "Updated database pool exhaustion fix needed",
  "description": "Updated description with clear reproduction steps and expected behavior.",
  "type": "bug"
}
```

Maintainers can also update workflow status:

```json
{
  "status": "in_progress"
}
```

### System

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/system/metrics` | Maintainer only | Get internal metrics |

## Query Parameters For Issues

`GET /api/issues`

| Query | Values | Default |
| --- | --- | --- |
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | none |
| `status` | `open`, `in_progress`, `resolved` | none |

Example:

```http
GET /api/issues?sort=oldest&type=bug&status=open
```

## Database Schema Summary

### users

| Field | Type | Notes |
| --- | --- | --- |
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Required |
| email | VARCHAR(255) | Required and unique |
| password | VARCHAR(255) | Hashed password |
| role | VARCHAR(50) | `contributor` or `maintainer` |
| created_at | TIMESTAMPTZ | Auto generated |
| updated_at | TIMESTAMPTZ | Auto updated |

### issues

| Field | Type | Notes |
| --- | --- | --- |
| id | SERIAL | Primary key |
| title | VARCHAR(150) | Required |
| description | TEXT | Required |
| type | VARCHAR(50) | `bug` or `feature_request` |
| status | VARCHAR(50) | `open`, `in_progress`, `resolved` |
| reporter_id | INTEGER | User id, validated in application logic |
| created_at | TIMESTAMPTZ | Auto generated |
| updated_at | TIMESTAMPTZ | Auto updated |

The database initialization logic is available at `src/db/index.ts`.

## Response Format

Success response:

```json
{
  "success": true,
  "message": "Operation message",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Error message",
  "errors": "Error details"
}
```

## Authorization

Protected routes need this header:

```http
Authorization: <JWT_TOKEN>
```

`Authorization: Bearer <JWT_TOKEN>` is also supported.

## Deployment Notes

- Use NeonDB, Supabase, or another PostgreSQL provider.
- Add `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `NODE_ENV=production` to deployment environment variables.
- Deploy the backend to Vercel, Render, or Railway.
- Make sure the live API URL and GitHub repository are public before submitting.
- Never commit the local `.env` file. Use `.env.example` only as a safe template.
- If a database URL or JWT secret is accidentally shared, rotate the secret before final submission.
