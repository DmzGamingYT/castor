import { createContext, useContext, useState, useEffect } from "react";
import { setLang as setTranslationsLang, t } from "./translations.js";

const LanguageContext = createContext();

const STORAGE_KEY = "castor-lang";

function getInitialLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "fr") return stored;
  } catch {
    /* localStorage indisponible (mode privé/SSR) → langue par défaut */
  }
  return "fr";
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang);
  const [, forceRender] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
    setTranslationsLang(lang);
    forceRender((n) => n + 1); // re-render pour que t() retourne la bonne langue
  }, [lang]);

  const toggle = () => setLang((l) => (l === "fr" ? "en" : "fr"));

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
