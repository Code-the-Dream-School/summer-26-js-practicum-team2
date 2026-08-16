const correctPhrases = [
  "Great job!",
  "Keep up the good work!",
  "You're doing amazing!",
  "Fantastic effort!",
  "Keep going, you're almost there!",
];

const incorrectPhrases = [
  "Don't worry, you'll get it next time!",
  "Keep trying, you're learning!",
  "Mistakes are part of the process!",
  "You're making progress, keep going!",
  "Almost there, give it another shot!",
];

const oneWordCorrectPhrases = [
  "Excellent!",
  "Brilliant!",
  "Superb!",
  "Outstanding!",
  "Impressive!",
  "Incredible!",
  "Fantastic!",
  "Marvelous!",
  "Remarkable!",
  "Phenomenal!",
  "Spectacular!",
  "Correct!",
];

const oneWordIncorrectPhrases = [
  "Oops!",
  "Uh-oh!",
  "Yikes!",
  "Oh no!",
  "Whoops!",
  "Darn!",
  "Bummer!",
  "Try again!",
  "Not quite!",
  "Incorrect!",
  "Wrong!",
  "Mistake!",
  "Beavered!",
];

const getPhrase = (isCorrect, phrases) => phrases[Math.floor(Math.random() * phrases.length)];

export const getEncouragingPhrase = (isCorrect) => {
  const phrases = isCorrect ? correctPhrases : incorrectPhrases;
  return getPhrase(isCorrect, phrases);
};

export const getEncouragingWord = (isCorrect) => {
  const phrases = isCorrect ? oneWordCorrectPhrases : oneWordIncorrectPhrases;
  return getPhrase(isCorrect, phrases);
};
