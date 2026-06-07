export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

/**
 * Resolves the theme to apply on first paint.
 * Priority: a valid stored value, then the OS preference, then light.
 */
export function resolveInitialTheme(
  stored: string | null,
  systemPrefersDark: boolean,
): Theme {
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return systemPrefersDark ? "dark" : "light";
}

/**
 * Synchronous script injected into <head> so the theme is applied before paint
 * (prevents a flash of the wrong theme). Mirrors resolveInitialTheme().
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;
