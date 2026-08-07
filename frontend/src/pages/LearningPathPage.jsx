// import { useEffect, useState } from 'react'
// import modules from '../content/index.js'
import cashFlow from '../content/budgeting.json'
import LearningPathNode from '../components/learningPath/LearningPathNode'
import Card from '../components/ui/Card'
// import LessonCard from '../components/layout/LessonCard'

function LearningPathPage() {
  //Mock Progress
  const progress = {
    currentModule: 'cashFlow',
    currentLessonId: '1.2',
    currentMicroLessonId: '1.2.1',
  }

  if (!progress) {
    return <div>Loading...</div>
  }

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

  const currentModule = cashFlow

  //Build path from current module
  const learningPath = currentModule.lessons.flatMap((lesson) =>
    lesson.microLessons.map((microLesson) => ({
      lessonId: lesson.id,
      lessonTitle: lesson.title,

      microLessonId: microLesson.id,

      microLessonTitle: microLesson.title,
    })),
  )

  const currentIndex = learningPath.findIndex(
    (node) => node.microLessonId === progress.currentMicroLessonId,
  )

  return (
    <Card>
      <h2 className="text-center mb-6 text-lg font-semibold text-slate-900">
        {currentModule.title}
      </h2>

      {currentModule.lessons.map((lesson) => (
        <div key={lesson.id} className="mb-12">
          <h2 className="mb-6 text-xl font-semibold text-heading">
            {lesson.id}: {lesson.title}
          </h2>

          {lesson.microLessons.map((microLesson) => {
            const node = {
              lessonId: lesson.id,
              lessonTitle: lesson.title,

              microLessonId: microLesson.id,
              microLessonTitle: microLesson.title,
            }

            const nodeIndex = learningPath.findIndex(
              (pathNode) => pathNode.microLessonId === microLesson.id,
            )

            let status = 'locked'

            if (nodeIndex < currentIndex) status = 'completed'

            if (nodeIndex === currentIndex) status = 'current'

            return <LearningPathNode key={microLesson.id} node={node} status={status} />
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
  )
}

export default LearningPathPage
