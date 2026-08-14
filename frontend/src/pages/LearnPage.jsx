import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useParams, useSearchParams } from "react-router";
import { useAuthContext } from "../context/AuthContext.jsx";
import useLessonContent from "../hooks/useLessonContent.js";
import { ROUTES } from "../app/router/routes.js";
import { updateLessonProgress } from "../services/api.js";
import {
  getResumeIndex,
  getSampleLesson,
  normalizeLearnData,
  selectRandomLesson,
  titlesOverlap,
} from "../features/learn/normalizeLesson.js";
import LessonComponent from "../features/learn/Lesson/Lesson.component.jsx";
import QuizComponent from "../features/learn/Quiz/Quiz.component.jsx";
import { useQuiz } from "../hooks/useQuiz.js";
import Button from "../shared/Button/Button.component.jsx";
import Card from "../shared/Card/Card.component.jsx";
import ProgressBar from "../shared/ProgressBar/ProgressBar.component.jsx";
import Skeleton from "../shared/Skeleton/Skeleton.component.jsx";
import dabbingBeaverImg from "../assets/dabbingBeaver.svg";
import abigailImg from "../assets/abigail.webp";
import ramonaImg from "../assets/ramona.webp";
import rightAnswerIcon from "../assets/right_answer.svg";
import wrongAnswerIcon from "../assets/wrong_answer.svg";

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

