import { ROUTES } from "../app/router/routes";

/**
 * Determines the appropriate post-login destination based on user role and optional `next` parameter.
 *
 * Routing priority:
 * 1. If a valid `next` destination is provided, redirect there (for users who came from a protected page)
 * 2. Otherwise, redirect admins to the admin dashboard
 * 3. Otherwise, redirect to the learner dashboard
 *
 * @param {Object} options - Configuration object
 * @param {Object} options.user - The authenticated user object
 * @param {string} [options.user.role] - The user's role ("admin" or "learner")
 * @param {unknown} [options.next] - Optional redirect destination
 * @returns {string} The route path to navigate to
 */
export function isSafeLocalPath(next) {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) {
    return false;
  }

  try {
    decodeURIComponent(next);
    const parsed = new URL(next, "http://localhost");
    return parsed.origin === "http://localhost";
  } catch {
    return false;
  }
}

export function getPostLoginDestination({ user, next }) {
  if (isSafeLocalPath(next)) {
    return next;
  }

  if (user?.role === "admin") {
    return ROUTES.ADMIN_DASHBOARD;
  }

  return ROUTES.DASHBOARD;
}
