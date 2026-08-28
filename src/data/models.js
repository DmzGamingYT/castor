/* Catalogue des modèles gratuits, par provider.
   SNAPSHOT = état vérifié à la date indiquée ; la page Modèles tente
   une actualisation live depuis l'API publique d'OpenRouter (sans clé)
   et retombe sur ce snapshot en cas d'échec réseau.
   Les listes Groq / Zen / Local sont des sélections curatées des
   principaux modèles actifs (leurs catalogues exigent une clé). */

export const SNAPSHOT_DATE = "28 août 2026";

export const PROVIDERS = {
  openrouter: { label: "OpenRouter", note: "Tier gratuit partagé, débit limité" },
  groq: { label: "Groq", note: "Inférence LPU ultra-rapide" },
  zen: { label: "OpenCode Zen", note: "Passerelle spécialisée code" },
  local: { label: "Local", note: "Sur ta machine · 100 % privé" },
};

export const TYPES = {
  multimodal: "Multimodal",
  vision: "Vision",
  raisonnement: "Raisonnement",
  code: "Code",
  rapide: "Rapide",
  outils: "Outils",
};

/* --- OpenRouter : liste réelle des gratuits au 21/08/2026 (hors
       modèles de modération et previews musique) --- */
const OPENROUTER_LIVE = [
  { id: "inclusionai/ling-3.0-flash-fin:free", name: "Ling 3.0 Flash Fin", types: ["rapide"], ctx: 262144 },
  { id: "dots-studio/dots-3-note-preview:free", name: "Dots3 Note Preview", types: ["rapide"], ctx: 512000 },
  { id: "liquid/lfm-2.5-2.6b:free", name: "LFM 2.5 2.6B", types: ["rapide"], ctx: 65536 },
  { id: "nvidia/nemotron-3.5-lightning:free", name: "Nemotron 3.5 Lightning", types: ["rapide"], ctx: 1000000 },
  { id: "thinkingmachines/inkling-small:free", name: "Inkling Small", types: ["rapide"], ctx: 1048576 },
  { id: "poolside/laguna-s-2.1:free", name: "Laguna S 2.1", types: ["code", "outils"], ctx: 262144 },
  { id: "thinkingmachines/inkling:free", name: "Inkling", types: ["raisonnement", "outils"], ctx: 1048576 },
  { id: "poolside/laguna-xs-2.1:free", name: "Laguna XS 2.1", types: ["code", "rapide"], ctx: 262144 },
  { id: "cohere/north-mini-code:free", name: "North Mini Code", types: ["code"], ctx: 256000 },
  { id: "z-ai/glm-5.2:free", name: "GLM 5.2", types: ["raisonnement", "outils"], ctx: 256000 },
  { id: "nvidia/nemotron-3-ultra-550b-a55b:free", name: "Nemotron 3 Ultra", types: ["raisonnement", "outils"], ctx: 1000000 },
  { id: "minimax/minimax-m3:free", name: "MiniMax M3", types: ["raisonnement", "outils"], ctx: 1048576 },
  { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", name: "Nemotron 3 Nano Omni", types: ["multimodal", "raisonnement"], ctx: 256000 },
  { id: "google/gemma-4-26b-a4b-it:free", name: "Gemma 4 26B A4B", types: ["multimodal", "vision", "rapide"], ctx: 262144 },
  { id: "google/gemma-4-31b-it:free", name: "Gemma 4 31B", types: ["multimodal", "vision"], ctx: 262144 },
  { id: "minimax/minimax-m2.7:free", name: "MiniMax M2.7", types: ["rapide"], ctx: 196608 },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", name: "Nemotron 3 Super", types: ["raisonnement"], ctx: 262144 },
  { id: "openrouter/free", name: "Free Models Router", types: ["rapide", "outils"], ctx: 200000 },
].map((m) => ({ ...m, provider: "openrouter" }));

export const SNAPSHOT = [
  ...OPENROUTER_LIVE,

  // --- Groq (principaux actifs du tier gratuit) ---
  { id: "llama-3.3-70b-versatile", provider: "groq", name: "Llama 3.3 70B Versatile", types: ["rapide"], ctx: 131072 },
  { id: "llama-3.1-8b-instant", provider: "groq", name: "Llama 3.1 8B Instant", types: ["rapide"], ctx: 131072 },
  { id: "meta-llama/llama-4-scout-17b-16e-instruct", provider: "groq", name: "Llama 4 Scout", types: ["multimodal", "vision", "rapide"], ctx: 131072 },
  { id: "openai/gpt-oss-120b", provider: "groq", name: "GPT-OSS 120B", types: ["raisonnement", "outils"], ctx: 131072 },
  { id: "qwen/qwen3-32b", provider: "groq", name: "Qwen 3 32B", types: ["raisonnement", "code"], ctx: 131072 },

  // --- OpenCode Zen (passerelle code) ---
  { id: "grok-code", provider: "zen", name: "Grok Code", types: ["code", "rapide"], ctx: 131072 },
  { id: "qwen3-coder", provider: "zen", name: "Qwen3 Coder", types: ["code"], ctx: 262144 },
  { id: "kimi-k2", provider: "zen", name: "Kimi K2", types: ["outils", "code"], ctx: 131072 },

  // --- Local (bibliothèque Ollama) ---
  { id: "qwen3-coder:30b", provider: "local", name: "Qwen3 Coder 30B", types: ["code"], ctx: 262144 },
  { id: "qwen2.5-coder:7b", provider: "local", name: "Qwen 2.5 Coder 7B", types: ["code"], ctx: 32768 },
  { id: "gemma3:4b", provider: "local", name: "Gemma 3 4B", types: ["multimodal", "vision", "rapide"], ctx: 131072 },
  { id: "deepseek-r1:8b", provider: "local", name: "DeepSeek R1 8B", types: ["raisonnement"], ctx: 131072 },
  { id: "llava:7b", provider: "local", name: "LLaVA 7B", types: ["vision"], ctx: 32768 },
];

/* Modèles présents dans l'API mais hors périmètre chat :
   modération, génération musicale… */
export function isChatModel(id) {
  return !/content-safety|moderation|lyria/i.test(id || "");
}

/* Déduit des types depuis les métadonnées brutes d'OpenRouter */
export function inferTypes(model) {
  const types = new Set();
  const mods = model.architecture?.input_modalities || [];
  if (mods.includes("image")) {
    types.add("vision");
    types.add("multimodal");
  }
  const id = (model.id || "").toLowerCase();
  if (/coder|code/.test(id)) types.add("code");
  if (/r1|reason|think/.test(id)) types.add("raisonnement");
  if (model.supported_parameters?.includes("tools")) types.add("outils");
  if (!types.size) types.add("rapide");
  return [...types];
}

export function formatCtx(ctx) {
  if (!ctx) return "—";
  return ctx >= 1000000 ? `${(ctx / 1000000).toFixed(1)}M` : `${Math.round(ctx / 1024)}k`;
}

/* Version courte d'un id de modèle : retire le préfixe provider
   ("nvidia/…") et le suffixe ":free" — le badge affiche déjà le provider
   et le tooltip du composant garde l'id complet. */
export function shortId(id = "") {
  return id.replace(/^[^/]+\//, "").replace(/:free$/, "");
}
