/* Castor Desktop — renderer
   Providers multiples · compétences (/) · mémoire persistante ·
   usage & contexte · plan de tâches live extrait du flux. */
const $ = (sel) => document.querySelector(sel);

const CTX_WINDOW = 128000; // fenêtre de contexte par défaut (tokens)
const estTok = (chars) => Math.ceil(chars / 4);

const DEFAULT_SKILLS = [
  { name: "review", body: "Relis le code fourni comme un reviewer senior : points bloquants d'abord, puis suggestions concrètes avec extraits corrigés." },
  { name: "tests", body: "Propose des tests couvrant les cas limites du code fourni, prêts à coller dans le projet." },
  { name: "explique", body: "Explique pas à pas, avec une analogie simple, puis un résumé en 3 points." },
];

const state = {
  providers: [],
  activeId: null,
  messages: [], // {role, content}
  streaming: false,
  reqId: null,
  t0: 0,

  skills: [],
  memory: [],
  usage: { totalTokens: 0, requests: 0 },
  sessionTokens: 0,
  pendingSkill: null,

  wsName: null,
  wsPath: null,
  conversations: [],
  activeConvId: null,

  chatMode: "build", // build : outils actifs · plan : lecture seule
  queue: [], // messages en attente pendant un stream
  convTab: "active",
  convSearch: "",
  panelOpen: false,
  panelTab: "changes",
  notesTimer: null,
};

/* ---------- persistance (store.json côté main) ---------- */
async function loadPersisted() {
  try {
    return JSON.parse(localStorage.getItem("castor") || "{}");
  } catch {
    return {};
  }
}
function persist(patch) {
  const data = { ...loadPersisted(), ...patch };
  localStorage.setItem("castor", JSON.stringify(data));
}

/* ---------- providers ---------- */
function currentProvider() {
  return state.providers.find((p) => p.id === state.activeId);
}

async function initProviders() {
  state.providers = await window.castor.listProviders();
  const prefs = await loadPersisted();
  const last = state.providers.some((p) => p.id === prefs.lastProvider)
    ? prefs.lastProvider
    : state.providers.find((p) => p.configured)?.id;
  renderProviderList();
  selectProvider(last || state.providers[0].id);
}

function renderProviderList() {
  const ul = $("#provider-list");
  ul.innerHTML = "";
  for (const p of state.providers) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "provider-btn" + (p.id === state.activeId ? " active" : "");
    const dot = document.createElement("span");
    dot.className =
      "dot " + (!p.needsKey ? "dot--local" : p.configured ? "dot--on" : "dot--off");
    btn.appendChild(dot);
    btn.appendChild(document.createTextNode(p.label));
    if (p.needsKey && !p.configured) {
      const hint = document.createElement("span");
      hint.className = "provider-hint";
      hint.textContent = "clé requise";
      btn.appendChild(hint);
    }
    btn.addEventListener("click", () => selectProvider(p.id));
    li.appendChild(btn);
    ul.appendChild(li);
  }
}

function fillModelOptions(models) {
  const dl = $("#model-options");
  dl.innerHTML = "";
  for (const m of models || []) {
    const opt = document.createElement("option");
    opt.value = m;
    dl.appendChild(opt);
  }
}

async function selectProvider(id) {
  state.activeId = id;
  persist({ lastProvider: id });
  renderProviderList();

  const p = currentProvider();
  $("#model-input").value = (await loadPersisted())["model:" + id] || p.defaultModel;
  fillModelOptions(p.models);
  $("#baseurl-input").value = (await loadPersisted())["baseurl:" + id] || "";
  $("#baseurl-input").placeholder = p.baseURL;

  $("#key-row").classList.toggle("hidden", !p.needsKey);
  $("#save-key").classList.toggle("hidden", !p.needsKey);
  $("#key-input").value = "";
  $("#key-input").placeholder = p.configured ? "•••••••• (enregistrée)" : "sk-…";

  $("#provider-settings").classList.remove("hidden");
  $("#test-result").textContent = "";
  $("#chat-title").textContent = `Castor · ${p.label}`;
}

$("#save-key").addEventListener("click", async () => {
  const key = $("#key-input").value.trim();
  if (!key) return;
  await window.castor.setKey(state.activeId, key);
  const p = currentProvider();
  p.configured = true;
  $("#key-input").value = "";
  $("#key-input").placeholder = "•••••••• (enregistrée)";
  renderProviderList();
});

$("#refresh-models").addEventListener("click", async () => {
  const note = $("#test-result");
  note.className = "test-result";
  note.textContent = "Récupération…";
  const res = await window.castor.refreshModels(
    state.activeId,
    $("#baseurl-input").value.trim()
  );
  if (res.ok && res.models.length) {
    currentProvider().models = res.models;
    fillModelOptions(res.models);
    note.className = "test-result ok";
    note.textContent = `${res.models.length} modèles trouvés`;
  } else {
    note.className = "test-result ko";
    note.textContent = res.error || "aucun modèle";
  }
});

$("#test-conn").addEventListener("click", async () => {
  const note = $("#test-result");
  note.className = "test-result";
  note.textContent = "Test…";
  const res = await window.castor.testConnection(
    state.activeId,
    $("#baseurl-input").value.trim()
  );
  note.className = res.ok ? "test-result ok" : "test-result ko";
  note.textContent = res.ok ? "Connecté ✓" : res.error;
});

