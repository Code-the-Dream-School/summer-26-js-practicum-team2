// import { Link } from 'react-router'
import { useState } from 'react'
import LessonRenderer from './LessonRenderer'

function LessonCard({ lesson, microLesson, onNext }) {
  //Content index state
  const [contentIndex, setContentIndex] = useState(0)

  const content = microLesson.microLessonContent

  const currentContent = content[contentIndex]

  // const microLessonContent = microLesson.microLessonContent

  // console.log(microLesson)

  //Helper function for next button
  function handleNextContent() {
    const isLastContent = contentIndex === content.length - 1

    if (isLastContent) {
      onNext()
      return
    }

    setContentIndex((prev) => prev + 1)
  }

  return (
    <>
      <h1>{lesson.title}</h1>
      <h2>{microLesson.title}</h2>

      <LessonRenderer content={currentContent} />

      <button onClick={handleNextContent}>
        {contentIndex === content.length - 1 ? 'Next Lesson' : 'Continue'}
      </button>
    </>
  )
}

export default LessonCard
