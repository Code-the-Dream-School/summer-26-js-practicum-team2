const path = require("node:path");
const fs = require("node:fs");

// shared/content lives outside the backend package, alongside it in the repo root.
const CONTENT_ROOT = path.resolve(__dirname, "../../../shared/content");

const readJson = (relativeFile) => {
  const fullPath = path.join(CONTENT_ROOT, relativeFile);
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
};

let manifestCache = null;
let moduleCache = new Map();

const getManifest = () => {
  if (!manifestCache) {
    manifestCache = readJson("manifest.json");
  }
  return manifestCache;
};

// Look a module up in the manifest, then load the JSON file the manifest points at.
const getModule = (moduleId) => {
  if (moduleCache.has(moduleId)) {
    return moduleCache.get(moduleId);
  }

  const manifest = getManifest();
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

const getLesson = (moduleId, lessonId) => {
  const moduleData = getModule(moduleId);
  if (!moduleData) {
    return null;
  }
  return (moduleData.lessons || []).find((lesson) => lesson.id === lessonId) || null;
};

const clearCache = () => {
  manifestCache = null;
  moduleCache = new Map();
};

module.exports = { getManifest, getModule, getLesson, clearCache };
