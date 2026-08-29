import { useEffect, useState } from "react";

/* Thème automatique : sombre de 20h à 7h, clair le reste.
   Suit aussi la préférence système via matchMedia. */
function computeTheme() {
  try {
    const hour = new Date().getHours();
    // nuit : 20h → 7h
    if (hour >= 20 || hour < 7) return "dark";
  } catch {
    /* ignore */
  }
  return "light";
}

export function useTheme() {
  const [theme, setTheme] = useState(computeTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#161a10" : "#faf6ec");
  }, [theme]);

  // vérifier toutes les 60s pour basculer automatiquement
  useEffect(() => {
    const id = setInterval(() => {
      setTheme(computeTheme);
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // réagir au changement de préférence système
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setTheme(computeTheme);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return { theme };
}