/* ---------- espace de travail (atelier) ---------- */
function applyWorkspace(info) {
  state.wsName = info.name;
  state.wsPath = info.path;
  $("#ws-box").classList.add("hidden");
  $("#ws-active").classList.remove("hidden");
  $("#ws-name").textContent = info.name;
  $("#ws-name").title = info.path;
  $("#ws-chip-name").textContent = info.name;
  $("#ws-chip").classList.remove("hidden");
  loadNotes();
  if (state.panelOpen && state.panelTab === "changes") refreshChanges();
}

function clearWorkspaceView() {
  state.wsName = null;
  state.wsPath = null;
  $("#ws-box").classList.remove("hidden");
  $("#ws-active").classList.add("hidden");
  $("#ws-chip").classList.add("hidden");
  $("#file-tree").innerHTML = "";
  loadNotes();
  refreshChanges();
}

async function refreshFileTree() {
  const res = await window.castor.workspaceTree();
  if (!res.ok) return;
  $("#file-tree").replaceChildren(fileTreeNode(res.tree, 1));
}

function fileTreeNode(node, depth) {
  const frag = document.createDocumentFragment();
  for (const child of node.children || []) {
    if (child.type === "dir") {
      const details = document.createElement("details");
      if (depth < 2) details.open = true;
      const summary = document.createElement("summary");
      summary.textContent = "📁 " + child.name;
      details.appendChild(summary);
      if (child.children?.length) details.appendChild(fileTreeNode(child, depth + 1));
      frag.appendChild(details);
    } else {
      const file = document.createElement("div");
      file.className = "ft-file";
      file.textContent = "📄 " + child.name;
      frag.appendChild(file);
    }
  }
  return frag;
}

$("#open-workspace").addEventListener("click", async () => {
  const res = await window.castor.openWorkspace();
  if (!res.ok) return;
  applyWorkspace(res);
  refreshFileTree();
});

$("#close-workspace").addEventListener("click", async () => {
  await window.castor.closeWorkspace();
  clearWorkspaceView();
});

/* ---------- outils : trace dans le chat ---------- */
window.castor.onToolStart(({ reqId, callId, icon, label }) => {
  if (reqId !== state.reqId || !state.currentTrace) return;
  const line = document.createElement("div");
  line.className = "tool-line running";
  line.dataset.callId = callId;
  const ic = document.createElement("i");
  ic.className = "icon";
  ic.textContent = icon;
  const lb = document.createElement("span");
  lb.textContent = label;
  line.append(ic, lb);
  state.currentTrace.appendChild(line);
  scrollDown();
});

window.castor.onToolResult(({ reqId, callId, meta }) => {
  if (reqId === state.reqId) {
    const line = state.currentTrace?.querySelector(`[data-call-id="${callId}"]`);
    if (line) {
      line.classList.remove("running");
      line.classList.add("done");
    }
  }
  if (meta?.kind === "command") pushTerminal(meta);
  if (state.panelOpen && (meta?.kind === "write" || meta?.kind === "command")) {
    refreshChanges();
    $("#chg-badge").classList.remove("hidden");
  }
});

/* ---------- panneau droit : Changes · Terminal · Notes ---------- */
function setPanel(open) {
  state.panelOpen = open;
  document.querySelector(".layout").classList.toggle("panel-open", open);
  persist({ panelOpen: open });
  if (open && state.panelTab === "changes") refreshChanges();
}

function setPanelTab(tab) {
  state.panelTab = tab;
  document.querySelectorAll(".sp-tab").forEach((b) =>
    b.classList.toggle("active", b.dataset.tab === tab)
  );
  ["changes", "terminal", "notes"].forEach((t) =>
    $("#sp-view-" + t).classList.toggle("hidden", t !== tab)
  );
  if (tab === "changes" && state.panelOpen) refreshChanges();
  if (tab === "notes" && state.wsPath) $("#notes-area").focus();
}

const CHG_CLASS = { M: "mod", A: "add", D: "del", R: "ren", "?": "new" };

