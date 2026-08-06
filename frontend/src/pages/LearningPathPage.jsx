// import { useEffect, useState } from 'react'
// import modules from '../content/index.js'
import cashFlow from '../content/budgeting.json'
import LearningPathNode from '../components/learningPath/LearningPathNode'
// import LessonCard from '../components/layout/LessonCard'

function LearningPathPage() {
  //Mock Progress
  const progress = {
    currentModule: 'cashFlow',
    currentLessonId: '1.1',
    currentMicroLessonId: '1.1.1',
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
    <div>
      <h1>{currentModule.title}</h1>

      {learningPath.map((node, index) => {
        let status = 'locked'

        if (index < currentIndex) status = 'completed'

        if (index === currentIndex) status = 'current'

        return <LearningPathNode key={node.microLessonId} node={node} status={status} />
      })}
      {/* Rendering the modules to create the path */}
      {/* {modules.map((module) => (
        <div key={module.id}>{module.title}</div>
      ))} */}
    </div>
  )
}

export default LearningPathPage
