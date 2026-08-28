const { app, BrowserWindow, ipcMain, safeStorage, shell, Menu, dialog, net } =
  require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("node:path");
const fs = require("node:fs");
const { PROVIDERS } = require("./src/providers");
const {
  safeResolve,
  buildTree,
  readFileCapped,
  previewWrite,
  applyWrite,
  runCommand,
} = require("./src/tools");

let win = null;
let reqSeq = 0;
const streams = new Map(); // reqId -> AbortController
const writeBackups = new Map(); // callId -> { abs, prevContent, isNew } — undo des écritures

// ---------- stockage des clés (chiffré via safeStorage) ----------
const keysPath = () => path.join(app.getPath("userData"), "keys.json");

function loadKeys() {
  try {
    const raw = JSON.parse(fs.readFileSync(keysPath(), "utf8"));
    const out = {};
    for (const [id, v] of Object.entries(raw)) {
      if (v && v.enc && safeStorage.isEncryptionAvailable()) {
        out[id] = safeStorage.decryptString(Buffer.from(v.data));
      } else {
        out[id] = v.plain ?? "";
      }
    }
    return out;
  } catch {
    return {};
  }
}

function saveKeys(keys) {
  const payload = {};
  const canEncrypt = safeStorage.isEncryptionAvailable();
  for (const [id, value] of Object.entries(keys)) {
    if (!value) continue;
    payload[id] = canEncrypt
      ? { enc: true, data: Array.from(safeStorage.encryptString(value)) }
      : { plain: value };
  }
  fs.mkdirSync(path.dirname(keysPath()), { recursive: true });
  fs.writeFileSync(keysPath(), JSON.stringify(payload, null, 2));
}

let KEYS = null;

function getKey(id) {
  if (!KEYS) KEYS = loadKeys();
  return KEYS[id] || "";
}

function setKey(id, value) {
  if (!KEYS) KEYS = loadKeys();
  if (value) KEYS[id] = value;
  else delete KEYS[id];
  saveKeys(KEYS);
}

// ---------- helpers providers ----------
const findProvider = (id) => PROVIDERS.find((p) => p.id === id);

function headersFor(provider) {
  const h = { "content-type": "application/json" };
  const key = getKey(provider.id);
  if (provider.needsKey && key) {
    h.authorization = `Bearer ${key}`;
    // OpenRouter apprécie ces en-têtes d'identification d'app
    if (provider.id === "openrouter") {
      h["http-referer"] = "https://castor.app";
      h["x-title"] = "Castor Desktop";
    }
  }
  return h;
}

function resolveBaseURL(provider, override) {
  const base = (override || "").trim() || provider.baseURL;
  return base.replace(/\/+$/, "");
}

// ---------- IPC ----------
ipcMain.handle("app:info", () => ({
  version: app.getVersion(),
  platform: process.platform,
}));

// ---------- mises à jour automatiques (electron-updater) ----------
const UPDATE_RELEASES_URL = "https://github.com/DmzGamingYT/castor/releases/latest";
const updateState = { state: "idle", version: null, percent: null };

function pushUpdateStatus(patch) {
  Object.assign(updateState, patch);
  if (win && !win.isDestroyed()) {
    win.webContents.send("updates:status", { ...updateState });
  }
}

function setupAutoUpdater() {
  // en dev, pas de app-update.yml : on ne vérifie que dans l'app empaquetée
  if (!app.isPackaged) return;
  // macOS non signé : l'installation auto exige une signature → simple notification
  // avec lien vers la page Releases (win NSIS et linux AppImage s'installent tout seuls)
  autoUpdater.autoDownload = process.platform !== "darwin";
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on("checking-for-update", () => pushUpdateStatus({ state: "checking" }));
  autoUpdater.on("update-available", (it) =>
    pushUpdateStatus({ state: "available", version: it?.version || null, percent: null })
  );
  autoUpdater.on("update-not-available", () => pushUpdateStatus({ state: "none" }));
  autoUpdater.on("download-progress", (p) =>
    pushUpdateStatus({ state: "available", percent: Math.round(p?.percent || 0) })
  );
  autoUpdater.on("update-downloaded", (it) =>
    pushUpdateStatus({ state: "downloaded", version: it?.version || null })
  );
  autoUpdater.on("error", (err) =>
    pushUpdateStatus({ state: "error", message: String(err?.message || err) })
  );
  // petite temporisation pour laisser l'UI s'installer au lancement
  setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 5000);
}

