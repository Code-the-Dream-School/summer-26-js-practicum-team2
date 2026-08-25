// src/features/onboarding/OnboardingOverlay.component.jsx
import React from 'react';

const STEP_CONTENT = {
  0: {
    title: "Welcome to Sprout!",
    text: "Your email has been successfully verified! Let's kick things off with a quick tour. Click 'Next Step' to hop straight over to your profile manager layout."
  },
  1: {
    title: "Your Profile Page",
    text: "This is where your achievements live. You can click your avatar section icon right here to upload a custom picture! Ready? Let's check out a sample lesson."
  },
  2: {
    title: "Sample Lesson Activity",
    text: "Welcome to your first learning playground! Complete your tasks on this view screen to finish setting up your account details."
  }
};

export default function OnboardingOverlay({ currentStep, activePage, pageName, onNext }) {
  const content = STEP_CONTENT[currentStep];

  // Logic match safety step: Don't render content unless user is on the correct page view route
  if (!content || activePage !== pageName) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-neutral-200 bg-white p-5 shadow-2xl animate-fade-in">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {currentStep + 1}
        </span>
        <h4 className="font-heading text-sm font-bold text-heading">{content.title}</h4>
      </div>
      <p className="mt-2 text-xs text-neutral-600 leading-relaxed">{content.text}</p>
      <div className="mt-4 flex justify-end">
        <button
          onClick={onNext}
          className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          {currentStep === 2 ? "Finish Tour" : "Next Step"}
        </button>
      </div>
    </div>
  );
}