import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import { OnboardingProvider, useOnboarding } from "../../context/OnboardingContext1";
import OnboardingOverlay from "../../features/onboarding1/OnboardingOverlay1.component";
import Header from "./Header/Header.component";
import Footer from "./Footer/Footer.component";
import ConsentBanner from "../../features/legal/ConsentBanner/ConsentBanner.component";
import { getOnboardingPageName } from "../../features/onboarding1/onboarding.utils";

function OnboardingWrapper() {
  const { currentStep, hasCompleted, activePage, startOnboarding, skipOnboarding, handleNextStep } =
    useOnboarding();
  const location = useLocation();

  const pageName = getOnboardingPageName(location.pathname);

  return (
    <OnboardingOverlay
      hasCompleted={hasCompleted}
      currentStep={currentStep}
      activePage={activePage}
      pageName={pageName}
      onNext={handleNextStep}
      onStart={startOnboarding}
      onSkip={skipOnboarding}
    />
  );
}

export default function MainLayout() {
  const { isAuthenticated, user, logout } = useAuthContext();
  //add for admin update
  const isAdmin = user?.role === "admin";
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [currentModuleResources, setCurrentModuleResources] = useState({
    glossary: [],
    worksCited: [],
  });

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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface-app focus:px-4 focus:py-2 focus:text-primary"
        >
          Skip to content
        </a>
        <Header
          signedIn={isAuthenticated}
          isAdmin={isAdmin}
          avatarLabel={user?.name?.charAt(0)?.toUpperCase() || "A"}
          avatarUrl={user?.avatar_url ?? null}
          xp={user?.xp ?? 0}
          streak={user?.streak ?? 0}
          onLogout={handleLogout}
          isSigningOut={isSigningOut}
        />
        <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {isAuthenticated && <OnboardingWrapper />}
          <Outlet context={setCurrentModuleResources} />
        </main>
        <Footer
          glossary={currentModuleResources.glossary}
          worksCited={currentModuleResources.worksCited}
        />
        <ConsentBanner />
      </div>
    </OnboardingProvider>
  );
}
