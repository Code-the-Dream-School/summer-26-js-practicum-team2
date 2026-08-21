const path = require("node:path");
const fs = require("node:fs");
const LessonModule = require("../models/LessonModule.model");

// shared/content lives outside the backend package, alongside it in the repo root.
const CONTENT_ROOT = path.resolve(__dirname, "../../../shared/content");

const readJson = (relativeFile) => {
  const fullPath = path.join(CONTENT_ROOT, relativeFile);
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
};

let manifestCache = null;
let moduleCache = new Map();

const getManifest = async () => {
  if (!manifestCache) {
    manifestCache = readJson("manifest.json");
  }
  return manifestCache;
};

// Look a module up in the manifest, then load the JSON file the manifest points at.
const getModule = async (moduleId) => {
  if (moduleCache.has(moduleId)) {
    return moduleCache.get(moduleId);
  }

  try {
    const databaseModule = await LessonModule.findOne({ id: moduleId }).lean();
    if (databaseModule) {
      moduleCache.set(moduleId, databaseModule);
      return databaseModule;
    }
  } catch (error) {
    console.warn(`Falling back to JSON content for module '${moduleId}': ${error.message}`);
  }

  const manifest = await getManifest();
  const learningPath = manifest.learningPaths?.[0];
  const moduleMeta = learningPath?.modules?.find((mod) => mod.id === moduleId);
  if (!moduleMeta) {
    return null;
  }

  try {
    const moduleData = readJson(moduleMeta.file);
    moduleCache.set(moduleId, moduleData);
    return moduleData;
  } catch {
    // Manifest lists a module whose content file is missing or malformed.
    return null;
  }
};

const getLesson = async (moduleId, lessonId) => {
  const moduleData = await getModule(moduleId);
  if (!moduleData) {
    return null;
  }
  return (moduleData.lessons || []).find((lesson) => lesson.id === lessonId) || null;
};

const clearCache = () => {
  manifestCache = null;
  moduleCache = new Map();
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
  getManifest,
  getModule,
  getLesson,
  sanitizeLessonData,
  sanitizeModuleData,
  clearCache,
};
