import { inferTypes, isChatModel } from "../data/models.js";

/* Source unique pour l'annuaire live des modèles gratuits OpenRouter.
   Utilisée par la page Modèles (entrées riches) et les studios (liste simple). */
export async function fetchFreeOpenRouter(signal) {
  const res = await fetch("https://openrouter.ai/api/v1/models", { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const rows = Array.isArray(json?.data) ? json.data : [];
  return rows
    .filter((m) => m.pricing?.prompt === "0" && isChatModel(m.id))
    .map((m) => ({
      id: m.id,
      provider: "openrouter",
      name: (m.name || m.id).replace(/\s*\(free\)\s*$/i, ""),
      types: inferTypes(m),
      ctx: m.context_length || null,
      live: true,
    }));
}

/* Liste simple pour les sélecteurs de modèle des studios. */
export async function fetchFreeModels(signal) {
  const full = await fetchFreeOpenRouter(signal);
  return full.map(({ id, name, ctx }) => ({ id, name, ctx }));
}