ipcMain.handle("updates:check", async () => {
  if (app.isPackaged) {
    try {
      await autoUpdater.checkForUpdates();
    } catch (err) {
      pushUpdateStatus({ state: "error", message: String(err?.message || err) });
    }
  }
  return { ...updateState };
});

ipcMain.handle("updates:install", () => {
  // macOS non signé : ouvrir la page Releases pour récupérer le DMG
  if (process.platform === "darwin") {
    if (updateState.state === "available" || updateState.state === "downloaded") {
      shell.openExternal(UPDATE_RELEASES_URL);
    }
    return false;
  }
  if (updateState.state !== "downloaded") return false;
  autoUpdater.quitAndInstall(false, true);
  return true;
});

ipcMain.handle("providers:list", () =>
  PROVIDERS.map((p) => ({
    id: p.id,
    label: p.label,
    baseURL: p.baseURL,
    needsKey: p.needsKey,
    keyUrl: p.keyUrl || null,
    defaultModel: p.defaultModel,
    models: p.models,
    hint: p.hint,
    configured: !p.needsKey || Boolean(getKey(p.id)),
  }))
);

ipcMain.handle("key:set", (_e, id, value) => {
  setKey(id, String(value || "").trim());
  return true;
});

// ---------- store persistant (compétences, mémoire, usage) ----------
const storePath = () => path.join(app.getPath("userData"), "store.json");

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(storePath(), "utf8"));
  } catch {
    return {};
  }
}

function writeStore(data) {
  fs.mkdirSync(path.dirname(storePath()), { recursive: true });
  fs.writeFileSync(storePath(), JSON.stringify(data, null, 2));
}

ipcMain.handle("store:get", (_e, key) => readStore()[key] ?? null);
ipcMain.handle("store:set", (_e, key, value) => {
  const data = readStore();
  data[key] = value;
  writeStore(data);
  return true;
});

ipcMain.handle("models:refresh", async (_e, providerId, baseURLOverride) => {
  const provider = findProvider(providerId);
  if (!provider) return { ok: false, models: [], error: "provider inconnu" };
  try {
    const res = await net.fetch(`${resolveBaseURL(provider, baseURLOverride)}/models`, {
      headers: headersFor(provider),
    });
    if (!res.ok) return { ok: false, models: [], error: `HTTP ${res.status}` };
    const json = await res.json();
    // objets riches quand l'API les fournit (OpenRouter) : gratuité + contexte
    const models = (json.data || [])
      .map((m) => ({
        id: m.id,
        free: m.pricing
          ? Number(m.pricing.prompt) === 0 && Number(m.pricing.completion) === 0
          : undefined,
        context: m.context_length || m.top_provider?.context_size || null,
      }))
      .filter((m) => m.id)
      .sort((a, b) => a.id.localeCompare(b.id));
    return { ok: true, models };
  } catch (err) {
    return { ok: false, models: [], error: err.message };
  }
});

// ---------- espace de travail (atelier) ----------
let WORKSPACE = null;

ipcMain.handle("workspace:open", async () => {
  const r = await dialog.showOpenDialog(win, {
    properties: ["openDirectory"],
    title: "Choisis le dossier du projet",
  });
  if (r.canceled || !r.filePaths[0]) return { ok: false };
  WORKSPACE = r.filePaths[0];
  startWatcher(WORKSPACE);
  const store = readStore();
  store.workspace = WORKSPACE;
  writeStore(store);
  return { ok: true, path: WORKSPACE, name: path.basename(WORKSPACE) };
});

ipcMain.handle("workspace:restore", () => {
  const saved = readStore().workspace;
  if (saved && fs.existsSync(saved)) {
    WORKSPACE = saved;
    startWatcher(WORKSPACE);
    return { ok: true, path: WORKSPACE, name: path.basename(WORKSPACE) };
  }
  return { ok: false };
});

