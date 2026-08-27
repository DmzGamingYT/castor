/* Simulateur window.castor pour la DÉMO hors-Electron (preview-demo.html).
   Aucune vraie requête : providers, store, streaming, outils et approbation
   sont simulés en mémoire pour présenter l'UI retravaillée. */
(function () {
  "use strict";

  const mem = new Map();
  mem.set("skills", [
    { name: "review", body: "Relis le code fourni comme un reviewer senior : points bloquants d'abord, puis suggestions concrètes avec extraits corrigés." },
    { name: "tests", body: "Propose des tests couvrant les cas limites du code fourni, prêts à coller dans le projet." },
    { name: "explique", body: "Explique pas à pas, avec une analogie simple, puis un résumé en 3 points." },
  ]);
  mem.set("memory", [
    { id: 1, text: "Réponses courtes, code en TypeScript." },
    { id: 2, text: "Le projet castor utilise Vite + React 18." },
  ]);
  mem.set("usage", { totalTokens: 4821, requests: 7 });

  const now = Date.now();
  const P_CASTOR = "/Users/demo/projets/castor";
  const P_SITE = "/Users/demo/projets/site-vitrine";
  mem.set("projects", [
    { id: P_CASTOR, name: "castor", path: P_CASTOR },
    { id: P_SITE, name: "site-vitrine", path: P_SITE },
  ]);
  mem.set("conversations", [
    { id: 1, projectId: P_CASTOR, title: "Refactore le lecteur de config en TypeScript", messages: [{ role: "user", content: "Refactore le lecteur de config en TypeScript." }], updatedAt: now - 1000 * 60 * 42, archived: false },
    { id: 2, projectId: P_CASTOR, title: "Corrige le bug d'accents dans le parseur CSV", messages: [{ role: "user", content: "Corrige le bug d'accents." }], updatedAt: now - 1000 * 60 * 60 * 5, archived: false },
    { id: 3, projectId: null, title: "Idées de nommage pour le module de thèmes", messages: [{ role: "user", content: "Des idées de nommage ?" }], updatedAt: now - 1000 * 60 * 60 * 26, archived: false },
    { id: 4, projectId: P_SITE, title: "Optimise les images de la page modèles", messages: [{ role: "user", content: "Optimise les images." }], updatedAt: now - 1000 * 60 * 60 * 30, archived: true },
  ]);

  const listeners = { chunk: [], end: [], error: [], toolStart: [], toolResult: [], approval: [] };
  const on = (key) => (cb) => {
    listeners[key].push(cb);
    return () => { listeners[key] = listeners[key].filter((f) => f !== cb); };
  };
  const emit = (key, data) => listeners[key].forEach((cb) => { try { cb(data); } catch (e) { console.error(e); } });

  let reqSeq = 0;
  let timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  // simulateur de mise à jour : la pastille de la sidebar doit apparaître
  let updateStatus = { state: "idle" };
  const updateCbs = [];
  let updateSimStarted = false;
  function simulateUpdate() {
    if (updateSimStarted) return;
    updateSimStarted = true;
    const push = (s) => { updateStatus = s; updateCbs.forEach((cb) => cb({ ...s })); };
    setTimeout(() => push({ state: "available", version: "0.2.1", percent: null }), 1500);
    setTimeout(() => push({ state: "available", version: "0.2.1", percent: 42 }), 2700);
    setTimeout(() => push({ state: "available", version: "0.2.1", percent: 100 }), 3900);
    setTimeout(() => push({ state: "downloaded", version: "0.2.1", percent: 100 }), 5100);
  }
  setTimeout(simulateUpdate, 800);

  const FAKE_REPLY = [
    "Voici mon plan :\n",
    "\n- [x] lire le fichier de config\n- [x] repérer les types manquants\n- [ ] réécrire `config.js` en TypeScript\n\n",
    "Le lecteur actuel mélange lecture et validation. Je propose un module typé :\n\n",
    "```ts\nexport interface Config {\n  port: number;\n  theme: \"clair\" | \"sombre\";\n}\n```\n\n",
    "Je peux écrire `src/config.ts` — dis-moi et je m'en occupe. 🦫",
  ].join("");

  function runFakeStream(reqId) {
    later(250, () => emit("toolStart", { reqId, callId: "t1", icon: "📄", label: "read_file src/config.js" }));
    later(950, () => emit("toolResult", { reqId, callId: "t1", meta: { kind: "read" } }));
    later(1200, () =>
      emit("approval", {
        callId: "w1",
        kind: "write",
        path: "src/config.ts",
        isNew: true,
        diff:
          "@@ -0,0 +1,4 @@\n" +
          "+ export interface Config {\n+   port: number;\n+   theme: \"clair\" | \"sombre\";\n+ }\n",
      })
    );
    // commande shell simulée : visible dans l'onglet Terminal du panneau droit
    later(3400, () =>
      emit("toolStart", {
        reqId,
        callId: "c1",
        icon: "⚙️",
        label: "run_command « npm test »",
        kind: "command",
      })
    );
    later(4700, () =>
      emit("toolResult", {
        reqId,
        callId: "c1",
        meta: {
          kind: "command",
          command: "npm test",
          code: 0,
          output: "> castor@0.1.0 test\n✓ 12 tests passés (2,1 s)\n✓ coverage 94 %",
        },
      })
    );
    later(5200, () => {
      const parts = FAKE_REPLY.match(/[\s\S]{1,80}/g) || [];
      parts.forEach((p, i) => later(i * 170, () => emit("chunk", { reqId, delta: p })));
      later(parts.length * 170 + 350, () => {
        emit("end", { reqId, ms: 4400 + parts.length * 170, cancelled: false });
      });
    });
  }

  let currentWs = null;
  const PROJECTS = () => mem.get("projects") || [];
  const fakeWorkspace = () => {
    const list = PROJECTS();
    const target = list.find((p) => p.path !== currentWs) || list[0];
    if (!target) return { ok: false };
    currentWs = target.path;
    return { ok: true, name: target.name, path: target.path };
  };

  window.castor = {
    appInfo: async () => ({ version: "0.2.0", platform: "darwin" }),

    listProviders: async () => [
      { id: "openrouter", label: "OpenRouter", baseURL: "https://openrouter.ai/api/v1", needsKey: true, keyUrl: "https://openrouter.ai/settings/keys", defaultModel: "meta-llama/llama-3.3-70b-instruct", models: ["meta-llama/llama-3.3-70b-instruct", "deepseek/deepseek-chat", "qwen/qwen-2.5-coder-32b-instruct", "mistralai/mistral-small-24b-instruct"], hint: "", configured: true },
      { id: "groq", label: "Groq", baseURL: "https://api.groq.com/openai/v1", needsKey: true, keyUrl: "https://console.groq.com/keys", defaultModel: "llama-3.3-70b-versatile", models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"], hint: "", configured: false },
      { id: "ollama", label: "Local · Ollama", baseURL: "http://localhost:11434/v1", needsKey: false, keyUrl: null, defaultModel: "qwen2.5-coder:7b", models: ["qwen2.5-coder:7b", "llama3.2:3b"], hint: "", configured: true },
      { id: "lmstudio", label: "Local · LM Studio", baseURL: "http://localhost:1234/v1", needsKey: false, keyUrl: null, defaultModel: "local-model", models: [], hint: "", configured: true },
    ],
    setKey: async () => {
      const p = window.castor.__providers.find((x) => x.id === window.castor.__activeId);
      if (p) p.configured = true;
      return true;
    },
    refreshModels: async () => ({
      ok: true,
      models: [
        { id: "meta-llama/llama-3.3-70b-instruct", free: true, context: 131072 },
        { id: "deepseek/deepseek-r1:free", free: true, context: 163840 },
        { id: "deepseek/deepseek-chat", free: true, context: 65536 },
        { id: "qwen/qwen-2.5-coder-32b-instruct", free: true, context: 32768 },
        { id: "mistralai/mistral-small-24b-instruct", free: true, context: 32768 },
        { id: "google/gemini-2.0-flash-exp:free", free: true, context: 1048576 },
        { id: "anthropic/claude-sonnet-4", free: false, context: 200000 },
        { id: "openai/gpt-4.1-mini", free: false, context: 1047576 },
      ],
    }),
    testConnection: async () => ({ ok: true }),

    stream: async () => {
      const reqId = ++reqSeq;
      runFakeStream(reqId);
      return { ok: true, reqId };
    },
    cancel: async (reqId) => {
      clearTimers();
      emit("end", { reqId, ms: 900, cancelled: true });
    },
    onChunk: on("chunk"),
    onEnd: on("end"),
    onError: on("error"),
    onToolStart: on("toolStart"),
    onToolResult: on("toolResult"),
    onApprovalRequest: on("approval"),

    openWorkspace: async () => fakeWorkspace(),
    openWorkspacePath: async (p) => {
      const proj = PROJECTS().find((x) => x.path === p);
      if (!proj) return { ok: false };
      currentWs = proj.path;
      return { ok: true, name: proj.name, path: proj.path };
    },
    restoreWorkspace: async () => {
      const first = PROJECTS()[0];
      if (!first) return { ok: false };
      currentWs = first.path;
      return { ok: true, name: first.name, path: first.path };
    },
    closeWorkspace: async () => { currentWs = null; return { ok: true }; },
    workspaceTree: async () => ({
      ok: true,
      tree: {
        children: [
          { type: "dir", name: "desktop", children: [{ type: "file", name: "main.js" }, { type: "file", name: "preload.js" }, { type: "dir", name: "renderer", children: [{ type: "file", name: "app.js" }, { type: "file", name: "index.html" }, { type: "file", name: "styles.css" }] }] },
          { type: "dir", name: "src", children: [{ type: "file", name: "config.js" }, { type: "file", name: "utils.js" }] },
          { type: "file", name: "package.json" },
        ],
      },
    }),
    workspaceChanges: async () =>
      currentWs
        ? { ok: true, repo: true, clean: false, files: [
            { code: "M", path: "desktop/renderer/app.js" },
            { code: "M", path: "desktop/renderer/styles.css" },
            { code: "A", path: "src/config.ts" },
          ] }
        : { ok: true, repo: false },
    workspaceFileDiff: async () => ({
      ok: true,
      content:
        "@@ -12,7 +12,9 @@\n- function loadConfig() {\n-   return JSON.parse(raw);\n- }\n+ function loadConfig(): Config {\n+   return schema.parse(JSON.parse(raw));\n+ }\n",
    }),
    pathForFile: () => null,
    respondApproval: (_callId, approved) => {
      if (!approved) return;
      const reqId = reqSeq;
      later(150, () => emit("toolStart", { reqId, callId: "w1", icon: "✏️", label: "write_file src/config.ts" }));
      later(1100, () => emit("toolResult", { reqId, callId: "w1", meta: { kind: "write" } }));
    },

    storeGet: async (k) => (mem.has(k) ? mem.get(k) : null),
    storeSet: async (k, v) => { mem.set(k, v); return true; },

    // mises à jour (séquence simulée : dispo → téléchargement → prête)
    checkUpdates: async () => {
      simulateUpdate();
      return { ...updateStatus };
    },
    installUpdate: async () => true,
    onUpdateStatus: (cb) => {
      updateCbs.push(cb);
      return () => { const i = updateCbs.indexOf(cb); if (i >= 0) updateCbs.splice(i, 1); };
    },

    // état interne pour que setKey sache qui modifier
    __providers: null,
    __activeId: "openrouter",
  };

  // petit pont : listProviders mémorise la liste pour setKey
  const realList = window.castor.listProviders;
  window.castor.listProviders = async () => {
    const list = await realList();
    window.castor.__providers = list;
    return list;
  };
})();
