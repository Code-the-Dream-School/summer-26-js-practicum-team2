import abigailImg from '../../assets/abigail.webp'
import dabbingBeaverImg from '../../assets/dabbingBeaver.svg'
import ramonaImg from '../../assets/ramona.webp'

const GUIDE_VARIANTS = {
  beaver: {
    image: dabbingBeaverImg,
    alt: 'Sprout lesson guide',
  },
  abigail: {
    image: abigailImg,
    alt: 'Abigail',
  },
  ramona: {
    image: ramonaImg,
    alt: 'Ramona',
  },
}

function LessonGuideCharacter({ variant = 'beaver', imageSrc, imageAlt, bubbleText, children }) {
  // Determine the selected variant and resolve the image and alt text based on the provided props or defaults
  const selectedVariant = GUIDE_VARIANTS[variant] ?? GUIDE_VARIANTS.beaver
  const resolvedImage = imageSrc ?? selectedVariant.image
  const resolvedAlt = imageAlt ?? selectedVariant.alt
  // Render the lesson guide character with the provided bubble text and children content
  return (
    <div className="mx-auto max-w-xl">
      <div className="relative rounded-3xl border border-primary/25 bg-white px-5 py-6 text-left shadow-[0_12px_30px_rgba(6,30,25,0.1)] sm:px-8 sm:py-8">
        {resolvedImage ? (
          <span
            aria-hidden="true"
            className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 border-b border-r border-primary/25 bg-white sm:left-20 sm:translate-x-0"
          />
        ) : null}

        {bubbleText ? (
          <p className="relative mb-4 font-heading text-lg font-bold text-primary">{bubbleText}</p>
        ) : null}
    
        <div className="relative space-y-4">{children}</div>
      </div>

      {resolvedImage ? (
        <div className="mt-5 flex justify-center sm:justify-start sm:pl-7">
          <img
            src={resolvedImage}
            alt={resolvedAlt}
            className="relative z-10 w-full max-w-[11rem] drop-shadow-sm"
          />
        </div>
      ) : null}
    </div>
  )
}

export default LessonGuideCharacter
