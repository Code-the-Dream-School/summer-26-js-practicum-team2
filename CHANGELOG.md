# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## [Unreleased] -->

<!-- --- -->

## [Unreleased]

### Added

- Added URL-based avatar management on the Profile page, with avatar images shown in the shared navigation and an initials fallback when an image cannot load.
- Added a public quiz answer-check endpoint that returns correctness, correct choices, and an explanation only after a learner submits an answer.
- Added a retry state when profile details cannot be loaded.

### Changed

- Updated account reactivation to use the normalized sign-in credentials, login rate limit, and shared account-deletion lifecycle handling.
- Updated profile, dashboard, and shared navigation state to synchronize learner details and current streaks after profile or learning-progress changes.
- Improved administrator user management filters and in-place updates, and disabled account actions that are not available for accounts scheduled for deletion.
- Standardized profile avatars as validated HTTP(S) URLs rather than file uploads.
- Updated global API rate limits to use production-specific limits while keeping development and test environments practical.

### Fixed

- Fixed stale learning streaks after missed days and kept profile and dashboard streak displays consistent.
- Fixed authentication handling so normal authorization and CSRF errors do not clear local sign-in state; confirmed invalidated, disabled, and deleted accounts now use stable session error codes.
- Fixed profile, password, deletion, and reactivation validation responses to return consistent structured errors.

---

## [0.4.1] - 2026-09-02

### Added

- Added Playwright coverage verifying that saving a display name updates the header avatar.

### Changed

- Redesigned mobile navigation as an anchored dropdown with account details for signed-in learners and a direct account-creation action for visitors.
- Improved mobile navigation accessibility with explicit open and close labels, menu relationships, active-link styling, click-away dismissal, and Escape-key support.
- Updated lesson question normalization to preserve correct choice identifiers from current and legacy lesson payloads.

### Fixed

- Fixed dashboards in fresh environments with no persisted modules so new learners receive the default Cash Flow start action and passed quizzes reconcile into saved progress.

---

## [0.4.0] - 2026-09-02

### Added

- Added full profile management for viewing and updating account details, avatar URLs, goals, notification preferences, passwords, and account deletion requests
- Added role-based administrator authorization with protected backend routes and frontend admin routing
- Added atomic administrator bootstrap behavior that assigns the first successfully registered user the admin role
- Added an administrator control panel for managing users, account status, roles, email verification, progress resets, and account deletion
- Added admin user listing, Ban/Unban controls, role management, progress reset, email verification, and reversible account deletion actions
- Added a 30-day account deletion lifecycle with scheduled deletion metadata and account reactivation support
- Added MongoDB-backed lesson module storage and lesson content management
- Added public lesson content APIs for signed-out lesson previews
- Added server-side quiz answer checking with intentional immediate correct-choice and explanation feedback after an answer is submitted
- Added admin module and nested lesson CRUD APIs with budgeting module seed support
- Added duplicate module and lesson protection with lesson cache invalidation
- Added an admin-only budgeting seed workflow for initializing runtime lesson content
- Added a full lesson JSON editor for lesson metadata, micro-lessons, quizzes, and lesson content blocks
- Added block-type controls for paragraph, callout, formula, list, quiz, table, and budget content
- Added structured editing support for lists, character introductions, knowledge checks, tables, and budget summaries
- Added backend and frontend regression coverage for profile management, account deletion, reactivation, administrator authorization, route guards, session invalidation, lesson content, and admin workflows
- Added Postman coverage for administrator status, user management, module seeding, module CRUD, nested lesson CRUD, public lesson loading, and quiz answer checks
- Added separate public, user, and admin Postman workflows with shared session and CSRF environment variables

### Changed

- Updated authentication to use database-backed user state and token-version checks when validating active sessions
- Updated login behavior to route administrators to the admin panel and learners to the standard dashboard
- Updated shared navigation to expose administrator links only to authorized users and make all navigation links accessible from the mobile menu
- Prevented disabled, banned, and deleted users from signing in or continuing authenticated sessions
- Updated account deletion to use an administrator-reviewed soft-deletion workflow with a recovery period
- Updated signed-out lesson previews to load lesson content through the public lesson API instead of bundled frontend content
- Updated lesson normalization to consume API-provided lesson payloads
- Updated public and authenticated lesson responses to sanitize quiz answers and explanations before the intentional immediate-feedback check request
- Updated quiz state to use correctness metadata returned by the server instead of calculating correctness from bundled answer data
- Made learning-path module discovery database-driven instead of assuming the `cashFlow` module
- Made dashboard next actions and empty states reflect the lesson modules currently available in the database
- Updated unseeded learning-path states to use the shared `EmptyState` presentation and lesson artwork
- Replaced admin panel action controls with the shared `Button` component
- Updated Postman authentication workflows to share user and admin session and CSRF state
- Updated Postman requests to correctly handle login cookies, logout sessions, dashboard events, and multipart lesson imports

