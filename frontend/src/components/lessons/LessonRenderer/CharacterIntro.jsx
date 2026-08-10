import abigailImage from '../../../assets/abigail.svg'
import ramonaImage from '../../../assets/ramona.svg'
import dabbingBeaver from '../../../assets/dabbingBeaver.svg'

function CharacterIntro({ content }) {
  let imageSrc = dabbingBeaver

  if (content.text.includes('Abigail')) {
    imageSrc = abigailImage
  }

  if (content.text.includes('Ramona')) {
    imageSrc = ramonaImage
  }

  //   const character = module.characters.find(
  //     (character) => character.characterId === content.characterId,
  //   )

  //   if (!character) {
  //     return <div>Character not found</div>
  //   }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
      <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
        Character Introduction
      </div>

      <div className="flex flex-col items-center gap-4">
        {imageSrc}
        <h2 className="text-2xl text-slate-900">{content.text}</h2>
      </div>
    </div>
  )
}

export default CharacterIntro
