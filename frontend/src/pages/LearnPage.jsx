import { useEffect, useMemo } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router";
import { useAuthContext } from "../context/AuthContext";
import useLessonContent from "../hooks/useLessonContent";
import { ROUTES } from "../app/router/routes";
import {
  updateLessonProgress,
  completeMicroLesson,
  notifyDashboardProgressChanged,
} from "../services/api";
import {
  getResumeIndex,
  getSampleLesson,
  normalizeLearnData,
  selectRandomLesson,
  titlesOverlap,
} from "../features/learn/normalizeLesson";
import LessonComponent from "../features/learn/Lesson/Lesson.component";
import QuizComponent from "../features/learn/Quiz/Quiz.component";
import { useQuiz } from "../hooks/useQuiz";
import Button from "../shared/Button/Button.component";
import { normalizeLearnData, selectRandomLesson } from "../features/learn/normalizeLesson";
import LearnFlow from "../features/learn/LearnFlow/LearnFlow.component";
import Card from "../shared/Card/Card.component";
import Skeleton from "../shared/Skeleton/Skeleton.component";
import dabbingBeaverImg from "../assets/dabbingBeaver.svg";
import abigailImg from "../assets/abigail.webp";
import ramonaImg from "../assets/ramona.webp";
import Toast from "../shared/Toast/Toast.component";
import useRewardQueue from "../hooks/useRewardQueue";

function LearnFlow({ refreshProfile }) {
  //Toast state for rewards like badges, xp, and streaks
  const { hasToasts, currentToast, addRewards, closeToast } = useRewardQueue();

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

  return (
    <Toast
      isOpen={hasToasts}
      variant={currentToast?.variant ?? "default"}
      message={currentToast?.message ?? ""}
      onClose={closeToast}
    />
  );
}

export default function LearnPage() {
  const { isAuthenticated, isHydrating, csrfToken } = useAuthContext();
  const { moduleId, lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const setCurrentModuleResources = useOutletContext();

  const selectedMicroLessonId = location.state?.microLessonId;
  const isSamplePreview = searchParams.get("sample") === "true";

  const {
    moduleData: fetchedModuleData,
    lessonData: fetchedLessonData,
    progress,
    isLoading,
    error,
  } = useLessonContent({
    moduleId,
    lessonId,
    enabled: isAuthenticated || isSamplePreview,
    isPublic: !isAuthenticated && isSamplePreview,
  });

  const learnData = useMemo(
    () =>
      normalizeLearnData({
        moduleData: fetchedModuleData,
        lessonData: fetchedLessonData,
      }),
    [fetchedLessonData, fetchedModuleData],
  );
  const sampleLearnData = useMemo(() => {
    if (!learnData || isAuthenticated) return learnData;

    const randomStep = selectRandomLesson(learnData.lessonSteps);
    return randomStep
      ? {
          ...learnData,
          lessonSteps: [randomStep],
          questions: learnData.questions.filter(
            (question) => question.lessonStepId === randomStep.id,
          ),
        }
      : learnData;
  }, [isAuthenticated, learnData]);

  const characterImages = {
    abigail: abigailImg,
    ramona: ramonaImg,
    beaver: dabbingBeaverImg,
  };

  useEffect(() => {
    if (typeof setCurrentModuleResources !== "function") {
      return undefined;
    }

    setCurrentModuleResources({
      glossary: Array.isArray(learnData?.module?.glossary) ? learnData.module.glossary : [],
      worksCited: Array.isArray(learnData?.module?.worksCited) ? learnData.module.worksCited : [],
    });

    return () => setCurrentModuleResources({ glossary: [], worksCited: [] });
  }, [learnData?.module, setCurrentModuleResources]);

  // Wait for storage hydration before deciding to redirect
  if (isHydrating) {
    return (
      <section className="mx-auto max-w-2xl px-2 py-12 sm:px-4 sm:py-16">
        <Skeleton />
      </section>
    );
  }

  if (!isAuthenticated && !isSamplePreview) {
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

  if (!isAuthenticated) {
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
          refreshProfile={refreshProfile}
        />
      </>
    );
  }

  return (
    <LearnFlow
      key={`${learnData.moduleId}:${learnData.id}:${selectedMicroLessonId ?? "resume"}`}
      learnData={learnData}
      characterImages={characterImages}
      guideImage={dabbingBeaverImg}
      savedProgress={progress}
      csrfToken={csrfToken}
      refreshProfile={refreshProfile}
    />
  );
}
