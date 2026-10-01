export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify",
  OAUTH_CALLBACK: "/oauth/callback",
  PASSWORD_RESET: "/reset-password",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  LEARN: "/learn",
  LAST_LESSON: "/learn/last-lesson",
  LEARN_LESSON: "/learn/:moduleId/:lessonId",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  ADMIN_DASHBOARD: "/admin/dashboard",
};

export const APP_NAME = import.meta.env.VITE_APP_NAME?.trim() || "open.quiz";

// External link for the "Report a bug" CTA on error pages (404/500).
export const REPORT_BUG_LINK =
  "https://github.com/Code-the-Dream-School/summer-26-js-practicum-team2/issues/new?template=bug_report.md";

const TITLES = {
  [ROUTES.HOME]: APP_NAME,
  [ROUTES.LOGIN]: `Log in — ${APP_NAME}`,
  [ROUTES.REGISTER]: `Create an account — ${APP_NAME}`,
  [ROUTES.VERIFY_EMAIL]: `Verify your email — ${APP_NAME}`,
  [ROUTES.OAUTH_CALLBACK]: `Signing you in — ${APP_NAME}`,
  [ROUTES.PASSWORD_RESET]: `Reset your password — ${APP_NAME}`,
  [ROUTES.DASHBOARD]: `Dashboard — ${APP_NAME}`,
  [ROUTES.PROFILE]: `Profile — ${APP_NAME}`,
  [ROUTES.LEARN]: `Learning path — ${APP_NAME}`,
  [ROUTES.PRIVACY]: `Privacy policy — ${APP_NAME}`,
  [ROUTES.TERMS]: `Terms of service — ${APP_NAME}`,
  [ROUTES.ADMIN_DASHBOARD]: `Admin dashboard — ${APP_NAME}`,
};

export function getRouteTitle(pathname) {
  return (
    TITLES[pathname] ??
    (pathname.startsWith("/learn/") ? `Lesson — ${APP_NAME}` : `Not found — ${APP_NAME}`)
  );
}
