# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## [Unreleased] -->

<!-- --- -->

## [Unreleased]

### Changed

- Handle JWT secrets more efficiently and allow authenticated API requests using either a session cookie or Bearer token
- Session cookies are now scoped to the application root so that authenticated users can access all rotected routes
- Users sign in automatically after email verification and password reset, which returns a CSRF token
- Logging out successfully returns a message indicating, and if a user is not logged in, returns a message stating a user is not logged in

### Fixed

- Implement an IPv6-safe login limiter fallback to satisfy tests

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
