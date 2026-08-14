function buildLearningPath(moduleData) {
  if (!moduleData) return [];
  return (moduleData.lessons || []).flatMap((lesson) =>
    (lesson.microLessons || []).map((microLesson) => ({
      moduleId: moduleData.id,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      microLessonId: microLesson.id,
      microLessonTitle: microLesson.title,
    })),
  );
}

function pickCurrentNode(learningPath, progressRecord) {
  if (learningPath.length === 0) return null;

  const completed = new Set(progressRecord?.completed_micro_lessons || []);
  const savedIndex = learningPath.findIndex(
    (node) => node.microLessonId === progressRecord?.current_micro_lesson_id,
  );
  const lastCompletedIndex = learningPath.reduce(
    (furthest, node, index) => (completed.has(node.microLessonId) ? index : furthest),
    -1,
  );
  const isModuleComplete =
    Boolean(progressRecord?.is_module_completed) || lastCompletedIndex === learningPath.length - 1;

  if (isModuleComplete) {
    return { ...learningPath[learningPath.length - 1], isModuleComplete: true };
  }

  const currentIndex = Math.min(
    Math.max(savedIndex, lastCompletedIndex + 1),
    learningPath.length - 1,
  );
  return { ...learningPath[currentIndex], isModuleComplete: false };
}

module.exports = { buildLearningPath, pickCurrentNode };
