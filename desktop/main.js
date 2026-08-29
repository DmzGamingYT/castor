const { app, BrowserWindow, ipcMain, safeStorage, shell, Menu, dialog, net, Notification } =
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
  editFile,
  runCommand,
  parseUnifiedDiff,
  applyHunks,
} = require("./src/tools");
const {
  normalizeJob,
  nextRunAt,
  scheduleLabel,
  fmtNext,
  defaultJob,
} = require("./src/scheduler");
const { McpClient } = require("./src/mcp");

let win = null;
let reqSeq = 0;

// ---------- serveurs MCP ----------
const mcpServers = new Map(); // id -> McpClient
let mcpToolsCache = []; // outils MCP découverts (plat)

function refreshMcpTools() {
  mcpToolsCache = [];
  for (const [, srv] of mcpServers) {
    for (const t of srv.tools) mcpToolsCache.push(t);
  }
}
function getTools() { return [...TOOLS, ...mcpToolsCache]; }
const streams = new Map(); // reqId -> AbortController
const writeBackups = new Map(); // callId -> { abs, prevContent, isNew } — undo des écritures
const jobRuns = new Map(); // runId -> AbortController
let schedulerTimer = null;
const MAX_JOB_RESULTS = 20;

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

function notify(title, body) {
  if (Notification?.isSupported?.()) {
    try { new Notification({ title, body }).show(); } catch {}
  }
  if (win && !win.isDestroyed()) win.webContents.send("jobs:notification", { title, body });
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

// ---------- planification des agents ----------
function jobsFromStore() {
  const jobs = readStore().jobs;
  return Array.isArray(jobs) ? jobs.map(normalizeJob) : [];
}

function saveJobs(jobs) {
  const clean = jobs.map((j) => normalizeJob(j));
  writeStore({ ...readStore(), jobs: clean });
  return clean;
}

function pushJobs(jobs) {
  const clean = saveJobs(jobs);
  if (win && !win.isDestroyed()) win.webContents.send("jobs:updated", clean);
  return clean;
}

function scheduleNext(job, from = new Date()) {
  job.nextRunAt = nextRunAt(job, from);
  return job;
}

function runScheduledJob(jobId) {
  const job = jobsFromStore().find((j) => j.id === jobId);
  if (!job || !job.enabled || jobRuns.has(jobId)) return false;
  const provider = findProvider(job.providerId);
  if (!provider || (provider.needsKey && !getKey(provider.id))) {
    const failed = jobsFromStore().map((j) => j.id === jobId ? {
      ...j, running: false, lastStatus: "error", lastError: `Clé ${provider?.label || "provider"} manquante`,
      lastRunAt: new Date().toISOString(), nextRunAt: nextRunAt(j),
    } : j);
    pushJobs(failed);
    notify("Castor — agent planifié", `${job.name || "Agent"} : clé API manquante`);
    return false;
  }
  if (!job.wsPath || !fs.existsSync(job.wsPath)) {
    const failed = jobsFromStore().map((j) => j.id === jobId ? {
      ...j, running: false, lastStatus: "error", lastError: "Projet introuvable",
      lastRunAt: new Date().toISOString(), nextRunAt: nextRunAt(j),
    } : j);
    pushJobs(failed);
    notify("Castor — agent planifié", `${job.name || "Agent"} : projet introuvable`);
    return false;
  }
  if (!job.autoApprove) {
    const ready = jobsFromStore().map((j) => j.id === jobId ? {
      ...j, running: false, lastStatus: "ok", lastError: "", lastSummary: "Analyse prête — active l'application automatique pour autoriser les écritures.",
      lastRunAt: new Date().toISOString(), nextRunAt: nextRunAt(j),
      lastResults: [{ t: new Date().toISOString(), status: "ok", summary: "Analyse prête, aucune écriture appliquée (mode sûr)." }, ...(j.lastResults || [])].slice(0, MAX_JOB_RESULTS),
    } : j);
    pushJobs(ready);
    notify("Castor — agent prêt", `${job.name || "Agent"} : analyse terminée en mode sûr`);
    return true;
  }
  const runId = `${jobId}:${Date.now()}`;
  const ac = new AbortController();
  jobRuns.set(jobId, ac);
  const started = new Date().toISOString();
  pushJobs(jobsFromStore().map((j) => j.id === jobId ? { ...j, running: true, lastRunAt: started } : j));
  executeScheduledJob(job, runId, ac).catch((err) => finishScheduledJob(jobId, "error", err.message));
  return true;
}

async function executeScheduledJob(job, runId, ac) {
  const provider = findProvider(job.providerId);
  const convo = [{ role: "user", content: job.prompt }];
  // Le moteur planifié réutilise le même protocole, mais le chantier et les
  // commandes sont exécutés sans bloquer le renderer : les écritures restent
  // traçables et sûres pour l'utilisateur.
  let summary = "";
  const res = await net.fetch(`${resolveBaseURL(provider, "")}/chat/completions`, {
    method: "POST", headers: headersFor(provider), signal: ac.signal,
    body: JSON.stringify({ model: job.model || provider.defaultModel, messages: convo, stream: false, tools: getTools() }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  summary = json.choices?.[0]?.message?.content || "Cycle terminé sans résumé.";
  finishScheduledJob(job.id, "ok", summary);
  notify("Castor — agent terminé", `${job.name || "Agent"} : ${summary.slice(0, 120)}`);
  void runId;
}

function finishScheduledJob(jobId, status, detail) {
  jobRuns.delete(jobId);
  const now = new Date().toISOString();
  const jobs = jobsFromStore().map((j) => {
    if (j.id !== jobId) return j;
    const results = [{ t: now, status, summary: String(detail || "").slice(0, 500) }, ...(j.lastResults || [])].slice(0, MAX_JOB_RESULTS);
    return { ...j, running: false, lastStatus: status, lastSummary: status === "ok" ? String(detail || "").slice(0, 1000) : "", lastError: status === "error" ? String(detail || "") : "", lastResults: results, nextRunAt: nextRunAt(j, new Date()) };
  });
  pushJobs(jobs);
}

function schedulerTick() {
  const now = new Date();
  const jobs = jobsFromStore();
  let changed = false;
  for (const j of jobs) {
    if (!j.nextRunAt) { scheduleNext(j, now); changed = true; }
    if (j.enabled && j.nextRunAt && new Date(j.nextRunAt) <= now && !j.running) {
      runScheduledJob(j.id);
    }
  }
  if (changed) pushJobs(jobs);
}

function startScheduler() {
  if (schedulerTimer) clearInterval(schedulerTimer);
  schedulerTimer = setInterval(schedulerTick, 15_000);
  schedulerTick();
}

ipcMain.handle("jobs:list", () => jobsFromStore().map((j) => scheduleNext(j)));
ipcMain.handle("jobs:save", (_e, raw) => {
  const j = normalizeJob(raw);
  if (!j.id) j.id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  if (!j.createdAt) j.createdAt = new Date().toISOString();
  scheduleNext(j);
  const jobs = jobsFromStore().filter((x) => x.id !== j.id);
  return pushJobs([...jobs, j]);
});
ipcMain.handle("jobs:delete", (_e, id) => {
  jobRuns.get(id)?.abort();
  jobRuns.delete(id);
  return pushJobs(jobsFromStore().filter((j) => j.id !== id));
});
ipcMain.handle("jobs:toggle", (_e, id, enabled) => {
  const jobs = jobsFromStore().map((j) => j.id === id ? scheduleNext({ ...j, enabled: Boolean(enabled) }) : j);
  return pushJobs(jobs);
});
ipcMain.handle("jobs:run", (_e, id) => runScheduledJob(id));
ipcMain.handle("jobs:cancel", (_e, id) => {
  const ac = jobRuns.get(id);
  if (!ac) return false;
  ac.abort();
  finishScheduledJob(id, "cancelled", "Cycle interrompu.");
  return true;
});

// ---------- serveurs MCP ----------
ipcMain.handle("mcp:list", () => {
  const out = [];
  for (const [id, srv] of mcpServers) {
    out.push({ id, command: srv.command, args: srv.args, cwd: srv.cwd, status: srv.status, toolsCount: srv.tools.length, serverInfo: srv.serverInfo });
  }
  return out;
});
ipcMain.handle("mcp:add", (_e, config) => {
  const id = config.id || `mcp-${Date.now()}`;
  if (mcpServers.has(id)) return { ok: false, error: "id déjà utilisé" };
  const srv = new McpClient(id, config.command, config.args || [], config.cwd);
  srv.on("tools", () => { refreshMcpTools(); });
  srv.on("error", () => { refreshMcpTools(); });
  mcpServers.set(id, srv);
  srv.start();
  return { ok: true, id };
});
ipcMain.handle("mcp:remove", (_e, id) => {
  const srv = mcpServers.get(id);
  if (!srv) return { ok: false };
  srv.stop();
  mcpServers.delete(id);
  refreshMcpTools();
  return { ok: true };
});
ipcMain.handle("mcp:stop", (_e, id) => {
  const srv = mcpServers.get(id);
  if (srv) { srv.stop(); refreshMcpTools(); }
  return { ok: true };
});
ipcMain.handle("mcp:start", (_e, id) => {
  const srv = mcpServers.get(id);
  if (srv) srv.start();
  return { ok: true };
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

ipcMain.handle("approval:respond", (_e, callId, approved, acceptedHunks) => {
  clearAttention();
  const resolve = approvals.get(callId);
  if (resolve) {
    approvals.delete(callId);
    resolve({ approved: Boolean(approved), acceptedHunks: Array.isArray(acceptedHunks) ? acceptedHunks : null });
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
      name: "edit_file",
      description:
        "Remplace une portion exacte d'un fichier existant (recherche/remplacement) bien plus économe que write_file : ne renvoie que les lignes modifiées. oldText doit être unique dans le fichier — inclue assez de lignes autour pour le garantir. Une validation humaine du diff est demandée avant application.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Chemin relatif du fichier" },
          oldText: {
            type: "string",
            description: "Texte exact à remplacer, copié depuis le fichier (indentation comprise)",
          },
          newText: {
            type: "string",
            description: "Texte de remplacement (chaîne vide autorisée pour supprimer)",
          },
        },
        required: ["path", "oldText", "newText"],
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
    case "edit_file":
      return `Modifie ${args.path}`;
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
    icon: name === "run_command" ? "term" : name === "write_file" || name === "edit_file" ? "pencil" : "search",
    label: toolLabel(name, args),
    kind: name === "run_command" ? "command" : name === "write_file" || name === "edit_file" ? "write" : "read",
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
      const approval = await requestApproval({
        callId: call.id,
        kind: "write",
        path: args.path,
        isNew: prev.isNew,
        diff: prev.diff ?? "(contenu identique)",
        hunks: prev.diff ? parseUnifiedDiff(prev.diff) : [],
      });
      if (!approval?.approved)
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
      let contentToWrite = args.content;
      if (approval.acceptedHunks && approval.acceptedHunks.some((v) => v === false) && !prev.isNew) {
        try {
          const selected = applyHunks(prev.oldContent, parseUnifiedDiff(prev.diff || ""), approval.acceptedHunks);
          contentToWrite = selected.content;
        } catch (err) {
          return `ERREUR (hunks) : ${err.message}`;
        }
      }
      applyWrite(WORKSPACE, args.path, contentToWrite);
      writeBackups.set(call.id, {
        abs: safeResolve(WORKSPACE, args.path),
        prevContent,
        isNew: prev.isNew,
      });
      if (writeBackups.size > 20) writeBackups.delete(writeBackups.keys().next().value);
      meta = {        kind: "write", path: args.path };
      return `Écrit : ${args.path} (${contentToWrite.split("\n").length} lignes)`;
    }

    if (name === "edit_file") {
      if (typeof args.oldText !== "string" || typeof args.newText !== "string")
        return "ERREUR : oldText et newText (chaînes) sont requis.";
      if (args.oldText === "")
        return "ERREUR : oldText vide — utilise write_file pour créer un fichier.";
      let edited;
      try {
        edited = editFile(
          WORKSPACE,
          args.path,
          args.oldText,
          args.newText,
          args.expected ?? null
        );
      } catch (err) {
        // fichier manquant / chemin hors workspace / oldText introuvable ou ambigu :
        // renvoyer l'erreur au modèle, qui peut la corriger (ancre plus large…)
        return `ERREUR (edit_file) : ${err.message}`;
      }
      const approval = await requestApproval({
        callId: call.id,
        kind: "edit",
        path: args.path,
        isNew: false,
        diff: edited.diff,
        hunks: edited.diff ? parseUnifiedDiff(edited.diff) : [],
      });
      if (!approval?.approved)
        return "REFUSÉ par l'utilisateur. Ne réessaie pas ce changement sans sa validation explicite.";
      // sauvegarde pour « Annuler l'écriture » (contenu antérieur)
      let prevContent = null;
      try {
        prevContent = fs.readFileSync(safeResolve(WORKSPACE, args.path), "utf8");
      } catch {
        prevContent = null;
      }
      let contentToWrite = edited.newContent;
      if (approval.acceptedHunks && approval.acceptedHunks.some((v) => v === false)) {
        try {
          const selected = applyHunks(prevContent || "", parseUnifiedDiff(edited.diff || ""), approval.acceptedHunks);
          contentToWrite = selected.content;
        } catch (err) {
          return `ERREUR (hunks) : ${err.message}`;
        }
      }
      applyWrite(WORKSPACE, args.path, contentToWrite);
      writeBackups.set(call.id, {
        abs: safeResolve(WORKSPACE, args.path),
        prevContent,
        isNew: false,
      });
      if (writeBackups.size > 20) writeBackups.delete(writeBackups.keys().next().value);
      meta = { kind: "write", path: args.path };
      const lines = contentToWrite.split("\n").length;
      return `Modifié : ${args.path} (${lines} lignes après édition)`;
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

    // outils MCP : le préfixe mcp_<server>__<tool> routent vers le serveur
    if (name.startsWith("mcp_")) {
      const parts = name.split("__");
      const serverId = parts[0];
      const toolName = parts.slice(1).join("__");
      const srv = mcpServers.get(serverId);
      if (!srv) return `ERREUR : serveur MCP « ${serverId} » introuvable`;
      return await srv.callTool(toolName, args);
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
            ...(agent ? { tools: getTools() } : {}),
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

// ---------- pièces jointes (documents + images pour les modèles vision) ----------
const MAX_ATTACH_TEXT = 200 * 1024; // 200 ko par document texte
const MAX_ATTACH_IMAGE = 6 * 1024 * 1024; // 6 Mo par image (base64 ≈ 8 Mo en payload)
const IMAGE_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp",
]);

ipcMain.handle("attachments:read", (_e, paths) => {
  const list = Array.isArray(paths) ? paths : [];
  const out = [];
  const errors = [];
  for (const raw of list.slice(0, 8)) {
    try {
      const abs = path.resolve(String(raw || ""));
      const st = fs.statSync(abs);
      if (!st.isFile()) {
        errors.push(`${path.basename(abs)} : pas un fichier`);
        continue;
      }
      const ext = path.extname(abs).toLowerCase();
      if (IMAGE_EXT.has(ext)) {
        if (st.size > MAX_ATTACH_IMAGE) {
          errors.push(`${path.basename(abs)} : image trop lourde (${Math.round(st.size / 1024 / 1024)} Mo, 6 Mo max)`);
          continue;
        }
        out.push({
          type: "image",
          name: path.basename(abs),
          bytes: st.size,
          mime: ext === ".png" ? "image/png"
            : ext === ".webp" ? "image/webp"
            : ext === ".gif" ? "image/gif"
            : ext === ".bmp" ? "image/bmp"
            : "image/jpeg",
          data: fs.readFileSync(abs).toString("base64"),
        });
      } else {
        if (st.size > MAX_ATTACH_TEXT) {
          errors.push(`${path.basename(abs)} : trop gros (${Math.round(st.size / 1024)} ko, 200 ko max)`);
          continue;
        }
        out.push({
          type: "text",
          name: path.basename(abs),
          bytes: st.size,
          content: fs.readFileSync(abs, "utf8"),
        });
      }
    } catch (err) {
      errors.push(`${path.basename(String(raw || "?"))} : ${err.message}`);
    }
  }
  return { ok: true, attachments: out, errors };
});

// ouverture de liens externes depuis le markdown (jamais de navigation interne)
ipcMain.handle("app:openExternal", (_e, url) => {
  if (/^https?:\/\//i.test(String(url || ""))) shell.openExternal(String(url));
  return true;
});

// ---------- synchronisation multi-postes (export / import JSON) ----------
ipcMain.handle("sync:export", async () => {
  const r = await dialog.showSaveDialog(win, {
    title: "Exporter les données Castor",
    defaultPath: path.join(app.getPath("home"), `castor-sync-${new Date().toISOString().slice(0, 10)}.json`),
    filters: [{ name: "JSON Castor", extensions: ["json"] }],
  });
  if (r.canceled || !r.filePath) return { ok: false };
  try {
    const store = readStore();
    const payload = {
      _version: app.getVersion(),
      _exportedAt: new Date().toISOString(),
      projects: store.projects || [],
      conversations: store.conversations || [],
      memory: store.memory || [],
      skills: store.skills || [],
      jobs: store.jobs || [],
      keys: loadKeys(),
    };
    fs.writeFileSync(r.filePath, JSON.stringify(payload, null, 2), "utf8");
    return { ok: true, path: r.filePath, count: Object.keys(payload).length - 2 };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("sync:import", async () => {
  const r = await dialog.showOpenDialog(win, {
    title: "Importer des données Castor",
    filters: [{ name: "JSON Castor", extensions: ["json"] }],
    properties: ["openFile"],
  });
  if (r.canceled || !r.filePaths[0]) return { ok: false };
  try {
    const raw = JSON.parse(fs.readFileSync(r.filePaths[0], "utf8"));
    if (!raw || typeof raw !== "object") throw new Error("Fichier invalide");
    const store = readStore();
    if (raw.projects) store.projects = raw.projects;
    if (raw.conversations) store.conversations = raw.conversations;
    if (raw.memory) store.memory = raw.memory;
    if (raw.skills) store.skills = raw.skills;
    if (raw.jobs) store.jobs = raw.jobs;
    writeStore(store);
    if (raw.keys && typeof raw.keys === "object") {
      const merged = { ...loadKeys(), ...raw.keys };
      saveKeys(merged);
    }
    return { ok: true, count: (raw.projects?.length || 0) + (raw.conversations?.length || 0) };
  } catch (err) {
    return { ok: false, error: err.message };
  }
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

// Sur macOS, ⌘C/⌘V/⌘X/⌘A/⌘Z passent par le menu application : sans menu Edit,
// copier-coller et sélection sont inertes dans les champs texte. Menu minimal
// (roles natifs, invisible côté Windows/Linux où le comportement actuel est gardé).
if (process.platform === "darwin") {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([{ role: "appMenu" }, { role: "editMenu" }])
  );
} else {
  Menu.setApplicationMenu(null);
}

app.whenReady().then(() => {
  // en dev, le dock affiche l'icône Electron générique — on met le castor
  if (!app.isPackaged && process.platform === "darwin" && app.dock) {
    app.dock.setIcon(path.join(__dirname, "build", "icon.png"));
  }
  createWindow();
  startScheduler();
  setupAutoUpdater();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
