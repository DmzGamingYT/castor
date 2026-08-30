import { useEffect, useState } from "react";

const BASE = "/castor";

function currentPath() {
  const raw = window.location.pathname;
  const p = raw.startsWith(BASE) ? raw.slice(BASE.length) : raw;
  /* normalise le slash final : /castor/desktop/ → /desktop */
  return p.replace(/\/+$/, "") || "/";
}

const TITLE_KEYS = {
  "/": "title_home",
  "/cli": "title_cli",
  "/templates": "title_templates",
  "/desktop": "title_desktop",
  "/espace": "title_espace",
  "/cloud": "title_cloud",
  "/avancement": "title_avancement",
};

function titleFor(path, t) {
  const key = TITLE_KEYS[path] || TITLE_KEYS["/"];
  return t ? t(key) : "Castor";
}

/**
 * Routing basé sur l'History API (pushState / popstate).
 * Remplace le routing par hash (#/) pour un meilleur SEO.
 */
export default function useHistoryRoute(t) {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* Met à jour le titre de l'onglet et scrolle en haut à chaque changement de route */
  useEffect(() => {
    document.title = titleFor(path, t);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [path, t]);

  return path;
}

/**
 * Navigue vers une route via History API.
 * options.anchor = id de l'élément vers lequel scroller après le rendu.
 */
export function navigateTo(path, anchor) {
  const full = `/castor${path === "/" ? "/" : path}`;
  if (window.location.pathname + window.location.search === full && !anchor) return;
  window.history.pushState(null, "", full);
  window.dispatchEvent(new PopStateEvent("popstate"));

  if (anchor) {
    /* Attendre le rendu de la page cible avant de scroller */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      });
    });
  }
}
