/* Registre des providers — protocole OpenAI-compatible partout. */

const PROVIDERS = [
  {
    id: "openrouter",
    label: "OpenRouter",
    baseURL: "https://openrouter.ai/api/v1",
    needsKey: true,
    keyUrl: "https://openrouter.ai/settings/keys",
    defaultModel: "stealth/ox-alpha",
    models: [
      "stealth/ox-alpha",
      "nvidia/nemotron-3-ultra-550b-a55b:free",
      "poolside/laguna-s-2.1:free",
      "nvidia/nemotron-3.5-lightning:free",
      "poolside/laguna-xs-2.1:free",
    ],
    hint: "+ de 400 modèles, tier :free",
  },
  {
    id: "groq",
    label: "Groq",
    baseURL: "https://api.groq.com/openai/v1",
    needsKey: true,
    keyUrl: "https://console.groq.com/keys",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "meta-llama/llama-4-scout-17b-16e-instruct",
      "openai/gpt-oss-120b",
    ],
    hint: "inférence LPU ultra-rapide",
  },
  {
    id: "zen",
    label: "OpenCode Zen",
    baseURL: "https://opencode.ai/zen/v1",
    needsKey: true,
    keyUrl: "https://opencode.ai/zen",
    defaultModel: "grok-code",
    models: ["grok-code", "qwen3-coder", "kimi-k2"],
    hint: "passerelle spécialisée code",
  },
  {
    id: "ollama",
    label: "Local · Ollama",
    baseURL: "http://localhost:11434/v1",
    needsKey: false,
    defaultModel: "qwen2.5-coder:7b",
    models: ["qwen2.5-coder:7b", "qwen3-coder:30b", "gemma3:4b", "deepseek-r1:8b"],
    hint: "100 % hors ligne",
  },
  {
    id: "lmstudio",
    label: "Local · LM Studio",
    baseURL: "http://localhost:1234/v1",
    needsKey: false,
    defaultModel: "local-model",
    models: [],
    hint: "serveur local LM Studio",
  },
];

const isChatModel = (id) => !/content-safety|moderation|lyria/i.test(id || "");

module.exports = { PROVIDERS, isChatModel };
