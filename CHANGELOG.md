# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## [Unreleased] -->

<!-- --- -->

## [Unreleased]

### Added

- Added repository community-standard files: `SUPPORT.md`, `.editorconfig`, `.gitattributes`, and `.nvmrc`
- Added GitHub governance and automation files: `.github/CODEOWNERS`, `.github/SECURITY.md`, `.github/dependabot.yml`, and `.github/workflows/ci.yml`
- Added issue templates for bug reports, feature requests, and security vulnerabilities with issue-chooser contact links
- Added docs index and split guides under `docs/` for setup, API overview, Postman testing, workflow, and roadmap
- Added Postman environment files for remote development and remote production backend testing

### Changed

- Migrated layout into a new folder within `src/shared` called `MainLayout`
- Refactored imports to remove file extensions for consistency
- Established `src/styles/theme.css` as the authoritative frontend design-token source.
- Refactored root `README.md` into a concise landing page that links to detailed docs as the primary source of truth
- Updated contributor guidance and PR template expectations to align with issue-based, `hotfix/`, and `refactor/` workflows
- Updated project structure diagram and provide a link to more detailed ones in project-structure.md

### Fixed

- Resolved a typo within the ConsentBanner component
- Fixed a linting error by removing unused maxAge variable from logout in backend user.controller
- Added optional chaining to content in BudgetSummary component to prevent undefined if json is missing content

---

## [0.2.9]

### Added

- Added progress-driven LearningPathPage with lesson and micro-lesson navigation states
- Added LearningPathNode component for current, completed, and locked learning steps
- Added LastLessonRedirect with API lookup and localStorage fallback behavior

### Changed

- Refactor LearningPathPage component to show a callout message

### Fixed

- Switched script runner from concurrently to npm-run-all to prevent multiple "ghost" servers from running.

---

## [0.2.8]

### Added

- Added UnitProgressRow component for displaying lesson progress
- Added RecentActivityCard component to display user activity feed
- Added DashboardHero component for user dashboard display
- Added useDashboardData hook for managing dashboard state and caching

### Changed

- Refactor npm scripts for better organization of backend and frontend tests
- Enhanced DashboardPage with loading and error states, dashboard progress summaries, recent activity, and recommended next actions
- Refactored learning-path and last-lesson pages to use the shared authentication context, API services, and feature-based component structure

---

## [0.2.7]

### Added

- Added quiz scoring utility functions for normalizing choice IDs and scoring attempts
- Implemented quiz reducer with action handling and initial state setup
- Added useQuiz hook for managing quiz state and interactions
- Added QuizComponent for interactive quiz functionality

### Changed

- Invalidated cached dashboard on quiz submission to ensure progress updates are reflected

---

## [0.2.6]

### Added

- Added useLessonContent hook for lesson data fetching and state management
- Added normalization functions for lesson content and questions
- Added lesson cash flow JSON fixture for budgeting module

### Changed

- Moved lesson components into features and adds component suffix
- Refactored LearnPage to integrate lesson flow and progress tracking

### Fixed

- Fixes script option in dev command to prevent concurrent failures
- Added SAMPLE_LESSON_LINK to routes

---

## [0.2.5]

### Added

- Declared @hookform/resolvers as a dependency
- Added validation schemas for authentication and password management
- Added placeholder identities for fun registration experience
- Implemented password reset and email verification forms with error handling and user feedback

---

## [0.2.4]

### Added

- Added legal consent utility functions for tracking preferences
- Added ConsentBanner component to handle user consent for analytics
- Added Privacy and Terms pages with detailed content and improved layout
- Added Profile page shell and created routes to reach it

### Changed

- Refactored HomePage component to enhance layout and integrate authentication logic
- Compress images by converting large SVGs into .webp images

---

## [0.2.3]

### Added

- Added initial page components for Dashboard, Last Lesson Redirect, Login, Password Reset, Privacy, Register, Terms, and Verify Email
- Added ProtectedRoute component for authentication handling

### Changed

- Refactored main entry point to use BrowserRouter
- Refactored App component to set document title based on route
- Refactored AppRouter to use Routes as taught in curriculum
- Renamed LessonPage to LearnPage
- Refactored HomePage and LearningPathPage to use named exports
- Refactored route definitions and titles in routes.js to support handling titles

---

## [0.2.2]

### Added

