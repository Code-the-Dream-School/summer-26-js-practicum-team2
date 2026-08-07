// import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { modules } from '../../../content/index.js'
// import budgeting from '../content/budgeting.json'
import LessonCard from '../components/lessons/LessonCard'

function LessonPage() {
  //Get current module, lesson and micro-lesson from URL params
  const { moduleId, lessonId, microLessonId } = useParams()
  //Set progress state, currently using fake data
  // const [progress, setProgress] = useState({
  //   currentModuleId: 'cashFlow',
  //   currentLessonId: '1.1',
  //   currentMicroLessonId: '1.1.1',
  // })

  // This is the set progress state for when we can use the params
  // const [progress, setProgress] = useState({
  //   currentModuleId: moduleId,
  //   currentLessonId: lessonId,
  //   currentMicroLessonId: microLessonId,
  // })

  const navigate = useNavigate()

  console.log(moduleId)
  console.log(lessonId)
  console.log(microLessonId)

  //useEffect to update progress state when URL params change
  // useEffect(() => {
  //   setProgress({
  //     currentModuleId: moduleId,
  //     currentLessonId: lessonId,
  //     currentMicroLessonId: microLessonId,
  //   })
  // }, [moduleId, lessonId, microLessonId])

  const currentModule = modules[moduleId]

  if (!currentModule) {
    return <div>Module not found</div>
  }

  // const lesson = budgeting.lessons.find((lesson) => lesson.id === progress.currentLessonId)

  const lesson = currentModule.lessons.find((lesson) => lesson.id === lessonId)

  if (!lesson) {
    return <div>Lesson not found</div>
  }

  // const microLesson = lesson.microLessons.find(
  //   (microLesson) => microLesson.id === progress.currentMicroLessonId,
  // )

  // const microLesson = lesson.microLessons.find(
  //   (microLesson) => microLesson.id === progress.microLessonId,
  // )

  const microLesson = lesson.microLessons.find((microLesson) => microLesson.id === microLessonId)

  if (!microLesson) {
    return <div>Micro-lessons not found</div>
  }

  // const currentMicroLessonIndex = lesson.microLessons.findIndex(
  //   (microLesson) => microLesson.id === progress.currentMicroLessonId,
  // )

  const currentMicroLessonIndex = lesson.microLessons.findIndex(
    (microLesson) => microLesson.id === microLessonId,
  )

  function handleNext() {
    const nextMicroLesson = lesson.microLessons[currentMicroLessonIndex + 1]

    if (!nextMicroLesson) {
      console.log('Lesson Completed!')
      return
    }

    // const updatedProgress = {
    //   currentModuleId: moduleId,
    //   currentLessonId: lessonId,
    //   currentMicroLessonId: nextMicroLesson.id,
    // }

    // setProgress({
    //   ...progress,
    //   currentMicroLessonId: nextMicroLesson.id,
    // })

    // setProgress(updatedProgress)

    //Path to update progress in backend, currently commented out

    // await fetch('/api/progress', {
    //   method: 'PATCH',
    //   body: JSON.stringify(updatedProgress),
    // })

    navigate(`/learn/${moduleId}/${lessonId}/${nextMicroLesson.id}`)
  }

  return <LessonCard lesson={lesson} microLesson={microLesson} onNext={handleNext} />
}

export default LessonPage
