// src/features/onboarding/useOnboarding.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
//extract Token from AuthContext
import { useAuthContext } from "../../context/AuthContext";
import { ONBOARDING_STEPS } from "./onboarding.constants";

import {
  resetOnboardingProgress as apiResetOnboarding,
  //toggleOnboardingWorkflow as apiToggleOnboarding,
  updateOnboardingProgress as apiUpdateOnboardingProgress,
  beginOnboarding as apiBeginOnboarding,
  getOnboardingState as apiGetOnboardingState,
} from "../../services/api";

export { ONBOARDING_STEPS } from "./onboarding.constants";

export function useOnboarding() {
  const { csrfToken } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(null); //when you are waiting for user's response
  const navigate = useNavigate();
  // const [activePage, setActivePage] = useState("dashboard");

  const [hasCompleted, setHasCompleted] = useState(() => {
    const status = localStorage.getItem("sprout_onboarding_complete");
    if (status === null) {
      // First time landing from verification link -> Initialize onboarding
      localStorage.setItem("sprout_onboarding_complete", "false");
      return false;
    }
    return status === "true";
  });
useEffect (() => {
  async function fetchOnboardingState() {
      try {
        const response = await apiGetOnboardingState();
        if (response?.onboarding) {
          const onboarding = response.onboarding;
          const completed = Boolean(onboarding.is_completed);

          setHasCompleted(completed);
          localStorage.setItem("sprout_onboarding_complete", completed ? "true" : "false");

          //Only set active step if user started and not finished
          if(!completed && onboarding.started_at){
            setCurrentStep(onboarding.current_step ?? 0);
          }else{
            setCurrentStep(null);
          }
        }
          }catch(err){
            console.error("fail",err)
          }
        }
        fetchOnboardingState()},[]);

  const startOnboarding = async () => {
    console.log("startOnboarding called");
    console.log("Current Auth Token:", csrfToken);
    setCurrentStep(0);
    localStorage.setItem("sprout_onboarding_complete", "false");
    setHasCompleted(false);
    navigate(ONBOARDING_STEPS[0].route);

    try {
      await apiBeginOnboarding();
      await apiResetOnboarding(csrfToken);
      localStorage.setItem("sprout_onboarding_complete", "false");
      setHasCompleted(false);
      setCurrentStep(0);
      navigate(ONBOARDING_STEPS[0].route);
    } catch (err) {
      console.error("Fail to reset onboarding session:", err);
    }
  };
  
  //helper function to update progress in database via Path /api/v1/onboarding/step route
  const sendOnboardingStepToDB = async (tourKey, step, status, dismissed) => {
    try {
      await apiUpdateOnboardingProgress({
        tourKey,
        step,
        status,
        dismissed,
        csrfToken,
      });
    } catch (err) {
      console.error("Fail to sync onboard progress:", err);
    }
  };
  const skipOnboarding = async () => {
    const activeTourKey = ONBOARDING_STEPS[currentStep]?.page;
    try {
      if (activeTourKey && currentStep !== null) {
       await sendOnboardingStepToDB(activeTourKey, currentStep, "skipped", true);
      }
       //Reset local step state so popup closes and dashboard banner is available for user at a later time 
       setCurrentStep(null);
       localStorage.setItem("sprout_onboarding_complete", "false");
       setHasCompleted(false);
        navigate("/dashboard");
    
//Commenting out lines 148 to 151 with apiToggleOnboarding since it may have been forcing all unvisited keys as skipped preventing to try onboarding later. may later figure out logic to track user who do a an absolute skip all to all onboarding tours

    // try {
    //   await apiToggleOnboarding({
    //     enabled: false,
    //     csrfToken,
    //     // await fetch("/api/v1/onboarding/toggle", {
        //   method: "PATCH",
        //   credentials: "include",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
      //});
    } catch (err) {
      console.error("Failed to skip onboarding session:", err);
    }
  };
  const handleNextStep = async () => {
    const activeTourKey = ONBOARDING_STEPS[currentStep]?.page;

    try {
      if (activeTourKey) {
        await sendOnboardingStepToDB(activeTourKey, currentStep, "completed", false);
      }
    } catch (err) {
      console.error("Failed to sync step to backend: ", err);
    }
    const nextStepIndex = currentStep + 1;

    if (ONBOARDING_STEPS[nextStepIndex]) {
      setCurrentStep(nextStepIndex);
      navigate(ONBOARDING_STEPS[nextStepIndex].route);
    } else {
      localStorage.setItem("sprout_onboarding_complete", "true");
      setHasCompleted(true);
      navigate("/dashboard");
    }
  };
  return {
    currentStep,
    hasCompleted,
    activePage: currentStep !== null ? ONBOARDING_STEPS[currentStep]?.page : null,
    startOnboarding,
    sendOnboardingStepToDB,
    skipOnboarding,
    handleNextStep,
  };
}
