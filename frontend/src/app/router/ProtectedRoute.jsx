// import { Navigate, useLocation } from "react-router";
// import { useAuthContext } from "../../context/AuthContext";
// import Spinner from "../../shared/Spinner/Spinner.component";
// import { ROUTES } from "./routes";

// export default function ProtectedRoute({ children }) {
//   const { isAuthenticated, isHydrating } = useAuthContext();
//   const location = useLocation();

//   // Redirecting before hydration finishes would bounce a signed-in user on every refresh.
//   if (isHydrating) {
//     return (
//       <div className="flex min-h-[50vh] items-center justify-center">
//         <Spinner label="Loading" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     const next = encodeURIComponent(location.pathname + location.search);
//     return <Navigate to={`${ROUTES.LOGIN}?next=${next}`} replace />;
//   }

//   return children;
// }
import { Navigate, useLocation } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import Spinner from "../../shared/Spinner/Spinner.component";
import { ROUTES } from "./routes";

import { useOnboarding } from "../../features/onboarding/useOnboarding";
import OnboardingOverlay from "../../features/onboarding/OnboardingOverlay.component";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isHydrating } = useAuthContext();
  const location = useLocation();

  const { currentStep, hasCompleted, activePage, startOnboarding, skipOnboarding, handleNextStep } =
    useOnboarding();

  // Redirecting before hydration finishes would bounce a signed-in user on every refresh.
  if (isHydrating) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${ROUTES.LOGIN}?next=${next}`} replace />;
  }
  //Aug 30 Extract current page key from the route path ()
  const currentPageName = location.pathname.split("/")[1] || "dashboard";
  return (
    <>
      {!hasCompleted && (
        <OnboardingOverlay
          hasCompleted={hasCompleted}
          currentStep={currentStep}
          activePage={activePage}
          pageName={currentPageName}
          onNext={handleNextStep}
          onSkip={skipOnboarding}
          onStart={startOnboarding}
        />
      )}
      {children}
    </>
  );
}
