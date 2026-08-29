import Card from "../../../../shared/Card/Card.component";
import Button from "../../../../shared/Button/Button.component";

function StartOverButton({ onStartOver }) {
  return (
    <Button variant="quizSecondary" onClick={onStartOver}>
      Start Over
    </Button>
  );
}

export default function LessonControlPanel({
  savedProgress,
  isAtLessonStart,
  currentStep,
  onStartOver,
}) {
  // If the user has saved progress and is not at the start of the lesson, show a card with a "Start Over" button.
  const showResumeBanner = savedProgress && !isAtLessonStart;
  if (!showResumeBanner) return null;

  return (
    <Card className="mt-4 mb-4 border-primary/20 bg-primary/5 p-4 ">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium">Welcome Back! Resuming "{currentStep.title}"</p>
        <StartOverButton onStartOver={onStartOver} />
      </div>
    </Card>
  );
}
