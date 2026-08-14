# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## [Unreleased] -->

<!-- --- -->

## 0.2.8

### Added

- Added UnitProgressRow component for displaying lesson progress
- Added RecentActivityCard component to display user activity feed
- Added DashboardHero component for user dashboard display
- Added useDashboardData hook for managing dashboard state and caching
- Added dashboard fixture data for initial testing

### Changed

- Refactor npm scripts for better organization of backend and frontend tests
- Enhanced DashboardPage with loading and error states, and integrate DashboardHero, RecentActivityCard, and UnitProgressRow components

---

## [0.2.7]

### Added

- Added quiz scoring utility functions for normalizing choice IDs and scoring attempts
- Implemented quiz reducer with action handling and initial state setup
- Added useQuiz hook for managing quiz state and interactions
- Added QuizComponent for interactive quiz functionality
- Added unit tests for quizReducer functionality
- Added tests for QuizComponent functionality
- Added tests for quiz scoring and normalization functions

### Changed

- Invalidated cached dashboard on quiz submission to ensure progress updates are reflected

---

## [0.2.6]

### Added

- Added useLessonContent hook for lesson data fetching and state management
- Added normalization functions for lesson content and questions
- Added lesson cash flow JSON fixture for budgeting module
- Added tests for LessonRenderer component to verify content rendering and reference resolution
- Added tests for useLessonContent hook to verify lesson loading and error handling
- Added tests for normalizeLesson utility functions
- Enabled clearMocks option in Vitest configuration for better test isolation

### Changed

- Moved lesson components into features and adds component suffix
- Refactored LearnPage to integrate lesson flow and progress tracking

### Fixed

- Fixes script option in dev command to prevent concurrent failures
- Added SAMPLE_LESSON_LINK to routes and update tests for public access to fix failing test in AppRouter.test

---

## [0.2.5]

### Added

- Declared @hookform/resolvers as a dependency
- Added validation schemas for authentication and password management
- Added placeholder identities for fun registration experience
- Implemented password reset and email verification forms with error handling and user feedback
- Added tests for Login and Register pages to validate user input and authentication flow

---

## [0.2.4]

### Added

- Added legal consent utility functions for tracking preferences
- Added ConsentBanner component to handle user consent for analytics
- Added Privacy and Terms pages with detailed content and improved layout
- Added unit tests for legal consent functionality
- Added Profile page shell and created routes to reach it
- Add tests for ProtectedRoute component and enhance AppRouter tests

### Changed

- Refactored HomePage component to enhance layout and integrate authentication logic
- Compress images by converting large SVGs into .webp images

---

## [0.2.3]

### Added

- Added initial page components for Dashboard, Last Lesson Redirect, Login, Password Reset, Privacy, Register, Terms, and Verify Email
- Added ProtectedRoute component for authentication handling
- Added tests for AppRouter to validate routing behavior and authentication handling

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
- Added mock implementations for HTMLDialogElement methods in setupTests
- Added tests for Button, Card, EmptyState, Input, and Modal components

### Changed

- Renamed every shared component to have a `.component.jsx` suffix
- Refactored layout components: updated MainLayout import path, enhanced Header with logo and props, and streamlined NavBar structure

### Removed

- Removed unused SVG images

---

## [0.2.1]

### Added

- Added auth reducer with action types and initial state
- Added tests for authReducer functionality
- Implemented authentication context and provider
- Updated environment configuration and API paths
- Added lesson and quiz endpoints

### Changed

- Refactored useAuth hook to improve authentication state management and storage handling
- Disabled react-refresh rule for context files
- Wrapped AppRouter with AuthProvider for authentication context

### Removed

- Removed setupTests test as it was a temporary proof of concept

---

## [0.2.0]

### Added

- Added Vitest, jsdom, and React Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`) to the frontend as dev dependencies
- Added `test` and `test:watch` scripts to the frontend package
- Added `frontend/src/styles/reset.css` with an accessibility-focused reset covering `:focus-visible`, `forced-colors`, and `prefers-reduced-motion`
- Added `frontend/src/styles/theme.css` defining the Tailwind `@theme` design tokens for brand, status, surface, and learning-path colors
- Added `VITE_API_PORT` documentation to `frontend/.env.example`
- Added a `/api` dev-server proxy to `frontend/vite.config.js`, targeting the port set by `VITE_API_PORT` (defaults to `8080`)
- Added `frontend/public/_redirects` so client-side routes resolve correctly on Netlify
- Added Vitest setup and initial test configuration

### Changed

- Changed `frontend/src/index.css` to import the reset and theme stylesheets alongside Tailwind
- Changed the frontend ESLint config to declare Vitest globals for test files and the setup file, keeping `npm run lint --max-warnings 0` passing

### Fixed

- Fixed the misspelled `frontend/.prettieringore`, which left `node_modules`, `dist`, `coverage`, and `package-lock.json` unignored by Prettier

---

## [0.1.3]

### Added

- Added Postman collection and environment files for local backend API testing
- Added instructions within `.env.example` to generate a proper JWT token for use in production
- Added ESLint and Prettier configuration for code formatting and linting
- Added tests for error handler middleware to validate responses for Mongoose ID errors and malformed JSON

### Changed

- Refactored JWT middleware to simplify CSRF token validation logic
- Refactored authentication tests to use helper functions for user registration, verification, and login
- Refactored lesson test helpers for improved readability and functionality
- Validated microLessonId in startQuiz and handled empty request body
- Refactored error handler middleware to remove unused next parameter and improved error handling structure

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

- Handled JWT secrets more efficiently and allowed authenticated API requests using either a session cookie or Bearer token
- Scoped session cookies to the application root so that authenticated users could access all protected routes
- Signed users in automatically after email verification and password reset, which returned a CSRF token
- Returned a success message when logging out and a message stating that a user was not logged in when applicable
- Upgraded the backend test runner to Jest 30
- Approved required install scripts for `mongodb-memory-server` and Jest's `unrs-resolver` dependency

### Added

- Added a `npm test` command for the backend using Jest and Supertest
- Added isolated in-memory MongoDB setup and cleanup for backend integration tests
- Added integration coverage for registration, login, logout, password-reset sessions, and protected lesson retrieval

### Fixed

- Implemented an IPv6-safe login limiter fallback to satisfy tests
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
