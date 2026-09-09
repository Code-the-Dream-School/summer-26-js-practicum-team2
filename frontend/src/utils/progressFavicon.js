import plantProgress0 from "../assets/plant_progress_0.webp";
import plantProgress25 from "../assets/plant_progress_25.webp";
import plantProgress50 from "../assets/plant_progress_50.webp";
import plantProgress75 from "../assets/plant_progress_75.webp";
import plantProgress100 from "../assets/plant_progress_100.svg";

const progressFavicons = [
  { minimum: 100, src: plantProgress100 },
  { minimum: 75, src: plantProgress75 },
  { minimum: 50, src: plantProgress50 },
  { minimum: 25, src: plantProgress25 },
  { minimum: 0, src: plantProgress0 },
];

export function getProgressFavicon(percent) {
  const safePercent = Number.isFinite(percent) ? Math.min(Math.max(percent, 0), 100) : 0;
  return progressFavicons.find(({ minimum }) => safePercent >= minimum).src;
}

export function setProgressFavicon(percent) {
  const favicon = document.querySelector('link[rel="icon"]') || document.createElement("link");
  favicon.rel = "icon";
  favicon.href = getProgressFavicon(percent);
  document.head.append(favicon);
}
