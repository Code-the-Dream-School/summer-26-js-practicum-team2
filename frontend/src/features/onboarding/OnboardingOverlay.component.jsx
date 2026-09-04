// import React from "react";

// const TOUR_STEPS = {
//   dashboardPage: [
//     { title: "Welcome to Sprout!", text: "This is your main dashboard hub. Let's look around your metrics." },
//     { title: "Recommended Actions", text: "This card points you directly to the highest priority micro-lesson you should tackle next." },
//     { title: "Unit Progress Rows", text: "Down here you can track how many total modules and sub-lessons you have completed." }
//   ],
//   profilePage: [
//     { title: "Your Profile Settings", text: "Manage your identity here! You can adjust your display name or update security credentials." },
//     { title: "Achievements Panel", text: "Keep an eye on this upper counter to monitor your total platform XP Points and daily learning streaks." }
//   ],
//   learningPath: [
//     { title: "Your Learning Path Map", text: "This interactive layout charts your journey. Click unlocked nodes to launch into training activities." }
//   ],
//   lessonPage: [
//     { title: "Activity Finished!", text: "Fantastic job completing your training module! This final milestone successfully finishes your introductory user tour. Click 'Got it!' to wrap up." }
//   ]
// };

// const OnboardingOverlay = ({ tourKey, onboarding, onSaveProgress }) => {
//   if (!onboarding || onboarding.is_completed) return null;

//   const currentTourData = onboarding.tours?.[tourKey];
//   if (!currentTourData || currentTourData.dismissed) return null;

//   const stepsList = TOUR_STEPS[tourKey] || [];
//   const currentStepIndex = currentTourData.step ?? 0;
//   const content = stepsList[currentStepIndex];

//   if (!content) return null;

//   const isLastStep = currentStepIndex >= stepsList.length - 1;

//   const handleNext = () => {
//     if (!isLastStep) {
//       onSaveProgress({ tourKey, step: currentStepIndex + 1, dismissed: false });
//     } else {
//       onSaveProgress({ tourKey, step: currentStepIndex, dismissed: true });
//     }
//   };

//   return (
//     <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-neutral-200 bg-white p-5 shadow-2xl animate-fade-in text-left">
//       <div className="flex items-center gap-2">
//         <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
//           {currentStepIndex + 1}
//         </span>
//         <h4 className="font-heading text-sm font-bold text-heading">{content.title}</h4>
//       </div>
//       <p className="mt-2 text-xs text-neutral-600 leading-relaxed">{content.text}</p>
//       <div className="mt-4 flex justify-end">
//         <button
//           onClick={handleNext}
//           className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition-colors"
//         >
//           {isLastStep ? "Got it!" : "Next"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default OnboardingOverlay;

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
    text: "Welcome to your first learning playground! Complete your tasks on this view screen to finish setting up your account details.",
  },
};

// export default function OnboardingOverlay({ hasCompleted, currentStep, activePage, pageName, onNext, onStart, onSkip,}) {
export default function OnboardingOverlay({
  hasCompleted,
  currentStep,
  activePage,
  pageName,
  onNext,
  onStart,
  onSkip,
}) {
  //data persistent banner on dashboard if it's not completed with all pages
  const showCheckboxBanner = !hasCompleted && pageName === "dashboardPage";

  //render floating step popup if step is active and matches the current route
  const tourContent = currentStep !== null ? STEP_CONTENT[currentStep] : null;
  const showTourPopup = tourContent && activePage === pageName;

  return (
    <>
      {showCheckboxBanner && (
        <div className="w-full rounded-xl border border-neutral-200 bg-white p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                id="onboarding-say-yes"
                onChange={(e) => {
                  if (e.target.checked) {
                    onStart(); // begins global start logic, reset step, and updates state
                  } else {
                    onSkip();
                  }
                }}
                className="h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer"
              />
              <span className="font-medium text-sm text-neutral-800">
                Would you like to tour Sprout?
              </span>
            </label>
            <button
              onClick={onSkip}
              className="text-xs text-neutral-500 hover:text-neutral-700 underline"
            >
              No thanks, skip
            </button>
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
          <div className="mt-4 flex justify-end">
            <button
              onClick={onNext}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              {currentStep === 2 ? "Finish Tour" : "Next Step"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
//   //const [isTourActive, setIsTourActive] = useState(false);
//   if (hasCompleted) return null;
//   //if(!isTourActive) {
//   //if (hasCompleted && pageName === "dashboardPage") {
//   //if (pageName !== "dashboardPage") return null;
//   if (pageName === "dashboardPage") {
//     return (
//       <div className="w-full rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
//         <div className="flex items-center justify-between">
//           <label className="flex items-center space-x-3 cursor-pointer">
//             <input
//               type="checkbox"
//               id="onboarding-say-yes"
//               onChange={(e) => {
//                 //if (e.target.checked) setIsTourActive(true);
//                 if (e.target.checked && onStart) {
//                 // if(e.target.checked && startOnboarding) {
//                 //   //startOnboarding();
//                 // }
//                   onStart(); // begins global start logic, reset step, and updates state
//                 }
//               }}
//               className="h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer"
//             />

//             <span className="font-medium text-sm text-neutral-800">
//               Would you like to tour Sprout?
//             </span>
//           </label>
//           <button onClick={onSkip}
//           className="text-xs text-neutral-500 hover:text-neutral-700">
//           {/* <button onClick={skipOnboarding} className="text-xs text-neutral-500 hover:text-neutral-700">  */}
//             No thanks, skip
//           </button>
//         </div>
//      </div>
//     );
//   }
//   // if(status === "beginner") {
//   //   if(pageName !== "dashboardPage")return null;
//   //   return (
//   //     <div className = "w-full rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
//   //       <div className= "flex items-center justify-between">
//   //         <label className="flex items-center space-x-3 cursor-pointer">
//   //           <input type="checkbox" id="onboarding-say-yes" onChange={(e) => {
//   //             if (e.target.checked && onStart) onStart();
//   //           }}
//   //           className="h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer" />

//   //           <span className= "font-medium text-sm text-neutral-800">
//   //             Would you like to tour Sprout?</span>
//   //             </label>
//   //             <button onClick={onSkip} className="text-xs text-neutral-500 hover:text-neutral-700">
//   //               No thanks, skip
//   //             </button>
//   //     </div>
//   //     </div>
//   //   );
//   // }
//   const content = STEP_CONTENT[currentStep];

//   // Logic match safety step: Don't render content unless user is on the correct page view route
//   if (!content || activePage !== pageName) return null;

//   return (
//     <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-neutral-200 bg-white p-5 shadow-2xl animate-fade-in">
//       <div className="flex items-center gap-2">
//         <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
//           {currentStep + 1}
//         </span>
//         <h4 className="font-heading text-sm font-bold text-heading">{content.title}</h4>
//       </div>
//       <p className="mt-2 text-xs text-neutral-600 leading-relaxed">{content.text}</p>
//       <div className="mt-4 flex justify-end">
//         <button
//           onClick={onNext}
//           className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition-colors"
//         >
//           {currentStep === 2 ? "Finish Tour" : "Next Step"}
//         </button>
//       </div>
//     </div>
//   );
// }
