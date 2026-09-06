import { ROUTES } from "../../app/router/routes";

export function getOnboardingPageName(pathname) {
  if (pathname === ROUTES.DASHBOARD || pathname === ROUTES.HOME) return "dashboardPage";
  if (pathname === ROUTES.PROFILE) return "profilePage";
  if (pathname === ROUTES.LEARN) return "learningPath";
  if (pathname.startsWith(`${ROUTES.LEARN}/`)) return "lessonPage";
  return "";
}
