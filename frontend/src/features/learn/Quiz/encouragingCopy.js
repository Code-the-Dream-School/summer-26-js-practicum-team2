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
  "Excellent",
  "Brilliant",
  "Superb",
  "Outstanding",
  "Impressive",
  "Incredible",
  "Fantastic",
  "Marvelous",
  "Remarkable",
  "Phenomenal",
  "Spectacular",
  "Correct",
];

const oneWordIncorrectPhrases = [
  "Oops",
  "Uh-oh",
  "Yikes",
  "Oh no",
  "Whoops",
  "Darn",
  "Bummer",
  "Try again",
  "Not quite",
  "Incorrect",
  "Wrong",
  "Mistake",
  "Beavered",
];

const passedQuizPhrases = [
  "You passed the quiz!",
  "You nailed it!",
  "You did it!",
  "You crushed it!",
  "You got it!",
  "You made it!",
  "You aced the quiz!",
  "You rocked this quiz!",
  "You knocked it out!",
  "You got the job done!",
  "You came out on top!",
  "You showed what you know!",
  "You really know your stuff!",
  "You mastered this one!",
  "You conquered this quiz!",
  "You finished strong!",
  "You made that look easy!",
  "You're on a roll!",
  "You're getting the hang of this!",
  "You're making great progress!",
  "You're doing great!",
  "You're crushing it!",
  "You're moving right along!",
  "You're one step closer!",
  "Keep up the great work!",
  "Keep that momentum going!",
  "Nice work on this one!",
  "Great work on this quiz!",
  "That was a strong finish!",
  "That's another quiz down!",
];

const failedQuizPhrases = [
  "Don't be discouraged, keep trying!",
  "You can do it! Keep practicing!",
  "Mistakes are part of learning, keep going!",
  "Keep pushing forward, you'll get it next time!",
  "Stay motivated and keep working towards success!",
  "Give it another shot!",
  "Try one more time!",
  "You can try again!",
  "Give it another go!",
  "Take another swing at it!",
  "Keep going!",
  "Don't give up!",
  "You've got this!",
  "Keep at it!",
  "Try that one again!",
  "Almost there!",
  "You're getting closer!",
  "You're on the right track!",
  "A little more practice will do it!",
  "Let's give it another try!",
  "Time for another attempt!",
  "Take another crack at it!",
  "See if you can get it next time!",
  "Review and give it another go!",
  "Brush up and try again!",
  "Keep learning and try again!",
  "One more try might do it!",
  "There's always another try!",
  "You'll get it next time!",
  "Ready for another try?",
  "Let's try that again!",
  "Give the quiz another go!",
  "Take what you learned and try again!",
  "A quick review might do the trick!",
  "You're not done yet!",
];

const allCaughtUpPhrases = [
  "You reviewed every bite-sized lesson.",
  "You're all caught up on your learning path!",
  "No more lessons to review at this time.",
  "You've completed all available lessons.",
  "You're up to date with your learning!",
  "All lessons completed, great job!",
  "You've finished all the lessons, keep up the good work!",
  "No more lessons for now, take a break!",
  "You're current with your learning path!",
  "All lessons are done, time to celebrate your progress!",
  "You've reached the end of the available lessons, well done!",
  "You're all caught up!",
  "No more lessons for now!",
  "You've completed all available lessons!",
  "You're up to date with your learning!",
  "All lessons completed, great job!",
  "You've finished all the lessons, keep up the good work!",
  "No more lessons to complete at this time.",
  "You're current with your learning path!",
  "All lessons are done, time to celebrate your progress!",
  "You've reached the end of the available lessons, well done!",
];

const getString = (isCorrect, phrases) => phrases[Math.floor(Math.random() * phrases.length)];

export const getEncouragingPhrase = (isCorrect) => {
  const phrases = isCorrect ? correctPhrases : incorrectPhrases;
  return getString(isCorrect, phrases);
};

export const getEncouragingWord = (isCorrect) => {
  const words = isCorrect ? oneWordCorrectPhrases : oneWordIncorrectPhrases;
  return getString(isCorrect, words);
};

export const getQuizCompletionPhrase = (passed) => {
  const phrases = passed ? passedQuizPhrases : failedQuizPhrases;
  return getString(passed, phrases);
};

export const getQuizCompletionWord = (passed) => {
  const words = passed ? oneWordCorrectPhrases : oneWordIncorrectPhrases;
  return getString(passed, words);
};

export const getAllCaughtUpPhrase = () => {
  return getString(true, allCaughtUpPhrases);
};
