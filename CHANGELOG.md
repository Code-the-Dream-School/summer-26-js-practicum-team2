# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## [Unreleased] -->

<!-- --- -->

## [0.2.0]

### Added

- Added Vitest, jsdom, and React Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`) to the frontend as dev dependencies
- Added `test` and `test:watch` scripts to the frontend package
- Added `frontend/src/styles/reset.css` with an accessibility-focused reset covering `:focus-visible`, `forced-colors`, and `prefers-reduced-motion`
- Added `frontend/src/styles/theme.css` defining the Tailwind `@theme` design tokens for brand, status, surface, and learning-path colors

### Changed

- Changed `frontend/src/index.css` to import the reset and theme stylesheets alongside Tailwind

---

## [0.1.3]

### Added

- Added Postman collection and environment files for local backend API testing
- Added instructions within `.env.example` to generate a proper JWT token for use in production
- Added ESLint and Prettier configuration for code formatting and linting
- Added tests for error handler middleware to validate responses for Mongoose ID errors and malformed JSON

### Changed

- Refactor JWT middleware to simplify CSRF token validation logic
- Refactor authentication tests to use helper functions for user registration, verification, and login
- Refactor lesson test helpers for improved readability and functionality
- Validate microLessonId in startQuiz and handle empty request body
- Refactor error handler middleware to remove unused next parameter and improve error handling structure

### Fixed

- Prevent server from running in production without a JWT_SECRET
- Enforce JWT authentication on logout to prevent CSRF-triggered logouts and session spoofing

---

## [0.1.2]

### Added

- Added test coverage for registration rate limiting, and public registration access
- Added authentication boundary coverage for protected route groups
- Add Postman collection and environment files for local backend API testing

### Changed

- Moved JWT authentication from individual endpoints to the lesson, dashboard, and quiz route groups

---

## [0.1.1]

### Added

- Added JSON 404 responses for unknown API routes
- Added error-handler middleware test coverage

### Changed

- Moved error handling middleware to run after all routes

---

## [0.1.0]

### Changed

- Handle JWT secrets more efficiently and allow authenticated API requests using either a session cookie or Bearer token
- Session cookies are now scoped to the application root so that authenticated users can access all rotected routes
- Users sign in automatically after email verification and password reset, which returns a CSRF token
- Logging out successfully returns a message indicating, and if a user is not logged in, returns a message stating a user is not logged in
- Upgraded the backend test runner to Jest 30
- Approved required install scripts for `mongodb-memory-server` and Jest's `unrs-resolver` dependency

### Added

- Added a `npm test` command for the backend using Jest and Supertest
- Added isolated in-memory MongoDB setup and cleanup for backend integration tests
- Added integration coverage for registration, login, logout, password-reset sessions, and protected lesson retrieval

### Fixed

- Implement an IPv6-safe login limiter fallback to satisfy tests
- Replaced deprecated transitive `glob` and `test-exclude` versions with maintained releases

---

## [0.0.7]

### Added

- Added dashboard cache invalidation on quiz submission
- Added shared learning-path helpers
- Added dashboard assembly for hero copy, next action, unit progress, recent activity, and passed-attempt reconciliation
- Added POST /api/v1/dashboard/events; unknown event types are accepted and ignored
- Enabled /api/v1/dashboard and /api/v1/quizzes routes

### Fixed

- Fix module path for budgeting content

---

## [0.0.6]

### Added

- Add content utility functions for managing modules and lessons
- Add lesson routes and controller for lesson management

### Changed

- Trimmed manifest.json to the one module that actually ships lessons
- In shared/content/index.js, exports mudules map and utility functions

---

## [0.0.5]

### Added

- Added completed_micro_lessons to UserProgress Schema
- Added robust scrypt password hashing/comparison
- Added cookie-based JWT middleware with production CSRF checks
- Added dev verification/reset URLs

### Changed

- Rename controllers, routes, and model files for consistency
- Replaced SMTP with Brevo and a development logging fallback
- Enabled /api/v1/users

---

## [0.0.4]

### Added

- Cherry-picks commits from feature branches to keep contributions from team to this point

### Changed

- Temporarily removes features breaking code without supporting dependent files

---

## [0.0.3]

### Added

- Install dependencies and write scripts for backend
- Configure Express App with middleware and a simple hello route
- Add server and MongoDB connection setup
- Initialize environment example files

---

## [0.0.2]

### Added

- Initalize new project scaffolding to run project from root folder

### Removed

- Removes initial project scaffolding

---

## [0.0.1] - 2026-07-01

### Added

- Initial release.