async function refreshChanges() {
  const list = $("#changes-list");
  const empty = $("#changes-empty");
  const badge = $("#chg-badge");
  const pre = $("#changes-diff");
  pre.classList.add("hidden");
  list.innerHTML = "";

  if (!state.wsPath) {
    empty.textContent = "Ouvre un chantier pour suivre les fichiers modifiés par le castor.";
    empty.classList.remove("hidden");
    badge.classList.add("hidden");
    return;
  }
  const res = await window.castor.workspaceChanges();
  if (!res.ok) {
    empty.textContent = res.error || "Impossible de lire l'état git.";
    empty.classList.remove("hidden");
    badge.classList.add("hidden");
    return;
  }
  if (!res.repo) {
    empty.textContent = "Ce chantier n'est pas un dépôt git — pas de suivi des changements.";
    empty.classList.remove("hidden");
    badge.classList.add("hidden");
    return;
  }
  badge.classList.toggle("hidden", !res.files.length);
  badge.textContent = String(res.files.length);
  if (res.clean) {
    empty.textContent = "Chantier propre — aucun changement en cours ✓";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  for (const f of res.files) {
    const li = document.createElement("li");
    li.className = "changes-row";
    const code = document.createElement("span");
    code.className = "chg-code " + (CHG_CLASS[f.code[0]] || CHG_CLASS[f.code[1]] || "ren");
    code.textContent = f.code;
    const p = document.createElement("span");
    p.className = "path";
    p.textContent = f.path;
    p.title = "Voir le diff";
    li.append(code, p);
    li.addEventListener("click", () => showFileDiff(f));
    list.appendChild(li);
  }
}

async function showFileDiff(f) {
  const pre = $("#changes-diff");
  const res = await window.castor.workspaceFileDiff(f.path);
  pre.classList.remove("hidden");
  if (!res.ok) {
    pre.innerHTML = escapeHtml(res.error || "Erreur");
    return;
  }
  pre.innerHTML = res.untracked
    ? colorizeDiff(
        "(nouveau fichier — aperçu)\n" +
          res.content.split("\n").map((l) => "+ " + l).join("\n")
      )
    : colorizeDiff(res.content);
}

function pushTerminal({ command, code, output }) {
  $("#terminal-empty").classList.add("hidden");
  const box = $("#terminal-log");
  const entry = document.createElement("div");
  entry.className = "term-entry";
  const cmd = document.createElement("div");
  cmd.className = "term-cmd";
  cmd.textContent = "$ " + command;
  const out = document.createElement("pre");
  out.className = "term-out";
  out.textContent = (output || "(aucune sortie)").slice(0, 1500);
  const cod = document.createElement("div");
  cod.className = "term-code" + (code === 0 ? "" : " ko");
  cod.textContent = "exit " + code;
  entry.append(cmd, out, cod);
  box.appendChild(entry);
  while (box.children.length > 80) box.firstChild.remove();
  box.scrollTop = box.scrollHeight;
}

async function loadNotes() {
  const area = $("#notes-area");
  area.disabled = !state.wsPath;
  area.value = state.wsPath
    ? (await window.castor.storeGet("notes:" + state.wsPath)) || ""
    : "";
}

$("#notes-area").addEventListener("input", () => {
  if (!state.wsPath) return;
  clearTimeout(state.notesTimer);
  state.notesTimer = setTimeout(() => {
    window.castor.storeSet("notes:" + state.wsPath, $("#notes-area").value);
  }, 500);
});

$("#panel-toggle").addEventListener("click", () => setPanel(!state.panelOpen));
$("#sp-close").addEventListener("click", () => setPanel(false));
document.querySelectorAll(".sp-tab").forEach((btn) =>
  btn.addEventListener("click", () => setPanelTab(btn.dataset.tab))
);
$("#sp-refresh").addEventListener("click", () => {
  if (state.panelTab === "changes") refreshChanges();
});
$("#term-clear").addEventListener("click", () => {
  $("#terminal-log").innerHTML = "";
  $("#terminal-empty").classList.remove("hidden");
});

/* ---------- modes build / plan ---------- */
function setChatMode(mode) {
  state.chatMode = mode;
  $("#mode-build").classList.toggle("active", mode === "build");
  $("#mode-plan").classList.toggle("active", mode === "plan");
  persist({ chatMode: mode });
}
$("#mode-build").addEventListener("click", () => setChatMode("build"));
$("#mode-plan").addEventListener("click", () => setChatMode("plan"));

/* ---------- approbation (diff / commande) ---------- */
let pendingApproval = null;

function colorizeDiff(diff) {
  return escapeHtml(diff)
    .split("\n")
    .map((line) => {
      if (line.startsWith("@@")) return `<span class="d-hunk">${line}</span>`;
      if (line.startsWith("+")) return `<span class="d-add">${line}</span>`;
      if (line.startsWith("-")) return `<span class="d-del">${line}</span>`;
      return line;
    })
    .join("\n");
}

function showApproval(p) {
  pendingApproval = p.callId;
  if (p.kind === "command") {
    $("#diff-icon").textContent = "⚙️";
    $("#diff-title").textContent = "Commande shell";
    $("#diff-path").textContent = `dans ${state.wsName || "le projet"} — ${p.command}`;
    $("#diff-body").innerHTML = escapeHtml("$ " + p.command);
  } else {
    $("#diff-icon").textContent = p.isNew ? "✨" : "✏️";
    $("#diff-title").textContent = p.isNew ? "Nouveau fichier" : "Écriture de fichier";
    $("#diff-path").textContent = p.path;
    $("#diff-body").innerHTML = colorizeDiff(p.diff || "");
  }
  $("#diff-modal").classList.remove("hidden");
  $("#diff-reject").focus();
}

function answerApproval(approved) {
  if (!pendingApproval) return;
  window.castor.respondApproval(pendingApproval, approved);
  pendingApproval = null;
  $("#diff-modal").classList.add("hidden");
  $("#input").focus();
}

window.castor.onApprovalRequest(showApproval);
$("#diff-approve").addEventListener("click", () => answerApproval(true));
$("#diff-reject").addEventListener("click", () => answerApproval(false));
$("#diff-modal").addEventListener("click", (e) => {
  if (e.target.classList.contains("diff-modal__backdrop")) answerApproval(false);
});
document.addEventListener("keydown", (e) => {
  if (pendingApproval == null) return;
  if (e.key === "Escape") answerApproval(false);
  if (e.key === "Enter") {
    e.preventDefault();
    answerApproval(true);
  }
});

/* ---------- glisser-déposer un dossier ---------- */
let dragDepth = 0;
const dropHasFiles = (e) => [...(e.dataTransfer?.types || [])].includes("Files");

document.addEventListener("dragenter", (e) => {
  if (!dropHasFiles(e)) return;
  e.preventDefault();
  dragDepth++;
  document.body.classList.add("ws-dropping");
});
document.addEventListener("dragleave", () => {
  dragDepth = Math.max(0, dragDepth - 1);
  if (!dragDepth) document.body.classList.remove("ws-dropping");
});
document.addEventListener("dragover", (e) => e.preventDefault());
document.addEventListener("drop", async (e) => {
  e.preventDefault();
  dragDepth = 0;
  document.body.classList.remove("ws-dropping");
  const file = e.dataTransfer?.files?.[0];
  if (!file || state.streaming) return;
  const p = window.castor.pathForFile(file);
  if (!p) return;
  const res = await window.castor.openWorkspacePath(p);
  if (!res.ok) return;
  applyWorkspace(res);
  refreshFileTree();
});

/* ---------- raccourcis clavier ---------- */
document.addEventListener("keydown", (e) => {
  if (!(e.metaKey || e.ctrlKey) || pendingApproval != null) return;
  const k = e.key.toLowerCase();
  if (k === "n") {
    e.preventDefault();
    if (!state.streaming) resetChatView();
  }
  if (k === "o") {
    e.preventDefault();
    $("#open-workspace").click();
  }
});

/* ---------- compétences ---------- */
function renderSkills() {
  const ul = $("#skill-list");
  ul.innerHTML = "";
  if (!state.skills.length) {
    const li = document.createElement("li");
    li.className = "empty-note";
    li.textContent = "Aucune compétence — crée la tienne.";
    ul.appendChild(li);
    return;
  }
  for (const s of state.skills) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "skill-btn";
    btn.title = s.body.slice(0, 120);
    const slash = document.createElement("span");
    slash.className = "slash";
    slash.textContent = "/" + s.name;
    btn.appendChild(slash);
    const del = document.createElement("button");
    del.className = "del";
    del.title = "Supprimer";
    del.textContent = "✕";
    del.addEventListener("click", async (e) => {
      e.stopPropagation();
      state.skills = state.skills.filter((x) => x.name !== s.name);
      await window.castor.storeSet("skills", state.skills);
      renderSkills();
    });
    btn.appendChild(del);
    btn.addEventListener("click", () => activateSkill(s));
    li.appendChild(btn);
    ul.appendChild(li);
  }
}

