import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import { OnboardingProvider, useOnboarding } from "../../context/OnboardingContext1";
import OnboardingOverlay from "../../features/onboarding1/onboardingOverlay1.component";
import Header from "./Header/Header.component";
import Footer from "./Footer/Footer.component";
import ConsentBanner from "../../features/legal/ConsentBanner/ConsentBanner.component";

function OnboardingWrapper() {
  const { currentStep, hasCompleted, activePage, startOnboarding, skipOnboarding, handleNextStep } =
    useOnboarding();
  const location = useLocation();
  
  //Map current pathname to match tours
  const getPageName = (pathname) => {
    if (pathname.includes("/dashboard") || pathname === "/") return "dashboardPage";
    if (pathname.includes("/profile")) return "profilePage";
    if (pathname.includes("/learn/last-lesson")) return "lessonPage";
    if (pathname.includes("/learn")) return "learningPath";
    return "";
  };
  const currentPageName = getPageName(location.pathname);
  return(
    <OnboardingOverlay
              hasCompleted={hasCompleted}
              currentStep={currentStep}
              activePage={activePage}
              pageName={currentPageName}
              onNext={handleNextStep}
              onStart={startOnboarding}
              onSkip={skipOnboarding}
            /> 
  );
}
export default function MainLayout() {
  const { isAuthenticated, user, logout } = useAuthContext();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await logout();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <OnboardingProvider>
      <div className="mx-auto min-h-screen bg-surface-app text-foreground">
        <Header
          signedIn={isAuthenticated}
          avatarLabel={user?.name?.charAt(0)?.toUpperCase() || "A"}
          onLogout={handleLogout}
          isSigningOut={isSigningOut}
        />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <OnboardingWrapper />
          <Outlet />
        </main>
        
        <Footer />
        <ConsentBanner />
      </div>
    </OnboardingProvider>
  );
}
