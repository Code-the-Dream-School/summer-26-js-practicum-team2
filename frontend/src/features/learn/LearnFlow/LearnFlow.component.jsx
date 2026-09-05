import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

import { ROUTES } from "../../../app/router/routes";
import { getResumeIndex, titlesOverlap } from "../../../features/learn/normalizeLesson";
import {
  completeMicroLesson,
  completeLesson,
  updateLessonProgress,
  restartLessonProgress,
} from "../../../services/api";
import { useQuiz } from "../../../hooks/useQuiz";
import { getQuizFeedbackPreference } from "../../../utils/quizFeedbackPreference";
import {
  getQuizCompletionPhrase,
  getQuizCompletionWord,
  getAllCaughtUpPhrase,
} from "../Quiz/encouragingCopy";
import { aggregateLessonScore } from "../../../utils/quizScoring";

import QuizComponent from "../Quiz/Quiz.component";
import QuizReview from "../Quiz/QuizReview/QuizReview.component";
import Button from "../../../shared/Button/Button.component";
import Card from "../../../shared/Card/Card.component";
import ProgressBar from "../../../shared/ProgressBar/ProgressBar.component";
import LessonComponent from "../Lesson/Lesson.component";
import LessonControlPanel from "./LessonControlPanel/LessonControlPanel.component";

import rightAnswerIcon from "../../../assets/right_answer.svg";
import wrongAnswerIcon from "../../../assets/wrong_answer.svg";

import Toast from "../shared/Toast/Toast.component";
import useRewardQueue from "../hooks/useRewardQueue";

function resolveCharacter(characterId, characterImages, guideImage) {
  if (!characterId) {
    return {
      variant: "beaver",
      image: characterImages.beaver ?? guideImage,
      alt: "Sprout lesson guide",
    };
  }

  return {
    variant: characterId,
    image: characterImages[characterId] ?? characterImages.beaver ?? guideImage,
    alt: characterId.charAt(0).toUpperCase() + characterId.slice(1),
  };
}

// A micro-lesson with no content still occupies one step, so never count it as zero.
function countChunks(step) {
  return Math.max(step.content?.length ?? 0, 1);
}

