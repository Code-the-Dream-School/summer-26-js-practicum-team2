// import { Link } from 'react-router'
import LessonRenderer from './LessonRenderer'

function LessonCard({ lesson, microLesson, onNext }) {
  const microLessonContent = microLesson.microLessonContent

  return (
    <>
      <h1>{lesson.title}</h1>
      <h2>{microLesson.title}</h2>

      <LessonRenderer content={microLessonContent} />

      <button onClick={onNext}>Next</button>
    </>
  )
}

export default LessonCard
