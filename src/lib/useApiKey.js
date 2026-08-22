import { useCallback, useEffect, useState } from "react";
import { API_KEY_STORE } from "./utils.js";

const EVT = "castor:key";

function read() {
  try {
    return localStorage.getItem(API_KEY_STORE) || "";
  } catch {
    return "";
  }
}

/* Clé OpenRouter partagée entre WebStudio et ChatStudio.
   Synchronisée au sein de l'onglet (event custom) et entre onglets (storage). */
export function useApiKey() {
  const [apiKey, setApiKey] = useState(read);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === API_KEY_STORE) setApiKey(e.newValue || "");
    };
    const onLocal = () => setApiKey(read());
    window.addEventListener("storage", onStorage);
    window.addEventListener(EVT, onLocal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EVT, onLocal);
    };
  }, []);

  const saveKey = useCallback((v) => {
    const clean = (v || "").trim();
    try {
      if (clean) localStorage.setItem(API_KEY_STORE, clean);
      else localStorage.removeItem(API_KEY_STORE);
    } catch {
      /* stockage indisponible — la clé reste en mémoire pour la session */
    }
    setApiKey(clean);
    window.dispatchEvent(new Event(EVT));
  }, []);

  return [apiKey, saveKey];
}
