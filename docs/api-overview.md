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
GET    /api/v1/auth/providers
GET    /api/v1/auth/google
GET    /api/v1/auth/google/callback
GET    /api/v1/auth/github
GET    /api/v1/auth/github/callback
```

`/providers` returns the configured provider availability, for example
`{ "google": true, "github": false }`. The frontend only renders enabled provider buttons;
direct requests for a disabled provider redirect safely to the login page.

Start OAuth through a browser by visiting a provider route from the login or registration page.
Each start request creates a short-lived, HTTP-only OAuth state cookie and sends its random value
to the provider. The matching callback must return that state value; missing, mismatched, or
replayed state is rejected before provider authentication runs. The state cookie is secure in
production, uses `SameSite=Lax`, and is cleared after a callback attempt.

New OAuth-backed accounts require a verified provider email address and an explicit Terms of
Service and Privacy Policy acknowledgement from the social sign-in UI. On success, the backend
creates the normal HTTP-only session cookie and redirects to `/oauth/callback`. OAuth failures
redirect to safe login error codes such as `oauth_failed`, `oauth_email_required`,
`oauth_terms_required`, or `oauth_unavailable`; these routes rely on external provider redirects
and are not intended for Postman requests.