### Fixed

- Fixed non-administrator access to protected administrator pages so unauthorized users return to the standard dashboard
- Fixed account reactivation lookups so recently deleted users can be restored during the 30-day recovery period
- Fixed profile deletion and administrator approval/rejection requests so frontend and backend API contracts remain aligned
- Fixed soft-delete validation to accept the deletion state used by the admin panel
- Fixed banned-account login handling to return an explicit account-banned message
- Fixed administrator account actions so admins cannot perform destructive management actions against their own account
- Fixed repeated administrator email verification attempts
- Fixed duplicate lesson and module creation and ensured content caches are invalidated after administrative updates
- Fixed Postman user login cookie capture, logout cookie handling, dashboard event requests, multipart import headers, and collection route coverage

### Security

- Added explicit administrator-role enforcement to all protected admin API routes
- Added database-backed JWT version validation so password changes, account deletion, bans, and other account-state changes can invalidate existing sessions
- Added banned-session enforcement so already authenticated users cannot continue using revoked accounts
- Prevented administrators from targeting their own account with destructive management actions
- Restricted account deletion approval and rejection to users with active pending deletion requests
- Allowlisted administrator API response fields to prevent sensitive user data such as password hashes from being exposed
- Stopped administrator deletion actions from returning complete user documents
- Prevented public and authenticated lesson APIs from exposing quiz `correctResponse` or explanation data in initial lesson payloads; `POST /api/v1/quizzes/check` intentionally returns feedback after an answer is submitted
- Moved quiz correctness validation to the backend instead of trusting client-side lesson content

### Removed

- Removed the frontend dependency on bundled lesson content for signed-out lesson previews
- Removed the `getSampleLesson` preview helper
- Removed automatic runtime loading of arbitrary lesson JSON files in favor of MongoDB-backed module discovery and administrative seeding
- Kept learning-path module discovery database-driven while allowing dashboard and direct `cashFlow` lesson requests to use bundled default content when MongoDB has not been seeded

---

## [0.3.8] - 2026-09-01

### Added

- Added core rule utilities and corresponding tests for XP awards and caps, streak/freeze status, and lesson-unlock gating.
- Added backend API integration, contract, and negative-path coverage for authentication, password reset, logout/CSRF protection, lesson and dashboard progress, quiz persistence and submission, middleware/error responses, security headers, and rate limiting.
- Added shared backend authentication and request helpers to reduce repeated Authorization and session-plus-CSRF setup across integration tests.
- Added backend coverage enforcement through `test:coverage` with global Jest coverage thresholds.
- Added frontend regression and unit coverage for authentication, dashboard caching and refresh, lesson loading and navigation, learning-path state, quiz interactions and review flows, reducers, shared components, accessibility behavior, consent analytics, and email verification.
- Added Playwright end-to-end testing with Chromium, including browser smoke coverage for protected-route redirects and keyboard navigation through the responsive mobile menu.
- Added CI artifacts for frontend test output, frontend builds, backend coverage, and Playwright reports/results to improve failure diagnostics.
- Added a keyboard-accessible "Skip to content" link and main-content target to the shared application layout.

### Changed

- Updated CI pull-request triggers from `docs` to `main`.
- Updated backend CI to enforce coverage thresholds and added browser journey checks to the CI pipeline.
- Updated email-verification errors to use alert semantics so they are announced by assistive technology.
- Updated formatting and test-result ignore configuration for generated coverage, build, and Playwright artifacts.

### Fixed

- Fixed the Express error-handler middleware contract to accept `next` and forward errors when response headers have already been sent.

---

## [0.3.7] - 2026-08-25

### Added

- Added chunk-level lesson progress tracking so learners can resume at the exact lesson, micro-lesson, and chunk they left off on
- Added a lesson progress restart endpoint and frontend API helper for restarting saved progress
- Added `LessonControlPanel` with a welcome-back message and --Start Over-- option when resuming saved lesson progress
- Added backend regression and validation tests for lesson progress creation, updates, restarting, and invalid requests
- Added frontend regression tests for lesson resume, restart, progress syncing, and `LessonControlPanel` behavior
- Added the lesson progress restart endpoint to the API documentation and Postman collection

### Changed

