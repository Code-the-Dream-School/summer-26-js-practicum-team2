// src/features/onboarding/useOnboarding.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router'; 

// State machine configuration mapping steps to pages and paths
export const ONBOARDING_STEPS = {
  0: { page: 'dashboard', route: '/dashboard' },
  1: { page: 'profile', route: '/profile' },
  2: { page: 'lesson', route: '/lesson/sample-lesson' } 
};

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user has a "completed" flag saved in their browser
    const status = localStorage.getItem('sprout_onboarding_complete');
    
    if (status === null) {
      // First time landing from verification link -> Initialize onboarding
      localStorage.setItem('sprout_onboarding_complete', 'false');
      setHasCompleted(false);
    } else {
      setHasCompleted(status === 'true');
    }
  }, []);

  const handleNextStep = () => {
    const nextStepIndex = currentStep + 1;
    
    if (ONBOARDING_STEPS[nextStepIndex]) {
      setCurrentStep(nextStepIndex);
      // Sequentially shifts page routes just like advancing local views
      navigate(ONBOARDING_STEPS[nextStepIndex].route);
    } else {
      // Final walkthrough target cleared -> Mark complete permanently
      localStorage.setItem('sprout_onboarding_complete', 'true');
      setHasCompleted(true);
      navigate('/dashboard'); 
    }
  };

  return {
    currentStep,
    hasCompleted,
    activePage: ONBOARDING_STEPS[currentStep]?.page,
    handleNextStep
  };
}