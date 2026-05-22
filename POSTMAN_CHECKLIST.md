# DevPulse Postman Checklist

Use this checklist before deployment and again after deployment by replacing the base URL.

Local base URL:

```txt
http://localhost:3000
```

Deployed base URL:

```txt
https://your-deployed-api-url
```

## Authentication

1. `POST /api/auth/signup` creates a contributor user and does not return password.
2. `POST /api/auth/signup` creates a maintainer user and does not return password.
3. `POST /api/auth/login` returns a JWT token and user data.
4. Invalid login credentials return `401 Unauthorized`.

## Issues

1. `POST /api/issues` without token returns `401 Unauthorized`.
2. `POST /api/issues` with contributor token creates an issue with default `open` status.
3. `GET /api/issues` works without token.
4. `GET /api/issues?sort=newest&type=bug&status=open` returns filtered issues.
5. `GET /api/issues/:id` returns reporter details.
6. Contributor can update their own issue while status is `open`.
7. Contributor cannot update another user's issue.
8. Contributor cannot update an issue after status changes from `open`.
9. Maintainer can update issue status.
10. Maintainer can delete any issue.

## Metrics

1. `GET /api/system/metrics` without token returns `401 Unauthorized`.
2. `GET /api/system/metrics` with contributor token returns `403 Forbidden`.
3. `GET /api/system/metrics` with maintainer token returns system metrics.

## Final Checks

1. `GET /` returns the API welcome response.
2. `GET /health` returns healthy status.
3. Error responses use `success: false`.
4. Success responses use `success: true`.
5. No response exposes user passwords.
