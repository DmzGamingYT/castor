/* Utilitaires partagés entre les studios, la page Modèles et le chat. */

export const API_KEY_STORE = "castor-or-key";
export const DEFAULT_MODEL = "stealth/ox-alpha";

/* Modèles mis en avant en tête des sélecteurs des studios. */
export const PREFERRED_MODELS = [
  DEFAULT_MODEL,
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "poolside/laguna-s-2.1:free",
  "nvidia/nemotron-3.5-lightning:free",
  "poolside/laguna-xs-2.1:free",
];

/* Nom affiché d'un modèle : tolère id/name manquants. */
export function shortName(id, name) {
  return String(name || id || "").replace(/\s*\(free\)\s*$/i, "");
}

export function slugify(s) {
  return (
    String(s)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()
      .slice(0, 28) || "mon-site"
  );
}

export function escapeHtml(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/* Trie une liste de modèles : préférences d'abord, puis contexte décroissant. */
export function sortModelsByPreference(list) {
  return [...list].sort((a, b) => {
    const ia = PREFERRED_MODELS.indexOf(a.id);
    const ib = PREFERRED_MODELS.indexOf(b.id);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return (b.ctx || 0) - (a.ctx || 0);
  });
}

/* Markdown minimal, échappé AVANT toute transformation → sûr pour innerHTML. */
export function renderMarkdown(src) {
  const parts = escapeHtml(src).split(/```/);
  let out = "";
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      const nl = parts[i].indexOf("\n");
      out += `<pre>${nl >= 0 ? parts[i].slice(nl + 1) : parts[i]}</pre>`;
    } else {
      let seg = parts[i];
      seg = seg.replace(/`([^`]+)`/g, "<code>$1</code>");
      seg = seg.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      seg = seg.replace(/^### (.+)$/gm, "<h4>$1</h4>");
      seg = seg.replace(/^\*([^*\n]+)\*$/gm, "<em>$1</em>");
      seg = seg.replace(/^[-*] (.+)$/gm, "• $1");
      seg = seg.replace(/^(\d+)\. (.+)$/gm, "$1. $2");
      out += seg;
    }
  }
  return out;
}

/* Enter déclenche l'envoi sauf Shift (saut de ligne) et composition IME. */
export function shouldSubmit(e) {
  return e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing;
}
