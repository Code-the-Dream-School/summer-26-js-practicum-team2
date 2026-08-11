import Card from '../ui/Card.jsx'

function renderContentBlock(content) {
  switch (content.type) {
    case 'paragraph':
    case 'characterIntro':
      return (
        <p key={content.id} className="text-xl leading-relaxed text-foreground">
          {content.text}
        </p>
      )

    case 'callout':
      return (
        <Card key={content.id} variant="choice" className="px-5 py-4 text-left shadow-sm">
          <p className="text-lg font-semibold leading-relaxed text-heading">{content.text}</p>
        </Card>
      )

    case 'formula':
      return (
        <div
          key={content.id}
          className="rounded-2xl border border-primary/30 bg-white px-5 py-4 text-center font-heading text-xl font-bold leading-relaxed text-heading shadow-sm"
        >
          {content.text}
        </div>
      )

    case 'example':
      return (
        <Card key={content.id} variant="choice" className="px-5 py-4 text-left shadow-sm">
          <p className="whitespace-pre-line text-lg leading-relaxed text-foreground">
            {content.text}
          </p>
        </Card>
      )

    case 'unorderedList':
      return (
        <Card key={content.id} variant="choice" className="px-6 py-5 text-left shadow-sm">
          <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed text-foreground">
            {(content.items ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      )

    default:
      return null
  }
}

function LessonComponent({
  title,
  eyebrow,
  content = [],
  characterImage,
  characterAlt = 'Lesson guide',
  bubbleText,
}) {
  const visibleContent = content.filter(Boolean)

  return (
    <div className="mt-8 space-y-8 text-center">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-small font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
        ) : null}
        <h2 className="font-heading text-h3 font-bold text-heading">{title}</h2>
      </div>

      <div className="mx-auto max-w-xl">
        <div className="relative rounded-3xl border border-primary/25 bg-white px-5 py-6 text-left shadow-[0_12px_30px_rgba(6,30,25,0.1)] sm:px-8 sm:py-8">
          {characterImage ? (
            <span
              aria-hidden="true"
              className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 border-b border-r border-primary/25 bg-white sm:left-20 sm:translate-x-0"
            />
          ) : null}

          {bubbleText ? (
            <p className="relative mb-4 font-heading text-lg font-bold text-primary">
              {bubbleText}
            </p>
          ) : null}

          <div className="relative space-y-4">
            {visibleContent.length > 0 ? (
              visibleContent.map(renderContentBlock)
            ) : (
              <p className="text-xl leading-relaxed text-foreground">
                This lesson is ready to review.
              </p>
            )}
          </div>
        </div>

        {characterImage ? (
          <div className="mt-5 flex justify-center sm:justify-start sm:pl-7">
            <img
              src={characterImage}
              alt={characterAlt}
              className="relative z-10 w-full max-w-[11rem] drop-shadow-sm"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default LessonComponent
