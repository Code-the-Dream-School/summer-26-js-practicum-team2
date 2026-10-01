const LessonModule = require("../models/LessonModule.model");

let moduleCache = new Map();

const getModule = async (moduleId) => {
  if (moduleCache.has(moduleId)) {
    return moduleCache.get(moduleId);
  }

  const moduleData = await LessonModule.findOne({ id: moduleId }).lean();
  if (moduleData) {
    moduleCache.set(moduleId, moduleData);
  }
  return moduleData;
};

const getDefaultModule = async () => {
  const configuredModuleId = process.env.DEFAULT_MODULE_ID?.trim();
  const query = configuredModuleId ? { id: configuredModuleId } : {};
  return LessonModule.findOne(query).sort({ id: 1 }).lean();
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
  getDefaultModule,
  getLesson,
  sanitizeLessonData,
  sanitizeModuleData,
  clearCache,
  clearModuleCache,
};
