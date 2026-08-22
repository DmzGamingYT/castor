import { useEffect, useState } from "react";

const KEY = "castor-theme";

function initial() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* pas de stockage */
  }
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

/* Thème clair/sombre : appliqué sur <html data-theme>, persisté,
   et synchronisé avec la meta theme-color. */
export function useTheme() {
  const [theme, setTheme] = useState(initial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#161a10" : "#faf6ec");
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
}
