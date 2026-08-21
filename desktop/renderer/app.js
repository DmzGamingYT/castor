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

async function send(text) {
  if (state.streaming || !text.trim()) return;

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
  $("#send").disabled = true;
  scrollDown();

  const payloadMessages = [
    buildSystemMessage(),
    ...state.messages.slice(0, -1),
  ];

  const res = await window.castor.stream({
    providerId: provider.id,
    baseURLOverride: baseURL,
    model,
    messages: payloadMessages,
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
  }

  function cleanup() {
    state.streaming = false;
    state.reqId = null;
    $("#send").disabled = false;
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

$("#send").addEventListener("click", submitInput);

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

$("#new-chat").addEventListener("click", () => {
  state.messages = [];
  $("#messages").innerHTML = welcomeHTML();
  $("#stats").textContent = "";
  renderTodos([]);
  renderUsage();
});

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

  renderSkills();
  renderMemory();
  renderUsage();
  initProviders();
})();
