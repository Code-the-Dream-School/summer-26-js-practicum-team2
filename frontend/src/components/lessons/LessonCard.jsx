// import { Link } from 'react-router'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import LessonRenderer from './LessonRenderer'
import Button from '../ui/Button'

function LessonCard({ lesson, microLesson, onNext }) {
  //Content index state
  const [contentIndex, setContentIndex] = useState(0)

  const navigate = useNavigate()

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

  //Helper function for back button
  //Helper function for back button
  function handlePreviousContent() {
    if (contentIndex === 0) {
      navigate('/learn')
      return
    }

    setContentIndex((prev) => prev - 1)
  }

  return (
    <>
      <h1>{lesson.title}</h1>
      <h2>{microLesson.title}</h2>

      <LessonRenderer content={currentContent} />

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={handlePreviousContent}>
          {contentIndex === 0 ? 'Learning Path' : 'Back'}
        </Button>

        <Button variant="primary" onClick={handleNextContent}>
          {contentIndex === content.length - 1 ? 'Next Lesson' : 'Continue'}
        </Button>
      </div>
    </>
  )
}

export default LessonCard
