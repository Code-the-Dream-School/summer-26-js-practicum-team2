import { Link } from 'react-router'

function LessonCard({lessons}) {
  return (
    <Link to={`/lesson/${lessons.id}`}>
    </Link>
)
}

export default LessonCard
