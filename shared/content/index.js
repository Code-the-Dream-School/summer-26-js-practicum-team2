// Frontend imports these directly through Vite (JSON is supported out of the box).
// Backend loads the same files from disk via backend/src/utils/content.js.
import manifest from "./manifest.json";
import cashFlow from "./budgeting.json";
// import savings from './savings.json'
// import credit from './credit.json'
// import debt from './debt.json'
// import investing from './investing.json'

export const modules = {
  cashFlow,
  // savings,
  // credit,
  // debt,
  // investing,
};

export { manifest };

export const getModule = (moduleId) => modules[moduleId] || null;

export const getLesson = (moduleId, lessonId) => {
  const mod = getModule(moduleId);
  if (!mod) return null;
  return (mod.lessons || []).find((lesson) => lesson.id === lessonId) || null;
};
