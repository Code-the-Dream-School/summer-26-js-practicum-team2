function CharacterIntro({ content }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
      <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
        Character Introduction
      </div>

      <h2 className="text-2xl font-bold text-slate-900">{content.text}</h2>
    </div>
  )
}

export default CharacterIntro
