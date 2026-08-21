const LessonModule = require("../models/LessonModule.model");

let moduleCache = new Map();

// Runtime lesson content comes only from MongoDB. JSON is available through explicit admin seed/import operations.
const getModule = async (moduleId) => {
  if (moduleCache.has(moduleId)) {
    return moduleCache.get(moduleId);
  }

  const databaseModule = await LessonModule.findOne({ id: moduleId }).lean();
  if (databaseModule) {
    moduleCache.set(moduleId, databaseModule);
  }
  return databaseModule || null;
};

const getLesson = async (moduleId, lessonId) => {
  const moduleData = await getModule(moduleId);
  if (!moduleData) {
    return null;
  }
  return (moduleData.lessons || []).find((lesson) => lesson.id === lessonId) || null;
};

const clearCache = () => {
  moduleCache = new Map();
};

const clearModuleCache = (moduleId) => {
  moduleCache.delete(moduleId);
};

const sanitizeLessonData = (lessonData) => {
  const sanitizedLesson = JSON.parse(JSON.stringify(lessonData));

  for (const microLesson of sanitizedLesson.microLessons || []) {
    for (const contentItem of microLesson.microLessonContent || []) {
      if (contentItem.type === "knowledgeCheck") {
        delete contentItem.correctResponse;
        delete contentItem.explanation;
      }
    }
  }

  return sanitizedLesson;
};

const sanitizeModuleData = (moduleData) => ({
  ...moduleData,
  lessons: (moduleData.lessons || []).map(sanitizeLessonData),
});

module.exports = {
  getModule,
  getLesson,
  sanitizeLessonData,
  sanitizeModuleData,
  clearCache,
  clearModuleCache,
};
