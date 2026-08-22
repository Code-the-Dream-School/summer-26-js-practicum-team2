import { useMemo } from "react";
import { Link, Navigate, useLocation, useParams, useSearchParams } from "react-router";
import { useAuthContext } from "../context/AuthContext";
import useLessonContent from "../hooks/useLessonContent";
import { ROUTES } from "../app/router/routes";
import {
  getSampleLesson,
  normalizeLearnData,
  selectRandomLesson,
} from "../features/learn/normalizeLesson";
import LearnFlow from "../features/learn/LearnFlow/LearnFlow.component";

import Card from "../shared/Card/Card.component";
import Skeleton from "../shared/Skeleton/Skeleton.component";
import dabbingBeaverImg from "../assets/dabbingBeaver.svg";
import abigailImg from "../assets/abigail.webp";
import ramonaImg from "../assets/ramona.webp";

export default function LearnPage() {
  const { isAuthenticated, isHydrating, csrfToken } = useAuthContext();
  const { moduleId, lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const selectedMicroLessonId = location.state?.microLessonId;

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

  // Wait for storage hydration before deciding to redirect
  if (isHydrating) {
    return (
      <section className="mx-auto max-w-2xl px-2 py-12 sm:px-4 sm:py-16">
        <Skeleton />
      </section>
    );
  }

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
      key={`${learnData.moduleId}:${learnData.id}:${selectedMicroLessonId ?? "resume"}`}
      learnData={learnData}
      characterImages={characterImages}
      guideImage={dabbingBeaverImg}
      savedProgress={progress}
      selectedMicroLessonId={selectedMicroLessonId}
      csrfToken={csrfToken}
    />
  );
}
