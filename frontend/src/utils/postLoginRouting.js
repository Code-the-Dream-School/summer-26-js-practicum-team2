import { ROUTES } from "../app/router/routes";

/**
 * Determines the appropriate post-login destination based on user role and optional `next` parameter.
 *
 * Routing priority:
 * 1. If a valid `next` destination is provided, redirect there (for users who came from a protected page)
 * 2. Otherwise, redirect to the main dashboard
 *
 * Note: Admin-specific routing should be added here when admin dashboard features are available.
 *
 * @param {Object} options - Configuration object
 * @param {Object} _options.user - The authenticated user object (reserved for future use)
 * @param {string} [_options.user.role] - The user's role ("admin" or "learner")
 * @param {string} [options.next] - Optional redirect destination (validated by caller)
 * @returns {string} The route path to navigate to
 */
export function getPostLoginDestination({ _user, next }) {
  if (next) {
    return next;
  }

  return ROUTES.DASHBOARD;
}