function activateSkill(skill) {
  state.pendingSkill = skill;
  $("#skill-chip-name").textContent = "/" + skill.name;
  $("#active-skill-chip").classList.remove("hidden");
  $("#input").focus();
}

$("#clear-skill").addEventListener("click", () => {
  state.pendingSkill = null;
  $("#active-skill-chip").classList.add("hidden");
});

$("#add-skill").addEventListener("click", () => {
  $("#skill-editor").classList.toggle("hidden");
  $("#skill-name").focus();
});

$("#cancel-skill").addEventListener("click", () => {
  $("#skill-editor").classList.add("hidden");
  $("#skill-name").value = "";
  $("#skill-body").value = "";
});

$("#save-skill").addEventListener("click", async () => {
  const name = $("#skill-name").value.trim().replace(/^\/+/, "").replace(/\s+/g, "-").toLowerCase();
  const body = $("#skill-body").value.trim();
  if (!name || !body) return;
  state.skills = state.skills.filter((s) => s.name !== name);
  state.skills.push({ name, body });
  await window.castor.storeSet("skills", state.skills);
  $("#skill-name").value = "";
  $("#skill-body").value = "";
  $("#skill-editor").classList.add("hidden");
  renderSkills();
});

/* ---------- mémoire persistante ---------- */
function renderMemory() {
  const ul = $("#memory-list");
  ul.innerHTML = "";
  $("#memory-count").textContent = state.memory.length;
  if (!state.memory.length) {
    const li = document.createElement("li");
    li.className = "empty-note";
    li.textContent = "Rien pour l'instant — ce que tu écris ici est injecté dans chaque demande.";
    ul.appendChild(li);
    return;
  }
  for (const m of [...state.memory].reverse()) {
    const li = document.createElement("li");
    li.className = "memory-row";
    const span = document.createElement("span");
    span.textContent = m.text;
    span.title = m.text;
    const del = document.createElement("button");
    del.className = "del";
    del.title = "Oublier";
    del.textContent = "✕";
    del.addEventListener("click", async () => {
      state.memory = state.memory.filter((x) => x.id !== m.id);
      await window.castor.storeSet("memory", state.memory);
      renderMemory();
    });
    li.append(span, del);
    ul.appendChild(li);
  }
}

$("#memory-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = $("#memory-input").value.trim();
  if (!text) return;
  state.memory.push({ id: Date.now(), text });
  await window.castor.storeSet("memory", state.memory);
  $("#memory-input").value = "";
  renderMemory();
});

/* ---------- usage & contexte ---------- */
function conversationChars() {
  let chars = systemPromptChars + state.messages.reduce(
    (n, m) => n + (m.content?.length || 0),
    0
  );
  return chars;
}

let systemPromptChars = 0;

