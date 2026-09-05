# Write Endpoint Validation

Backend write endpoints validate request input with Joi before business logic,
database queries, grading, cache invalidation, or persistence.

Invalid input returns HTTP `400` with this response shape:

```json
{
  "message": "Validation error",
  "errors": ["... validation message ..."]
}
```

## Lesson Progress

`PATCH /api/v1/lessons/progress`

Request body:

- `moduleId`: optional; defaults to `cashFlow`
- `lessonId`: optional non-empty string
- `microLessonId`: optional non-empty string

At least one of `lessonId` or `microLessonId` is required. Unknown fields and
incorrectly typed values are rejected.

## Start Quiz

`POST /api/v1/quizzes/start`

Request body:

- `microLessonId`: required non-empty string
- `moduleId`: optional; defaults to `cashFlow`

The micro-lesson ID is validated before the lesson ID is derived, so an empty
request cannot reach ID parsing or cause a server error.

## Submit Quiz

`POST /api/v1/quizzes/:id/submit`

The `id` route parameter must be a non-empty micro-lesson ID. The request body
supports:

- `attemptId`: optional 24-character hexadecimal MongoDB ID
- `moduleId`: optional; defaults to `cashFlow`
- `started_at`: optional ISO date
- `answers`: optional object containing string or string-array answers

Both the route parameter and body are validated before grading or database
access.

## Password Recovery

`POST /api/v1/users/forgot-password`

- `email`: required valid email address

`POST /api/v1/users/reset-password`

- `token`: required 64-character hexadecimal reset token
- `newPassword`: must satisfy the shared password requirements

Registration and login retain their existing validation behavior. Password
recovery uses Joi's sanitized values for database queries and password hashing.

## Dashboard Events

`POST /api/v1/dashboard/events`

- `type`: required
- Allowed values: `lesson_complete` or `quiz_submit`

The dashboard cache is invalidated only after the event passes validation.

## Password Requirements

Passwords must satisfy one of these rules:

- At least 16 characters with uppercase, lowercase, and numeric characters; or
- At least 8 characters with uppercase, lowercase, numeric, and special
  characters.

## Test Coverage

Validation behavior is covered by `backend/test/writeValidation.test.js`, which
asserts the `400` status, `Validation error` message, and populated `errors`
array for invalid write requests.