ipcMain.handle("workspace:openPath", (_e, p) => {
  try {
    const abs = path.resolve(String(p || ""));
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) return { ok: false };
    WORKSPACE = abs;
    startWatcher(WORKSPACE);
    const store = readStore();
    store.workspace = WORKSPACE;
    writeStore(store);
    return { ok: true, path: WORKSPACE, name: path.basename(WORKSPACE) };
  } catch {
    return { ok: false };
  }
});

ipcMain.handle("workspace:close", () => {
  stopWatcher();
  WORKSPACE = null;
  const store = readStore();
  delete store.workspace;
  writeStore(store);
  return true;
});

ipcMain.handle("workspace:tree", () => {
  if (!WORKSPACE) return { ok: false, error: "aucun dossier ouvert" };
  try {
    return { ok: true, path: WORKSPACE, name: path.basename(WORKSPACE), tree: buildTree(WORKSPACE) };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// lecture en lecture seule (200 ko max) pour l'aperçu dans l'onglet Files
ipcMain.handle("workspace:readFile", (_e, rel) => {
  if (!WORKSPACE) return { ok: false, error: "aucun dossier ouvert" };
  try {
    const r = readFileCapped(WORKSPACE, rel);
    return { ok: true, content: r.content, truncated: r.truncated, bytes: r.bytes };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// ---------- approbation des actions sensibles ----------
const approvals = new Map(); // callId -> resolve
let bounceId = null;

function requestApproval(payload) {
  return new Promise((resolve) => {
    approvals.set(payload.callId, resolve);
    win.webContents.send("approval:request", payload);
    if (!win.isFocused()) {
      if (process.platform === "darwin" && app.dock) bounceId = app.dock.bounce();
      win.flashFrame(true);
    }
  });
}

function clearAttention() {
  if (bounceId != null && process.platform === "darwin" && app.dock) {
    app.dock.cancelBounce(bounceId);
    bounceId = null;
  }
  win.flashFrame(false);
}

ipcMain.handle("approval:respond", (_e, callId, approved) => {
  clearAttention();
  const resolve = approvals.get(callId);
  if (resolve) {
    approvals.delete(callId);
    resolve(Boolean(approved));
  }
  return true;
});

// ---------- outils exposés au modèle ----------
const TOOLS = [
  {
    type: "function",
    function: {
      name: "list_dir",
      description:
        "Liste le contenu d'un dossier de l'espace de travail (chemins relatifs à la racine).",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Chemin relatif, '.' pour la racine" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Lit un fichier (200 ko max) et renvoie son contenu texte.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Chemin relatif du fichier" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write_file",
      description:
        "Écrit un fichier complet (création ou remplacement). Une validation humaine du diff est demandée avant application.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Chemin relatif du fichier" },
          content: { type: "string", description: "Contenu complet du fichier" },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_command",
      description:
        "Lance une commande shell dans la racine du projet (npm, git…). Validation humaine demandée. 60 s max.",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "La commande à exécuter" },
        },
        required: ["command"],
      },
    },
  },
];

function toolLabel(name, args) {
  switch (name) {
    case "list_dir":
      return `Explore ${args.path || "."}`;
    case "read_file":
      return `Lit ${args.path}`;
    case "write_file":
      return `Écrit ${args.path}`;
    case "run_command":
      return `Lance « ${String(args.command).slice(0, 60)} »`;
    default:
      return name;
  }
}

async function executeTool(call, reqId) {
  let args = {};
  try {
    args = JSON.parse(call.function.arguments || "{}");
  } catch {
    return "ERREUR : arguments JSON invalides.";
  }
  const name = call.function.name;
  let meta = null; // infos pour le renderer (terminal, changes)
  win.webContents.send("tool:start", {
    reqId,
    callId: call.id,
    icon: name === "run_command" ? "term" : name === "write_file" ? "pencil" : "search",
    label: toolLabel(name, args),
    kind: name === "run_command" ? "command" : name === "write_file" ? "write" : "read",
  });

  try {
    if (!WORKSPACE)
      return "ERREUR : aucun dossier ouvert. Demande à l'utilisateur d'ouvrir un espace de travail.";

    if (name === "list_dir") {
      const abs = safeResolve(WORKSPACE, args.path || ".");
      const st = fs.statSync(abs);
      if (!st.isDirectory()) return `Ce n'est pas un dossier : ${args.path}`;
      const entries = fs
        .readdirSync(abs, { withFileTypes: true })
        .filter((e) => !/^(node_modules|\.git|dist|build|release)$/.test(e.name))
        .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name))
        .map((e) => (e.isDirectory() ? `${e.name}/` : e.name));
      return entries.length ? entries.join("\n") : "(dossier vide)";
    }

    if (name === "read_file") {
      const r = readFileCapped(WORKSPACE, args.path);
      return (
        (r.truncated
          ? `FICHIER TRONQUÉ (${Math.round(r.bytes / 1024)} ko au total)\n`
          : "") + r.content
      );
    }

    if (name === "write_file") {
      if (typeof args.content !== "string")
        return "ERREUR : contenu manquant.";
      const prev = previewWrite(WORKSPACE, args.path, args.content);
      const approved = await requestApproval({
        callId: call.id,
        kind: "write",
        path: args.path,
        isNew: prev.isNew,
        diff: prev.diff ?? "(contenu identique)",
      });
      if (!approved)
        return "REFUSÉ par l'utilisateur. Ne réessaie pas ce changement sans sa validation explicite.";
      // sauvegarde pour « Annuler l'écriture » (contenu antérieur)
      let prevContent = null;
      if (!prev.isNew) {
        try {
          prevContent = fs.readFileSync(safeResolve(WORKSPACE, args.path), "utf8");
        } catch {
          prevContent = null;
        }
      }
      applyWrite(WORKSPACE, args.path, args.content);
      writeBackups.set(call.id, {
        abs: safeResolve(WORKSPACE, args.path),
        prevContent,
        isNew: prev.isNew,
      });
      if (writeBackups.size > 20) writeBackups.delete(writeBackups.keys().next().value);
      meta = { kind: "write", path: args.path };
      return `Écrit : ${args.path} (${args.content.split("\n").length} lignes)`;
    }

    if (name === "run_command") {
      const approved = await requestApproval({
        callId: call.id,
        kind: "command",
        command: String(args.command || ""),
      });
      if (!approved) return "REFUSÉ par l'utilisateur.";
      const r = await runCommand(args.command, WORKSPACE);
      meta = { kind: "command", command: String(args.command || ""), code: r.code, output: r.output };
      return `Code de sortie : ${r.code}\n${r.output}`;
    }

    return `ERREUR : outil inconnu « ${name} ».`;
  } catch (err) {
    return `ERREUR (${name}) : ${err.message}`;
  } finally {
    win.webContents.send("tool:result", { reqId, callId: call.id, meta });
  }
}

