// import { useEffect, useState } from 'react'
import manifest from '../content/manifest.json'
import LearningPathNode from '../components/learningPath/LearningPathNode'
// import LessonCard from '../components/layout/LessonCard'

function LearningPathPage() {
  //Setting state for user progress
  const path = manifest.learningPaths[0]

  const modules = manifest.learningPaths[0].modules

  //For getting progress from backend

  //   const [progress, setProgress] = useState(null)

  //   useEffect(() => {
  //     fetch('/api/progress')
  //       .then((res) => res.json())
  //       .then((data) => setProgress(data))
  //   }, [])

  //Mock Progress
  const progress = {
    currentModuleId: 'budgeting',
    currentLessonId: 'cash-flow',
    currentMicroLessonId: 'intro',
  }

  if (!progress) {
    return <div>Loading...</div>
  }

  const currentIndex = modules.findIndex((module) => module.id === progress.currentModuleId)

  return (
    <div>
      <h1>{path.name}</h1>
      {/* Rendering the modules to create the path */}
      {/* {modules.map((module) => (
        <div key={module.id}>{module.title}</div>
      ))} */}

      {modules.map((module, index) => {
        let status = 'locked'

        if (index < currentIndex) status = 'completed'

        if (index === currentIndex) status = 'current'

        return <LearningPathNode key={module.id} module={module} status={status} />
      })}
    </div>
  )
}

export default LearningPathPage