function renderUsage() {
  $("#u-session").textContent = fmtTok(state.sessionTokens);
  $("#u-total").textContent = fmtTok(state.usage.totalTokens);
  $("#u-req").textContent = String(state.usage.requests);

  const used = estTok(conversationChars());
  const pct = Math.min(100, Math.round((used / CTX_WINDOW) * 1000) / 10);
  $("#gauge-fill").style.width = pct + "%";
  $("#gauge-label").textContent =
    `contexte ~${fmtTok(used)} tok · ${pct} % de 128k`;
}

function fmtTok(n) {
  return n >= 10000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

/* ---------- plan de tâches (todo live) ---------- */
const TODO_RE = /^[-*]\s+\[([ xX])\]\s+(.+)$/gm;

function parseTodos(text) {
  const todos = [];
  const seen = new Set();
  let m;
  TODO_RE.lastIndex = 0;
  while ((m = TODO_RE.exec(text))) {
    const label = m[2].trim();
    if (!seen.has(label)) {
      seen.add(label);
      todos.push({ label, done: m[1].toLowerCase() === "x" });
    } else {
      const t = todos.find((t) => t.label === label);
      if (t) t.done = m[1].toLowerCase() === "x" ? true : t.done;
    }
  }
  return todos;
}

function renderTodos(todos) {
  const panel = $("#todo-panel");
  if (!todos.length) {
    panel.classList.add("hidden");
    return;
  }
  panel.classList.remove("hidden");
  const done = todos.filter((t) => t.done).length;
  $("#todo-count").textContent = `${done}/${todos.length}`;
  $("#todo-bar").style.width = todos.length
    ? Math.round((done / todos.length) * 100) + "%"
    : "0%";

  const ul = $("#todo-list");
  ul.innerHTML = "";
  for (const t of todos) {
    const li = document.createElement("li");
    li.className = "todo-item" + (t.done ? " done" : "");
    const box = document.createElement("span");
    box.className = "box";
    box.textContent = t.done ? "☑" : "☐";
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = t.label;
    li.append(box, label);
    ul.appendChild(li);
  }
}

$("#todo-toggle").addEventListener("click", () =>
  $("#todo-panel").classList.toggle("collapsed")
);

/* ---------- prompt système ---------- */
function buildSystemMessage() {
  const p = currentProvider();
  let s =
    "Tu es Castor 🦫, un agent de code expert qui travaille sur le projet de l'utilisateur. " +
    "Réponds en français, de façon concise et actionnable.\n" +
    "Si la tâche comporte plusieurs étapes, commence ta réponse par une liste de cases à cocher " +
    'au format "- [ ] étape", puis reprends la même liste plus bas en cochée "- [x]" quand une étape est faite.';

  if (state.wsPath) {
    if (state.chatMode === "build") {
      s +=
        "\n\n# Espace de travail\n" +
        `Dossier ouvert : ${state.wsName} (${state.wsPath})\n` +
        "Tu disposes d'outils : list_dir, read_file, write_file, run_command.\n" +
        "Explore le projet avant de modifier. Pour écrire, fournis toujours le contenu complet du fichier — " +
        "l'utilisateur validera chaque écriture et chaque commande.";
    } else {
      s +=
        "\n\n# Espace de travail (mode plan)\n" +
        `Dossier ouvert : ${state.wsName} (${state.wsPath})\n` +
        "L'utilisateur est en mode plan : explore et analyse le code autant que nécessaire, " +
        "mais ne modifie aucun fichier et n'exécute rien. Propose un plan d'action détaillé.";
    }
  }

  const skill = state.pendingSkill;
  if (skill) s += `\n\n# Compétence activée : ${skill.name}\n${skill.body}`;

  if (state.memory.length) {
    s +=
      "\n\n# Mémoire persistante (faits donnés par l'utilisateur)\n" +
      state.memory.map((m) => `- ${m.text}`).join("\n");
  }

  s += `\n\n# Contexte\nDate : ${new Date().toLocaleDateString("fr-FR")} · Provider : ${p.label} · Modèle : ${$("#model-input").value}`;
  systemPromptChars = s.length;
  return { role: "system", content: s };
}

/* ---------- chat ---------- */
function addMessageEl(role) {
  const wrap = document.createElement("div");
  wrap.className = `msg msg--${role}`;
  const bubble = document.createElement("div");
  bubble.className = "msg__bubble";
  wrap.appendChild(bubble);
  $("#messages").appendChild(wrap);
  return bubble;
}

/* ---------- file d'attente (messages pendant un stream) ---------- */
function renderQueue() {
  const zone = $("#queue-zone");
  zone.innerHTML = "";
  if (!state.queue.length) {
    zone.classList.add("hidden");
    return;
  }
  zone.classList.remove("hidden");
  state.queue.forEach((t, i) => {
    const chip = document.createElement("span");
    chip.className = "queue-chip";
    const txt = document.createElement("span");
    txt.textContent = t.length > 70 ? t.slice(0, 70) + "…" : t;
    txt.title = t;
    const x = document.createElement("button");
    x.textContent = "✕";
    x.title = "Retirer de la file";
    x.addEventListener("click", () => {
      state.queue.splice(i, 1);
      renderQueue();
    });
    chip.append(txt, x);
    zone.appendChild(chip);
  });
}

function pumpQueue() {
  if (state.streaming || !state.queue.length) return;
  const next = state.queue.shift();
  renderQueue();
  send(next);
}

async function send(text) {
  if (!text.trim()) return;
  if (state.streaming) {
    state.queue.push(text.trim());
    renderQueue();
    return;
  }

  const provider = currentProvider();
  const model = $("#model-input").value.trim() || provider.defaultModel;
  const baseURL = $("#baseurl-input").value.trim();
  persist({
    ["model:" + provider.id]: model,
    ["baseurl:" + provider.id]: baseURL,
  });

  $(".welcome")?.remove();

  pushMessage("user", text).textContent = text;

  const thinking = document.createElement("div");
  thinking.className = "thinking";
  thinking.textContent = `${provider.label} réfléchit…`;
  $("#messages").appendChild(thinking);

  state.messages.push({ role: "assistant", content: "" });
  const bubble = addMessageEl("assistant");

  state.streaming = true;
  state.t0 = performance.now();
  state.firstTokenMs = null;
  let chars = 0;
  const inTokens = estTok(systemPromptChars + text.length + state.sessionTokens * 0); // approx via conversation
  const sendBtn = $("#send");
  sendBtn.textContent = "⏹";
  sendBtn.title = "Arrêter la génération";
  sendBtn.classList.add("stop");
  scrollDown();

  const payloadMessages = [
    buildSystemMessage(),
    ...state.messages.slice(0, -1),
  ];

  const trace = document.createElement("div");
  trace.className = "tools-trace";
  $("#messages").appendChild(trace);
  state.currentTrace = trace;

  const res = await window.castor.stream({
    providerId: provider.id,
    baseURLOverride: baseURL,
    model,
    messages: payloadMessages,
    agent: state.chatMode === "build" && Boolean(state.wsPath),
  });
  state.reqId = res.reqId;

  function onChunk({ delta }) {
    chars += delta.length;
    if (state.firstTokenMs === null) {
      state.firstTokenMs = performance.now() - state.t0;
      thinking.remove();
    }
    state.messages[state.messages.length - 1].content += delta;
    bubble.innerHTML = renderMarkdown(
      state.messages[state.messages.length - 1].content
    );
    renderTodos(parseTodos(state.messages[state.messages.length - 1].content));
    scrollDown();
  }

  function onEnd({ ms, cancelled }) {
    cleanup();
    thinking.remove();
    if (!trace.children.length) trace.remove();
    const content = state.messages[state.messages.length - 1]?.content || "";

    // usage
    const outTok = estTok(chars);
    const inTok = estTok(conversationChars() - chars);
    state.sessionTokens += inTok + outTok;
    state.usage.totalTokens += inTok + outTok;
    state.usage.requests += 1;
    window.castor.storeSet("usage", state.usage);

    if (!content && cancelled) {
      bubble.textContent = "(arrêté)";
      state.messages.pop();
      renderUsage();
      return finish();
    }

    const secs = ms / 1000;
    const tps = secs > 0 ? Math.round(outTok / secs) : 0;
    $("#stats").textContent =
      `${(ms / 1000).toFixed(1)} s · ~${tps} tok/s · ↑${fmtTok(inTok)} ↓${fmtTok(outTok)} tok` +
      (state.firstTokenMs !== null
        ? ` · 1ᵉʳ token ${(state.firstTokenMs / 1000).toFixed(2)} s`
        : "");
    renderUsage();
    finish();
  }

  function onError({ message }) {
    cleanup();
    thinking.remove();
    bubble.innerHTML = `<span style="color:var(--danger)">⚠ ${escapeHtml(message)}</span>`;
    renderUsage();
    finish();
    saveActiveConversation();
  }

  function cleanup() {
    state.streaming = false;
    state.reqId = null;
    state.currentTrace = null;
    const sendBtn = $("#send");
    sendBtn.textContent = "Envoyer";
    sendBtn.title = "";
    sendBtn.classList.remove("stop");
    chunkOff();
    endOff();
    errOff();
  }

  function finish() {
    if (!state.messages.at(-1)?.content) {
      state.messages.pop();
      bubble.closest(".msg")?.remove();
    }
    state.pendingSkill = null;
    $("#active-skill-chip").classList.add("hidden");
    pumpQueue();
  }

  const chunkOff = window.castor.onChunk(onChunk);
  const endOff = window.castor.onEnd(onEnd);
  const errOff = window.castor.onError(onError);

  renderUsage();
}

function pushMessage(role, content) {
  state.messages.push({ role, content });
  return addMessageEl(role);
}

function scrollDown() {
  const box = $("#messages");
  box.scrollTop = box.scrollHeight;
}

/* ---------- markdown minimal (échappé, jamais de HTML brut) ---------- */
function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderMarkdown(src) {
  const escaped = escapeHtml(src);
  const parts = escaped.split(/```/);
  let out = "";
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      const nl = parts[i].indexOf("\n");
      const code = nl >= 0 ? parts[i].slice(nl + 1) : parts[i];
      out += `<pre>${code}</pre>`;
    } else {
      let seg = parts[i];
      seg = seg.replace(/`([^`]+)`/g, "<code>$1</code>");
      seg = seg.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      out += seg;
    }
  }
  return out;
}

/* ---------- menu slash (/) ---------- */
function handleSlashInput(value) {
  const menu = $("#slash-menu");
  const match = value.match(/^\/(\w*)$/);
  if (!match || !state.skills.length) {
    menu.classList.add("hidden");
    return;
  }
  const prefix = match[1].toLowerCase();
  const hits = state.skills.filter((s) => s.name.startsWith(prefix)).slice(0, 6);
  if (!hits.length) {
    menu.classList.add("hidden");
    return;
  }
  menu.innerHTML = "";
  hits.forEach((s, i) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "slash-item" + (i === 0 ? " sel" : "");
    item.dataset.name = s.name;
    const slash = document.createElement("span");
    slash.className = "slash";
    slash.textContent = "/" + s.name;
    const preview = document.createElement("small");
    preview.textContent = s.body.slice(0, 40) + "…";
    item.append(slash, preview);
    item.addEventListener("mousedown", (e) => {
      e.preventDefault();
      chooseSkill(s);
    });
    menu.appendChild(item);
  });
  menu.classList.remove("hidden");
}