export default function LearnFlow({
  learnData,
  characterImages,
  guideImage,
  savedProgress = null,
  csrfToken,
  isReadOnly = false,
  refreshProfile,
}) {
  const { lessonSteps } = learnData;

  //Toast state for rewards like badges, xp, and streaks
  const { hasToasts, currentToast, addRewards, closeToast } = useRewardQueue();

  const [stepIndex, setStepIndex] = useState(() => getResumeIndex(lessonSteps, savedProgress));
  const [chunkIndex, setChunkIndex] = useState(() => {
    const resumeIndex = getResumeIndex(lessonSteps, savedProgress);
    const resumedStep = lessonSteps[resumeIndex];
    const savedChunkIndex = savedProgress?.currentChunkIndex;

    if (!Number.isInteger(savedChunkIndex) || savedChunkIndex < 0) return 0;
    return Math.min(savedChunkIndex, Math.max(countChunks(resumedStep) - 1, 0));
  });
  const [phase, setPhase] = useState("lesson");
  const [isComplete, setIsComplete] = useState(false);
  const completionRequestRef = useRef(false);
  // Graded results keyed by micro-lesson, so the completion card can report the whole lesson.
  const [submissions, setSubmissions] = useState({});
  const [completedAttempts, setCompletedAttempts] = useState([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState(() => getQuizFeedbackPreference());

  const currentStep = lessonSteps[stepIndex];
  const chunks = currentStep?.content ?? [];
  const currentChunk = chunks[chunkIndex];
  const currentMicroLessonId = currentStep?.id;
  const canSyncProgress = !isReadOnly && Boolean(csrfToken);

  const currentStepQuestions = useMemo(
    () => learnData.questions.filter((question) => question.lessonStepId === currentMicroLessonId),
    [learnData.questions, currentMicroLessonId],
  );

  const quiz = useQuiz({
    questions: currentStepQuestions,
    moduleId: learnData.moduleId,
    passThreshold: learnData.passThreshold,
    csrfToken,
    isReadOnly,
  });

  useEffect(() => {
    if (!canSyncProgress || !currentMicroLessonId) return;

    updateLessonProgress({
      moduleId: learnData.moduleId,
      lessonId: learnData.id,
      microLessonId: currentMicroLessonId,
      currentChunkIndex: chunkIndex,
      csrfToken,
    }).catch(() => {
      // A dropped position update should never interrupt the lesson.
    });
  }, [
    canSyncProgress,
    csrfToken,
    chunkIndex,
    currentMicroLessonId,
    learnData.id,
    learnData.moduleId,
  ]);

  useEffect(() => {
    function handleStorageChange() {
      setFeedbackMode(getQuizFeedbackPreference());
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const { totalUnits, completedUnits } = useMemo(() => {
    const countQuestions = (stepId) =>
      learnData.questions.filter((question) => question.lessonStepId === stepId).length;
    const countUnits = (step) => countChunks(step) + countQuestions(step.id);

    return {
      totalUnits: lessonSteps.reduce((total, step) => total + countUnits(step), 0),
      completedUnits: lessonSteps
        .slice(0, stepIndex)
        .reduce((total, step) => total + countUnits(step), 0),
    };
  }, [learnData.questions, lessonSteps, stepIndex]);

  const currentUnit =
    phase === "quiz"
      ? completedUnits + (currentStep ? countChunks(currentStep) : 0) + quiz.questionIndex
      : completedUnits + chunkIndex;

  const progressPercent =
    totalUnits === 0 ? 0 : Math.round(((isComplete ? totalUnits : currentUnit) / totalUnits) * 100);

  const character = resolveCharacter(
    quiz.currentQuestion?.characterId ?? currentChunk?.characterId ?? currentStep?.characterId,
    characterImages,
    guideImage,
  );

  const isFirstChunk = stepIndex === 0 && chunkIndex === 0;
  const isAtLessonStart = isFirstChunk && phase === "lesson";
  const isLastChunkOfStep = chunkIndex >= chunks.length - 1;
  const isLastStep = stepIndex >= lessonSteps.length - 1;
  const isLastQuestion = quiz.questionIndex >= currentStepQuestions.length - 1;

  const gradedSubmissions = Object.values(submissions);
  const { percentage: gradedPercentage, passed: gradedPassed } = aggregateLessonScore(
    gradedSubmissions,
    learnData.passThreshold,
  );
  const hasQuiz = learnData.questions.length > 0;
  // Only a passing lesson unlocks the next one.
  const canContinue = !hasQuiz || gradedPassed;

  useEffect(() => {
    if (!isComplete || !canContinue || !canSyncProgress || completionRequestRef.current) {
      return;
    }

    completionRequestRef.current = true;
    completeLesson({
      moduleId: learnData.moduleId,
      lessonId: learnData.id,
      csrfToken,
    }).catch(() => {
      completionRequestRef.current = false;
    });
  }, [canContinue, canSyncProgress, csrfToken, isComplete, learnData.id, learnData.moduleId]);

  const continuePath = learnData.nextLessonId
    ? `${ROUTES.LEARN}/${learnData.moduleId}/${learnData.nextLessonId}`
    : ROUTES.LEARN;

  async function advanceStep() {
    if (!isReadOnly && currentMicroLessonId) {
      const response = await completeMicroLesson({
        moduleId: learnData.moduleId,
        microLessonId: currentMicroLessonId,
        csrfToken,
      });

      console.log("Rewards:", response.rewards);

      //Toast notifications for badges, xp, and streaks earned

      addRewards(response.rewards);

      //clearDashboardCache(auth.user.id);
      await refreshProfile();

      console.log("DISPATCHING DASHBOARD REFRESH EVENT");

      notifyDashboardProgressChanged();
    }

    if (!isLastStep) {
      setStepIndex((current) => current + 1);
      setChunkIndex(0);
      setPhase("lesson");
      return;
    }

    setIsComplete(true);
  }

  async function goForward() {
    if (chunkIndex < chunks.length - 1) {
      setChunkIndex((current) => current + 1);
      return;
    }

    if (currentStepQuestions.length > 0) {
      setFeedbackMode(getQuizFeedbackPreference());
      quiz.begin(currentMicroLessonId);
      setPhase("quiz");
      return;
    }

    if (canSyncProgress) {
      try {
        await completeMicroLesson({
          moduleId: learnData.moduleId,
          microLessonId: currentMicroLessonId,
          csrfToken,
        });
      } catch {
        // Allow reading to continue if completion cannot be saved.
      }
    }
    advanceStep();
  }

  async function advanceQuiz() {
    if (!isLastQuestion) {
      quiz.goToNextQuestion();
      return;
    }

    const submission = await quiz.submit(currentMicroLessonId, currentStepQuestions);
    const submissionReviews =
      submission?.reviews?.length > 0
        ? Object.fromEntries(
            submission.reviews.map(({ questionId, ...review }) => [questionId, review]),
          )
        : quiz.reviews;

    if (submission) {
      setSubmissions((current) => ({
        ...current,
        [currentMicroLessonId]: { ...submission, totalQuestions: currentStepQuestions.length },
      }));
    }

    setCompletedAttempts((current) => [
      ...current,
      { questions: currentStepQuestions, answers: quiz.answers, reviews: submissionReviews },
    ]);

    quiz.reset();
    advanceStep();
  }

  function goBack() {
    if (chunkIndex > 0) {
      setChunkIndex((current) => current - 1);
      return;
    }

    if (stepIndex > 0) {
      const previousStep = lessonSteps[stepIndex - 1];
      setStepIndex((current) => current - 1);
      setChunkIndex(Math.max(countChunks(previousStep) - 1, 0));
    }
  }

  async function handleStartOver() {
    if (canSyncProgress) {
      try {
        await restartLessonProgress({
          moduleId: learnData.moduleId,
          csrfToken,
        });
      } catch {
        return;
      }
    }

    setStepIndex(0);
    setChunkIndex(0);
    setPhase("lesson");
    setIsComplete(false);
    setIsReviewing(false);
  }

  if (isComplete && isReviewing) {
    return (
      <>
        <QuizReview
          attempts={completedAttempts}
          onDone={() => setIsReviewing(false)}
          rightAnswerIcon={rightAnswerIcon}
          wrongAnswerIcon={wrongAnswerIcon}
        />
        <Toast
          isOpen={hasToasts}
          variant={currentToast?.variant ?? "default"}
          message={currentToast?.message ?? ""}
          onClose={closeToast}
        />
      </>
    );
  }

  if (isComplete) {
    return (
      <section className="mx-auto max-w-2xl px-2 py-12 sm:px-4 sm:py-16">
        <Card variant="quiz" className="space-y-6 p-7 text-center sm:p-10">
          <ProgressBar
            variant="illustrated"
            illustration="quiz"
            value={100}
            label="Lesson complete"
            imageAlt="Lesson complete"
            imageWrapperClassName="mx-auto max-w-md"
            imageClassName="mx-auto w-full max-w-md"
          />

          <h1 className="font-heading text-h2 font-bold text-heading">
            {hasQuiz && getQuizCompletionWord(gradedPassed)}
          </h1>
          <p className="text-lg font-semibold text-heading">
            {hasQuiz && getQuizCompletionPhrase(gradedPassed)}
          </p>

          {hasQuiz ? (
            <p className="text-foreground">
              Score: {gradedPercentage}% — {gradedPassed ? "Pass" : "Fail"}
            </p>
          ) : (
            <p className="text-foreground">{getAllCaughtUpPhrase()}</p>
          )}

          {quiz.errorMessage ? (
            <p role="alert" className="text-sm font-medium text-danger">
              {quiz.errorMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {Object.keys(submissions).length > 0 ? (
              <Button onClick={() => setIsReviewing(true)} variant="quizSecondary">
                Review Answers
              </Button>
            ) : null}

            {isReadOnly ? (
              <Button as={Link} to={ROUTES.REGISTER} variant="quiz">
                Register to keep learning
              </Button>
            ) : canContinue ? (
              <Button as={Link} to={continuePath} variant="quiz">
                Continue
              </Button>
            ) : (
              <Button as={Link} to={ROUTES.LEARN} variant="quizSecondary">
                Back to learning path
              </Button>
            )}
          </div>
        </Card>
        <Toast
          isOpen={hasToasts}
          variant={currentToast?.variant ?? "default"}
          message={currentToast?.message ?? ""}
          onClose={closeToast}
        />
      </section>
    );
  }

  if (!currentStep) return null;

  return (
    <section className="mx-auto max-w-2xl px-2 py-12 sm:px-4 sm:py-16">
      <Card variant="quiz" className="px-7 pb-8 pt-5 sm:px-10 sm:pb-10 sm:pt-6">
        <ProgressBar
          variant="illustrated"
          illustration="quiz"
          value={progressPercent}
          label="Learning progress"
          imageAlt="Learning progress"
          imageWrapperClassName="mx-auto max-w-md"
          imageClassName="mx-auto w-full max-w-md"
        />

        <div className="mt-4 space-y-3 text-center">
          <p className="text-small font-semibold uppercase tracking-wide text-primary">
            {learnData.moduleTitle}
          </p>
          <h1 className="font-heading text-h2 font-bold text-heading">{learnData.title}</h1>
          {isFirstChunk && learnData.learningGoal ? (
            <p className="mx-auto max-w-xl leading-relaxed text-foreground">
              {learnData.learningGoal}
            </p>
          ) : null}
        </div>
        {phase === "quiz" ? (
          <>
            <QuizComponent
              question={quiz.currentQuestion}
              questionNumber={quiz.questionIndex + 1}
              totalQuestions={currentStepQuestions.length}
              selectedChoiceIds={quiz.selectedChoiceIds}
              reviewAnswer={quiz.review}
              onChange={(choiceIds) => quiz.selectChoice(quiz.currentQuestion.id, choiceIds)}
              rightAnswerIcon={rightAnswerIcon}
              wrongAnswerIcon={wrongAnswerIcon}
              characterVariant={character.variant}
              characterImage={character.image}
              characterAlt={character.alt}
            />

            {quiz.errorMessage ? (
              <p role="alert" className="mt-4 text-center text-sm font-medium text-danger">
                {quiz.errorMessage}
              </p>
            ) : null}

            {/* Quiz navigation is forward-only so an answer cannot be revised after review. */}
            <div className="mt-8 flex flex-wrap justify-end gap-4 border-t border-primary/10 pt-6">
              {feedbackMode === "immediate" && quiz.review ? (
                <Button
                  variant="quiz"
                  className="min-w-36"
                  loading={quiz.status === "submitting"}
                  onClick={advanceQuiz}
                >
                  {isLastQuestion && isLastStep ? "View results" : "Continue"}
                </Button>
              ) : feedbackMode === "immediate" ? (
                <Button
                  variant="quiz"
                  className="min-w-40"
                  disabled={quiz.selectedChoiceIds.length === 0}
                  onClick={() => quiz.checkAnswer(quiz.currentQuestion, quiz.selectedChoiceIds)}
                >
                  Check answer
                </Button>
              ) : (
                <Button
                  variant="quiz"
                  className="min-w-40"
                  loading={quiz.status === "submitting"}
                  disabled={quiz.selectedChoiceIds.length === 0}
                  onClick={advanceQuiz}
                >
                  {isLastQuestion && isLastStep ? "View results" : "Continue"}
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <LessonControlPanel
              savedProgress={savedProgress}
              isAtLessonStart={isAtLessonStart}
              currentStep={currentStep}
              onStartOver={handleStartOver}
            />
            <LessonComponent
              title={titlesOverlap(learnData.title, currentStep.title) ? null : currentStep.title}
              eyebrow={`Lesson ${stepIndex + 1} of ${lessonSteps.length} • Step ${chunkIndex + 1} of ${Math.max(chunks.length, 1)}`}
              content={currentChunk ? [currentChunk] : []}
              module={learnData.module}
              characterVariant={character.variant}
              characterImage={character.image}
              characterAlt={character.alt}
              bubbleText={
                isLastChunkOfStep && currentStepQuestions.length > 0
                  ? "Ready for a quick check?"
                  : isLastChunkOfStep && isLastStep
                    ? "That's the whole lesson. Nice work!"
                    : isLastChunkOfStep
                      ? "Nice work. Ready for the next step?"
                      : "Let's keep going."
              }
            />

            <div className="mt-8 flex flex-wrap justify-between gap-4 border-t border-primary/10 pt-6">
              <Button variant="quizSecondary" disabled={isFirstChunk} onClick={goBack}>
                Previous
              </Button>
              <Button variant="quiz" className="min-w-36" onClick={goForward}>
                {isLastChunkOfStep && currentStepQuestions.length > 0
                  ? "Quick check"
                  : isLastChunkOfStep && isLastStep
                    ? "Finish lesson"
                    : "Continue"}
              </Button>
            </div>
          </>
        )}
      </Card>
      <Toast
        isOpen={hasToasts}
        variant={currentToast?.variant ?? "default"}
        message={currentToast?.message ?? ""}
        onClose={closeToast}
      />
    </section>
  );
}
