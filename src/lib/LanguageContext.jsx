import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { t as translate } from "./translations.js";

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const toggle = useCallback(() => {
    setLang((l) => (l === "fr" ? "en" : "fr"));
  }, []);

  // t() réactif : lit directement l'état lang → jamais décalé d'un rendu
  const t = useCallback((key) => translate(key, lang), [lang]);

  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, toggle, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}