// src/features/onboarding/useOnboarding.js
import { useState } from "react";
import { useNavigate } from "react-router";
//extract Token from AuthContext
import { useAuthContext } from "../../context/AuthContext";


import {
 resetOnboardingProgress as apiResetOnboarding,
 toggleOnboardingWorkflow as apiToggleOnboarding,
 updateOnboardingProgress as apiUpdateOnboardingProgress,
 beginOnboarding as apiBeginOnboarding,
//  getOnboardingState as apiGetOnboardingState,
} from "../../services/api";
// import { SAMPLE_LESSON_LINK } from "../../app/router/routes";


export const ONBOARDING_STEPS = {
 0: { page: "dashboardPage", route: "/dashboard" },
 1: { page: "profilePage", route: "/profile" },
 2: { page: "lessonPage", route: "/learn/last-lesson" },
 3: { page: "learningPath", route: "/learn" },
};


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


 const startOnboarding = async () => {
   console.log("startOnboarding called");
   console.log("Current Auth Token:", csrfToken);
   setCurrentStep(0);
   localStorage.setItem("sprout_onboarding_complete", "false");
   setHasCompleted(false);


   //setActivePage(ONBOARDING_STEPS[0].page);
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
 //   // //const response = await fetch("/api/v1/onboarding/reset", {
 //   //   method: "POST",
 //   //   credentials: "include",
 //   //   headers: {
 //   //     "Content-Type": "application/json",
 //   //      ...(token ?  {Authorization: `Bearer ${token}`} : {}),
 //   // },
 //   //   });


 //   if (response.ok){
 //     localStorage.setItem("sprout_onboarding_complete", "false");
 //     setHasCompleted(false);
 //     setCurrentStep(0);
 //     navigate(ONBOARDING_STEPS[0].route);
 //   }
 //   }catch (err) {
 //     console.error("Fail to reset onboarding session:", err);
 //   }
 // };
 //helper function to update progress in database via Path /api/v1/onboarding/step route
 const sendOnboardingStepToDB = async (tourKey, step, status, dismissed) => {
   try {
     await apiUpdateOnboardingProgress({
       tourKey,
       step,
       status,
       dismissed,
       csrfToken,
       // await fetch("/api/v1/onboarding/step", {
       //   method: "PATCH",
       //   credentials: "include", //for HttpOnly cookies
       //   headers: {
       //     "Content-Type": "application/json",
       //     // "X-CSRF-Token": "csrfToken",
       //    ...(token ? {Authorization: `Bearer ${token}`} : {}),
       //   },
       //   body: JSON.stringify({tourKey, step, status, dismissed}),
     });
   } catch (err) {
     console.error("Fail to sync onboard progress:", err);
   }
 };
 // const skipOnboarding = () => {


 // const activeTourKey = ONBOARDING_STEPS[currentStep]?.page;
 // //sync skip action to database before closing overlay


 // if (activeTourKey) {
 //   sendOnboardingStepToDB(activeTourKey, currentStep, "skipped", true);
 // }
 //   localStorage.setItem("sprout_onboarding_complete", "true");
 //   setHasCompleted(true);
 // };
 const skipOnboarding = async () => {
   //localStorage.setItem("sprout_onboarding_complete", "true");
   //setHasCompleted(true);
   // setCurrentStep(null);


   try {
     await apiToggleOnboarding({
       enabled: false,
       csrfToken,
       // await fetch("/api/v1/onboarding/toggle", {
       //   method: "PATCH",
       //   credentials: "include",
       //   headers: {
       //     "Content-Type": "application/json",
       //   },
     });
   } catch (err) {
     console.error("Failed to skip onboarding session:", err);
   }
 };
 // const handleNextStep = () => {
 //   const activeTourKey = ONBOARDING_STEPS[currentStep]?.page;


 //   //sync current step completion to backend
 //   if (activeTourKey) {
 //     sendOnboardingStepToDB(activeTourKey, currentStep, "completed", false);
 //   }
 //   const nextStepIndex = currentStep + 1;


 //   if (ONBOARDING_STEPS[nextStepIndex]) {
 //     setCurrentStep(nextStepIndex);
 //     // Sequentially shifts page routes just like advancing local views
 //     navigate(ONBOARDING_STEPS[nextStepIndex].route);
 //   } else {
 //     // Final walkthrough target cleared -> Mark complete permanently


 //     localStorage.setItem("sprout_onboarding_complete", "true");
 //     setHasCompleted(true);
 //     navigate("/dashboard");
 //   }
 // };
 const handleNextStep = async () => {
   const activeTourKey = ONBOARDING_STEPS[currentStep]?.page;


   if (activeTourKey) {
     await sendOnboardingStepToDB(activeTourKey, currentStep, "completed", false);
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
   //activePage: ONBOARDING_STEPS[currentStep]?.page,
   activePage: currentStep !== null ? ONBOARDING_STEPS[currentStep]?.page : null,
   startOnboarding,
   sendOnboardingStepToDB,
   skipOnboarding,
   handleNextStep,
 };
}