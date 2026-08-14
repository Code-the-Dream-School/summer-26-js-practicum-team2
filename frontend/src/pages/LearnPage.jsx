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
import Button from "../shared/Button/Button.component.jsx";
import Card from "../shared/Card/Card.component.jsx";
import ProgressBar from "../shared/ProgressBar/ProgressBar.component.jsx";
import Skeleton from "../shared/Skeleton/Skeleton.component.jsx";
import dabbingBeaverImg from "../assets/dabbingBeaver.svg";
import abigailImg from "../assets/abigail.webp";
import ramonaImg from "../assets/ramona.webp";

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
  const [isComplete, setIsComplete] = useState(false);

  const currentStep = lessonSteps[stepIndex];
  const chunks = currentStep?.content ?? [];
  const currentChunk = chunks[chunkIndex];
  const currentMicroLessonId = currentStep?.id;
  const canSyncProgress = !isReadOnly && Boolean(csrfToken);

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

  const { totalChunks, completedChunks } = useMemo(() => {
    return {
      totalChunks: lessonSteps.reduce((total, step) => total + countChunks(step), 0),
      completedChunks: lessonSteps
        .slice(0, stepIndex)
        .reduce((total, step) => total + countChunks(step), 0),
    };
  }, [lessonSteps, stepIndex]);

  const progressPercent =
    totalChunks === 0
      ? 0
      : Math.round(((isComplete ? totalChunks : completedChunks + chunkIndex) / totalChunks) * 100);

  const character = resolveCharacter(
    currentChunk?.characterId ?? currentStep?.characterId,
    characterImages,
    guideImage,
  );

  const isFirstChunk = stepIndex === 0 && chunkIndex === 0;
  const isLastChunkOfStep = chunkIndex >= chunks.length - 1;
  const isLastStep = stepIndex >= lessonSteps.length - 1;

  const continuePath = learnData.nextLessonId
    ? `${ROUTES.LEARN}/${learnData.moduleId}/${learnData.nextLessonId}`
    : ROUTES.LEARN;

  function goForward() {
    if (chunkIndex < chunks.length - 1) {
      setChunkIndex((current) => current + 1);
      return;
    }

    if (!isLastStep) {
      setStepIndex((current) => current + 1);
      setChunkIndex(0);
      return;
    }

    setIsComplete(true);
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

          <h1 className="font-heading text-h2 font-bold text-heading">Congratulations!</h1>
          <p className="text-lg font-semibold text-heading">Lesson completed</p>
          <p className="text-foreground">You reviewed every bite-sized lesson.</p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {isReadOnly ? (
              <Button as={Link} to={ROUTES.REGISTER} variant="quiz">
                Register to keep learning
              </Button>
            ) : (
              <Button as={Link} to={continuePath} variant="quiz">
                Continue
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

        <LessonComponent
          title={titlesOverlap(learnData.title, currentStep.title) ? null : currentStep.title}
          eyebrow={`Lesson ${stepIndex + 1} of ${lessonSteps.length} • Step ${chunkIndex + 1} of ${Math.max(chunks.length, 1)}`}
          content={currentChunk ? [currentChunk] : []}
          module={learnData.module}
          characterVariant={character.variant}
          characterImage={character.image}
          characterAlt={character.alt}
          bubbleText={
            isLastChunkOfStep && isLastStep
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
            {isLastChunkOfStep && isLastStep ? "Finish lesson" : "Continue"}
          </Button>
        </div>
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
      const sampleLearnData = randomStep ? { ...learnData, lessonSteps: [randomStep] } : learnData;

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
