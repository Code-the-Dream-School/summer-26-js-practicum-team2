// import Card from '../ui/Card'
import { useNavigate } from 'react-router'
import Button from '../ui/Button'

function LearningPathNode({ node, status }) {
  let variant = 'disabled'
  const navigate = useNavigate()

  if (status === 'current') {
    variant = 'primary'
  }

  if (status === 'completed') {
    variant = 'secondary'
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <h1 className="mt-2 text-center text-lg font-semibold text-heading">
        {node.microLessonTitle}
      </h1>
      <Button
        variant={variant}
        size="circle"
        disabled={status === 'locked'}
        onClick={() => {
          if (status === 'current') {
            navigate('/lesson')
          }
        }}
        className="aspect-square h-5 rounded-full p-0 flex items-center justify-center"
      >
        {/* <div>
        {status === 'completed' && '✅'}
        {status === 'current' && '🟢'}
        {status === 'locked' && '🔒'}
      </div> */}

        <p className="text-lg font-medium">{node.microLessonId}</p>

        {/* <h3>
        {node.microLessonId}: {node.microLessonTitle}
      </h3> */}
      </Button>
      <div className="h-12 w-1 bg-neutral-300" />
    </div>
  )
}

export default LearningPathNode