- Updated Learning Path navigation to pass the selected micro-lesson into the lesson flow and changed the current lesson action from --Next-- to --Resume--
- Updated lesson progress syncing to save the learner's current chunk along with the lesson and micro-lesson
- Updated global API rate limiting to allow 200 requests per 15 minutes in production and use a higher limit during development

### Fixed

- Fixed lesson resume behavior so saved progress returns learners to the correct micro-lesson and chunk instead of restarting at the beginning of the micro-lesson
- Fixed learning path resume navigation to open the learner's current micro-lesson instead of only opening the containing lesson

---

## [0.3.6] - 2026-08-25

### Added

- Added focused backend integration tests for invalid lesson progress, quiz, password recovery, and dashboard event requests
- Added backend write-endpoint validation tests covering body-less requests and valid schema regression cases
- Added reusable Joi schemas and request validation helpers for backend write endpoint validation
- Added frontend password policy coverage with schema tests and form-level integration tests
- Added shared frontend password helper-text utility for registration and password reset forms
- Added documentation for write endpoint validation and the standard validation error response

### Changed

- Validated backend lesson progress, quiz, password recovery, and dashboard event inputs before processing or persistence
- Updated password validation to accept 16+ character passwords with uppercase, lowercase, and numeric characters; shorter passwords require a special character
- Updated registration and password reset helper text to render conditionally based on password length using shared logic

### Fixed

- Fixed validation behavior for missing request bodies so empty payloads consistently return structured 400 validation responses
- Fixed short-password special-character handling so whitespace does not satisfy the symbol requirement

---

## [0.3.5] - 2026-08-20

### Added

- Added a failing test reproducing the refresh-redirect bug where an authenticated user on the Learn page was sent to login before auth storage finished hydrating

### Fixed

- Fixed LearnPage redirecting authenticated users to login on refresh by waiting for auth hydration before checking authentication state

---

## [0.3.4] - 2026-08-19

### Added

- Added setup script for environment configuration and update package.json

### Changed

- Combines sync-shared-files into a single GitHub workflow file
- Restored functionality from development-backup to optionally inject a port into both frontend and backend

### Removed

- Removed kill-port as devDependency and removes the predev script

---

## [0.3.3] - 2026-08-19

### Added

- Added function to generate random encouraging phrases and words for quiz feedback
- Added ExpandableWhy component for quiz explanation display when the explanation is greater than 30 words
- Added a step-by-step quiz review flow after lesson completion.
- Preserved submitted quiz answers for later review.
- Added read-only answer feedback with correct and incorrect choice indicators.
- Added Previous, Next, and Back to Results navigation during quiz review.
- Added a quiz feedback preference (instant vs. at-the-end) with a toggle on the Profile page.
- Wired the quiz feedback preference into the lesson flow so it controls whether answers are revealed per question or only after quiz submission.
- Added character introductions for Abigail and Ramona in budgeting lessons
- Added additional randomized phrases and words for quiz completion, and catching up on lessons

### Changed

- Extracted the lesson/quiz flow out of LearnPage into a new LearnFlow component, reducing LearnPage's size.
- Refactored CharacterIntro component to only render text
- Refactored Table component for better accessibility and prevent crashes with optional chaining
- Changed the review quiz to only show explanations, not the encouraging text that shows up while taking a quiz

### Fixed

- Resolved a Mongoose deprecation warning by replacing the obsolete `new: true` option with `returnDocument: "after"` in the lesson progress and quiz submission controllers.
- Added `aggregateLessonScore` helper for calculating lesson quiz scores based on the total number of questions
- Added `quizScoring.test.js` tests for weighted scoring, passing and failing scores, and empty submissions
- Added `quiz.scoring.test.js` backend tests to make sure each micro-lesson quiz is still graded on its own

### Fixed

- Fixed lesson quiz scoring to use the total number of questions across all quizzes, preventing incorrect percentages and false "Fail" results

## [0.3.2] - 2026-08-18

### Added

- Added content accuracy review policy document
- Added accuracy review fields to budgeting lessons
- Added lesson accuracy metadata test
- Added content sign-off section to PR template for accuracy review
- Added content accuracy checklist for review process
- Added Content Accuracy section to README files
- Backfilled lesson content with passing metadata when it was completed

## [0.3.1] - 2026-08-18

### Fixed

- Fixed cross-site authentication between the Netlify frontend and Render backend by making session cookie security and `SameSite` settings configurable through environment variables.

---

## [0.3.0] - 2026-08-16

### Added

