import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { getLastLesson } from "../services/api";
import { ROUTES } from "../app/router/routes";
import Skeleton from "../shared/Skeleton/Skeleton.component";
import { useOnboarding } from "../context/OnboardingContext1";
const STORAGE_KEY = "lastLessonPath";

export default function LastLessonRedirect() {
  const {currentStep} = useOnboarding();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await getLastLesson();
        const path = data?.lastLessonPath;
        if (!isMounted || !path) return;
        localStorage.setItem(STORAGE_KEY, path);
        setTarget(path);
      } catch {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (isMounted) setTarget(cached || ROUTES.LEARN);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);
//OnboardingOverlay set up for page
  if (target && currentStep !==2) { return <Navigate to={target} replace />;
  }
  return (
    <section className="mx-auto max-w-2xl px-2 py-12 sm:px-4 sm:py-16">
      <Skeleton />
    </section>
  );
}
