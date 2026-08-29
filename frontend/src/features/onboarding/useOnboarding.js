import { useState, useEffect } from 'react';
import { getOnboardingState, updateOnboardingProgress,toggleOnboardingAPI } from '../../services/api';

export const ONBOARDING_STEPS = {
  0: { page: 'dashboardPage', route: '/dashboard' },
  1: { page: 'profilePage', route: '/profile' },
  2: { page: 'learningPath', route: '/learning-path' },
  3: { page: 'lessonPage', route: '/learn/cashFlow/1.1' }
}

export function useOnboarding(isAuthenticated, csrfToken) {
  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    getOnboardingState(csrfToken)
      .then((data) => {
        if (data.success) setOnboardingData(data.onboarding);
      })
      .catch((err) => console.error("Error loading onboarding state:", err))
      .finally(() => setLoading(false));
  }, [isAuthenticated, csrfToken]);

  const saveTourProgress = async ({ tourKey, step, dismissed }) => {
    try {
      const result = await updateOnboardingProgress({
        tourKey,
        step,
        dismissed,
        csrfToken,
      });
      
      if (result.onboarding) {
        setOnboardingData(result.onboarding); 
      }
    } catch (err) {
      console.error(`Failed to patch onboarding data for ${tourKey}:`, err);
    }
  };

  // Inside your useOnboarding hook function block, add this method:
const toggleOnboarding = async (enabled) => {
  try {
    const result = await toggleOnboardingAPI(enabled, csrfToken);
    if (result.success) {
      setOnboardingData(result.onboarding);
    }
  } catch (err) {
    console.error("Failed to toggle onboarding:", err);
  }
};

return {
  onboardingData,
  loading,
  saveTourProgress,
  toggleOnboarding, 
  isCompleted: onboardingData?.is_completed ?? false,
};
}