- Added repository community-standard files: `SUPPORT.md`, `.editorconfig`, `.gitattributes`, and `.nvmrc`
- Added GitHub governance and automation files: `.github/CODEOWNERS`, `.github/SECURITY.md`, `.github/dependabot.yml`, and `.github/workflows/ci.yml`
- Added issue templates for bug reports, feature requests, and security vulnerabilities with issue-chooser contact links
- Added docs index and split guides under `docs/` for setup, API overview, Postman testing, workflow, and roadmap
- Added Postman environment files for remote development and remote production backend testing
- Added GitHub workflows for syncing `docs` with `development` and also `development` with `docs`

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
- Fixed login rate limiter IP key generation
- In backend/server.js, conditionally sets DNS override only outside of production to prevent the app from crashing in some environments
- Allowed Vite to access shared lesson content by updating the vite.config.js file
- Prevented invalid button props on link components by adding a type check in Button component and confirming isDisable is not undefined
- Fixed Tailwind breakpoint class typo in CharacterIntro component
- Fixed typo with duplicate JWT_SECRET is backend/.env.example
- Improved lesson table rendering by safely handling missing module, table, and budget data, and by selecting the correct budget when a `budgetId` is provided instead of always defaulting to the first budget.

---

## [0.2.9] 2026-08-15

### Added

- Added progress-driven LearningPathPage with lesson and micro-lesson navigation states
- Added LearningPathNode component for current, completed, and locked learning steps
- Added LastLessonRedirect with API lookup and localStorage fallback behavior

### Changed

- Refactor LearningPathPage component to show a callout message

### Fixed

- Switched script runner from concurrently to npm-run-all to prevent multiple "ghost" servers from running.

---

## [0.2.8] - 2026-08-14

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

## [0.2.7] - 2026-08-11

### Added

- Added quiz scoring utility functions for normalizing choice IDs and scoring attempts
- Implemented quiz reducer with action handling and initial state setup
- Added useQuiz hook for managing quiz state and interactions
- Added QuizComponent for interactive quiz functionality

### Changed

- Invalidated cached dashboard on quiz submission to ensure progress updates are reflected

---

## [0.2.6] 2026-08-10

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

## [0.2.5] 2026-08-09

### Added

- Declared @hookform/resolvers as a dependency
- Added validation schemas for authentication and password management
- Added placeholder identities for fun registration experience
- Implemented password reset and email verification forms with error handling and user feedback

---

## [0.2.4] - 2026-08-08

### Added

- Added legal consent utility functions for tracking preferences
- Added ConsentBanner component to handle user consent for analytics
- Added Privacy and Terms pages with detailed content and improved layout
- Added Profile page shell and created routes to reach it

### Changed

- Refactored HomePage component to enhance layout and integrate authentication logic
- Compress images by converting large SVGs into .webp images

---

## [0.2.3] - 2026-08-07

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

## [0.2.2] - 2026-08-06

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

## [0.2.1] - 2026-08-05

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

## [0.2.0] - 2026-08-04

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

## [0.1.3] - 2026-08-03

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

## [0.1.2] - 2026-08-02

### Added

- Add Postman collection and environment files for local backend API testing

### Changed

- Moved JWT authentication from individual endpoints to the lesson, dashboard, and quiz route groups

---

## [0.1.1] - 2026-08-01

### Added

- Added JSON 404 responses for unknown API routes

### Changed

- Moved error handling middleware to run after all routes

---

## [0.1.0] - 2026-07-31

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

## [0.0.7] - 2026-07-30

### Added

- Added dashboard cache invalidation on quiz submission
- Added shared learning-path helpers
- Added dashboard assembly for hero copy, next action, unit progress, recent activity, and passed-attempt reconciliation
- Added POST /api/v1/dashboard/events; unknown event types are accepted and ignored
- Enabled /api/v1/dashboard and /api/v1/quizzes routes

### Fixed

- Fixed module path for budgeting content

---

## [0.0.6] - 2026-07-29

### Added

- Added content utility functions for managing modules and lessons
- Added lesson routes and controller for lesson management

### Changed

- Trimmed manifest.json to the one module that actually ships lessons
- In shared/content/index.js, exported modules map and utility functions

---

## [0.0.5] - 2026-07-28

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

## [0.0.4] 2026-07-27

### Added

- Cherry-picks commits from feature branches to keep contributions from team to this point

### Changed

- Temporarily removed features breaking code without supporting dependent files

---

## [0.0.3] 2026-07-26

### Added

- Installed dependencies and wrote scripts for backend
- Configured Express App with middleware and a simple hello route
- Added server and MongoDB connection setup
- Initialized environment example files

---

## [0.0.2] - 2026-07-25

### Added

- Initialized new project scaffolding to run project from root folder

### Removed

- Removed initial project scaffolding

---

## [0.0.1] - 2026-07-12

### Added

- Initial release.
