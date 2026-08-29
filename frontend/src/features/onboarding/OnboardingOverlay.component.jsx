import React from "react";

const TOUR_STEPS = {
  dashboardPage: [
    { title: "Welcome to Sprout!", text: "This is your main dashboard hub. Let's look around your metrics." },
    { title: "Recommended Actions", text: "This card points you directly to the highest priority micro-lesson you should tackle next." },
    { title: "Unit Progress Rows", text: "Down here you can track how many total modules and sub-lessons you have completed." }
  ],
  profilePage: [
    { title: "Your Profile Settings", text: "Manage your identity here! You can adjust your display name or update security credentials." },
    { title: "Achievements Panel", text: "Keep an eye on this upper counter to monitor your total platform XP Points and daily learning streaks." }
  ],
  learningPath: [
    { title: "Your Learning Path Map", text: "This interactive layout charts your journey. Click unlocked nodes to launch into training activities." }
  ],
  lessonPage: [
    { title: "Activity Finished!", text: "Fantastic job completing your training module! This final milestone successfully finishes your introductory user tour. Click 'Got it!' to wrap up." }
  ]
};

const OnboardingOverlay = ({ tourKey, onboarding, onSaveProgress }) => {
  if (!onboarding || onboarding.is_completed) return null;
  
  const currentTourData = onboarding.tours?.[tourKey];
  if (!currentTourData || currentTourData.dismissed) return null;

  const stepsList = TOUR_STEPS[tourKey] || [];
  const currentStepIndex = currentTourData.step ?? 0;
  const content = stepsList[currentStepIndex];

  if (!content) return null;

  const isLastStep = currentStepIndex >= stepsList.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      onSaveProgress({ tourKey, step: currentStepIndex + 1, dismissed: false });
    } else {
      onSaveProgress({ tourKey, step: currentStepIndex, dismissed: true });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-neutral-200 bg-white p-5 shadow-2xl animate-fade-in text-left">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {currentStepIndex + 1}
        </span>
        <h4 className="font-heading text-sm font-bold text-heading">{content.title}</h4>
      </div>
      <p className="mt-2 text-xs text-neutral-600 leading-relaxed">{content.text}</p>
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleNext}
          className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          {isLastStep ? "Got it!" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingOverlay;
