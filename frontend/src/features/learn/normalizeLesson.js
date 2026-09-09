export function normalizeContent(content = []) {
  return content.map((item, index) => ({
    // Some content blocks lack IDs, so generate one for stable rendering and tracking.
    id: item.id ?? `${item.type}-${index}`,
    ...item,
  }));
}

export function normalizeQuestion(question, index) {
  // Support both the current answerChoices fields and the legacy choices fields.
  const answerChoices = question.answerChoices ?? question.choices ?? [];
  const correctResponse = question.correctResponse ?? question.correctChoiceIds ?? [];

  return {
    id: question.id ?? `question-${index + 1}`,
    characterId: question.characterId ?? null,
    type: question.questionType === "multiSelect" ? "multiSelect" : "singleChoice",
    prompt: question.question ?? question.prompt,
    choices: answerChoices.map((choice) => ({
      id: choice.key ?? choice.id,
      label: choice.text ?? choice.label,
    })),
    correctChoiceIds: Array.isArray(correctResponse)
      ? correctResponse
      : correctResponse
        ? [correctResponse]
        : [],
  };
}

export function normalizeLearnData({ moduleData, lessonData }) {
  if (!lessonData) return null;

  const microLessons = lessonData.microLessons ?? [];

  const lessonSteps = microLessons.map((microLesson) => {
    const content = microLesson.microLessonContent ?? [];
    // Any block may name the character, not just characterIntro.
    const firstCharacterContent = content.find((item) => item.characterId);

    return {
      id: microLesson.id,
      title: microLesson.title,
      characterId: firstCharacterContent?.characterId,
      content: normalizeContent(content.filter((item) => item.type !== "knowledgeCheck")),
    };
  });

  // Remove knowledge checks from lesson content and collect them for the quiz separately.
  const questions = microLessons.flatMap((microLesson) =>
    (microLesson.microLessonContent ?? [])
      .filter((item) => item.type === "knowledgeCheck")
      .map((question, index) => ({
        ...normalizeQuestion(question, index),
        lessonStepId: microLesson.id,
      })),
  );

  const moduleLessons = moduleData?.lessons ?? [];
  const lessonPosition = moduleLessons.findIndex((lesson) => lesson.id === lessonData.id);

  return {
    id: lessonData.id,
    moduleId: moduleData?.id,
    module: moduleData,
    moduleTitle: moduleData?.title,
    title: lessonData.title,
    learningGoal: lessonData.learningGoal,
    passThreshold: (lessonData.passingScore ?? 70) / 100,
    nextLessonId: lessonPosition >= 0 ? (moduleLessons[lessonPosition + 1]?.id ?? null) : null,
    lessonSteps,
    questions,
  };
}

export function selectRandomLesson(lessonSteps) {
  if (!lessonSteps?.length) return null;
  return lessonSteps[Math.floor(Math.random() * lessonSteps.length)];
}

// Micro-lesson titles often repeat the lesson title, so compare loosely to avoid showing both.
export function titlesOverlap(lessonTitle = "", stepTitle = "") {
  const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const a = normalize(lessonTitle);
  const b = normalize(stepTitle);

  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

export function getResumeIndex(lessonSteps, savedProgress) {
  const savedId = savedProgress?.currentMicroLessonId;
  if (!savedId) return 0;

  // Stale saved progress should restart the lesson instead of producing an invalid index.
  const index = lessonSteps.findIndex((lesson) => lesson.id === savedId);
  return index >= 0 ? index : 0;
}
