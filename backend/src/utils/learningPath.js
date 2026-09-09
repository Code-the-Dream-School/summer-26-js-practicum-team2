const { isLessonUnlocked } = require("./coreRules");

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

// Use the same step progress as the learning path, while preserving older saved lesson cursors.
function getCurrentLessonId(moduleData, progressRecord) {
  const lessons = moduleData?.lessons || [];
  const currentNode = pickCurrentNode(buildLearningPath(moduleData), progressRecord);
  const currentIndex = lessons.findIndex((lesson) => lesson.id === currentNode?.lessonId);
  const savedIndex = lessons.findIndex((lesson) => lesson.id === progressRecord?.course_lesson_id);
  return lessons[Math.max(0, currentIndex, savedIndex)]?.id ?? null;
}

function isLessonAccessible(moduleData, progressRecord, lessonId) {
  const lessonSequence = (moduleData?.lessons || []).map((lesson) => lesson.id);
  const lessonIndex = lessonSequence.indexOf(lessonId);
  if (lessonIndex < 0) return false;

  const currentIndex = lessonSequence.indexOf(getCurrentLessonId(moduleData, progressRecord));
  const completedLessons = progressRecord?.completed_lessons || [];
  return (
    lessonIndex <= currentIndex ||
    completedLessons.includes(lessonId) ||
    isLessonUnlocked({ lessonId, lessonSequence, completedLessons })
  );
}

module.exports = { buildLearningPath, pickCurrentNode, getCurrentLessonId, isLessonAccessible };