function chooseSkill(skill) {
  activateSkill(skill);
  $("#input").value = "";
  $("#slash-menu").classList.add("hidden");
  autoresize($("#input"));
}

$("#input").addEventListener("keydown", (e) => {
  const menu = $("#slash-menu");
  const menuOpen = !menu.classList.contains("hidden");

  if (menuOpen) {
    const items = [...menu.querySelectorAll(".slash-item")];
    const idx = items.findIndex((it) => it.classList.contains("sel"));
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = e.key === "ArrowDown" ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
      items.forEach((it, i) => it.classList.toggle("sel", i === next));
      return;
    }
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const sel = items[idx] || items[0];
      const skill = state.skills.find((s) => s.name === sel.dataset.name);
      if (skill) chooseSkill(skill);
      return;
    }
    if (e.key === "Escape") {
      menu.classList.add("hidden");
      return;
    }
  }

  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    submitInput();
  } else if (e.key === "Escape" && state.reqId != null) {
    window.castor.cancel(state.reqId);
  }
});

function submitInput() {
  const input = $("#input");
  const text = input.value;
  input.value = "";
  autoresize(input);
  send(text);
}

$("#send").addEventListener("click", () => {
  if (state.streaming) {
    if (state.reqId != null) window.castor.cancel(state.reqId);
    return;
  }
  submitInput();
});