function LearnFlow({
  learnData,
  characterImages,
  guideImage,
  savedProgress = null,
  csrfToken,
  isReadOnly = false,
}) {
  const { lessonSteps } = learnData;

  const [stepIndex, setStepIndex] = useState(() => getResumeIndex(lessonSteps, savedProgress));
  const [chunkIndex, setChunkIndex] = useState(0);
  const [phase, setPhase] = useState("lesson");
  const [isComplete, setIsComplete] = useState(false);
  // Graded results keyed by micro-lesson, so the completion card can report the whole lesson.
  const [submissions, setSubmissions] = useState({});

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
      csrfToken,
    }).catch(() => {
      // A dropped position update should never interrupt the lesson.
    });
  }, [canSyncProgress, csrfToken, currentMicroLessonId, learnData.id, learnData.moduleId]);

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
  const isLastChunkOfStep = chunkIndex >= chunks.length - 1;
  const isLastStep = stepIndex >= lessonSteps.length - 1;
  const isLastQuestion = quiz.questionIndex >= currentStepQuestions.length - 1;

  const gradedSubmissions = Object.values(submissions);
  const gradedPercentage = gradedSubmissions.length
    ? Math.round(
        gradedSubmissions.reduce((total, submission) => total + (submission.score ?? 0), 0) /
          gradedSubmissions.length,
      )
    : 0;
  const gradedPassed =
    gradedSubmissions.length > 0 && gradedSubmissions.every((submission) => submission.passed);
  const hasQuiz = learnData.questions.length > 0;
  // Only a passing lesson unlocks the next one.
  const canContinue = !hasQuiz || gradedPassed;

  const continuePath = learnData.nextLessonId
    ? `${ROUTES.LEARN}/${learnData.moduleId}/${learnData.nextLessonId}`
    : ROUTES.LEARN;

  function advanceStep() {
    if (!isLastStep) {
      setStepIndex((current) => current + 1);
      setChunkIndex(0);
      setPhase("lesson");
      return;
    }

    setIsComplete(true);
  }

  function goForward() {
    if (chunkIndex < chunks.length - 1) {
      setChunkIndex((current) => current + 1);
      return;
    }

    if (currentStepQuestions.length > 0) {
      quiz.begin(currentMicroLessonId);
      setPhase("quiz");
      return;
    }

    advanceStep();
  }

  async function advanceQuiz() {
    if (!isLastQuestion) {
      quiz.goToNextQuestion();
      return;
    }

    const submission = await quiz.submit(currentMicroLessonId, currentStepQuestions);

    if (submission) {
      setSubmissions((current) => ({ ...current, [currentMicroLessonId]: submission }));
    }

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
            {hasQuiz && !gradedPassed ? "Nice try" : "Congratulations!"}
          </h1>
          <p className="text-lg font-semibold text-heading">
            {hasQuiz && !gradedPassed ? "Keep practicing" : "Lesson completed"}
          </p>

          {hasQuiz ? (
            <p className="text-foreground">
              Score: {gradedPercentage}% — {gradedPassed ? "Pass" : "Fail"}
            </p>
          ) : (
            <p className="text-foreground">You reviewed every bite-sized lesson.</p>
          )}

          {quiz.errorMessage ? (
            <p role="alert" className="text-sm font-medium text-danger">
              {quiz.errorMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-center gap-4 pt-2">
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
              {quiz.review ? (
                <Button
                  variant="quiz"
                  className="min-w-36"
                  loading={quiz.status === "submitting"}
                  onClick={advanceQuiz}
                >
                  {isLastQuestion && isLastStep ? "View results" : "Continue"}
                </Button>
              ) : (
                <Button
                  variant="quiz"
                  className="min-w-40"
                  disabled={quiz.selectedChoiceIds.length === 0}
                  onClick={() => quiz.checkAnswer(quiz.currentQuestion, quiz.selectedChoiceIds)}
                >
                  Check answer
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
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
    </section>
  );
}

export default function LearnPage() {
  const { isAuthenticated, csrfToken } = useAuthContext();
  const { moduleId, lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const isSamplePreview = searchParams.get("sample") === "true";

  const {
    moduleData: fetchedModuleData,
    lessonData: fetchedLessonData,
    progress,
    isLoading,
    error,
  } = useLessonContent({ moduleId, lessonId, enabled: isAuthenticated });

  // Signed-out previews read bundled content because the lesson API requires a session.
  const sampleLesson = useMemo(() => {
    if (isAuthenticated || !isSamplePreview) return null;
    return getSampleLesson({ moduleId, lessonId });
  }, [isAuthenticated, isSamplePreview, lessonId, moduleId]);

  const learnData = useMemo(
    () =>
      normalizeLearnData({
        moduleData: fetchedModuleData ?? sampleLesson?.moduleData,
        lessonData: fetchedLessonData ?? sampleLesson?.lessonData,
      }),
    [fetchedLessonData, fetchedModuleData, sampleLesson],
  );

  const characterImages = {
    abigail: abigailImg,
    ramona: ramonaImg,
    beaver: dabbingBeaverImg,
  };

  if (!isAuthenticated) {
    if (isSamplePreview && learnData) {
      const randomStep = selectRandomLesson(learnData.lessonSteps);
      // Keep only the questions for the previewed step so local scoring reflects a real attempt.
      const sampleLearnData = randomStep
        ? {
            ...learnData,
            lessonSteps: [randomStep],
            questions: learnData.questions.filter(
              (question) => question.lessonStepId === randomStep.id,
            ),
          }
        : learnData;

      return (
        <>
          <p className="mx-auto mb-4 max-w-5xl rounded-xl border border-primary/20 bg-danger/5 px-4 py-3 text-sm font-medium text-primary sm:px-6">
            This is a sample of a lesson.
          </p>
          <LearnFlow
            key={`${learnData.moduleId}:${learnData.id}`}
            learnData={sampleLearnData}
            characterImages={characterImages}
            guideImage={dabbingBeaverImg}
            isReadOnly
          />
        </>
      );
    }

    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${ROUTES.LOGIN}?next=${next}`} replace />;
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-2xl px-2 py-12 sm:px-4 sm:py-16">
        <Skeleton />
      </section>
    );
  }

  if (!learnData) {
    return (
      <section className="mx-auto max-w-2xl px-2 py-12 sm:px-4 sm:py-16">
        <Card className="space-y-5 p-7 sm:p-10">
          <h1 className="font-heading text-h3 font-bold text-heading">Lesson unavailable</h1>
          <p role="alert">{error || "This learning content could not be loaded."}</p>
          <Link to={ROUTES.HOME} className="text-primary underline">
            Back home
          </Link>
        </Card>
      </section>
    );
  }

  return (
    <LearnFlow
      key={`${learnData.moduleId}:${learnData.id}`}
      learnData={learnData}
      characterImages={characterImages}
      guideImage={dabbingBeaverImg}
      savedProgress={progress}
      csrfToken={csrfToken}
    />
  );
}