- Added logo, progress-bar, flower-progress, right, and wrong answer SVG images
- Added useFieldA11y hook for accessible form field management
- Added Footer and Header components with navigation links

### Changed

- Renamed every shared component to have a `.component.jsx` suffix
- Refactored layout components: updated MainLayout import path, enhanced Header with logo and props, and streamlined NavBar structure

### Removed

- Removed unused SVG images

---

## [0.2.1]

### Added

- Added auth reducer with action types and initial state
- Implemented authentication context and provider
- Updated environment configuration and API paths
- Added lesson and quiz endpoints

### Changed

- Refactored useAuth hook to improve authentication state management and storage handling
- Disabled react-refresh rule for context files
- Wrapped AppRouter with AuthProvider for authentication context

### Removed

---

## [0.2.0]

### Added

- Added `frontend/src/styles/reset.css` with an accessibility-focused reset covering `:focus-visible`, `forced-colors`, and `prefers-reduced-motion`
- Added `frontend/src/styles/theme.css` defining the Tailwind `@theme` design tokens for brand, status, surface, and learning-path colors
- Added `VITE_API_PORT` documentation to `frontend/.env.example`
- Added a `/api` dev-server proxy to `frontend/vite.config.js`, targeting the port set by `VITE_API_PORT` (defaults to `8080`)
- Added `frontend/public/_redirects` so client-side routes resolve correctly on Netlify

### Changed

- Changed `frontend/src/index.css` to import the reset and theme stylesheets alongside Tailwind

### Fixed

- Fixed the misspelled `frontend/.prettieringore`, which left `node_modules`, `dist`, `coverage`, and `package-lock.json` unignored by Prettier

---

## [0.1.3]

### Added

- Added Postman collection and environment files for local backend API testing
- Added instructions within `.env.example` to generate a proper JWT token for use in production
- Added ESLint and Prettier configuration for code formatting and linting

### Changed

- Refactored JWT middleware to simplify CSRF token validation logic
- Validated microLessonId in startQuiz and handled empty request body
- Refactored error handler middleware to remove unused next parameter and improved error handling structure

### Fixed

- Prevent server from running in production without a JWT_SECRET
- Enforce JWT authentication on logout to prevent CSRF-triggered logouts and session spoofing

---

## [0.1.2]

### Added

- Add Postman collection and environment files for local backend API testing

### Changed

- Moved JWT authentication from individual endpoints to the lesson, dashboard, and quiz route groups

---

## [0.1.1]

### Added

- Added JSON 404 responses for unknown API routes

### Changed

- Moved error handling middleware to run after all routes

---

## [0.1.0]

### Changed

- Handled JWT secrets more efficiently and allowed authenticated API requests using either a session cookie or Bearer token
- Scoped session cookies to the application root so that authenticated users could access all protected routes
- Signed users in automatically after email verification and password reset, which returned a CSRF token
- Returned a success message when logging out and a message stating that a user was not logged in when applicable
- Approved required install scripts for `mongodb-memory-server` and Jest's `unrs-resolver` dependency

### Added

### Fixed

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

- Fixed module path for budgeting content

---

## [0.0.6]

### Added

- Added content utility functions for managing modules and lessons
- Added lesson routes and controller for lesson management

### Changed

- Trimmed manifest.json to the one module that actually ships lessons
- In shared/content/index.js, exported modules map and utility functions

---

## [0.0.5]

### Added

- Added completed_micro_lessons to UserProgress Schema
- Added robust scrypt password hashing/comparison
- Added cookie-based JWT middleware with production CSRF checks
- Added dev verification/reset URLs

### Changed

- Renamed controllers, routes, and model files for consistency
- Replaced SMTP with Brevo and a development logging fallback
- Enabled /api/v1/users

---

## [0.0.4]

### Added

- Cherry-picks commits from feature branches to keep contributions from team to this point

### Changed

- Temporarily removed features breaking code without supporting dependent files

---

## [0.0.3]

### Added

- Installed dependencies and wrote scripts for backend
- Configured Express App with middleware and a simple hello route
- Added server and MongoDB connection setup
- Initialized environment example files

---

## [0.0.2]

### Added

- Initialized new project scaffolding to run project from root folder

### Removed

- Removed initial project scaffolding

---

## [0.0.1] - 2026-07-01

### Added

- Initial release.
