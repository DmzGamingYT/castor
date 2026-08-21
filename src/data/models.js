/* Catalogue des modèles gratuits, par provider.
   SNAPSHOT = état vérifié à la date indiquée ; la page Modèles tente
   une actualisation live depuis l'API publique d'OpenRouter (sans clé)
   et retombe sur ce snapshot en cas d'échec réseau. */

export const SNAPSHOT_DATE = "21 août 2026";

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

export const SNAPSHOT = [
  // --- OpenRouter (suffixe :free) ---
  { id: "deepseek/deepseek-chat-v3-0324:free", provider: "openrouter", name: "DeepSeek V3 0324", types: ["code", "outils"], ctx: 163840 },
  { id: "deepseek/deepseek-r1-0528:free", provider: "openrouter", name: "DeepSeek R1", types: ["raisonnement", "code"], ctx: 163840 },
  { id: "qwen/qwen3-coder:free", provider: "openrouter", name: "Qwen3 Coder", types: ["code", "outils"], ctx: 262144 },
  { id: "meta-llama/llama-3.3-70b-instruct:free", provider: "openrouter", name: "Llama 3.3 70B", types: ["rapide"], ctx: 131072 },
  { id: "google/gemma-3-27b-it:free", provider: "openrouter", name: "Gemma 3 27B", types: ["multimodal", "vision"], ctx: 131072 },
  { id: "mistralai/mistral-small-3.2-24b-instruct:free", provider: "openrouter", name: "Mistral Small 3.2", types: ["rapide", "code"], ctx: 131072 },
  { id: "moonshotai/kimi-k2:free", provider: "openrouter", name: "Kimi K2", types: ["outils", "code"], ctx: 131072 },
  { id: "z-ai/glm-4.5-air:free", provider: "openrouter", name: "GLM 4.5 Air", types: ["raisonnement", "rapide"], ctx: 131072 },

  // --- Groq (tier gratuit) ---
  { id: "llama-3.3-70b-versatile", provider: "groq", name: "Llama 3.3 70B Versatile", types: ["rapide"], ctx: 131072 },
  { id: "llama-3.1-8b-instant", provider: "groq", name: "Llama 3.1 8B Instant", types: ["rapide"], ctx: 131072 },
  { id: "qwen-2.5-coder-32b", provider: "groq", name: "Qwen 2.5 Coder 32B", types: ["code"], ctx: 131072 },
  { id: "meta-llama/llama-4-scout-17b-16e-instruct", provider: "groq", name: "Llama 4 Scout", types: ["multimodal", "vision", "rapide"], ctx: 131072 },
  { id: "openai/gpt-oss-120b", provider: "groq", name: "GPT-OSS 120B", types: ["raisonnement", "outils"], ctx: 131072 },

  // --- OpenCode Zen ---
  { id: "grok-code", provider: "zen", name: "Grok Code", types: ["code", "rapide"], ctx: 131072 },
  { id: "qwen3-coder", provider: "zen", name: "Qwen3 Coder", types: ["code"], ctx: 262144 },
  { id: "kimi-k2", provider: "zen", name: "Kimi K2", types: ["outils"], ctx: 131072 },

  // --- Local (Ollama & co) ---
  { id: "qwen2.5-coder:7b", provider: "local", name: "Qwen 2.5 Coder 7B", types: ["code"], ctx: 32768 },
  { id: "llama3.2:3b", provider: "local", name: "Llama 3.2 3B", types: ["rapide"], ctx: 131072 },
  { id: "llava:7b", provider: "local", name: "LLaVA 7B", types: ["vision"], ctx: 32768 },
  { id: "deepseek-r1:8b", provider: "local", name: "DeepSeek R1 8B", types: ["raisonnement"], ctx: 131072 },
];

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
