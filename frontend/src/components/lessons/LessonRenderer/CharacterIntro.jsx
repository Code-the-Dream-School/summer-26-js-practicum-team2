import abigailImage from "../../../assets/abigail.svg";
import ramonaImage from "../../../assets/ramona.svg";
import dabbingBeaver from "../../../assets/dabbingBeaver.svg";

function CharacterIntro({ content }) {
  let imageSrc = dabbingBeaver;

  if (content.text.includes("Abigail")) {
    imageSrc = abigailImage;
  }

  if (content.text.includes("Ramona")) {
    imageSrc = ramonaImage;
  }

  //   const character = module.characters.find(
  //     (character) => character.characterId === content.characterId,
  //   )

  //   if (!character) {
  //     return <div>Character not found</div>
  //   }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm items-center text-center md:text-left">
      <div className="mb-5 text-sm font-semibold uppercase tracking-wide text-blue-600">
        Character Introduction
      </div>

      <div className="flex flex-col items-center gap-4">
        <img
          src={imageSrc}
          alt="Character"
          className="mx-5 h-auto object-contain inline-block w-3/4 items-center md:w-1/4"
        />
        <h2 className="text-lg md: text-xl text-slate-900">{content.text}</h2>
      </div>
    </div>
  );
}

export default CharacterIntro;
