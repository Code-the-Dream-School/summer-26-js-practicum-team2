import BudgetSummary from "./BudgetSummary.component";
import CharacterIntro from "./CharacterIntro.component";
import abigailImage from "./assets/abigail.webp";
import beaverImage from "./assets/dabbingBeaver.svg";
import ramonaImage from "./assets/ramona.webp";

export const lessonBlockRenderers = {
  "budget-summary": BudgetSummary,
  characterIntro: CharacterIntro,
};

export const characterImages = {
  abigail: abigailImage,
  beaver: beaverImage,
  ramona: ramonaImage,
};

export const guideImage = beaverImage;
