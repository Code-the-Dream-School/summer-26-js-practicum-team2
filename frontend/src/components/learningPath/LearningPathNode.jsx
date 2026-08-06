import Card from '../ui/Card'

function LearningPathNode({ node, status }) {
  return (
    <Card>
      <div>
        {status === 'completed' && '✅'}
        {status === 'current' && '🟢'}
        {status === 'locked' && '🔒'}
      </div>

      <h3>
        {node.microLessonId}: {node.microLessonTitle}
      </h3>
      <p>{node.description}</p>
    </Card>
  )
}

export default LearningPathNode
