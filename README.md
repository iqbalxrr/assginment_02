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

### Issues

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/issues` | Authenticated | Create an issue |
| GET | `/api/issues` | Public | Get all issues |
| GET | `/api/issues/:id` | Public | Get single issue |
| PATCH | `/api/issues/:id` | Authenticated | Update issue fields |
| DELETE | `/api/issues/:id` | Maintainer only | Delete an issue |

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
- Add `CONNECTIONSTRING`, `JWT_SECRET`, and `JWT_EXPIRES_IN` to deployment environment variables.
- Deploy the backend to Vercel, Render, or Railway.
- Make sure the live API URL and GitHub repository are public before submitting.
