# API Overview

## Routes Covered By Postman Collection

```text
GET    /api/hello

POST   /api/v1/users/register
GET    /api/v1/users/verify?token=...
POST   /api/v1/users/login
POST   /api/v1/users/logout
POST   /api/v1/users/forgot-password
POST   /api/v1/users/reset-password

GET    /api/v1/dashboard
POST   /api/v1/dashboard/events

GET    /api/v1/quizzes/progress
GET    /api/v1/quizzes/attempts
POST   /api/v1/quizzes/start
POST   /api/v1/quizzes/1.1.2/submit

GET    /api/v1/lessons/cashFlow/1.1
GET    /api/v1/lessons/progress?moduleId=cashFlow
PATCH  /api/v1/lessons/progress
PATCH  /api/v1/lessons/progress/restart
```

## OAuth Browser Routes

```text
GET    /api/v1/auth/google
GET    /api/v1/auth/google/callback
GET    /api/v1/auth/github
GET    /api/v1/auth/github/callback
```

Start OAuth through a browser by visiting a provider route from the login or registration
page. The provider calls the matching callback route after authorization. On success, the
backend creates an HTTP-only session cookie and redirects to `/oauth/callback`; on failure,
it redirects to `/login?error=oauth_failed`. These routes rely on external provider redirects
and are not intended for Postman requests.
