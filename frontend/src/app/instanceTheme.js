const themeEnvironment = {
  VITE_THEME_PRIMARY: "--instance-primary",
  VITE_THEME_PRIMARY_HOVER: "--instance-primary-hover",
  VITE_THEME_PRIMARY_ALT: "--instance-primary-alt",
  VITE_THEME_ACCENT: "--instance-accent",
  VITE_THEME_SUCCESS: "--instance-success",
  VITE_THEME_HEADING: "--instance-heading",
  VITE_THEME_FOREGROUND: "--instance-foreground",
  VITE_THEME_SURFACE: "--instance-surface-app",
  VITE_THEME_SURFACE_RAISED: "--instance-surface-raised",
  VITE_THEME_SURFACE_INSET: "--instance-surface-inset",
  VITE_THEME_FONT_HEADING: "--instance-font-heading",
  VITE_THEME_FONT_BODY: "--instance-font-body",
  VITE_THEME_RADIUS_SM: "--instance-radius-sm",
  VITE_THEME_RADIUS_MD: "--instance-radius-md",
  VITE_THEME_RADIUS_LG: "--instance-radius-lg",
  VITE_THEME_RADIUS_PILL: "--instance-radius-pill",
};

export function applyInstanceTheme() {
  const root = document.documentElement;

  for (const [environmentKey, cssProperty] of Object.entries(themeEnvironment)) {
    const value = import.meta.env[environmentKey]?.trim();
    if (value) root.style.setProperty(cssProperty, value);
  }

  const faviconUrl = import.meta.env.VITE_APP_FAVICON_URL?.trim();
  if (faviconUrl) {
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.append(favicon);
    }
    favicon.href = faviconUrl;
  }
}
