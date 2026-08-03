function LearningPathNode({ module, status }) {
  return (
    <div>
      <button>
        {status === 'completed'}
        {status === 'current'}
        {status === 'locked'}

        {module.title}
      </button>

      <h3>{module.title}</h3>
      <p>{module.description}</p>
    </div>
  )
}

export default LearningPathNode