function autoresize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 160) + "px";
}
$("#input").addEventListener("input", (e) => {
  autoresize(e.target);
  handleSlashInput(e.target.value);
});
$("#input").addEventListener("blur", () =>
  setTimeout(() => $("#slash-menu").classList.add("hidden"), 150)
);

/* ---------- conversations persistantes ---------- */
function loadConversations() {
  return window.castor.storeGet("conversations").then(
    (list) => (state.conversations = list || [])
  );
}

function relTime(ts) {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return Math.floor(s / 60) + " min";
  if (s < 86400) return Math.floor(s / 3600) + " h";
  if (s < 86400 * 30) return Math.floor(s / 86400) + " j";
  return new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function renderConvList() {
  const ul = $("#conv-list");
  ul.innerHTML = "";
  const nbActive = state.conversations.filter((c) => !c.archived).length;
  const nbArchived = state.conversations.length - nbActive;
  $("#conv-count").textContent = String(state.conversations.length);
  $("#conv-nb-active").textContent = String(nbActive);
  $("#conv-nb-archived").textContent = String(nbArchived);

  const q = state.convSearch.toLowerCase();
  const visible = state.conversations
    .filter((c) => Boolean(c.archived) === (state.convTab === "archived"))
    .filter((c) => !q || c.title.toLowerCase().includes(q))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  if (!visible.length) {
    const li = document.createElement("li");
    li.className = "empty-note";
    li.textContent = q
      ? "Aucun résultat."
      : state.convTab === "archived"
        ? "Rien d'archivé."
        : "Tes conversations apparaîtront ici.";
    ul.appendChild(li);
    return;
  }

  for (const c of visible) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "conv-btn" + (c.id === state.activeConvId ? " active" : "");
    btn.dataset.convId = c.id;
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = c.title;
    title.title = c.title + " — double-clic pour renommer";
    title.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      startConvRename(c, title);
    });
    const when = document.createElement("span");
    when.className = "when";
    when.textContent = relTime(c.updatedAt);
    when.title = new Date(c.updatedAt).toLocaleString("fr-FR");
    const arch = document.createElement("button");
    arch.className = "arch";
    arch.textContent = c.archived ? "↩" : "📦";
    arch.title = c.archived ? "Désarchiver" : "Archiver";
    arch.addEventListener("click", async (e) => {
      e.stopPropagation();
      c.archived = !c.archived;
      await window.castor.storeSet("conversations", state.conversations);
      if (!c.archived) c.updatedAt = Date.now();
      if (state.convTab === "archived" && state.activeConvId === c.id && c.archived)
        resetChatView();
      renderConvList();
    });
    const del = document.createElement("button");
    del.className = "del";
    del.title = "Supprimer";
    del.textContent = "✕";
    del.addEventListener("click", async (e) => {
      e.stopPropagation();
      state.conversations = state.conversations.filter((x) => x.id !== c.id);
      await window.castor.storeSet("conversations", state.conversations);
      if (state.activeConvId === c.id) resetChatView();
      renderConvList();
    });
    btn.append(title, when, arch, del);
    btn.addEventListener("click", () => openConversation(c.id));
    li.appendChild(btn);
    ul.appendChild(li);
  }
}

