// import { Link } from 'react-router'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import LessonRenderer from './LessonRenderer/LessonRenderer'
import Button from '../ui/Button'
import Card from '../ui/Card'

function LessonCard({ module, lesson, microLesson, onNext }) {
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

  console.log(contentIndex)
  console.log(content.length)
  console.log(currentContent)

  return (
    <Card>
      <h1 className="text-h1 font-bold mb-6 text-lg text-heading flex flex-col items-center text-center">
        {lesson.title}
      </h1>
      <h2 className="text-center text-h2 mb-12 text-lg font-semibold text-slate-900">
        {microLesson.title}
      </h2>

      <LessonRenderer content={currentContent} module={module} />

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={handlePreviousContent}>
          {contentIndex === 0 ? 'Learning Path' : 'Back'}
        </Button>

        <Button variant="primary" onClick={handleNextContent}>
          {contentIndex === content.length - 1 ? 'Next Lesson' : 'Continue'}
        </Button>
      </div>
    </Card>
  )
}

export default LessonCard
