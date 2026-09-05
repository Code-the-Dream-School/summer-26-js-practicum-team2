import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import {
  getOnboardingState,
  resetOnboardingProgress,
  updateOnboardingProgress,
} from "../../services/api";
import { ONBOARDING_STEPS } from "./onboarding.constants";

export { ONBOARDING_STEPS } from "./onboarding.constants";

const STORAGE_KEY = "sprout_onboarding_complete";

export function useOnboarding() {
  const { csrfToken, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(null);
  const [hasCompleted, setHasCompleted] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true",
  );

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;
    getOnboardingState()
      .then(({ onboarding }) => {
        if (cancelled || !onboarding) return;
        const completed = Boolean(onboarding.is_completed);
        setHasCompleted(completed);
        localStorage.setItem(STORAGE_KEY, String(completed));
        setCurrentStep(!completed && onboarding.started_at ? (onboarding.current_step ?? 0) : null);
      })
      .catch((error) => console.error("Failed to load onboarding progress:", error));

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const startOnboarding = async () => {
    setCurrentStep(0);
    setHasCompleted(false);
    localStorage.setItem(STORAGE_KEY, "false");
    navigate(ONBOARDING_STEPS[0].route);

    try {
      await resetOnboardingProgress(csrfToken);
    } catch (error) {
      console.error("Failed to reset onboarding progress:", error);
    }
  };

  const saveStep = (tourKey, step, status, dismissed) =>
    updateOnboardingProgress({ tourKey, step, status, dismissed, csrfToken });

  const skipOnboarding = async () => {
    const activeTourKey = ONBOARDING_STEPS[currentStep]?.page;
    setCurrentStep(null);
    navigate(ONBOARDING_STEPS[0].route);

    if (!activeTourKey) return;
    try {
      await saveStep(activeTourKey, currentStep, "skipped", true);
    } catch (error) {
      console.error("Failed to save skipped onboarding step:", error);
    }
  };

  const handleNextStep = async () => {
    const activeTourKey = ONBOARDING_STEPS[currentStep]?.page;
    if (activeTourKey) {
      try {
        await saveStep(activeTourKey, currentStep, "completed", false);
      } catch (error) {
        console.error("Failed to save onboarding progress:", error);
      }
    }

    const nextStep = currentStep + 1;
    if (ONBOARDING_STEPS[nextStep]) {
      setCurrentStep(nextStep);
      navigate(ONBOARDING_STEPS[nextStep].route);
      return;
    }

    setCurrentStep(null);
    setHasCompleted(true);
    localStorage.setItem(STORAGE_KEY, "true");
    navigate(ONBOARDING_STEPS[0].route);
  };

  return {
    currentStep,
    hasCompleted,
    activePage: ONBOARDING_STEPS[currentStep]?.page ?? null,
    startOnboarding,
    skipOnboarding,
    handleNextStep,
  };
}
