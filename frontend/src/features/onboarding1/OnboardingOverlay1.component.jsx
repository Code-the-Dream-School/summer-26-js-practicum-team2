// src/features/onboarding/OnboardingOverlay.component.jsx
//import {useState, useEffect} from "react";
const STEP_CONTENT = {
  0: {
    title: "Welcome to Sprout!",
    text: "Your email has been successfully verified! Let's kick things off with a quick tour. Click 'Next Step' to hop straight over to your profile manager layout.",
  },
  1: {
    title: "Your Profile Page",
    text: "This is where your achievements live. You can click your avatar section icon right here to upload a custom picture! Ready? Let's check out a sample lesson.",
  },
  2: {
    title: "Sample Lesson Activity",
    text: "Welcome to your first learning playground! Here you will go through small lessons followed by mini checks your knowledge from the lesson..",
  },
  3: {
    title: "Learning Path",
    text: "This is the learning path and helps you see where you are in your journey. Click on an unlocked step and proceed to the lesson. Have Fun!",
  },
};

export default function OnboardingOverlay({
  hasCompleted,
  currentStep,
  activePage,
  pageName,
  onNext,
  onStart,
  onSkip,
}) {
  // local state of checkbox to be false on mount

  //data persistent banner on dashboard if it's not completed with all pages

  //const showCheckboxBanner = !hasCompleted && pageName === "dashboardPage"; (sept 2)
  const showCheckboxBanner = pageName === "dashboardPage";
  const tourContent = STEP_CONTENT[currentStep] || {};
  //render floating step popup if step is active and matches the current route
  // const tourContent = currentStep !== null ? STEP_CONTENT[currentStep] : null; remove tourContent Sept 2
  //const showTourPopup = tourContent && activePage === pageName;
  const showTourPopup = currentStep !== null && activePage === pageName && !hasCompleted;

  const isTourActive = currentStep !== null && currentStep >= 0 && !hasCompleted;

  const handleCheckboxChange = (e) => {
    if (e.target.checked) {
      onStart(); //triggers restart/begin onboarding
    } else {
      onSkip(); //triggers skip/disable unboarding
    }
  };
  return (
    <>
      {showCheckboxBanner && (
        <div className="w-full rounded-xl border border-neutral-200 bg-white p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isTourActive}
                id="onboarding-say-yes"
                onChange={handleCheckboxChange} // begins global start logic, reset step, and updates state
                className="h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer"
              />
              <span className="font-medium text-sm text-neutral-800">
                {hasCompleted ? "Retake Sprout Tour" : "Would you like to tour Sprout?"}
              </span>
            </label>
            {isTourActive && (
              <button
                onClick={onSkip}
                className="text-xs text-neutral-500 hover:text-neutral-700 underline"
              >
                No thanks, skip
              </button>
            )}
          </div>
        </div>
      )}

      {showTourPopup && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-neutral-200 bg-white p-5 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {currentStep + 1}
            </span>
            <h4 className="font-heading text-sm font-bold text-heading">{tourContent.title}</h4>
          </div>
          <p className="mt-2 text-xs text-neutral-600 leading-relaxed">{tourContent.text}</p>

          <div className="mt-4 flex justify-end gap-2">
            {/* </div><div className="mt-4 flex justify-end gap-2"> */}
            <button
              onClick={onSkip}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              Skip
            </button>
            <button
              onClick={onNext}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              {currentStep === 3 ? "Finish Tour" : "Next Step"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