$("#conv-tab-active").addEventListener("click", () => {
  state.convTab = "active";
  $("#conv-tab-active").classList.add("active");
  $("#conv-tab-archived").classList.remove("active");
  renderConvList();
});
$("#conv-tab-archived").addEventListener("click", () => {
  state.convTab = "archived";
  $("#conv-tab-archived").classList.add("active");
  $("#conv-tab-active").classList.remove("active");
  renderConvList();
});
$("#conv-search").addEventListener("input", (e) => {
  state.convSearch = e.target.value.trim();
  renderConvList();
});

function startConvRename(conv, titleEl) {
  const input = document.createElement("input");
  input.className = "conv-rename";
  input.value = conv.title;
  input.spellcheck = false;
  titleEl.replaceWith(input);
  input.focus();
  input.select();

  let done = false;
  const commit = async () => {
    if (done) return;
    done = true;
    const v = input.value.trim();
    if (v && v !== conv.title) {
      conv.title = v;
      await window.castor.storeSet("conversations", state.conversations);
      if (state.activeConvId === conv.id) $("#chat-title").textContent = v;
    }
    renderConvList();
  };
  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (ev) => {
    ev.stopPropagation();
    if (ev.key === "Enter") input.blur();
    if (ev.key === "Escape") {
      done = true;
      renderConvList();
    }
  });
}

async function saveActiveConversation() {  const firstUser = state.messages.find((m) => m.role === "user");
  if (!firstUser || !firstUser.content.trim()) return;

  if (state.activeConvId == null) state.activeConvId = Date.now();
  const snapshot = state.messages.map((m) => ({ role: m.role, content: m.content }));
  const title =
    firstUser.content.trim().slice(0, 60) +
    (firstUser.content.trim().length > 60 ? "…" : "");

  const existing = state.conversations.find((c) => c.id === state.activeConvId);
  if (existing) {
    existing.title = title;
    existing.messages = snapshot;
    existing.updatedAt = Date.now();
  } else {
    state.conversations.push({
      id: state.activeConvId,
      title,
      messages: snapshot,
      updatedAt: Date.now(),
      archived: false,
    });
  }
  await window.castor.storeSet("conversations", state.conversations);
  renderConvList();
}

function openConversation(id) {
  if (state.streaming) return;
  const conv = state.conversations.find((c) => c.id === id);
  if (!conv) return;

  state.activeConvId = id;
  state.messages = conv.messages.map((m) => ({ ...m }));

  const box = $("#messages");
  box.innerHTML = "";
  for (const m of state.messages) {
    const bubble = addMessageEl(m.role);
    bubble.innerHTML = m.content ? renderMarkdown(m.content) : "";
  }
  const lastAssistant = [...state.messages].reverse().find((m) => m.role === "assistant");
  renderTodos(parseTodos(lastAssistant?.content || ""));

  $("#stats").textContent = "";
  $("#chat-title").textContent = conv.title;
  $("#conv-list")
    .querySelectorAll(".conv-btn")
    .forEach((b) => b.classList.toggle("active", b.dataset.convId === String(id)));
  renderUsage();
  scrollDown();
}

function resetChatView() {
  state.activeConvId = null;
  state.messages = [];
  $("#messages").innerHTML = welcomeHTML();
  $("#stats").textContent = "";
  const p = currentProvider();
  $("#chat-title").textContent = p ? `Castor · ${p.label}` : "Nouvelle conversation";
  renderTodos([]);
  renderConvList();
  renderUsage();
}

$("#new-chat").addEventListener("click", resetChatView);

function welcomeHTML() {
  return `
    <div class="welcome">
      <span class="welcome__logo">🦫</span>
      <h2>Salut, je suis Castor.</h2>
      <p>Choisis un provider, tape <code>/</code> pour tes compétences,
         et donne-moi un chantier. Ce que je fais s'affiche en liste.</p>
      <div class="welcome__hints">
        <code>/review ce composant</code>
        <code>/tests pour ma fonction parse()</code>
        <code>refactore ce fichier en TypeScript</code>
      </div>
    </div>`;
}

$("#messages").addEventListener("click", (e) => {
  if (e.target.matches(".welcome__hints code")) {
    $("#input").value = e.target.textContent;
    $("#input").focus();
    autoresize($("#input"));
  }
});

/* ---------- boot ---------- */
(async function boot() {
  const info = await window.castor.listProviders();
  void info;

  state.skills = (await window.castor.storeGet("skills")) || DEFAULT_SKILLS;
  if (!(await window.castor.storeGet("skills"))) {
    await window.castor.storeSet("skills", state.skills);
  }
  state.memory = (await window.castor.storeGet("memory")) || [];
  state.usage = (await window.castor.storeGet("usage")) || {
    totalTokens: 0,
    requests: 0,
  };

  await loadConversations();
  const ws = await window.castor.restoreWorkspace();
  if (ws.ok) {
    applyWorkspace(ws);
    refreshFileTree();
  }

  const prefs2 = await loadPersisted();
  setChatMode(prefs2.chatMode === "plan" ? "plan" : "build");
  if (prefs2.panelOpen) {
    setPanel(true);
    setPanelTab(state.panelTab);
  }

  renderConvList();
  renderSkills();
  renderMemory();
  renderUsage();
  initProviders();
})();
