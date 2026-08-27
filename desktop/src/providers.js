// Registre des providers — source unique partagée entre main et renderer.
// Tous les providers parlent le protocole OpenAI-compatible /chat/completions.
const PROVIDERS = [
  {
    id: "openrouter",
    label: "OpenRouter",
    baseURL: "https://openrouter.ai/api/v1",
    needsKey: true,
    includeUsage: true, // accepte stream_options.include_usage (compteurs réels)
    keyUrl: "https://openrouter.ai/settings/keys",
    defaultModel: "meta-llama/llama-3.3-70b-instruct",
    models: [
      "meta-llama/llama-3.3-70b-instruct",
      "deepseek/deepseek-chat",
      "qwen/qwen-2.5-coder-32b-instruct",
      "mistralai/mistral-small-24b-instruct",
    ],
    hint: "+ de 400 modèles via une seule clé.",
  },
  {
    id: "groq",
    label: "Groq",
    baseURL: "https://api.groq.com/openai/v1",
    needsKey: true,
    includeUsage: true,
    keyUrl: "https://console.groq.com/keys",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "qwen-2.5-coder-32b",
    ],
    hint: "Inférence ultra-rapide (LPU).",
  },
  {
    id: "zen",
    label: "OpenCode Zen",
    baseURL: "https://opencode.ai/zen/v1",
    needsKey: true,
    includeUsage: true,
    keyUrl: "https://opencode.ai/zen",
    defaultModel: "grok-code",
    models: ["grok-code", "qwen3-coder", "claude-sonnet-4"],
    hint: "Passerelle code-focused. Endpoint éditable dans Réglages si besoin.",
  },
  {
    id: "ollama",
    label: "Local · Ollama",
    baseURL: "http://localhost:11434/v1",
    needsKey: false,
    defaultModel: "qwen2.5-coder:7b",
    models: ["qwen2.5-coder:7b", "llama3.2:3b", "deepseek-r1:8b"],
    hint: "100 % hors ligne. Lance d'abord : ollama pull qwen2.5-coder:7b",
  },
  {
    id: "lmstudio",
    label: "Local · LM Studio",
    baseURL: "http://localhost:1234/v1",
    needsKey: false,
    defaultModel: "local-model",
    models: [],
    hint: "Active le serveur local dans LM Studio, puis « Rafraîchir ».",
  },
];

module.exports = { PROVIDERS };
