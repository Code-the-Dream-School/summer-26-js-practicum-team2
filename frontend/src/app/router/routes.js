export const ROUTES = {
 HOME: "/",
 LOGIN: "/login",
 REGISTER: "/register",
 VERIFY_EMAIL: "/verify",
 PASSWORD_RESET: "/reset-password",
 DASHBOARD: "/dashboard",
 PROFILE: "/profile",
 LEARN: "/learn",
 LAST_LESSON: "/learn/last-lesson",
 LEARN_LESSON: "/learn/:moduleId/:lessonId",
 PRIVACY: "/privacy",
 TERMS: "/terms",
 };


// Link target, not a <Route path> — the query string opts into the unauthenticated preview.
export const SAMPLE_LESSON_LINK = "/learn/cashFlow/1.1?sample=true";


const TITLES = {
 [ROUTES.HOME]: "Sprout — Counting Cents and Making Sense",
 [ROUTES.LOGIN]: "Log in — Sprout",
 [ROUTES.REGISTER]: "Create an account — Sprout",
 [ROUTES.VERIFY_EMAIL]: "Verify your email — Sprout",
 [ROUTES.PASSWORD_RESET]: "Reset your password — Sprout",
 [ROUTES.DASHBOARD]: "Dashboard — Sprout",
 [ROUTES.PROFILE]: "Profile — Sprout",
 [ROUTES.LEARN]: "Learning path — Sprout",
 [ROUTES.PRIVACY]: "Privacy policy — Sprout",
 [ROUTES.TERMS]: "Terms of service — Sprout",
};


export function getRouteTitle(pathname) {
 return (
   TITLES[pathname] ?? (pathname.startsWith("/learn/") ? "Lesson — Sprout" : "Not found — Sprout")
 );
}


