# API Overview

## Routes Covered By Postman Collection

```text
GET    /api/hello

POST   /api/v1/users/register
GET    /api/v1/users/verify?token=...
POST   /api/v1/users/login
POST   /api/v1/users/reactivate
POST   /api/v1/users/logout
POST   /api/v1/users/forgot-password
POST   /api/v1/users/reset-password

GET    /api/v1/dashboard
POST   /api/v1/dashboard/events

GET    /api/v1/quizzes/progress
GET    /api/v1/quizzes/attempts
POST   /api/v1/quizzes/check
POST   /api/v1/quizzes/start
POST   /api/v1/quizzes/1.1.2/submit

GET    /api/v1/profile
PATCH  /api/v1/profile
POST   /api/v1/profile/avatar
POST   /api/v1/profile/password
POST   /api/v1/profile/request-deletion

GET    /api/v1/lessons/cashFlow/1.1
GET    /api/v1/lessons/progress?moduleId=cashFlow
PATCH  /api/v1/lessons/progress
PATCH  /api/v1/lessons/progress/restart
```

## Immediate Quiz Feedback

`POST /api/v1/quizzes/check` is intentionally public so signed-out lesson previews and
authenticated learners receive immediate feedback. After the caller submits a choice, the
response includes `isCorrect`, `correctChoiceIds`, and `explanation`. Lesson-content APIs
continue to omit correct answers and explanations from their initial payloads.

## Profile Avatars

`POST /api/v1/profile/avatar` supports a JSON `avatar_url` only. The URL must use HTTP or HTTPS;
send `null` or an empty string to return to the initials-based avatar. File uploads are not part
of this endpoint.

## Lesson Content Fallback

MongoDB lesson modules are preferred. When no module has been seeded, dashboard and direct
`cashFlow` lesson requests can use the bundled default Cash Flow content. Learning-path module
discovery remains database-driven, so an unseeded learning path clearly asks an administrator to
seed or import content.
