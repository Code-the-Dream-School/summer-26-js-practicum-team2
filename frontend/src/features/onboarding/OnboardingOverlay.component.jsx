const STEP_CONTENT = [
  {
    title: "Welcome to Sprout!",
    text: "This dashboard brings your learning progress and next step together.",
  },
  {
    title: "Your Profile Page",
    text: "Review your learning plan, achievements, and account preferences here.",
  },
  {
    title: "Sample Lesson Activity",
    text: "Lessons break financial topics into short, practical activities.",
  },
];

export default function OnboardingOverlay({
  hasCompleted,
  currentStep,
  activePage,
  pageName,
  onNext,
  onStart,
  onSkip,
}) {
  const showBanner = !hasCompleted && currentStep === null && pageName === "dashboardPage";
  const content = currentStep === null ? null : STEP_CONTENT[currentStep];
  const showPopup = Boolean(content && activePage === pageName);

  return (
    <>
      {showBanner && (
        <div className="mb-6 w-full rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                aria-label="Tour Sprout"
                onChange={(event) => event.target.checked && onStart()}
                className="h-5 w-5 accent-primary"
              />
              <span className="text-sm font-medium text-neutral-800">
                Would you like to tour Sprout?
              </span>
            </label>
            <button type="button" onClick={onSkip} className="text-xs text-neutral-600 underline">
              No thanks, skip
            </button>
          </div>
        </div>
      )}
      {showPopup && (
        <aside className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-neutral-200 bg-white p-5 shadow-2xl">
          <h2 className="font-heading text-sm font-bold text-heading">{content.title}</h2>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600">{content.text}</p>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white"
            >
              {currentStep === STEP_CONTENT.length - 1 ? "Finish Tour" : "Next Step"}
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
