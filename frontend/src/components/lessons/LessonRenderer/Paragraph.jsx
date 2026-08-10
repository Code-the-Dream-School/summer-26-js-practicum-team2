function Paragraph({ content }) {
  return (
    <div className="max-w-prose">
      <p className="text-lg leading-8 text-slate-700">{content.text}</p>
    </div>
  )
}

export default Paragraph