// ---------- suivi des changements git du chantier ----------
ipcMain.handle("workspace:changes", async () => {
  if (!WORKSPACE) return { ok: false, error: "aucun dossier ouvert" };
  try {
    const st = await runCommand(
      "git --no-optional-locks status --porcelain=v1",
      WORKSPACE,
      15_000
    );
    if (/not a git repository|fatal/i.test(st.output))
      return { ok: true, repo: false };
    const ss = await runCommand("git --no-optional-locks diff --stat", WORKSPACE, 15_000);
    const files = st.output
      .split("\n")
      .filter((l) => l.trim())
      .map((line) => ({ code: line.slice(0, 2).trim(), path: line.slice(3).trim() }));
    return { ok: true, repo: true, files, stat: ss.output.trim(), clean: !files.length };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("workspace:fileDiff", async (_e, rel) => {
  if (!WORKSPACE) return { ok: false, error: "aucun dossier ouvert" };
  try {
    const abs = safeResolve(WORKSPACE, rel);
    const relSafe = path.relative(WORKSPACE, abs);
    const quoted = JSON.stringify(relSafe);
    const st = await runCommand(
      `git --no-optional-locks status --porcelain=v1 -- ${quoted}`,
      WORKSPACE,
      10_000
    );
    if (st.output.trim().startsWith("??")) {
      const r = readFileCapped(WORKSPACE, relSafe);
      return {
        ok: true,
        untracked: true,
        content: r.content.split("\n").slice(0, 160).join("\n"),
      };
    }
    const d = await runCommand(
      `git --no-optional-locks diff -- ${quoted}`,
      WORKSPACE,
      15_000
    );
    return { ok: true, content: d.output.trim() || "(aucun changement)" };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("chat:test", async (_e, providerId, baseURLOverride) => {
  const provider = findProvider(providerId);
  if (!provider) return { ok: false, error: "provider inconnu" };
  if (provider.needsKey && !getKey(provider.id))
    return { ok: false, error: "clé API manquante" };
  try {
    const res = await net.fetch(
      `${resolveBaseURL(provider, baseURLOverride)}/models`,
      { headers: headersFor(provider), signal: AbortSignal.timeout(6000) }
    );
    return { ok: res.ok, error: res.ok ? null : `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

const MAX_TOOL_ROUNDS = 12;

ipcMain.handle("chat:stream", async (_e, payload) => {
  const { providerId, baseURLOverride, model, messages, agent } = payload;
  const provider = findProvider(providerId);
  if (!provider) return { ok: false, reqId: 0, error: "provider inconnu" };
  if (provider.needsKey && !getKey(provider.id)) {
    win.webContents.send("chat:error", {
      reqId: 0,
      message: `Ajoute ta clé ${provider.label} dans la barre latérale.`,
    });
    return { ok: false, reqId: 0, error: "no-key" };
  }

  const reqId = ++reqSeq;
  const ac = new AbortController();
  streams.set(reqId, ac);
  const t0 = Date.now();
  const convo = [...messages]; // copie mutée à chaque tour d'outils
  // compteurs cumulés sur tous les tours d'outils (fournis par l'API si elle le permet)
  let usageAcc = { prompt_tokens: 0, completion_tokens: 0, prompt_tokens_details: null };
  const hasUsage = () => usageAcc.prompt_tokens || usageAcc.completion_tokens;

  try {
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const pendingTools = new Map(); // index -> {id, name, arguments}
      let textAccum = "";
      let finishReason = null;

      const res = await net.fetch(
        `${resolveBaseURL(provider, baseURLOverride)}/chat/completions`,
        {
          method: "POST",
          headers: headersFor(provider),
          signal: ac.signal,
          body: JSON.stringify({
            model,
            messages: convo,
            stream: true,
            // certains providers renvoient les compteurs réels dans le dernier chunk
            ...(provider.includeUsage ? { stream_options: { include_usage: true } } : {}),
            ...(agent ? { tools: TOOLS } : {}),
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        win.webContents.send("chat:end", {
          reqId,
          ms: Date.now() - t0,
          error: `HTTP ${res.status} — ${text.slice(0, 300)}`,
        });
        return { ok: false, reqId, error: `HTTP ${res.status}` };
      }

      // --- lecture du flux SSE ---
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      readLoop: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const events = buf.split(/\n\n/);
        buf = events.pop() ?? "";

        for (const evt of events) {
          for (const line of evt.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") break readLoop;
            try {
              const json = JSON.parse(data);
              // dernier chunk : compteurs réels (OpenAI-compatible)
              if (json.usage) {
                usageAcc.prompt_tokens += json.usage.prompt_tokens || 0;
                usageAcc.completion_tokens += json.usage.completion_tokens || 0;
                usageAcc.prompt_tokens_details =
                  json.usage.prompt_tokens_details || usageAcc.prompt_tokens_details;
              }
              const choice = json.choices?.[0];
              if (choice?.finish_reason) finishReason = choice.finish_reason;

              const delta = choice?.delta;
              if (delta?.content) {
                textAccum += delta.content;
                win.webContents.send("chat:chunk", { reqId, delta: delta.content });
              }
              if (Array.isArray(delta?.tool_calls)) {
                for (const tc of delta.tool_calls) {
                  const cur =
                    pendingTools.get(tc.index) ?? { id: "", name: "", arguments: "" };
                  if (tc.id) cur.id = tc.id;
                  if (!cur.name && tc.function?.name) cur.name = tc.function.name;
                  if (tc.function?.arguments)
                    cur.arguments += tc.function.arguments;
                  pendingTools.set(tc.index, cur);
                }
              }
            } catch {
              // fragment JSON incomplet : on ignore
            }
          }
        }
      }

      const toolCalls = [...pendingTools.values()].filter((t) => t.id && t.name);

      // --- pas d'outils appelés : fin normale ---
      if (!toolCalls.length || !agent) {
        win.webContents.send("chat:end", {
          reqId,
          ms: Date.now() - t0,
          usage: hasUsage() ? usageAcc : null,
        });
        return { ok: true, reqId };
      }

      // --- tour d'outils : on rejoue avec les résultats ---
      convo.push({
        role: "assistant",
        content: textAccum || null,
        tool_calls: toolCalls.map((t) => ({
          id: t.id,
          type: "function",
          function: { name: t.name, arguments: t.arguments || "{}" },
        })),
      });

      for (const call of toolCalls) {
        if (ac.signal.aborted) break;
        const result = await executeTool(call, reqId);
        convo.push({
          role: "tool",
          tool_call_id: call.id,
          content: result.slice(0, 16_000),
        });
      }

      if (ac.signal.aborted) {
        win.webContents.send("chat:end", {
          reqId,
          ms: Date.now() - t0,
          cancelled: true,
        });
        return { ok: true, reqId };
      }

      if (round === MAX_TOOL_ROUNDS) {
        convo.push({
          role: "system",
          content:
            "Nombre maximum de tours d'outils atteint. Résume l'état et rends la main.",
        });
      }
    }

    win.webContents.send("chat:end", {
      reqId,
      ms: Date.now() - t0,
      usage: hasUsage() ? usageAcc : null,
    });
    return { ok: true, reqId };
  } catch (err) {
    if (ac.signal.aborted) {
      win.webContents.send("chat:end", {
        reqId,
        ms: Date.now() - t0,
        cancelled: true,
      });
    } else {
      win.webContents.send("chat:error", { reqId, message: err.message });
    }
    streams.delete(reqId);
    return { ok: false, reqId, error: err.message };
  }
});

ipcMain.handle("chat:cancel", (_e, reqId) => {
  streams.get(reqId)?.abort();
});

// ---------- undo des écritures (backup avant chaque write approuvé) ----------
ipcMain.handle("workspace:undo", (_e, callId) => {
  const b = writeBackups.get(String(callId || ""));
  if (!b)
    return {
      ok: false,
      error: "sauvegarde introuvable (déjà annulée ou session antérieure)",
    };
  try {
    if (b.isNew || b.prevContent == null) fs.rmSync(b.abs, { force: true });
    else fs.writeFileSync(b.abs, b.prevContent);
    writeBackups.delete(String(callId));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// ouverture de liens externes depuis le markdown (jamais de navigation interne)
ipcMain.handle("app:openExternal", (_e, url) => {
  if (/^https?:\/\//i.test(String(url || ""))) shell.openExternal(String(url));
  return true;
});

// ---------- surveillance live du chantier (fs.watch) ----------
let watcher = null;
let watcherDebounce = null;

function stopWatcher() {
  if (watcher) {
    try {
      watcher.close();
    } catch {}
    watcher = null;
  }
  if (watcherDebounce) {
    clearTimeout(watcherDebounce);
    watcherDebounce = null;
  }
}

function startWatcher(dir) {
  stopWatcher();
  const onEvent = () => {
    if (watcherDebounce) clearTimeout(watcherDebounce);
    watcherDebounce = setTimeout(() => {
      watcherDebounce = null;
      if (win && !win.isDestroyed()) win.webContents.send("workspace:changed", {});
    }, 400);
  };
  try {
    // macOS / Windows : récursif natif
    watcher = fs.watch(dir, { recursive: true }, onEvent);
  } catch {
    try {
      // repli (Linux) : surveillance du niveau racine uniquement
      watcher = fs.watch(dir, onEvent);
    } catch {
      watcher = null;
    }
  }
  if (watcher) watcher.on("error", stopWatcher);
}

// ---------- fenêtre ----------
function createWindow() {
  win = new BrowserWindow({
    width: 1120,
    height: 740,
    minWidth: 880,
    minHeight: 560,
    backgroundColor: "#faf6ec",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    trafficLightPosition: process.platform === "darwin" ? { x: 14, y: 16 } : undefined,
    autoHideMenuBar: process.platform !== "darwin",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.on("closed", () => (win = null));
}

Menu.setApplicationMenu(null);

app.whenReady().then(() => {
  // en dev, le dock affiche l'icône Electron générique — on met le castor
  if (!app.isPackaged && process.platform === "darwin" && app.dock) {
    app.dock.setIcon(path.join(__dirname, "build", "icon.png"));
  }
  createWindow();
  setupAutoUpdater();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
