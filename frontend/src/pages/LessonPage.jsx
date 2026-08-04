import { useState } from 'react'
import budgeting from '../content/budgeting.json'
import LessonCard from '../components/lessons/LessonCard'

function LessonPage() {
  const [progress, setProgress] = useState({
    currentLessonId: '1.1',
    currentMicroLessonId: '1.1.1',
  })

  const lesson = budgeting.lessons.find((lesson) => lesson.id === progress.currentLessonId)

  if (!lesson) {
    return <div>Lesson not found</div>
  }

  const microLesson = lesson.microLessons.find(
    (microLesson) => microLesson.id === progress.currentMicroLessonId,
  )

  if (!microLesson) {
    return <div>Micro-lessons not found</div>
  }

  const currentMicroLessonIndex = lesson.microLessons.findIndex(
    (microLesson) => microLesson.id === progress.currentMicroLessonId,
  )

  function handleNext() {
    const nextMicroLesson = lesson.microLessons[currentMicroLessonIndex + 1]

    if (!nextMicroLesson) {
      console.log('Lesson Completed!')
      return
    }

    setProgress({
      ...progress,
      currentMicroLessonId: nextMicroLesson.id,
    })
  }

  return <LessonCard lesson={lesson} microLesson={microLesson} onNext={handleNext} />
}

export default LessonPage
