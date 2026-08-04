function LessonRenderer({ content }) {
  switch (content.type) {
    case 'paragraph':
      return <p>{content.text}</p>

    case 'characterIntro':
      return <h3>{content.text}</h3>

    case 'formula':
      return <div>{content.text}</div>

    case 'callout':
      return <h3>{content.text}</h3>

    default:
      return null
  }
}

export default LessonRenderer
