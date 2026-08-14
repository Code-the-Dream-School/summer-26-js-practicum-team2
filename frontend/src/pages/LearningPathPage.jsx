// import { useEffect, useState } from 'react'
import { useEffect, useRef } from "react";
// import modules from '../content/index.js'
import cashFlow from "../../../shared/content/budgeting.json";
import LearningPathNode from "../components/learningPath/LearningPathNode";
import Card from "../shared/Card/Card.component";
// import LessonCard from '../components/layout/LessonCard'

export default function LearningPathPage() {
  //Mock Progress
  const progress = {
    currentModule: "cashFlow",
    currentLessonId: "1.2",
    currentMicroLessonId: "1.2.3",
  };

  //Setting state for user progress
  //For getting progress from backend

  //   const [progress, setProgress] = useState(null)

  //   useEffect(() => {
  //     fetch('/api/progress')
  //       .then((res) => res.json())
  //       .then((data) => setProgress(data))
  //   }, [])

  //Use progress to determine which module to load

  //const currentModule = modules[progress.currentModuleId]

  const currentModule = cashFlow;

  //Build path from current module
  const learningPath = currentModule.lessons.flatMap((lesson) =>
    lesson.microLessons.map((microLesson) => ({
      moduleId: currentModule.id,

      lessonId: lesson.id,
      lessonTitle: lesson.title,

      microLessonId: microLesson.id,

      microLessonTitle: microLesson.title,
    })),
  );

  const currentIndex = learningPath.findIndex(
    (node) => node.microLessonId === progress.currentMicroLessonId,
  );

  //For scrolling to the current microLesson node in the learning path
  const currentNodeRef = useRef(null);

  useEffect(() => {
    currentNodeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  if (!progress) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <h2 className="text-h2 text-heading text-center mb-6 text-lg font-semibold text-slate-900">
        {currentModule.title}
      </h2>

      {currentModule.lessons.map((lesson) => (
        <div key={lesson.id} className="mb-12 flex flex-col items-center ">
          {/* Original*/}
          {/* <div className="mb-8 flex w-full flex-col items-center gap-8 sm:flex-row">
            <div className="hidden h-px flex-1 bg-neutral-300 sm:block" />
            <h2 className="mb-3 text-center text-xl font-semibold text-heading">{lesson.title}</h2>
            <div className="hidden h-px flex-1 bg-neutral-300 sm:block" />
          </div> */}

          {/* Mobile*/}
          <div className="mb-8 w-full block md:hidden">
            <div className="flex flex-col items-center block md:hidden" />
            <h2 className="mb-2 text-center text-xl font-semibold text-heading block md:hidden">
              {lesson.title}
            </h2>
            <div className="h-px w-full bg-neutral-300 block md:hidden" />
          </div>

          {/* Tablet/Desktop*/}
          <div className="mb-8 w-full items-center gap-4 hidden md:flex">
            <div className="h-px flex-1 bg-neutral-300 hidden md:flex" />
            <h2 className="px-8 text-xl font-semibold text-heading hidden md:flex">
              {lesson.title}
            </h2>
            <div className="h-px flex-1 bg-neutral-300 hidden md:flex" />
          </div>

          {lesson.microLessons.map((microLesson) => {
            const node = {
              moduleId: currentModule.id,

              lessonId: lesson.id,
              lessonTitle: lesson.title,

              microLessonId: microLesson.id,
              microLessonTitle: microLesson.title,
            };

            const nodeIndex = learningPath.findIndex(
              (pathNode) => pathNode.microLessonId === microLesson.id,
            );

            let status = "locked";

            if (nodeIndex < currentIndex) status = "completed";

            if (nodeIndex === currentIndex) status = "current";

            return (
              <LearningPathNode
                key={microLesson.id}
                node={node}
                status={status}
                ref={nodeIndex === currentIndex ? currentNodeRef : null}
              />
            );
          })}
        </div>
      ))}

      {/* {learningPath.map((node, index) => {
        let status = 'locked'

        if (index < currentIndex) status = 'completed'

        if (index === currentIndex) status = 'current'

        return <LearningPathNode key={node.microLessonId} node={node} status={status} />
      })} */}

      {/* Rendering the modules to create the path */}
      {/* {modules.map((module) => (
        <div key={module.id}>{module.title}</div>
      ))} */}
    </Card>
  );
}
