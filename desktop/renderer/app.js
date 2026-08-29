/* Castor Desktop — renderer
   Providers multiples · compétences (/) · mémoire persistante ·
   usage & contexte · plan de tâches live extrait du flux. */
const $ = (sel) => document.querySelector(sel);

const CTX_WINDOW = 128000; // fenêtre de contexte par défaut (tokens)
const estTok = (chars) => Math.ceil(chars / 4);

/* Fenêtre de contexte du modèle sélectionné : le cache des modèles
   (models:refresh) porte la vraie valeur (context_length) quand l'API la
   fournit — sinon repli sur 128k. */
function currentModelContext() {
  const model = ($("#model-input")?.value || "").trim();
  if (!model) return CTX_WINDOW;
  const hit = (currentProvider()?.models || []).find(
    (m) => (typeof m === "string" ? m : m.id) === model
  );
  const ctx = hit && typeof hit === "object" ? Number(hit.context) || 0 : 0;
  return ctx > 0 ? ctx : CTX_WINDOW;
}

const DEFAULT_SKILLS = [
  { name: "review", body: "Relis le code fourni comme un reviewer senior : points bloquants d'abord, puis suggestions concrètes avec extraits corrigés." },
  { name: "tests", body: "Propose des tests couvrant les cas limites du code fourni, prêts à coller dans le projet." },
  { name: "explique", body: "Explique pas à pas, avec une analogie simple, puis un résumé en 3 points." },
];

/* logo castor raffiné (aligné sur l'icône de l'app et du site) */
const LOGO_SVG =
  `<svg class="beaver-ico" viewBox="0 0 24 24" aria-hidden="true">
    <circle class="b-ear" cx="5.4" cy="5.6" r="1.8" />
    <circle class="b-ear" cx="18.6" cy="5.6" r="1.8" />
    <circle class="b-earin" cx="5.4" cy="5.6" r="0.9" />
    <circle class="b-earin" cx="18.6" cy="5.6" r="0.9" />
    <path class="b-fur" d="M12 3.4c5 0 8.2 3.3 8.2 7.7 0 2.3-.8 4.2-2.3 5.5-1.1 1-1.7 2.2-1.7 3.5v1H7.8v-1c0-1.3-.6-2.5-1.7-3.5C4.6 15.3 3.8 13.4 3.8 11.1c0-4.4 3.2-7.7 8.2-7.7Z" />
    <path class="b-muz" d="M8.4 12.5c0-1.7 1.6-2.8 3.6-2.8s3.6 1.1 3.6 2.8-1.6 3.3-3.6 3.3-3.6-1.6-3.6-3.3Z" />
    <path class="b-tooth" d="M10.7 14.2h2.6v2.2a.7.7 0 0 1-.7.7h-1.2a.7.7 0 0 1-.7-.7v-2.2Z" />
    <path class="b-nose" d="M10.6 10.8h2.8l-1 1.5a.55.55 0 0 1-.9 0l-.9-1.5Z" />
    <circle class="b-eye" cx="8.8" cy="8.9" r=".95" />
    <circle class="b-eye" cx="15.2" cy="8.9" r=".95" />
    <circle class="b-shine" cx="9.1" cy="8.6" r=".32" />
    <circle class="b-shine" cx="15.5" cy="8.6" r=".32" />
    <path class="b-wh" d="M4.8 11l2 .55M4.6 12.8l2-.25M19.2 11l-2 .55M19.4 12.8l-2-.25" />
  </svg>`;

/* icônes SVG dessinées main — même trait que le thème (stroke courant) */
const icoSVG = (body) =>
  `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const ICONS = {
  folder: icoSVG(`<path d="M3.5 7.2a1.7 1.7 0 0 1 1.7-1.7h4.1l2 2h7.5a1.7 1.7 0 0 1 1.7 1.7v7.9a1.7 1.7 0 0 1-1.7 1.7H5.2a1.7 1.7 0 0 1-1.7-1.7V7.2Z"/>`),
  file:   icoSVG(`<path d="M6 3.5h8l4.5 4.5V20.5H6z"/><path d="M14 3.5v4.5h4.5"/>`),
  gear:   icoSVG(`<circle cx="12" cy="12" r="3.1"/><path d="M12 2.6v3M12 18.4v3M2.6 12h3M18.4 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>`),
  pencil: icoSVG(`<path d="M4 20l1.1-4.2 9.9-9.9a1.9 1.9 0 0 1 2.7 0l.4.4a1.9 1.9 0 0 1 0 2.7L8.2 18.9 4 20Z"/><path d="M13.8 6.9l3.3 3.3"/>`),
  search: icoSVG(`<circle cx="10.8" cy="10.8" r="6"/><path d="M15.4 15.4 20 20"/>`),
  term:   icoSVG(`<path d="M4.5 6.5 10 12l-5.5 5.5"/><path d="M11 17.5h8"/>`),
  trash:  icoSVG(`<path d="M4.5 6.5h15M9.5 6.5V4.8h5v1.7M6.5 6.5l.8 12.7h9.4l.8-12.7M10 10.5v5M14 10.5v5"/>`),
  copy:   icoSVG(`<rect x="8.5" y="8.5" width="11" height="11" rx="1.8"/><path d="M5.5 15.5h-.8a1.7 1.7 0 0 1-1.7-1.7V5.2a1.7 1.7 0 0 1 1.7-1.7h8.6a1.7 1.7 0 0 1 1.7 1.7v.8"/>`),
  chevR:  icoSVG(`<path d="M9 5.5 15.5 12 9 18.5"/>`),
  chevD:  icoSVG(`<path d="M5.5 9 12 15.5 18.5 9"/>`),
  panel:  icoSVG(`<rect x="3.5" y="4.5" width="17" height="15" rx="2.4"/><path d="M12 4.5v15"/>`),
  close:  icoSVG(`<path d="M6 6l12 12M18 6 6 18"/>`),
  refresh:icoSVG(`<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v4.5h-4.5"/>`),
  check:  icoSVG(`<path d="M5 12.6 9.8 17.4 19 7"/>`),
  clock:  icoSVG(`<circle cx="12" cy="12" r="8.2"/><path d="M12 7.2V12l3.4 2"/>`),
  archive:icoSVG(`<path d="M3.5 8h17v12h-17z"/><path d="M3 3.5h18v4.5H3zM9.5 12h5"/>`),
  restore:icoSVG(`<path d="M9 6 3.5 11.5 9 17"/><path d="M3.5 11.5H15a5.5 5.5 0 0 1 5.5 5.5"/>`),
  sparkle:icoSVG(`<path d="M12 3.5l1.6 3.9 3.9 1.6-3.9 1.6L12 14.5l-1.6-3.9-3.9-1.6 3.9-1.6L12 3.5Z"/>`),
  checkList: icoSVG(`<rect x="3.5" y="4.5" width="17" height="15" rx="2.4"/><path d="M7.5 9.5l2 2 3.5-3.5M7.5 15.5l2 2 3.5-3.5"/>`),
  user: icoSVG(`<circle cx="12" cy="8.2" r="3.4"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/>`),
};

const state = {
  providers: [],
  jobs: [],
  editingJobId: null,
  activeId: null,
  messages: [], // {role, content}
  streaming: false,
  reqId: null,
  t0: 0,

  skills: [],
  memory: [],
  usage: { totalTokens: 0, requests: 0 },
  sessionTokens: 0,
  lastPayloadChars: null, // taille réelle du dernier payload envoyé (fenêtre glissante)
  lastTruncated: false,
  pendingSkill: null,

  wsName: null,
  wsPath: null,
  platform: null,
  version: "",
  projects: [], // [{ id, name, path }] — un espace dédié par dossier ouvert
  activeProjectId: null,
  conversations: [],
  activeConvId: null,
  stickToBottom: true, // scroll auto pendant le streaming tant que l'utilisateur est en bas

  chatMode: "build", // build : outils actifs · plan : lecture seule
  queue: [], // messages en attente pendant un stream
  attachments: [], // fichiers glissés, joints au prochain message
  attachErrors: [], // notes d'erreur transitoires (trop gros, binaire…)
  lastWrite: null, // { callId, path } — dernière écriture approuvée (annulable)
  convTab: "active",
  convSearch: "",
  panelOpen: false,
  panelTab: "changes",
  notesTimer: null,
  notesMode: "edit", // edit | preview
  notesDirty: false,

  // comptabilité fine des tokens
  lastReq: null, // détail de la dernière réponse (réels si fournis, sinon estimés)
  reqHistory: [], // session : dernières requêtes (plus récentes d'abord)
  sessionRequests: 0,

  planCollapsed: false,
  planShownThisStream: false,
  termFilter: "all",
  termRunning: new Map(), // callId -> { entry, t0 }
  sidebarW: 280,
  panelW: 320,
};

// hook de debug : état live accessible dans les devtools (Electron)
window.__castor = state;

/* ---------- persistance (store.json côté main) ---------- */
function loadPersisted() {
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

/* ---------- thème jour / nuit ---------- */
function systemPrefersDark() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function themeLabel(theme) {
  return theme === "dark" ? "Passer en mode jour" : "Passer en mode nuit";
}

// Détermine le thème courant : choix sauvegardé sinon préférence système.
function resolveTheme(prefs) {
  if (prefs.theme === "light" || prefs.theme === "dark") return prefs.theme;
  return systemPrefersDark() ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = $("#theme-toggle");
  btn.dataset.themeBtn = theme;
  btn.title = themeLabel(theme);
  const prefs = loadPersisted();
  if (prefs.accentColor) document.documentElement.style.setProperty("--accent", prefs.accentColor);
}

function applyAccentColor(hex) {
  document.documentElement.style.setProperty("--accent", hex);
  persist({ accentColor: hex });
}

async function setTheme(theme) {
  persist({ theme });
  applyTheme(theme);
}

async function toggleTheme() {
  const next = resolveTheme(loadPersisted()) === "dark" ? "light" : "dark";
  await setTheme(next);
}

$("#theme-toggle").addEventListener("click", toggleTheme);

/* ---------- accent color picker ---------- */
(function initAccentPicker() {
  const toggle = $("#accent-toggle");
  const panel = $("#accent-panel");
  const custom = $("#accent-custom");
  if (!toggle || !panel) return;
  toggle.addEventListener("click", () => panel.classList.toggle("hidden"));
  panel.querySelectorAll(".accent-swatch").forEach((btn) =>
    btn.addEventListener("click", () => { applyAccentColor(btn.dataset.color); panel.classList.add("hidden"); })
  );
  custom?.addEventListener("input", (e) => applyAccentColor(e.target.value));
  const prefs = loadPersisted();
  if (prefs.accentColor) {
    document.documentElement.style.setProperty("--accent", prefs.accentColor);
    if (custom) custom.value = prefs.accentColor;
  }
})();

// Suit le changement de préférence système tant que l'utilisateur n'a pas choisi.
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", async (e) => {
  const prefs = await loadPersisted();
  if (prefs.theme === "light" || prefs.theme === "dark") return;
  applyTheme(e.matches ? "dark" : "light");
});

/* ---------- providers ---------- */
function currentProvider() {
  return state.providers.find((p) => p.id === state.activeId);
}

/* ---------- mises à jour (pastille dans la sidebar) ---------- */
let updateState = null;

function renderUpdate(st) {
  updateState = st;
  const pill = $("#update-pill");
  if (!pill) return;
  const text = $("#update-pill-text");
  // silencieux tant qu'il n'y a rien à montrer (vérif, à jour, erreur réseau…)
  if (!st || ["idle", "checking", "none", "error"].includes(st.state)) {
    pill.classList.add("hidden");
    return;
  }
  pill.classList.remove("hidden");
  pill.classList.toggle("ready", st.state === "downloaded");
  if (st.state === "available") {
    text.textContent =
      st.percent != null
        ? `Mise à jour ${st.version ? "v" + st.version + " · " : ""}${st.percent} %`
        : `Mise à jour ${st.version ? "v" + st.version + " " : ""}disponible${
            state.platform === "darwin" ? " — voir la release" : "…"
          }`;
  } else if (st.state === "downloaded") {
    text.textContent = `v${st.version || ""} prête — redémarrer pour installer`;
  }
}

$("#update-pill").addEventListener("click", () => {
  if (!updateState) return;
  // win/linux : un clic = quitAndInstall · macOS non signé : ouvre la page Releases
  if (
    updateState.state === "downloaded" ||
    (state.platform === "darwin" && updateState.state === "available")
  ) {
    window.castor.installUpdate?.();
  }
});

$("#app-version").addEventListener("click", () => {
  $("#app-version").textContent = "vérification…";
  window.castor.checkUpdates?.().then((st) => {
    $("#app-version").textContent = state.version;
    if (st?.state === "none") {
      $("#app-version").title = "Castor est à jour ✓ — reclique pour revérifier";
    }
  });
});

async function initProviders() {
  state.providers = await window.castor.listProviders();
  const prefs = await loadPersisted();
  const last = state.providers.some((p) => p.id === prefs.lastProvider)
    ? prefs.lastProvider
    : state.providers.find((p) => p.configured)?.id;
  renderProviderList();
  selectProvider(last || state.providers[0].id);

  // premier lancement : onboarding guidé (provider → clé → chantier)
  if (!prefs.onboarded) openOnboard();
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
    const gear = document.createElement("button");
    gear.className = "gear";
    gear.title = "Réglages…";
    gear.innerHTML = ICONS.gear;
    gear.addEventListener("click", (e) => {
      e.stopPropagation();
      openProviderSettings(p.id);
    });
    btn.appendChild(gear);
    btn.addEventListener("click", () => {
      selectProvider(p.id);
      // provider sans clé : ouvrir directement les réglages pour la saisir
      if (p.needsKey && !p.configured) openProviderSettings(p.id);
    });
    li.appendChild(btn);
    ul.appendChild(li);
  }
}

function fillModelOptions(models) {
  const dl = $("#model-options");
  dl.innerHTML = "";
  for (const m of models || []) {
    const opt = document.createElement("option");
    opt.value = typeof m === "string" ? m : m.id;
    dl.appendChild(opt);
  }
}

/* ---------- picker de modèles ---------- */
const asModelObj = (m) =>
  typeof m === "string" ? { id: m, free: undefined, context: null } : m;

/* cache des modèles par provider (30 min) — évite le fetch /models à chaque ouverture */
const MODELS_TTL = 30 * 60 * 1000;

async function getModels(provider, { force = false, baseURL = "" } = {}) {
  const key = "models:" + provider.id + (baseURL ? "@" + baseURL : "");
  if (!force) {
    try {
      const c = JSON.parse(localStorage.getItem(key) || "null");
      if (c && Date.now() - c.t < MODELS_TTL && Array.isArray(c.models) && c.models.length) {
        return { ok: true, models: c.models, cached: true };
      }
    } catch {}
  }
  const res = await window.castor.refreshModels(provider.id, baseURL);
  if (res.ok && res.models?.length) {
    try {
      localStorage.setItem(key, JSON.stringify({ t: Date.now(), models: res.models }));
    } catch {}
  }
  return res;
}

function fmtCtx(n) {
  return n >= 1000000 ? Math.round(n / 100000) / 10 + "M" : Math.round(n / 1000) + "k";
}

/* favoris mémorisés par provider ET par projet : clé fav:<provider>@<projet> */
function favKey() {
  return (
    "fav:" + (state.activeId || "?") + (state.activeProjectId ? "@" + state.activeProjectId : "")
  );
}
function getFavs() {
  return loadPersisted()[favKey()] || [];
}
function toggleFav(modelId) {
  const favs = getFavs();
  persist({
    [favKey()]: favs.includes(modelId)
      ? favs.filter((m) => m !== modelId)
      : [...favs, modelId],
  });
  renderModelList();
}

/* étoile SVG maison (cohérente avec les icônes dessinées de l'app) */
const STAR_PATH =
  "M12 3.6l2.47 5.01 5.53.8-4 3.9.94 5.51-4.94-2.6-4.94 2.6.94-5.51-4-3.9 5.53-.8L12 3.6z";
function starSVG() {
  return `<svg class="star-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_PATH}" /></svg>`;
}

function renderModelList() {
  const box = $("#model-list");
  if (!box) return;
  const all = (currentProvider()?.models || []).map(asModelObj);
  const q = ($("#model-search")?.value || "").trim().toLowerCase();
  const current = $("#model-input").value.trim();
  const favs = new Set(getFavs());
  const hits = all
    .filter((m) => !q || m.id.toLowerCase().includes(q))
    .sort((a, b) => Number(b.free === true) - Number(a.free === true) || a.id.localeCompare(b.id));
  // favoris épinglés en tête (ordre d'ajout), le reste ensuite
  const ordered = [...hits.filter((m) => favs.has(m.id)), ...hits.filter((m) => !favs.has(m.id))];
  const favCount = Math.min(ordered.length, hits.filter((m) => favs.has(m.id)).length);

  box.innerHTML = "";
  const cap = 80;
  ordered.slice(0, cap).forEach((m, i) => {
    if (i === favCount && favCount > 0) {
      const sep = document.createElement("div");
      sep.className = "model-list__sep";
      box.appendChild(sep);
    }
    const row = document.createElement("button");
    row.type = "button";
    row.className = "model-row" + (m.id === current ? " sel" : "");
    row.title = m.id + (m.free ? " · gratuit" : "");
    const id = document.createElement("span");
    id.className = "model-row__id";
    id.textContent = m.id;
    const badges = document.createElement("span");
    badges.className = "model-row__badges";
    if (m.free) {
      const b = document.createElement("span");
      b.className = "m-badge free";
      b.textContent = "gratuit";
      badges.appendChild(b);
    }
    if (m.context) {
      const b = document.createElement("span");
      b.className = "m-badge ctx";
      b.textContent = fmtCtx(m.context);
      badges.appendChild(b);
    }
    const star = document.createElement("button");
    star.type = "button";
    star.className = "model-row__star" + (favs.has(m.id) ? " on" : "");
    star.title = favs.has(m.id) ? "Retirer des favoris" : "Épingler en favori";
    star.innerHTML = starSVG();
    star.addEventListener("click", (e) => {
      e.stopPropagation(); // étoiler ne sélectionne pas le modèle
      toggleFav(m.id);
    });
    row.append(id, badges, star);
    row.addEventListener("click", () => {
      $("#model-input").value = m.id;
      updateModelChip(m.id);
      renderModelList();
    });
    box.appendChild(row);
  });
  if (!hits.length) {
    const note = document.createElement("div");
    note.className = "model-list__note";
    note.textContent = all.length
      ? "Aucun modèle ne correspond au filtre."
      : "Aucun modèle — clique « ↻ Rafraîchir les modèles ».";
    box.appendChild(note);
  } else if (ordered.length > cap) {
    const note = document.createElement("div");
    note.className = "model-list__note";
    note.textContent = `… ${ordered.length - cap} autres — affine le filtre.`;
    box.appendChild(note);
  }
}

$("#model-search")?.addEventListener("input", renderModelList);

async function selectProvider(id) {
  state.activeId = id;
  persist({ lastProvider: id });
  renderProviderList();

  const p = currentProvider();
  const model = (await loadPersisted())["model:" + id] || p.defaultModel;
  $("#model-input").value = model;
  updateModelChip(model);
  fillModelOptions(p.models);
  if ($("#model-search")) $("#model-search").value = "";
  renderModelList();
  $("#baseurl-input").value = (await loadPersisted())["baseurl:" + id] || "";
  $("#baseurl-input").placeholder = p.baseURL;

  $("#key-row").classList.toggle("hidden", !p.needsKey);
  $("#save-key").classList.toggle("hidden", !p.needsKey);
  $("#key-input").value = "";
  $("#key-input").placeholder = p.configured ? "•••••••• (enregistrée)" : "sk-…";
  const keyLink = $("#key-link");
  keyLink.classList.toggle("hidden", !p.needsKey || !p.keyUrl);
  if (p.keyUrl) keyLink.href = p.keyUrl;

  $("#test-result").textContent = "";
  $("#chat-title").textContent = `Castor · ${p.label}`;
}

function updateModelChip(model) {
  const chip = $("#model-chip");
  chip.textContent = model || "";
  chip.classList.toggle("hidden", !model);
  chip.title = model || "";
  // le modèle vient de changer : la jauge se recalcule sur son contexte réel
  renderUsage();
}

$("#model-input").addEventListener("input", () =>
  updateModelChip($("#model-input").value.trim())
);
$("#model-switcher").addEventListener("click", () => {
  if (state.activeId) openProviderSettings(state.activeId);
});

/* ---------- réglages provider (modale) ---------- */
function openProviderSettings(id) {
  selectProvider(id);
  const p = currentProvider();
  $("#pm-title").textContent = "Réglages · " + p.label;
  $("#pm-provider").textContent = p.id;
  $("#provider-modal").classList.remove("hidden");
  // liste statique → enrichir depuis l'API (cache 30 min côté renderer)
  if (p.models?.length && typeof p.models[0] === "string") {
    getModels(p, { baseURL: $("#baseurl-input").value.trim() })
      .then((res) => {
        if (res.ok && res.models?.length) {
          p.models = res.models;
          fillModelOptions(p.models);
          renderModelList();
        }
      })
      .catch(() => {});
  }
  // clé manquante → le champ clé d'abord, sinon le choix du modèle
  (p.needsKey && !p.configured ? $("#key-input") : $("#model-input")).focus();
}

function closeProviderModal() {
  $("#provider-modal").classList.add("hidden");
  $("#input").focus();
}

$("#pm-close").addEventListener("click", closeProviderModal);
$("#provider-modal").addEventListener("click", (e) => {
  if (e.target.classList.contains("diff-modal__backdrop")) closeProviderModal();
});
document.addEventListener("keydown", (e) => {
  if (pendingApproval != null) return;
  if (e.key === "Escape" && !$("#provider-modal").classList.contains("hidden")) {
    e.preventDefault();
    closeProviderModal();
  }
});

/* ---------- onboarding guidé (provider → clé → chantier) ---------- */
let obStep = 1;

function openOnboard() {
  persist({ onboarded: true }); // montré une fois, revisitable via ⌘K
  obStep = 1;
  const cloud =
    state.providers.find((p) => p.needsKey && !p.configured) || currentProvider();
  if (cloud) selectProvider(cloud.id);
  renderObProviders();
  showObStep(1);
  $("#onboard").classList.remove("hidden");
}

function renderObProviders() {
  const box = $("#ob-providers");
  box.innerHTML = "";
  for (const p of state.providers) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ob-provider" + (p.id === state.activeId ? " sel" : "");
    const dot = document.createElement("span");
    dot.className =
      "dot " + (!p.needsKey ? "dot--local" : p.configured ? "dot--on" : "dot--off");
    b.append(
      dot,
      document.createTextNode(p.label + (!p.needsKey ? " · local, sans clé" : ""))
    );
    b.addEventListener("click", () => {
      selectProvider(p.id);
      renderObProviders();
    });
    box.appendChild(b);
  }
}

function updateObKeyStep() {
  const p = currentProvider();
  const need = Boolean(p?.needsKey);
  $("#ob-key-input-wrap").classList.toggle("hidden", !need);
  $("#ob-key-hint").textContent = need
    ? `Une clé ${p.label} gratuite débloque le mode IA. Elle reste sur ta machine, chiffrée par le coffre de l'OS.`
    : `${p.label} tourne en local — aucune clé nécessaire, passe à la suite.`;
  const link = $("#ob-key-link");
  if (need && p.keyUrl) {
    link.href = p.keyUrl;
    link.classList.remove("hidden");
  } else {
    link.classList.add("hidden");
  }
}

function showObStep(n) {
  obStep = n;
  document.querySelectorAll(".ob-step").forEach((el) =>
    el.classList.toggle("hidden", Number(el.dataset.step) !== n)
  );
  document.querySelectorAll(".onboard__steps span").forEach((el) =>
    el.classList.toggle("on", Number(el.dataset.step) <= n)
  );
  $("#ob-skip").textContent = n === 3 ? "Plus tard" : "Passer";
  $("#ob-next").textContent = n === 3 ? "📁 Choisir un dossier" : "Suivant";
  if (n === 2) updateObKeyStep();
  if (n === 2 && !currentProvider()?.needsKey) return;
}

function closeOnboard() {
  $("#onboard").classList.add("hidden");
  $("#input").focus();
}

$("#ob-next").addEventListener("click", async () => {
  if (obStep === 2) {
    const key = $("#ob-key").value.trim();
    const p = currentProvider();
    if (p?.needsKey && key) {
      await window.castor.setKey(p.id, key);
      p.configured = true;
      $("#ob-key").value = "";
      renderProviderList();
    }
    return showObStep(3);
  }
  if (obStep === 3) {
    const res = await window.castor.openWorkspace();
    if (res.ok) {
      applyWorkspace(res);
      refreshFileTree();
    }
    closeOnboard();
    return;
  }
  showObStep(obStep + 1);
});
$("#ob-skip").addEventListener("click", closeOnboard);

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
  const res = await getModels(currentProvider(), {
    force: true,
    baseURL: $("#baseurl-input").value.trim(),
  });
  if (res.ok && res.models.length) {
    currentProvider().models = res.models;
    fillModelOptions(res.models);
    renderModelList();
    note.className = "test-result ok";
    const nFree = res.models.filter((m) => m.free).length;
    note.textContent =
      `${res.models.length} modèles trouvés` + (nFree ? ` · ${nFree} gratuits` : "");
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

/* ---------- projets : un espace dédié par dossier ---------- */
const PROJECT_COLORS = ["#e2952a", "#93a862", "#4ea8c9", "#c96f4a", "#b08d3e", "#8a9a5b"];

function projectColor(path) {
  let h = 0;
  for (const ch of path) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PROJECT_COLORS[h % PROJECT_COLORS.length];
}

function projectAvatarSVG(name, color) {
  const letter = escapeHtml((name || "?").trim().charAt(0).toUpperCase() || "?");
  return (
    `<svg class="proj-ico" viewBox="0 0 24 24" aria-hidden="true">` +
    `<rect x="1.2" y="1.2" width="21.6" height="21.6" rx="6.5" fill="${color}" opacity="0.16"/>` +
    `<rect x="1.2" y="1.2" width="21.6" height="21.6" rx="6.5" fill="none" stroke="${color}" stroke-opacity="0.55" stroke-width="1.2"/>` +
    `<text x="12" y="16.1" text-anchor="middle" font-size="11.5" font-weight="700" fill="${color}" font-family="Space Grotesk, sans-serif">${letter}</text></svg>`
  );
}

function ensureProject(info) {
  if (state.projects.some((p) => p.path === info.path)) return;
  state.projects.push({ id: info.path, name: info.name, path: info.path });
  window.castor.storeSet("projects", state.projects);
}

// si la conversation ouverte appartient à un autre espace, on repart de zéro
function leaveConversationIfForeign(bucketId) {
  const conv = state.conversations.find((c) => c.id === state.activeConvId);
  if (conv && (conv.projectId || null) !== bucketId) resetChatView();
}

function applyWorkspace(info) {
  leaveConversationIfForeign(info.path);
  state.wsName = info.name;
  state.wsPath = info.path;
  state.activeProjectId = info.path;
  ensureProject(info);
  $("#ws-chip-name").textContent = info.name;
  $("#ws-chip").classList.remove("hidden");
  renderProjects();
  renderConvList();
  loadNotes();
  if (state.panelOpen && state.panelTab === "changes") refreshChanges();
  if (state.panelOpen && state.panelTab === "files") refreshFiles();
}

async function clearWorkspaceView() {
  leaveConversationIfForeign(null);
  state.wsName = null;
  state.wsPath = null;
  state.activeProjectId = null;
  $("#ws-chip").classList.add("hidden");
  $("#ws-tree-wrap").classList.add("hidden");
  $("#file-tree").innerHTML = "";
  renderProjects();
  renderConvList();
  loadNotes();
  refreshChanges();
  refreshFiles();
}

async function switchToProject(p) {
  if (p.path === state.wsPath) return;
  const res = await window.castor.openWorkspacePath(p.path);
  if (!res.ok) return;
  applyWorkspace(res);
  refreshFileTree();
}

/* suppression d'un projet de la liste (deux clics, comme les conversations) */
let armedProj = null;
function disarmProj() {
  if (!armedProj) return;
  clearTimeout(armedProj.timer);
  armedProj.btn.textContent = "✕";
  armedProj.btn.classList.remove("confirm");
  armedProj.btn.title = "Retirer des projets";
  armedProj = null;
}

function renderProjects() {
  const ul = $("#project-list");
  ul.innerHTML = "";
  const badge = $("#project-count");
  badge.textContent = String(state.projects.length);
  badge.classList.toggle("hidden", !state.projects.length);

  // entrée « Général » : l'espace sans chantier (conversations non rattachées)
  const gen = document.createElement("li");
  const genBtn = document.createElement("button");
  genBtn.className = "proj-btn" + (!state.wsPath ? " active" : "");
  genBtn.title = "Conversations sans chantier";
  genBtn.innerHTML = projectAvatarSVG("Général", "#8a8f7a");
  const genName = document.createElement("span");
  genName.className = "name";
  genName.textContent = "Général";
  genBtn.appendChild(genName);
  genBtn.addEventListener("click", async () => {
    if (!state.wsPath) return;
    await window.castor.closeWorkspace();
    await clearWorkspaceView();
  });
  gen.appendChild(genBtn);
  ul.appendChild(gen);

  for (const p of state.projects) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "proj-btn" + (p.path === state.wsPath ? " active" : "");
    btn.title = p.path;
    btn.innerHTML = projectAvatarSVG(p.name, projectColor(p.path));
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = p.name;
    const del = document.createElement("button");
    del.className = "del";
    del.title = "Retirer des projets";
    del.textContent = "✕";
    del.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (armedProj?.path === p.path) {
        disarmProj();
        state.projects = state.projects.filter((x) => x.path !== p.path);
        await window.castor.storeSet("projects", state.projects);
        if (p.path === state.wsPath) {
          await window.castor.closeWorkspace();
          await clearWorkspaceView();
        } else {
          renderProjects();
        }
        return;
      }
      disarmProj();
      del.textContent = "?";
      del.classList.add("confirm");
      del.title = "Cliquer encore pour retirer ce projet";
      armedProj = { path: p.path, btn: del, timer: setTimeout(disarmProj, 2600) };
    });
    btn.append(name, del);
    btn.addEventListener("click", () => switchToProject(p));
    li.appendChild(btn);
    ul.appendChild(li);
  }

  const hint = $("#ws-hint");
  hint.textContent = !state.projects.length
    ? "Aucun projet — ajoute un dossier pour que le castor code."
    : state.wsPath
      ? ""
      : "Clique un projet pour l'activer, ou ajoutes-en un.";
  hint.classList.toggle("hidden", !hint.textContent);
}

async function refreshFileTree() {
  const res = await window.castor.workspaceTree();
  if (!res.ok) return;
  $("#ws-tree-wrap").classList.remove("hidden");
  $("#file-tree").replaceChildren(fileTreeNode(res.tree, 1));
}

function fileTreeNode(node, depth) {
  const frag = document.createDocumentFragment();
  for (const child of node.children || []) {
    if (child.type === "dir") {
      const details = document.createElement("details");
      if (depth < 2) details.open = true;
      const summary = document.createElement("summary");
      const dirIco = document.createElement("span");
      dirIco.className = "ft-ico";
      dirIco.innerHTML = ICONS.folder;
      summary.append(dirIco, document.createTextNode(child.name));
      details.appendChild(summary);
      if (child.children?.length) details.appendChild(fileTreeNode(child, depth + 1));
      frag.appendChild(details);
    } else {
      const file = document.createElement("div");
      file.className = "ft-file";
      const fileIco = document.createElement("span");
      fileIco.className = "ft-ico";
      fileIco.innerHTML = ICONS.file;
      file.append(fileIco, document.createTextNode(child.name));
      frag.appendChild(file);
    }
  }
  return frag;
}$("#open-workspace").addEventListener("click", async () => {
  const res = await window.castor.openWorkspace();
  if (!res.ok) return;
  applyWorkspace(res);
  refreshFileTree();
});

/* ---------- outils : trace dans le chat + terminal ---------- */
window.castor.onToolStart(({ reqId, callId, icon, label, kind }) => {
  if (reqId !== state.reqId || !state.currentTrace) return;
  const line = document.createElement("div");
  line.className = "tool-line running";
  line.dataset.callId = callId;
  const ic = document.createElement("i");
  ic.className = "icon" + (ICONS[icon] ? " ico" : "");
  ic.innerHTML = ICONS[icon] || escapeHtml(String(icon || ""));
  const lb = document.createElement("span");
  lb.textContent = label;
  line.append(ic, lb);
  state.currentTrace.appendChild(line);
  scrollDown();
  if (kind === "command") termStart(callId, label);
});

window.castor.onToolResult(({ reqId, callId, meta }) => {
  if (reqId === state.reqId) {
    const line = state.currentTrace?.querySelector(`[data-call-id="${callId}"]`);
    if (line) {
      line.classList.remove("running");
      line.classList.add("done");
    }
  }
  if (meta?.kind === "command") termFinish(callId, meta);
  if (meta?.kind === "write") {
    // l'écriture vient d'être appliquée : on peut l'annuler (backup côté main)
    state.lastWrite = { callId, path: meta.path };
    renderUndoButton();
  }
  if (state.panelOpen && (meta?.kind === "write" || meta?.kind === "command")) {
    refreshChanges();
    $("#chg-badge").classList.remove("hidden");
  }
});

/* ---------- annulation de la dernière écriture ---------- */
function renderUndoButton() {
  const btn = $("#diff-undo");
  const pathEl = $("#diff-undo-path");
  if (!btn) return;
  const has = Boolean(state.lastWrite);
  btn.classList.toggle("hidden", !has);
  btn.disabled = false;
  btn.title = state.lastWrite
    ? `Restaure ${state.lastWrite.path} tel qu'il était avant`
    : "";
  if (pathEl) {
    pathEl.textContent = state.lastWrite ? state.lastWrite.path : "";
    pathEl.classList.toggle("hidden", !has);
  }
}

async function undoLastWrite() {
  const w = state.lastWrite;
  const btn = $("#diff-undo");
  if (!w || !btn) return;
  btn.disabled = true;
  const res = await window.castor.undoWrite(w.callId);
  if (res?.ok) {
    state.lastWrite = null;
    renderUndoButton();
    refreshChanges();
    $("#chg-badge").classList.add("hidden");
  } else {
    btn.disabled = false;
    btn.title = "Échec de l'annulation : " + (res?.error || "sauvegarde introuvable") + " — clique pour réessayer";
  }
}

$("#diff-undo")?.addEventListener("click", undoLastWrite);

/* ---------- panneau droit : Changes · Terminal · Notes ---------- */
function setPanel(open) {
  state.panelOpen = open;
  document.querySelector(".layout").classList.toggle("panel-open", open);
  persist({ panelOpen: open });
  if (open && state.panelTab === "changes") refreshChanges();
}

/* ---------- redimensionnement sidebar / panneau ---------- */
const RESIZER_LIMITS = { sidebar: { min: 200, max: 440 }, panel: { min: 240, max: 520 } };

function initResizers() {
  const layout = document.querySelector(".layout");
  const prefs = loadPersisted();
  state.sidebarW = prefs.sidebarW || 280;
  state.panelW = prefs.panelW || 320;

  const apply = () => {
    layout.style.setProperty("--sidebar-w", state.sidebarW + "px");
    layout.style.setProperty("--panel-w", state.panelW + "px");
  };
  apply();

  const startDrag = (e, kind) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const { min, max } = RESIZER_LIMITS[kind];
    const startX = e.clientX;
    const startW = kind === "sidebar" ? state.sidebarW : state.panelW;
    const resizer = kind === "sidebar" ? $(".resizer--left") : $(".resizer--right");

    layout.classList.add("resizing");
    resizer.classList.add("dragging");
    document.body.classList.add("no-select");

    const move = (ev) => {
      const dx = ev.clientX - startX;
      // sidebar : tirer à droite élargit · panneau : tirer à gauche élargit
      const w = kind === "sidebar" ? startW + dx : startW - dx;
      const clamped = Math.max(min, Math.min(max, w));
      if (kind === "sidebar") {
        state.sidebarW = Math.round(clamped);
      } else {
        state.panelW = Math.round(clamped);
      }
      apply();
    };

    const up = () => {
      layout.classList.remove("resizing");
      resizer.classList.remove("dragging");
      document.body.classList.remove("no-select");
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      persist({ sidebarW: state.sidebarW, panelW: state.panelW });
    };

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };

  $(".resizer--left").addEventListener("pointerdown", (e) => startDrag(e, "sidebar"));
  $(".resizer--right").addEventListener("pointerdown", (e) => startDrag(e, "panel"));
}

function setPanelTab(tab) {
  state.panelTab = tab;
  document.querySelectorAll(".sp-tab").forEach((b) =>
    b.classList.toggle("active", b.dataset.tab === tab)
  );
  ["changes", "files", "plan", "terminal", "notes", "tools"].forEach((t) =>
    $("#sp-view-" + t).classList.toggle("hidden", t !== tab)
  );
  if (tab === "changes" && state.panelOpen) refreshChanges();
  if (tab === "files" && state.panelOpen) refreshFiles();
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

/* ---------- onglet Files : explorateur du chantier ---------- */
let filesTreeData = null; // arborescence brute (pour le filtre)
let filesOpen = new Set(); // dossiers dépliés (chemins relatifs)
let filesSel = null; // fichier sélectionné

async function refreshFiles() {
  const empty = $("#files-empty");
  const tree = $("#files-tree");
  tree.innerHTML = "";
  $("#files-preview").classList.add("hidden");
  if (!state.wsPath) {
    empty.textContent = "Ouvre un chantier pour explorer ses fichiers.";
    empty.classList.remove("hidden");
    $("#files-badge").classList.add("hidden");
    return;
  }
  const res = await window.castor.workspaceTree();
  if (!res.ok) {
    empty.textContent = res.error || "Impossible de lire le chantier.";
    empty.classList.remove("hidden");
    $("#files-badge").classList.add("hidden");
    return;
  }
  empty.classList.add("hidden");
  filesTreeData = res.tree;
  // au premier chargement : les dossiers de premier niveau sont dépliés
  if (!filesOpen.size) {
    for (const c of res.tree?.children || []) {
      if (c.type === "dir") filesOpen.add(c.name);
    }
  }
  renderFilesList();
}

/* un dossier (ou un parent) reste visible si lui ou un descendant matche le filtre */
function filesCollectVisible(node, q, rel, out) {
  const self = !q || node.name.toLowerCase().includes(q);
  let child = false;
  for (const c of node.children || []) {
    if (filesCollectVisible(c, q, rel + "/" + c.name, out)) child = true;
  }
  if (self || child) out.add(rel);
  return self || child;
}

function filesCountFiles(node) {
  let n = 0;
  for (const c of node?.children || []) n += c.type === "file" ? 1 : filesCountFiles(c);
  return n;
}

function renderFilesList() {
  const box = $("#files-tree");
  box.innerHTML = "";
  const q = ($("#files-search").value || "").trim().toLowerCase();
  const visible = new Set();
  for (const c of filesTreeData?.children || []) {
    filesCollectVisible(c, q, c.name, visible);
  }
  let shownFiles = 0;
  const frag = document.createDocumentFragment();

  const walk = (node, rel, depth) => {
    if (!visible.has(rel)) return;
    if (node.type === "dir") {
      const open = filesOpen.has(rel);
      const row = document.createElement("div");
      row.className = "fs-row fs-dir" + (open ? " open" : "");
      row.style.paddingLeft = 8 + depth * 14 + "px";
      const chev = document.createElement("span");
      chev.className = "fs-chev";
      chev.innerHTML = ICONS.chevR;
      const ic = document.createElement("span");
      ic.className = "fs-ico";
      ic.innerHTML = ICONS.folder;
      const name = document.createElement("span");
      name.className = "fs-name";
      name.textContent = node.name;
      name.title = rel;
      row.append(chev, ic, name);
      row.addEventListener("click", () => {
        if (open) filesOpen.delete(rel);
        else filesOpen.add(rel);
        renderFilesList();
      });
      frag.appendChild(row);
      if (open) {
        for (const c of node.children || []) walk(c, rel + "/" + c.name, depth + 1);
      }
    } else {
      shownFiles++;
      const row = document.createElement("div");
      row.className = "fs-row fs-file" + (filesSel === rel ? " sel" : "");
      row.style.paddingLeft = 8 + depth * 14 + "px";
      const chev = document.createElement("span");
      chev.className = "fs-chev";
      const ic = document.createElement("span");
      ic.className = "fs-ico";
      ic.innerHTML = ICONS.file;
      const name = document.createElement("span");
      name.className = "fs-name";
      name.textContent = node.name;
      name.title = rel;
      row.append(chev, ic, name);
      row.addEventListener("click", () => {
        filesSel = rel;
        renderFilesList();
        openFilePreview(rel);
      });
      frag.appendChild(row);
    }
  };
  for (const c of filesTreeData?.children || []) walk(c, c.name, 0);
  box.appendChild(frag);

  const total = filesCountFiles(filesTreeData);
  const badge = $("#files-badge");
  badge.textContent = String(q ? shownFiles : total);
  badge.classList.toggle("hidden", !(q ? shownFiles : total));
}

async function openFilePreview(rel) {
  const pv = $("#files-preview");
  pv.classList.remove("hidden");
  $(".fp-path").textContent = rel;
  const body = $(".fp-body");
  body.textContent = "Lecture…";
  const res = await window.castor.workspaceReadFile(rel);
  if (!res.ok) {
    body.textContent = res.error || "Erreur de lecture.";
    $(".fp-meta").textContent = "";
    return;
  }
  body.textContent =
    res.content.slice(0, 20000) + (res.content.length > 20000 ? "\n…(tronqué)" : "");
  $(".fp-meta").textContent = res.truncated
    ? `> ${Math.round(res.bytes / 1024)} ko — tronqué`
    : "";
}

$("#files-search").addEventListener("input", () => {
  if (filesTreeData) renderFilesList();
});
$("#files-refresh").addEventListener("click", refreshFiles);
$("#fp-close").addEventListener("click", () => {
  $("#files-preview").classList.add("hidden");
});

/* ---------- terminal : entrées enrichies (running / ok / ko) ---------- */
function termCmdFromLabel(label) {
  const m = String(label || "").match(/«\s*([^»]+)/);
  return m ? m[1] : label || "";
}

function clockTime(ts) {
  return new Date(ts).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function fmtDur(ms) {
  if (ms < 1000) return Math.round(ms) + " ms";
  return (ms / 1000).toFixed(1) + " s";
}

// squelette d'une entrée terminal ; le contenu est rempli à la fin
function termEntryEl(callId, command, ts) {
  $("#terminal-empty").classList.add("hidden");
  const box = $("#terminal-log");
  const entry = document.createElement("div");
  entry.className = "term-entry running";
  entry.dataset.callId = callId;
  entry.dataset.status = "running";

  const head = document.createElement("button");
  head.type = "button";
  head.className = "term-head";
  const st = document.createElement("span");
  st.className = "term-status";
  st.innerHTML = ICONS.clock;
  const cmd = document.createElement("code");
  cmd.className = "term-cmd";
  cmd.textContent = "$ " + command;
  cmd.title = command;
  const time = document.createElement("span");
  time.className = "term-time";
  time.textContent = clockTime(ts);
  time.title = "Lancée à " + new Date(ts).toLocaleString("fr-FR");
  const dur = document.createElement("span");
  dur.className = "term-dur";
  dur.textContent = "…";
  const copy = document.createElement("span");
  copy.className = "term-copy";
  copy.innerHTML = ICONS.copy;
  copy.title = "Copier la commande et sa sortie";
  const chev = document.createElement("span");
  chev.className = "term-chev";
  chev.innerHTML = ICONS.chevR;
  head.append(st, cmd, time, dur, copy, chev);

  const out = document.createElement("pre");
  out.className = "term-out";
  out.textContent = "(en cours…)";
  const cod = document.createElement("div");
  cod.className = "term-code";

  entry.append(head, out, cod);
  box.appendChild(entry);
  while (box.children.length > 80) box.firstChild.remove();
  box.scrollTop = box.scrollHeight;
  return entry;
}

function termStart(callId, label) {
  const t0 = Date.now();
  const entry = termEntryEl(callId, termCmdFromLabel(label), t0);
  state.termRunning.set(callId, { entry, t0 });
  updateTermBadge();
}

function termFinish(callId, meta) {
  const run = state.termRunning.get(callId);
  const t0 = run ? run.t0 : Date.now();
  const entry = run ? run.entry : termEntryEl(callId, meta.command, t0);
  state.termRunning.delete(callId);

  const code = Number(meta.code ?? -1);
  const status = code === 0 ? "ok" : "ko";
  entry.dataset.status = status;
  entry.classList.remove("running");
  entry.classList.add(status === "ko" ? "ko" : "ok");
  entry.querySelector(".term-status").innerHTML = status === "ok" ? ICONS.check : ICONS.close;
  entry.querySelector(".term-cmd").textContent = "$ " + meta.command;
  entry.querySelector(".term-cmd").title = meta.command;
  entry.querySelector(".term-out").textContent =
    (meta.output || "(aucune sortie)").slice(0, 1500);
  entry.querySelector(".term-dur").textContent = fmtDur(Date.now() - t0);
  const cod = entry.querySelector(".term-code");
  cod.textContent = "exit " + code;
  cod.classList.toggle("ko", status === "ko");
  entry.open = false; // repliée par défaut
  applyTermFilter();
  updateTermBadge();
  const box = $("#terminal-log");
  box.scrollTop = box.scrollHeight;
}

// clic sur l'en-tête : déplier / replier · clic sur ⧉ : copier
$("#terminal-log").addEventListener("click", (e) => {
  const copy = e.target.closest(".term-copy");
  if (copy) {
    e.stopPropagation();
    const entry = copy.closest(".term-entry");
    const cmd = entry.querySelector(".term-cmd").textContent;
    const out = entry.querySelector(".term-out").textContent;
    const code = entry.querySelector(".term-code").textContent;
    copyText(cmd + "\n" + out + "\n" + code);
    copy.innerHTML = ICONS.check;
    setTimeout(() => (copy.innerHTML = ICONS.copy), 900);
    return;
  }
  const head = e.target.closest(".term-head");
  if (!head) return;
  const entry = head.closest(".term-entry");
  if (entry.dataset.status === "running") return; // sortie pas encore connue
  entry.classList.toggle("open");
  entry.open = !entry.open;
});

function applyTermFilter() {
  document.querySelectorAll("#terminal-log .term-entry").forEach((el) => {
    const st = el.dataset.status;
    const show =
      state.termFilter === "all" || st === state.termFilter || st === "running";
    el.classList.toggle("hidden", !show);
  });
}

document.querySelectorAll(".term-filter").forEach((btn) =>
  btn.addEventListener("click", () => {
    state.termFilter = btn.dataset.filter;
    document.querySelectorAll(".term-filter").forEach((b) =>
      b.classList.toggle("active", b === btn)
    );
    applyTermFilter();
  })
);

function updateTermBadge() {
  const ko = document.querySelectorAll(
    "#terminal-log .term-entry[data-status=ko]"
  ).length;
  const badge = $("#term-badge");
  badge.textContent = String(ko);
  badge.classList.toggle("hidden", !ko);
}

$("#term-copy-all").addEventListener("click", () => {
  const text = [...document.querySelectorAll("#terminal-log .term-entry")]
    .map((el) =>
      [
        el.querySelector(".term-cmd")?.textContent,
        el.querySelector(".term-out")?.textContent,
        el.querySelector(".term-code")?.textContent,
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n\n");
  if (text) copyText(text);
});

/* ---------- notes : aperçu, stats, enregistrement visible ---------- */
async function loadNotes() {
  const area = $("#notes-area");
  area.disabled = !state.wsPath;
  area.value = state.wsPath
    ? (await window.castor.storeGet("notes:" + state.wsPath)) || ""
    : "";
  state.notesDirty = false;
  updateNotesUI();
}

function updateNotesUI() {
  const area = $("#notes-area");
  const value = area.value;
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  $("#notes-stats").textContent = `${words} mot${words > 1 ? "s" : ""} · ${value.length} car.`;
  const st = $("#notes-save-status");
  if (!state.wsPath) {
    st.textContent = "Ouvre un chantier pour prendre des notes.";
  } else if (state.notesDirty) {
    st.textContent = "Enregistrement…";
  } else if (value) {
    st.textContent = "Enregistré à " + clockTime(Date.now());
  } else {
    st.textContent = "Note vide";
  }
  if (state.notesMode === "preview" && state.wsPath) {
    $("#notes-preview").innerHTML = renderMarkdown(value || "_Note vide._");
  }
}

$("#notes-area").addEventListener("input", () => {
  if (!state.wsPath) return;
  state.notesDirty = true;
  updateNotesUI();
  clearTimeout(state.notesTimer);
  state.notesTimer = setTimeout(async () => {
    await window.castor.storeSet("notes:" + state.wsPath, $("#notes-area").value);
    state.notesDirty = false;
    updateNotesUI();
  }, 500);
});

$("#notes-mode").addEventListener("click", () => {
  state.notesMode = state.notesMode === "edit" ? "preview" : "edit";
  $("#sp-view-notes").classList.toggle("preview", state.notesMode === "preview");
  $("#notes-mode").textContent = state.notesMode === "preview" ? "Écrire" : "Aperçu";
  updateNotesUI();
});

$("#notes-copy").addEventListener("click", () => {
  const v = $("#notes-area").value;
  if (v) copyText(v);
});

let armedNotes = null;
$("#notes-clear").addEventListener("click", () => {
  if (armedNotes) {
    clearTimeout(armedNotes.timer);
    armedNotes = null;
    const area = $("#notes-area");
    area.value = "";
    if (state.wsPath) {
      window.castor.storeSet("notes:" + state.wsPath, "");
    }
    state.notesDirty = false;
    $("#notes-clear").textContent = "🗑";
    $("#notes-clear").classList.remove("confirm");
    updateNotesUI();
    return;
  }
  $("#notes-clear").textContent = "?";
  $("#notes-clear").classList.add("confirm");
  armedNotes = {
    timer: setTimeout(() => {
      armedNotes = null;
      $("#notes-clear").textContent = "🗑";
      $("#notes-clear").classList.remove("confirm");
    }, 2600),
  };
});

/* copie presse-papiers avec repli (Electron sandbox) */
async function copyText(t) {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = t;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {}
    ta.remove();
    return ok;
  }
}

$("#panel-toggle").addEventListener("click", () => setPanel(!state.panelOpen));
$("#sp-close").addEventListener("click", () => setPanel(false));
document.querySelectorAll(".sp-tab").forEach((btn) =>
  btn.addEventListener("click", () => setPanelTab(btn.dataset.tab))
);
$("#sp-refresh").addEventListener("click", () => {
  if (state.panelTab === "changes") refreshChanges();
  if (state.panelTab === "files") refreshFiles();
});
$("#term-clear").addEventListener("click", () => {
  $("#terminal-log").innerHTML = "";
  $("#terminal-empty").classList.remove("hidden");
  state.termRunning.clear();
  updateTermBadge();
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

let pendingHunks = [];

function renderSplitDiff(p) {
  const body = $("#diff-body");
  body.innerHTML = "";
  pendingHunks = (p.hunks && p.hunks.length ? p.hunks : []).map(() => true);
  if (!pendingHunks.length) {
    body.innerHTML = `<pre class="split-diff__empty">${escapeHtml(p.diff || "(aucune modification)")}</pre>`;
    return;
  }
  for (const [i, h] of p.hunks.entries()) {
    const row = document.createElement("section");
    row.className = "diff-hunk-row selected";
    row.dataset.hunk = String(i);
    const head = document.createElement("header");
    head.className = "diff-hunk-row__head";
    const check = document.createElement("input");
    check.type = "checkbox"; check.checked = true; check.dataset.hunk = String(i);
    check.setAttribute("aria-label", `Sélectionner le hunk ${i + 1}`);
    const label = document.createElement("span");
    label.textContent = `Hunk ${i + 1} · lignes ${h.oldStart}–${h.oldStart + h.oldCount - 1}`;
    head.append(check, label);
    const panes = document.createElement("div"); panes.className = "split-diff__panes";
    const oldPane = document.createElement("pre"); oldPane.className = "split-diff__pane split-diff__pane--old";
    const newPane = document.createElement("pre"); newPane.className = "split-diff__pane split-diff__pane--new";
    oldPane.innerHTML = h.oldSide.map((line, n) => `<span class="diff-line ${h.oldDel[n] ? "diff-line--del" : "diff-line--ctx"}">${escapeHtml(line || " ")}</span>`).join("");
    newPane.innerHTML = h.newSide.map((line, n) => `<span class="diff-line ${h.newAdd[n] ? "diff-line--add" : "diff-line--ctx"}">${escapeHtml(line || " ")}</span>`).join("");
    panes.append(oldPane, newPane); row.append(head, panes); body.appendChild(row);
    check.addEventListener("change", () => { pendingHunks[i] = check.checked; row.classList.toggle("selected", check.checked); updateDiffSummary(); });
  }
  updateDiffSummary();
}

function updateDiffSummary() {
  const total = pendingHunks.length;
  const selected = pendingHunks.filter(Boolean).length;
  $("#diff-summary").textContent = total ? `${selected}/${total} modification${total > 1 ? "s" : ""} sélectionnée${selected > 1 ? "s" : ""}` : "";
}

function showApproval(p) {
  pendingApproval = p.callId;
  $("#diff-icon").innerHTML = p.kind === "command" ? ICONS.term : p.isNew ? ICONS.sparkle : ICONS.pencil;
  $("#diff-title").textContent = p.kind === "command" ? "Commande shell" : p.isNew ? "Nouveau fichier" : "Édition de fichier";
  $("#diff-path").textContent = p.kind === "command" ? `dans ${state.wsName || "le projet"} — ${p.command}` : p.path;
  if (p.kind === "command") { $("#diff-body").innerHTML = `<pre class="split-diff__empty">${escapeHtml("$ " + p.command)}</pre>`; pendingHunks = []; }
  else renderSplitDiff(p);
  $("#diff-modal").classList.remove("hidden");
  $("#diff-reject").focus();
}

function answerApproval(approved) {
  if (!pendingApproval) return;
  window.castor.respondApproval(pendingApproval, approved, approved ? pendingHunks : null);
  pendingApproval = null; pendingHunks = [];
  $("#diff-modal").classList.add("hidden");
  $("#input").focus();
}

$("#diff-all").addEventListener("click", () => {
  const next = pendingHunks.some((x) => !x);
  pendingHunks = pendingHunks.map(() => next);
  document.querySelectorAll("#diff-body input[type=checkbox]").forEach((c, i) => { c.checked = next; c.closest(".diff-hunk-row")?.classList.toggle("selected", next); });
  updateDiffSummary();
});

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
  const files = [...(e.dataTransfer?.files || [])];
  if (!files.length || state.streaming) return;
  const paths = files.map((f) => window.castor.pathForFile(f)).filter(Boolean);
  // un seul élément : tenter d'ouvrir comme chantier (dossier) — comportement historique ;
  // openWorkspacePath échoue pour un fichier simple → pièce jointe
  if (paths.length === 1) {
    const res = await window.castor.openWorkspacePath(paths[0]);
    if (res.ok) {
      applyWorkspace(res);
      refreshFileTree();
      return;
    }
  }
  // fichiers → pièces jointes au prochain message (texte lu, images encodées)
  const res = await window.castor.readAttachments(paths);
  state.attachErrors = res.errors || [];
  for (const a of res.attachments || []) {
    if (state.attachments.length >= 8) {
      state.attachErrors.push("8 pièces jointes maximum");
      break;
    }
    state.attachments.push(a);
  }
  renderAttachments();
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
  if (k === "f") {
    e.preventDefault();
    const s = $("#conv-search");
    s?.focus();
    s?.select();
  }
  if (k === ",") {
    e.preventDefault();
    if (state.activeId) openProviderSettings(state.activeId);
  }
  if (k === "k") {
    e.preventDefault();
    openCmdk();
  }
});

/* ---------- palette de commandes (⌘K) ---------- */
let cmdkSel = 0;

function cmdkActions() {
  const dark = resolveTheme(loadPersisted()) === "dark";
  const actions = [
    { icon: ICONS.sparkle, label: "Nouvelle conversation", hint: "⌘N", run: () => { if (!state.streaming) resetChatView(); } },
    { icon: ICONS.search, label: "Rechercher une conversation", hint: "⌘F", run: () => { const s = $("#conv-search"); s?.focus(); s?.select(); } },
    { icon: ICONS.gear, label: "Changer de modèle / provider", hint: "⌘,", run: () => openProviderSettings(state.activeId) },
    { icon: ICONS.folder, label: "Ouvrir un projet…", hint: "⌘O", run: () => $("#open-workspace").click() },
    { icon: ICONS.clock, label: dark ? "☀ Passer en mode jour" : "🌙 Passer en mode nuit", run: () => toggleTheme() },
    { icon: ICONS.panel, label: state.panelOpen ? "Fermer le panneau latéral" : "Ouvrir le panneau (Changes · Plan · Terminal)", run: () => setPanel(!state.panelOpen) },
    { icon: ICONS.checkList, label: "Mode Build — agent actif", hint: state.chatMode === "build" ? "actif" : "", run: () => setChatMode("build") },
    { icon: ICONS.file, label: "Mode Plan — lecture seule", hint: state.chatMode === "plan" ? "actif" : "", run: () => setChatMode("plan") },
    { icon: ICONS.sparkle, label: "Revoir l'introduction", run: () => openOnboard() },
  ];
  for (const p of state.projects) {
    actions.push({
      icon: ICONS.folder,
      label: "Projet : " + p.name,
      hint: p.path === state.wsPath ? "ouvert" : "",
      run: () => switchToProject(p),
    });
  }
  for (const p of state.providers) {
    actions.push({
      icon: ICONS.gear,
      label: "Provider : " + p.label,
      hint: !p.needsKey || p.configured ? "" : "clé manquante",
      run: () => openProviderSettings(p.id),
    });
  }
  return actions;
}

function openCmdk() {
  if (!$("#cmdk")) return;
  $("#cmdk").classList.remove("hidden");
  const input = $("#cmdk-input");
  input.value = "";
  renderCmdkList("");
  input.focus();
}

function closeCmdk() {
  $("#cmdk").classList.add("hidden");
  $("#input").focus();
}

function renderCmdkList(q) {
  const list = $("#cmdk-list");
  const ql = q.trim().toLowerCase();
  const hits = cmdkActions()
    .filter((a) => !ql || a.label.toLowerCase().includes(ql))
    .slice(0, 9);
  cmdkSel = 0;
  list.innerHTML = "";
  hits.forEach((a, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cmdk-item" + (i === 0 ? " sel" : "");
    const ic = document.createElement("span");
    ic.className = "cmdk-ico";
    ic.innerHTML = a.icon;
    const lb = document.createElement("span");
    lb.textContent = a.label;
    btn.append(ic, lb);
    if (a.hint) {
      const h = document.createElement("small");
      h.textContent = a.hint;
      btn.appendChild(h);
    }
    btn.addEventListener("click", () => {
      closeCmdk();
      a.run();
    });
    li.appendChild(btn);
    list.appendChild(li);
  });
  if (!hits.length) {
    const li = document.createElement("li");
    li.className = "cmdk-empty";
    li.textContent = "Aucune commande.";
    list.appendChild(li);
  }
}

$("#cmdk-input").addEventListener("input", (e) => renderCmdkList(e.target.value));
$("#cmdk-input").addEventListener("keydown", (e) => {
  const items = [...document.querySelectorAll("#cmdk-list .cmdk-item")];
  if (e.key === "Escape") return closeCmdk();
  if (!items.length) return;
  const idx = items.findIndex((it) => it.classList.contains("sel"));
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    const next =
      e.key === "ArrowDown"
        ? (idx + 1) % items.length
        : (idx - 1 + items.length) % items.length;
    items.forEach((it, i) => it.classList.toggle("sel", i === next));
    items[next].scrollIntoView({ block: "nearest" });
  } else if (e.key === "Enter") {
    e.preventDefault();
    items[idx]?.click();
  }
});
$("#cmdk").addEventListener("click", (e) => {
  if (e.target.classList.contains("cmdk__backdrop")) closeCmdk();
});

/* ---------- compétences ---------- */
function renderSkills() {
  const ul = $("#skill-list");
  ul.innerHTML = "";
  $("#skill-count").textContent = state.skills.length;
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

/* ---------- serveurs MCP ---------- */
let state_mcpServers = [];
async function renderMcpList() {
  const ul = $("#mcp-list"); if (!ul) return;
  try { state_mcpServers = await window.castor.listMcpServers(); } catch { state_mcpServers = []; }
  ul.innerHTML = "";
  $("#mcp-count").textContent = String(state_mcpServers.length);
  for (const srv of state_mcpServers) {
    const li = document.createElement("li"); li.className = "skill-item";
    const dot = document.createElement("span"); dot.className = `dot ${srv.status === "running" ? "dot--on" : "dot--off"}`;
    const name = document.createElement("span"); name.style.fontWeight = "600"; name.textContent = srv.id;
    const info = document.createElement("span"); info.style.cssText = "font-size:0.7rem;color:var(--muted);"; info.textContent = `${srv.toolsCount} outil${srv.toolsCount > 1 ? "s" : ""} · ${srv.command}`;
    const del = document.createElement("button"); del.className = "del"; del.textContent = "✕"; del.title = "Supprimer";
    del.addEventListener("click", async () => { await window.castor.removeMcpServer(srv.id); renderMcpList(); });
    li.append(dot, name, info, del); ul.appendChild(li);
  }
}
$("#mcp-form")?.addEventListener("submit", async (e) => {
  e.preventDefault(); const raw = $("#mcp-command").value.trim(); if (!raw) return;
  const parts = raw.split(/\s+/); const command = parts[0]; const args = parts.slice(1);
  await window.castor.addMcpServer({ id: "mcp-" + command.split("/").pop().replace(/@.*?\//, ""), command, args });
  $("#mcp-command").value = "";
  renderMcpList();
});
renderMcpList();

/* suppression en deux clics : le ✕ devient « ? » pendant 2,6 s */
let armedDel = null;
function disarmDel() {
  if (!armedDel) return;
  clearTimeout(armedDel.timer);
  armedDel.btn.textContent = "✕";
  armedDel.btn.classList.remove("confirm");
  armedDel.btn.title = "Supprimer";
  armedDel = null;
}

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
  // la jauge reflète ce qui est réellement envoyé au modèle (fenêtre glissante)
  const used = estTok(state.lastPayloadChars ?? conversationChars());
  const ctx = currentModelContext();
  const pct = Math.min(100, Math.round((used / ctx) * 1000) / 10);
  $("#gauge-fill").style.width = pct + "%";
  $("#gauge-label").textContent =
    `≈${fmtTok(used)} tok · ${pct} % de ${fmtCtx(ctx)}` + (state.lastTruncated ? " · glissante" : "");
  renderUsagePopover(used, pct, ctx);
}

/* ---------- popover détaillé des tokens ---------- */
function renderUsagePopover(used, pct, ctx = currentModelContext()) {
  $("#up-ctx-used").textContent = fmtTok(used) + " tok";
  $("#up-ctx-cap").textContent = ctx.toLocaleString("fr-FR") + " tok";
  const fill = $("#up-gauge-fill");
  fill.style.width = pct + "%";
  fill.style.background =
    pct >= 90
      ? "linear-gradient(90deg, var(--danger), #e2952a)"
      : pct >= 70
        ? "linear-gradient(90deg, var(--accent), var(--accent-2))"
        : "linear-gradient(90deg, var(--sage), var(--accent))";
  $("#up-truncated").classList.toggle("hidden", !state.lastTruncated);

  const last = state.lastReq;
  const lastBox = $("#up-last");
  if (!last) {
    lastBox.textContent = "Aucune requête pour l'instant.";
  } else {
    lastBox.innerHTML = "";
    const rows = [
      ["Durée", fmtDur(last.ms)],
      ["Débit", "~" + fmtTok(last.tps) + " tok/s"],
      ["1ᵉʳ token", last.firstTokenMs != null ? (last.firstTokenMs / 1000).toFixed(2) + " s" : "—"],
      ["Entrée", fmtTok(last.inTok) + (last.cachedTok ? ` (dont ${fmtTok(last.cachedTok)} cache)` : "")],
      ["Sortie", fmtTok(last.outTok) + " tok"],
      ["Modèle", last.model],
    ];
    for (const [k, v] of rows) {
      const row = document.createElement("div");
      row.className = "up-row";
      const span = document.createElement("span");
      span.textContent = k;
      const b = document.createElement("b");
      b.textContent = v;
      b.title = typeof v === "string" ? v : "";
      row.append(span, b);
      lastBox.appendChild(row);
    }
    if (!last.real) {
      const note = document.createElement("small");
      note.className = "up-estim";
      note.textContent = "compteur estimé (l'API n'a pas fourni d'usage)";
      lastBox.appendChild(note);
    }
  }

  $("#up-session-tok").textContent = fmtTok(state.sessionTokens) + " tok";
  $("#up-session-req").textContent = String(state.sessionRequests);
  $("#up-total-tok").textContent = fmtTok(state.usage.totalTokens) + " tok";
  $("#up-total-req").textContent = String(state.usage.requests);

  const hist = $("#up-history");
  hist.innerHTML = "";
  const list = state.reqHistory.slice(0, 8);
  if (!list.length) {
    const li = document.createElement("li");
    li.className = "up-hist-empty";
    li.textContent = "—";
    hist.appendChild(li);
  }
  for (const r of list) {
    const li = document.createElement("li");
    li.className = "up-hist-row";
    li.title = `${r.model} · ${new Date(r.ts).toLocaleString("fr-FR")}`;
    const when = document.createElement("span");
    when.textContent = new Date(r.ts).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const mid = document.createElement("span");
    const short =
      String(r.model || "").length > 24 ? String(r.model).slice(0, 24) + "…" : r.model || "?";
    mid.textContent = short;
    mid.className = "up-hist-model";
    const io = document.createElement("span");
    io.textContent = `↑${fmtTok(r.inTok)} ↓${fmtTok(r.outTok)}${r.cachedTok ? ` ·c${fmtTok(r.cachedTok)}` : ""}`;
    io.className = "up-hist-io";
    li.append(when, mid, io);
    hist.appendChild(li);
  }
}

function fmtTok(n) {
  if (!Number.isFinite(n)) return "0";
  return n >= 10000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

/* ouverture / fermeture du popover */
$("#usage-box").addEventListener("click", (e) => {
  e.stopPropagation();
  renderUsage();
  $("#usage-popover").classList.toggle("hidden");
});
document.addEventListener("click", (e) => {
  const pop = $("#usage-popover");
  if (pop.classList.contains("hidden")) return;
  if (!e.target.closest(".usage-wrap")) pop.classList.add("hidden");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") $("#usage-popover")?.classList.add("hidden");
});

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
      todos.push({ label, key: label.toLowerCase(), done: m[1].toLowerCase() === "x" });
    } else {
      const t = todos.find((t) => t.label === label);
      if (t) t.done = m[1].toLowerCase() === "x" ? true : t.done;
    }
  }
  return todos;
}

function renderTodos(todos) {
  const has = todos.length > 0;
  const badge = $("#todo-badge");
  const done = todos.filter((t) => t.done).length;
  badge.textContent = has ? `${done}/${todos.length}` : "0/0";
  badge.classList.toggle("hidden", !has);
  $("#plan-empty").classList.toggle("hidden", has);
  $("#todo-list").classList.toggle("hidden", !has);
  $("#plan-count").textContent = has ? `${done}/${todos.length}` : "0/0";
  $("#plan-bar").style.width = has
    ? Math.round((done / todos.length) * 100) + "%"
    : "0%";

  if (!has) {
    $("#todo-list").innerHTML = "";
    return;
  }

  // première liste de la session : on ouvre le panneau sur l'onglet Plan
  if (state.streaming && !state.planShownThisStream && !state.panelOpen) {
    state.planShownThisStream = true;
    setPanel(true);
    setPanelTab("plan");
  }

  // diff clé : on ne reconstruit que ce qui change (pas de flash pendant le stream)
  const ul = $("#todo-list");
  const cur = new Map([...ul.children].map((li) => [li.dataset.key, li]));
  const seen = new Set();
  for (const t of todos) {
    seen.add(t.key);
    let li = cur.get(t.key);
    if (!li) {
      li = document.createElement("li");
      li.className = "todo-item new";
      li.dataset.key = t.key;
      const box = document.createElement("span");
      box.className = "box";
      const label = document.createElement("span");
      label.className = "label";
      li.append(box, label);
      ul.appendChild(li);
    }
    li.classList.toggle("done", t.done);
    li.querySelector(".label").textContent = t.label;
    li.querySelector(".box").textContent = t.done ? "✓" : "";
  }
  for (const [k, li] of cur) {
    if (!seen.has(k)) li.remove();
  }
}

$("#plan-collapse").addEventListener("click", () => {
  state.planCollapsed = !state.planCollapsed;
  $("#sp-view-plan").classList.toggle("collapsed", state.planCollapsed);
  $("#plan-collapse").classList.toggle("rotated", state.planCollapsed);
  persist({ planCollapsed: state.planCollapsed });
});

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
        "Tu disposes d'outils : list_dir, read_file, write_file, edit_file, run_command.\n" +
        "Explore le projet avant de modifier. Pour créer un fichier ou le réécrire en entier, " +
        "fournis le contenu complet via write_file ; pour changer une portion précise d'un fichier " +
        "existant, préfère edit_file (oldText exact et unique + newText) — beaucoup plus économe. " +
        "L'utilisateur validera chaque écriture, édition et commande.";
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

  const imgs = state.attachments.filter((a) => a.type === "image").length;
  if (state.attachments.length) {
    s +=
      `\n\n# Pièces jointes au message utilisateur\n` +
      (imgs ? `${imgs} image(s) : utilise la vision pour les décrire, les comparer, extraire du texte ou du code.
` : "") +
      `Les blocs « [Fichier joint : nom — taille] » contiennent le contenu exact du fichier, entre marqueurs début/fin. Appuie-toi dessus pour répondre précisément.`;
  }

  if (state.memory.length) {
    s +=
      "\n\n# Mémoire persistante (faits donnés par l'utilisateur)\n" +
      state.memory.map((m) => `- ${m.text}`).join("\n");
  }

  s += `\n\n# Contexte\nDate : ${new Date().toLocaleDateString("fr-FR")} · Provider : ${p.label} · Modèle : ${$("#model-input").value}`;
  systemPromptChars = s.length;
  return { role: "system", content: s };
}

/* ---------- fenêtre glissante d'historique ----------
   On n'envoie que le système + les messages récents qui tiennent dans le
   budget (75 % de la fenêtre — le reste sert à la réponse). Les 2 derniers
   messages sont toujours conservés, même hors budget. */
const historyBudgetTok = () => Math.floor(currentModelContext() * 0.75);

function buildPayloadMessages() {
  const system = buildSystemMessage();
  const history = state.messages.slice(0, -1); // tout sauf l'assistant en cours
  const budgetChars = historyBudgetTok() * 4;
  const minStart = Math.max(0, history.length - 2); // jamais moins de 2 messages
  let total = system.content.length;
  let start = history.length;
  while (start > 0) {
    const c = history[start - 1].content?.length || 0;
    if (total + c > budgetChars) break;
    total += c;
    start--;
  }
  if (start > minStart) {
    // même hors budget, on garde au moins les 2 derniers messages (coût assumé)
    for (let i = start; i > minStart; i--) total += history[i - 1].content?.length || 0;
    start = minStart;
  }
  const dropped = start;
  if (dropped > 0) {
    system.content +=
      `\n\n# Contexte tronqué\nLes ${dropped} premiers messages de la conversation ne sont plus ` +
      "envoyés (fenêtre glissante) — reste cohérent avec ce qui suit.";
  }
  return { messages: [system, ...history.slice(start)], dropped };
}

/* ---------- chat ---------- */
function makeMessageEl(role) {
  const wrap = document.createElement("div");
  wrap.className = `msg msg--${role}`;
  const av = document.createElement("span");
  av.className = "msg__avatar";
  av.innerHTML = role === "assistant" ? LOGO_SVG : ICONS.user;
  av.title = role === "assistant" ? "Castor" : "Toi";
  const bubble = document.createElement("div");
  bubble.className = "msg__bubble";
  wrap.append(av, bubble);
  return { wrap, bubble };
}

function addMessageEl(role) {
  const { wrap, bubble } = makeMessageEl(role);
  $("#messages").appendChild(wrap);
  return bubble;
}

/* ---------- pièces jointes (chips au-dessus du composer) ---------- */
function fmtBytes(n) {
  return n >= 1024 * 1024 ? (n / 1024 / 1024).toFixed(1) + " Mo" : Math.max(1, Math.round(n / 1024)) + " ko";
}

function renderAttachments() {
  const zone = $("#attach-zone");
  if (!zone) return;
  zone.innerHTML = "";
  zone.classList.toggle("hidden", !state.attachments.length && !state.attachErrors.length);
  for (const [i, a] of state.attachments.entries()) {
    const chip = document.createElement("span");
    chip.className = "attach-chip" + (a.type === "image" ? " attach-chip--img" : "");
    chip.title = a.type === "image" ? `${a.name} — image (vision)` : `${a.name} — ${fmtBytes(a.bytes)}`;
    if (a.type === "image") {
      const thumb = document.createElement("img");
      thumb.src = `data:${a.mime};base64,${a.data}`;
      thumb.alt = a.name;
      chip.appendChild(thumb);
    } else {
      const ic = document.createElement("i");
      ic.className = "icon ico";
      ic.innerHTML = ICONS.file;
      chip.appendChild(ic);
    }
    const nm = document.createElement("span");
    nm.className = "attach-chip__name";
    nm.textContent = a.name;
    chip.appendChild(nm);
    const x = document.createElement("button");
    x.textContent = "✕";
    x.title = "Retirer la pièce jointe";
    x.addEventListener("click", () => {
      state.attachments.splice(i, 1);
      renderAttachments();
    });
    chip.appendChild(x);
    zone.appendChild(chip);
  }
  for (const err of state.attachErrors) {
    const chip = document.createElement("span");
    chip.className = "attach-chip attach-chip--err";
    chip.textContent = err;
    zone.appendChild(chip);
  }
  if (!state.attachments.length) {
    // erreurs seules : elles disparaissent au prochain envoi
    if (state.attachErrors.length) {
      clearTimeout(state.attachErrTimer);
      state.attachErrTimer = setTimeout(() => {
        state.attachErrors = [];
        renderAttachments();
      }, 4000);
    }
  }
}

/* Construit le bloc de contexte des pièces jointes du message utilisateur.
   Documents texte → blocs annotés · Images → data URI (modèles vision). */
function attachmentsToContent(text) {
  const texts = state.attachments.filter((a) => a.type === "text");
  const images = state.attachments.filter((a) => a.type === "image");
  let content = text;
  for (const a of texts) {
    content +=
      `\n\n[Fichier joint : ${a.name} — ${fmtBytes(a.bytes)}]\n` +
      "--- début de " + a.name + " ---\n" +
      a.content +
      "\n--- fin de " + a.name + " ---";
  }
  if (images.length) {
    content +=
      `\n\n[Images jointes : ${images.map((i) => i.name).join(", ")} — décris-les ou exploite-les selon la demande]`;
  }
  return { content, images };
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
  // garde-fou : pas de clé → message clair + réglages, au lieu d'une erreur API absconse
  if (provider?.needsKey && !provider.configured) {
    $(".welcome")?.remove();
    const bubble = addMessageEl("assistant");
    bubble.innerHTML =
      `<span style="color:var(--danger)">⚠ Il manque la clé API ${escapeHtml(provider.label)}.</span><br>` +
      `<small class="msg__meta">Colle-la dans les réglages — elle sera chiffrée par le coffre de l'OS.</small>`;
    openProviderSettings(provider.id);
    return;
  }

  const model = $("#model-input").value.trim() || provider.defaultModel;
  const baseURL = $("#baseurl-input").value.trim();
  persist({
    ["model:" + provider.id]: model,
    ["baseurl:" + provider.id]: baseURL,
  });

  $(".welcome")?.remove();

  const { content: textWithAttachments, images } = attachmentsToContent(text);
  const el = pushMessage("user", textWithAttachments);
  // la bulle affiche le texte + les vignettes ; le contenu complet reste dans l'historique
  el.textContent = textWithAttachments.replace(/\n\n\[Images jointes[^\]]*\]$/, "");
  if (images.length) {
    const gal = document.createElement("span");
    gal.className = "attach-gallery";
    for (const im of images) {
      const thumb = document.createElement("img");
      thumb.src = `data:${im.mime};base64,${im.data}`;
      thumb.alt = im.name;
      thumb.title = im.name;
      gal.appendChild(thumb);
    }
    el.appendChild(gal);
  }
  state.attachments = [];
  state.attachErrors = [];
  renderAttachments();

  const thinking = document.createElement("div");
  thinking.className = "thinking";
  thinking.textContent = `${provider.label} réfléchit…`;
  $("#messages").appendChild(thinking);

  state.messages.push({ role: "assistant", content: "" });
  const bubble = addMessageEl("assistant");

  state.streaming = true;
  state.planShownThisStream = false;
  state.t0 = performance.now();
  state.firstTokenMs = null;
  let chars = 0;
  const sendBtn = $("#send");
  sendBtn.innerHTML =
    '<span class="send-wave" aria-hidden="true"><i></i><i></i><i></i></span>';
  sendBtn.title = "Arrêter la génération (Échap)";
  sendBtn.classList.add("stop");
  sendBtn.disabled = false;
  scrollDown(true); // un nouveau message ramène toujours en bas

  // fenêtre glissante : ne pas exploser la fenêtre de contexte sur les longues conversations
  const payload = buildPayloadMessages();
  state.lastPayloadChars = payload.messages.reduce(
    (n, m) => n + (m.content?.length || 0),
    0
  );
  state.lastTruncated = payload.dropped > 0;

  const trace = document.createElement("div");
  trace.className = "tools-trace";
  $("#messages").appendChild(trace);
  state.currentTrace = trace;

  // seul le dernier message utilisateur porte les images (contenu multimodal) :
  // l'historique reste en texte simple, comme le veut le protocole OpenAI
  let lastUserIdx = -1;
  for (let i = payload.messages.length - 1; i >= 0; i--) {
    if (payload.messages[i].role === "user") {
      lastUserIdx = i;
      break;
    }
  }
  const payloadMsgs = payload.messages.map((m, i) => {
    if (i !== lastUserIdx || m.role !== "user" || !images.length) return m;
    const parts = [];
    const t = m.content.replace(/\n\n\[Images jointes[^\]]*\]$/, "");
    if (t) parts.push({ type: "text", text: t });
    for (const im of images) parts.push({ type: "image_url", image_url: { url: `data:${im.mime};base64,${im.data}` } });
    return { role: "user", content: parts };
  });

  const res = await window.castor.stream({
    providerId: provider.id,
    baseURLOverride: baseURL,
    model,
    messages: payloadMsgs,
    agent: state.chatMode === "build" && Boolean(state.wsPath),
  });
  state.reqId = res.reqId;

  // rendu markdown throttlé : un seul renderMarkdown par frame, même si
  // plusieurs chunks arrivent entre deux frames (les réponses longues ne jankent plus)
  let rafId = null;
  function cancelStreamRender() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }
  function renderStream() {
    const content = state.messages[state.messages.length - 1]?.content || "";
    bubble.innerHTML = renderMarkdown(content);
    renderTodos(parseTodos(content));
    scrollDown();
  }
  function scheduleStreamRender() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      renderStream();
    });
  }

  function onChunk({ delta }) {
    chars += delta.length;
    if (state.firstTokenMs === null) {
      state.firstTokenMs = performance.now() - state.t0;
      thinking.remove();
    }
    state.messages[state.messages.length - 1].content += delta;
    scheduleStreamRender();
  }

  function onEnd({ ms, cancelled, usage }) {
    cancelStreamRender();
    cleanup();
    thinking.remove();
    if (!trace.children.length) trace.remove();
    const content = state.messages[state.messages.length - 1]?.content || "";
    if (content) bubble.innerHTML = renderMarkdown(content); // rendu final (des chunks pouvaient être en attente)

    // usage : compteurs réels de l'API quand elle les fournit (stream_options),
    // sinon estimation locale (~4 caractères par token)
    const real = Boolean(usage);
    const outTok = real
      ? usage.completion_tokens || 0
      : estTok(chars);
    const inTok = real
      ? usage.prompt_tokens || 0
      : estTok(state.lastPayloadChars || Math.max(0, conversationChars() - chars));
    const cachedTok = real ? usage.prompt_tokens_details?.cached_tokens || 0 : 0;
    state.sessionTokens += inTok + outTok;
    state.usage.totalTokens += inTok + outTok;
    state.usage.requests += 1;
    state.sessionRequests += 1;

    const secs = ms / 1000;
    const tps = secs > 0 ? Math.round(outTok / secs) : 0;
    const lastReq = {
      ts: Date.now(),
      model: model || "?",
      provider: provider.id,
      inTok,
      outTok,
      cachedTok,
      ms,
      tps,
      firstTokenMs: state.firstTokenMs,
      real,
    };
    state.lastReq = lastReq;
    state.reqHistory.unshift(lastReq);
    if (state.reqHistory.length > 12) state.reqHistory.pop();
    state.usage.history = (state.usage.history || []);
    state.usage.history.unshift({
      ts: lastReq.ts,
      model: lastReq.model,
      inTok,
      outTok,
      cachedTok,
      ms,
    });
    if (state.usage.history.length > 20) state.usage.history.pop();
    window.castor.storeSet("usage", state.usage);

    if (!content && cancelled) {
      bubble.textContent = "(arrêté)";
      state.messages.pop();
      renderUsage();
      return finish();
    }

    $("#stats").textContent =
      `${(ms / 1000).toFixed(1)} s · ~${tps} tok/s · ↑${fmtTok(inTok)} ↓${fmtTok(outTok)} tok` +
      (cachedTok ? ` · cache ${fmtTok(cachedTok)}` : "") +
      (state.firstTokenMs !== null
        ? ` · 1ᵉʳ token ${(state.firstTokenMs / 1000).toFixed(2)} s`
        : "");
    renderUsage();
    saveActiveConversation();
    finish();
  }

  function onError({ message }) {
    cancelStreamRender(); // un frame en attente ne doit pas écraser le message d'erreur
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
    updateSendState();
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

/* ---------- scroll intelligent ---------- */
function nearBottom() {
  const box = $("#messages");
  return box.scrollHeight - box.scrollTop - box.clientHeight < 48;
}

function scrollDown(force = false) {
  if (!force && !state.stickToBottom) return; // l'utilisateur a remonté : on ne le tire pas
  const box = $("#messages");
  box.scrollTop = box.scrollHeight;
}

$("#messages").addEventListener("scroll", () => {
  state.stickToBottom = nearBottom();
  $("#scroll-bottom").classList.toggle("visible", !state.stickToBottom);
});

$("#scroll-bottom").addEventListener("click", () => {
  state.stickToBottom = true;
  $("#scroll-bottom").classList.remove("visible");
  const box = $("#messages");
  if (typeof box.scrollTo === "function") {
    box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  } else {
    box.scrollTop = box.scrollHeight;
  }
});

/* ---------- markdown riche, rendu par blocs (incrémental) ----------
   Toujours échappé (jamais de HTML brut du modèle). Le rendu découpe la
   source en blocs (code, titres, listes, citations, paragraphes) et ne
   re-rend que les blocs changés : les réponses longues ne jankent plus. */
function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/* highlighting maison (~60 lignes) : commentaires, chaînes, nombres,
   mots-clés et appels de fonction pour js/ts/json/py/sh/css */
const HL_KEYWORDS = {
  js: "const let var function return if else for while class new extends import export from default try catch finally throw async await typeof instanceof of in switch case break continue yield static get set this super null undefined true false delete debugger void do",
  py: "def class return if elif else for while import from as try except finally raise with lambda yield async await pass break continue global nonlocal assert del None True False and or not is in self print",
  sh: "if then else elif fi for while do done case esac function echo exit return export source local cd sudo apt brew npm npx git node python pip curl mkdir rm cp mv cat grep sed awk chmod ls which set",
  css: "important media supports keyframes import from to and not only root var",
};

function codeFamily(lang) {
  const l = (lang || "").toLowerCase();
  if (/^(js|ts|jsx|tsx|mjs|cjs|javascript|typescript|json)$/.test(l)) return "js";
  if (/^(py|python)$/.test(l)) return "py";
  if (/^(sh|bash|zsh|shell|console)$/.test(l)) return "sh";
  if (l === "css") return "css";
  return null;
}

function highlight(code, family) {
  const kws = new Set((HL_KEYWORDS[family] || HL_KEYWORDS.js).split(" "));
  const re =
    /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][\w$]*\b)/g;
  let out = "";
  let last = 0;
  let m;
  while ((m = re.exec(code))) {
    out += escapeHtml(code.slice(last, m.index));
    const [tok, com, str, num, word] = m;
    if (com) {
      // '#' n'est un commentaire qu'en python / shell
      if (com.startsWith("#") && family !== "py" && family !== "sh") {
        out += escapeHtml(tok);
      } else {
        out += `<span class="tok-com">${escapeHtml(tok)}</span>`;
      }
    } else if (str) {
      out += `<span class="tok-str">${escapeHtml(tok)}</span>`;
    } else if (num) {
      out += `<span class="tok-num">${escapeHtml(tok)}</span>`;
    } else if (word) {
      const isFn = code[re.lastIndex] === "(";
      if (kws.has(word)) out += `<span class="tok-kw">${escapeHtml(tok)}</span>`;
      else if (isFn) out += `<span class="tok-fn">${escapeHtml(tok)}</span>`;
      else out += escapeHtml(tok);
    }
    last = re.lastIndex;
  }
  out += escapeHtml(code.slice(last));
  return out;
}

/* inline : gras, italique, code, liens http(s) uniquement */
function mdInline(s) {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" title="$2">$1</a>'
    );
}

/* découpe la source en blocs typés */
function mdBlocks(src) {
  const blocks = [];
  const parts = src.split(/```/);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      const nl = parts[i].indexOf("\n");
      const lang = nl >= 0 ? parts[i].slice(0, nl).trim() : "";
      const code = nl >= 0 ? parts[i].slice(nl + 1) : parts[i];
      blocks.push({ type: "code", lang, code, raw: "```" + parts[i] });
      continue;
    }
    for (const chunk of parts[i].split(/\n{2,}/)) {
      if (!chunk.trim()) continue;
      blocks.push({ type: "text", raw: chunk });
    }
  }
  return blocks;
}

function renderTextBlock(chunk) {
  const lines = chunk.split("\n");
  // titre # .. ####
  const h = chunk.match(/^(#{1,4})\s+(.+)$/);
  if (h && lines.length === 1) {
    const lvl = Math.min(h[1].length + 2, 5); // h3..h5 dans le chat
    return `<h${lvl} class="md-h">${mdInline(h[2])}</h${lvl}>`;
  }
  // filet horizontal
  if (chunk.replace(/[\s\-*_=]/g, "") === "" && /[-*_=]{3}/.test(chunk)) return "<hr />";
  // citation
  if (lines.every((l) => /^\s*>/.test(l))) {
    return `<blockquote>${lines
      .map((l) => mdInline(l.replace(/^\s*>\s?/, "")))
      .join("<br />")}</blockquote>`;
  }
  // listes (puces / numérotées / cases à cocher)
  const isUl = lines.every((l) => /^\s*[-*+]\s+/.test(l));
  const isOl = lines.every((l) => /^\s*\d+[.)]\s+/.test(l));
  if ((isUl || isOl) && lines.length) {
    const tag = isUl ? "ul" : "ol";
    const items = lines
      .map((l) => {
        const body = l.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "");
        const todo = body.match(/^\[([ xX])\]\s+(.*)$/);
        if (todo) {
          return `<li class="md-todo ${todo[1].toLowerCase() === "x" ? "done" : ""}">${
            todo[1].toLowerCase() === "x" ? "☑" : "☐"
          } ${mdInline(todo[2])}</li>`;
        }
        return `<li>${mdInline(body)}</li>`;
      })
      .join("");
    return `<${tag} class="md-list">${items}</${tag}>`;
  }
  return `<p>${chunk.split("\n").map(mdInline).join("<br />")}</p>`;
}

function renderCodeBlock(b) {
  const fam = codeFamily(b.lang);
  const body = fam ? highlight(b.code, fam) : escapeHtml(b.code);
  return `<pre data-lang="${escapeHtml(b.lang || "")}"><code>${body}</code></pre>`;
}

function blockHtml(b) {
  return b.type === "code" ? renderCodeBlock(b) : renderTextBlock(b.raw);
}

/* rendu incrémental : un bloc inchangé n'est jamais re-rendu ; seul le
   dernier bloc (en pleine écriture pendant le stream) est refait */
function renderMarkdownInto(el, src) {
  const blocks = mdBlocks(src);
  const kids = el.children;
  while (kids.length > blocks.length) kids[kids.length - 1].remove();
  blocks.forEach((b, i) => {
    const isLast = i === blocks.length - 1;
    const node = kids[i];
    if (!isLast && node && node.__raw === b.raw) return; // inchangé → rien à faire
    const html = blockHtml(b);
    if (!isLast && node && node.__html === html) {
      node.__raw = b.raw;
      return;
    }
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const fresh = tmp.firstChild;
    if (!fresh) {
      if (node) node.remove();
      return;
    }
    fresh.__raw = b.raw;
    fresh.__html = html;
    if (node) el.replaceChild(fresh, node);
    else el.appendChild(fresh);
  });
}

/* version string (aperçu des notes, …) */
function renderMarkdown(src) {
  return mdBlocks(src)
    .map(blockHtml)
    .join("");
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
  updateSendState();
  send(text);
}

// bouton Envoyer inactif tant que le champ est vide (sauf pendant un stream : ⏹)
function updateSendState() {
  $("#send").disabled = !state.streaming && !$("#input").value.trim();
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
  updateSendState();
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

/* regroupement des conversations par jour */
function dayBucketLabel(ts) {
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(new Date(ts))) / 86400000);
  if (diffDays <= 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return "7 derniers jours";
  return "Plus ancien";
}

function renderConvList() {
  const ul = $("#conv-list");
  ul.innerHTML = "";
  // chaque projet voit son espace : les conversations sont regroupées par chantier
  const bucket = state.conversations.filter(
    (c) => (c.projectId || null) === (state.activeProjectId || null)
  );
  const nbActive = bucket.filter((c) => !c.archived).length;
  const nbArchived = bucket.length - nbActive;
  $("#conv-count").textContent = String(bucket.length);
  $("#conv-nb-active").textContent = String(nbActive);
  $("#conv-nb-archived").textContent = String(nbArchived);

  const q = state.convSearch.toLowerCase();
  const visible = bucket
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
        : state.activeProjectId
          ? "Aucune conversation sur ce chantier."
          : "Tes conversations apparaîtront ici.";
    ul.appendChild(li);
    return;
  }

  let lastDay = null;
  for (const c of visible) {
    // en-tête de groupe quand on change de jour
    const day = dayBucketLabel(c.updatedAt);
    if (day !== lastDay) {
      lastDay = day;
      const head = document.createElement("li");
      head.className = "conv-day";
      head.textContent = day;
      ul.appendChild(head);
    }
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
    arch.innerHTML = c.archived ? ICONS.restore : ICONS.archive;
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
      if (armedDel?.id === c.id) {
        disarmDel();
        state.conversations = state.conversations.filter((x) => x.id !== c.id);
        await window.castor.storeSet("conversations", state.conversations);
        if (state.activeConvId === c.id) resetChatView();
        renderConvList();
        return;
      }
      disarmDel();
      del.textContent = "?";
      del.classList.add("confirm");
      del.title = "Cliquer encore pour supprimer définitivement";
      armedDel = { id: c.id, btn: del, timer: setTimeout(disarmDel, 2600) };
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
      projectId: state.activeProjectId || null,
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
  disarmDel();

  const box = $("#messages");
  renderConversationWindow();
  const lastAssistant = [...state.messages].reverse().find((m) => m.role === "assistant");
  renderTodos(parseTodos(lastAssistant?.content || ""));
  scrollDown(true);
  $("#input").focus();

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
  state.lastWrite = null; // l'annulation ne survit pas au changement de conversation
  renderUndoButton();
  $("#messages").innerHTML = welcomeHTML();
  $("#stats").textContent = "";
  const p = currentProvider();
  $("#chat-title").textContent = p ? `Castor · ${p.label}` : "Nouvelle conversation";
  state.planShownThisStream = false;
  renderTodos([]);
  renderConvList();
  renderUsage();
  $("#input").focus();
  updateSendState();
}

$("#new-chat").addEventListener("click", resetChatView);

/* ---------- fenêtrage des messages (conversations très longues) ----------
   On n'affiche que les 60 derniers messages ; un bouton remonte les
   anciens par lots en conservant la position de scroll. */
const MSG_WINDOW = 60;
let renderedFrom = 0;

function renderConversationWindow() {
  const box = $("#messages");
  box.innerHTML = "";
  const total = state.messages.length;
  renderedFrom = Math.max(0, total - MSG_WINDOW);
  if (renderedFrom > 0) {
    const more = document.createElement("button");
    more.className = "load-earlier";
    more.addEventListener("click", loadEarlier);
    box.appendChild(more);
    updateLoadEarlierLabel(more);
  }
  for (let i = renderedFrom; i < total; i++) {
    const m = state.messages[i];
    const { wrap, bubble } = makeMessageEl(m.role);
    if (m.content) renderMarkdownInto(bubble, m.content);
    box.appendChild(wrap);
  }
}

function updateLoadEarlierLabel(btn) {
  const n = renderedFrom;
  btn.textContent = `↑ Charger ${n} message${n > 1 ? "s" : ""} plus ancien${n > 1 ? "s" : ""}`;
}

function loadEarlier() {
  const box = $("#messages");
  const newFrom = Math.max(0, renderedFrom - MSG_WINDOW);
  if (newFrom === renderedFrom) return;
  const prevH = box.scrollHeight;
  const btn = box.querySelector(".load-earlier");
  const anchor = btn ?? box.firstChild;
  for (let i = renderedFrom - 1; i >= newFrom; i--) {
    const m = state.messages[i];
    const { wrap, bubble } = makeMessageEl(m.role);
    if (m.content) renderMarkdownInto(bubble, m.content);
    box.insertBefore(wrap, anchor);
  }
  renderedFrom = newFrom;
  if (btn) {
    if (renderedFrom > 0) updateLoadEarlierLabel(btn);
    else btn.remove();
  }
  box.scrollTop += box.scrollHeight - prevH;
}

function welcomeHTML() {
  return `
    <div class="welcome">
      <span class="welcome__logo">${LOGO_SVG}</span>
      <h2>Salut, je suis Castor.</h2>
      <p>Choisis un provider et un projet, tape <code>/</code> pour tes compétences,
         et donne-moi un chantier. Ce que je fais s'affiche en liste.</p>
      <div class="welcome__hints">
        <code>/review ce composant</code>
        <code>/tests pour ma fonction parse()</code>
        <code>édite la fonction parse() dans utils.js</code>
      </div>
      <div class="welcome__keys">
        <span><kbd>⌘K</kbd> palette de commandes</span>
        <span><kbd>⌘N</kbd> nouvelle conversation</span>
        <span><kbd>⌘O</kbd> ouvrir un chantier</span>
        <span>glisse un dossier ou des fichiers dans la fenêtre</span>
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

/* ---------- synchronisation multi-postes ---------- */
function initSync() {
  $("#sync-export")?.addEventListener("click", async () => {
    const res = await window.castor.exportData();
    if (res.ok) alert(`Exporté ${res.count} sections vers :\n${res.path}`);
    else if (res.error) alert(`Erreur : ${res.error}`);
  });
  $("#sync-import")?.addEventListener("click", async () => {
    const res = await window.castor.importData();
    if (res.ok) { alert(`Importé ${res.count} éléments. Redémarre l'app pour tout charger.`); location.reload(); }
    else if (res.error) alert(`Erreur : ${res.error}`);
  });
}
initSync();

/* ---------- assistant IA embarqué (Castor Bot) ---------- */
const BOT_RESPONSES = {
  "": "Tape /help pour la liste des commandes, ou pose-moi une question sur ton projet.",
  help: {
    title: "Commandes disponibles",
    lines: ["/help — afficher cette aide", "/roadmap — état du chantier Castor", "/astuce — une astuce aléatoire pour ton workflow", "/memory — mémoire persistante", "/usage — consommation de tokens", "Tu peux aussi me poser une question libre sur ton projet."],
  },
  roadmap: {
    title: "🦫 Roadmap Castor",
    lines: [
      "✅ Agents planifiés — agent nocturne configuré", "✅ Diff côte à côte — validation hunk par hunk",
      "✅ Assistant embarqué — tu me parles directement", "✅ Sync multi-postes — export / import JSON",
      "🔧 Serveurs MCP — protocole JSON-RPC en cours", "💡 Thèmes personnalisables — en exploration",
      "▸ rdv sur castor/avancement pour le suivi complet"
    ],
  },
  astuce: {
    title: "💡 Astuce du castor",
    lines: [
      "💡 Tape / avant ton message pour activer une compétence (review, tests, explique…).",
      "💡 Glisse un dossier dans la fenêtre pour ouvrir un chantier instantanément.",
      "💡 Le bouton ⏱ dans la sidebar te permet de programmer un agent autonome.",
      "💡 Active le mode « Plan » pour que le castor analyse sans rien modifier.",
      "💡 Exporte tes données régulièrement pour les garder synchronisées entre postes."
    ],
  },
};

function botReply(input) {
  const q = input.trim().toLowerCase();
  if (!q) return BOT_RESPONSES[""];
  const r = BOT_RESPONSES[q];
  if (r) return `${r.title}\n\n${r.lines.join("\n")}`;
  if (q === "memory") {
    const mem = state.memory || [];
    return mem.length ? `Mémoire : ${mem.length} fait${mem.length > 1 ? "s" : "s"} enregistré${mem.length > 1 ? "s" : "s"}.\n\n${mem.slice(0, 5).map((m) => "• " + (m.text || m).slice(0, 80)).join("\n")}` : "Mémoire vide — utilise la section Outils pour ajouter des faits.";
  }
  if (q === "usage") {
    const u = state.usage || {};
    return `Session : ${state.sessionTokens || 0} tok, ${state.sessionRequests || 0} requêtes.\nCumul : ${u.totalTokens || 0} tok, ${u.requests || 0} requêtes.`;
  }
  return `Je ne comprends pas « ${input.trim().slice(0, 40)} ». Tape /help pour la liste des commandes.`;
}

function botMessage(text, role) {
  const wrap = $("#castor-bot-messages");
  if (!wrap) return;
  const el = document.createElement("div");
  el.className = `castor-bot__msg castor-bot__msg--${role || "bot"}`;
  el.textContent = text;
  wrap.appendChild(el);
  wrap.scrollTop = wrap.scrollHeight;
}

function initCastorBot() {
  const toggle = $("#castor-bot-toggle");
  const panel = $("#castor-bot");
  const close = $("#castor-bot-close");
  const input = $("#castor-bot-input");
  const send = $("#castor-bot-send");
  if (!toggle || !panel) return;
  toggle.addEventListener("click", () => { panel.classList.toggle("hidden"); if (!panel.classList.contains("hidden")) { input.focus(); botMessage("Salut ! Je suis ton assistant Castor. Tape /help pour commencer.", "bot"); } });
  close?.addEventListener("click", () => panel.classList.add("hidden"));
  function sendBot() {
    const val = input.value.trim(); if (!val) return;
    botMessage(val, "user"); input.value = "";
    const reply = botReply(val);
    setTimeout(() => botMessage(reply, "bot"), 120);
  }
  send?.addEventListener("click", sendBot);
  input?.addEventListener("keydown", (e) => { if (e.key === "Enter") sendBot(); });
}
initCastorBot();

/* ---------- agents planifiés ---------- */
const jobScheduleLabel = (s) => {
  if (!s) return "";
  if (s.type === "nightly") return `Chaque nuit à ${String(s.hour).padStart(2, "0")}:${String(s.minute).padStart(2, "0")}`;
  if (s.type === "hourly") return `Chaque heure · minute ${String(s.minute).padStart(2, "0")}`;
  return `Toutes les ${s.minutes} min`;
};
const jobNextLabel = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso); if (Number.isNaN(d.getTime())) return "—";
  const diff = d - new Date();
  if (diff < 60_000) return "à l'instant";
  if (diff < 3_600_000) return `dans ${Math.max(1, Math.round(diff / 60_000))} min`;
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

function renderJobs() {
  const ul = $("#job-list"); if (!ul) return;
  ul.innerHTML = "";
  const jobs = state.jobs || [];
  $("#job-count").textContent = String(jobs.length);
  $("#job-count").classList.toggle("hidden", !jobs.length);
  $("#job-empty").classList.toggle("hidden", Boolean(jobs.length));
  for (const job of jobs) {
    const li = document.createElement("li"); li.className = `job-item${job.enabled ? "" : " job-item--off"}`;
    const top = document.createElement("div"); top.className = "job-item__top";
    const dot = document.createElement("span"); dot.className = `job-item__dot${job.running ? " job-item__dot--running" : ""}`;
    const name = document.createElement("strong"); name.textContent = job.name || "Agent sans nom";
    const toggle = document.createElement("button"); toggle.className = "job-toggle"; toggle.textContent = job.enabled ? "ON" : "OFF"; toggle.title = "Activer / désactiver";
    toggle.addEventListener("click", async () => { state.jobs = await window.castor.toggleJob(job.id, !job.enabled); renderJobs(); });
    top.append(dot, name, toggle);
    const meta = document.createElement("small"); meta.textContent = job.running ? "En cours…" : `${jobScheduleLabel(job.schedule)} · ${jobNextLabel(job.nextRunAt)}`;
    if (job.lastStatus) {
      const result = document.createElement("span"); result.className = `job-item__result job-item__result--${job.lastStatus}`;
      result.textContent = job.lastStatus === "ok" ? "✓ dernier cycle réussi" : job.lastStatus === "cancelled" ? "× interrompu" : "! dernier cycle en erreur";
      result.title = job.lastSummary || job.lastError || ""; li.appendChild(result);
    }
    const actions = document.createElement("div"); actions.className = "job-item__actions";
    const run = document.createElement("button"); run.className = "job-action"; run.textContent = job.running ? "Stop" : "▶"; run.title = job.running ? "Arrêter" : "Lancer maintenant";
    run.addEventListener("click", async () => { if (job.running) await window.castor.cancelJob(job.id); else await window.castor.runJob(job.id); });
    const edit = document.createElement("button"); edit.className = "job-action"; edit.textContent = "✎"; edit.title = "Modifier"; edit.addEventListener("click", () => openJobModal(job));
    const del = document.createElement("button"); del.className = "job-action job-action--danger"; del.textContent = "×"; del.title = "Supprimer"; del.addEventListener("click", async () => { await window.castor.deleteJob(job.id); });
    actions.append(run, edit, del); li.append(top, meta, actions); ul.appendChild(li);
  }
}

function fillJobForm(job = null) {
  $("#job-name").value = job?.name || ""; $("#job-prompt").value = job?.prompt || "";
  const s = job?.schedule || { type: "nightly", hour: 2, minute: 0, minutes: 30 };
  $("#job-schedule-type").value = s.type; $("#job-hour").value = `${String(s.hour ?? 2).padStart(2, "0")}:${String(s.minute ?? 0).padStart(2, "0")}`; $("#job-minute").value = s.minute ?? 0; $("#job-interval").value = s.minutes ?? 30;
  $("#job-provider").innerHTML = state.providers.map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.label)}</option>`).join("");
  $("#job-provider").value = job?.providerId || state.activeId || state.providers[0]?.id || "";
  $("#job-model").value = job?.model || "";
  $("#job-auto-approve").checked = Boolean(job?.autoApprove);
  $("#job-project").innerHTML = state.projects.map((p) => `<option value="${escapeHtml(p.path)}">${escapeHtml(p.name)}</option>`).join("");
  if (job?.wsPath) $("#job-project").value = job.wsPath;
  updateJobScheduleFields();
}
function updateJobScheduleFields() {
  const type = $("#job-schedule-type").value;
  $("#job-hour-wrap").classList.toggle("hidden", type !== "nightly"); $("#job-minute-wrap").classList.toggle("hidden", type !== "hourly"); $("#job-interval-wrap").classList.toggle("hidden", type !== "interval");
}
function openJobModal(job = null) { state.editingJobId = job?.id || null; $("#job-modal-title").textContent = job ? "Modifier l'agent" : "Programmer un agent"; fillJobForm(job); $("#job-form-error").textContent = ""; $("#job-modal").classList.remove("hidden"); $("#job-name").focus(); }
function closeJobModal() { $("#job-modal").classList.add("hidden"); state.editingJobId = null; }

$("#add-job").addEventListener("click", () => openJobModal()); $("#job-cancel").addEventListener("click", closeJobModal); $("#job-schedule-type").addEventListener("change", updateJobScheduleFields);
$("#job-modal").addEventListener("click", (e) => { if (e.target.classList.contains("diff-modal__backdrop")) closeJobModal(); });
$("#job-form").addEventListener("submit", async (e) => {
  e.preventDefault(); const name = $("#job-name").value.trim(); const prompt = $("#job-prompt").value.trim(); const project = $("#job-project").value;
  if (!name || !prompt || !project) { $("#job-form-error").textContent = "Nom, consigne et projet sont obligatoires."; return; }
  const type = $("#job-schedule-type").value; const time = $("#job-hour").value.split(":");
  const old = state.jobs.find((j) => j.id === state.editingJobId);
  const job = { ...(old || {}), id: state.editingJobId, name, prompt, providerId: $("#job-provider").value, model: $("#job-model").value.trim(), wsPath: project, autoApprove: $("#job-auto-approve").checked, schedule: { type, hour: Number(time[0] || 2), minute: type === "hourly" ? Number($("#job-minute").value) : Number(time[1] || 0), minutes: Number($("#job-interval").value || 30) }, enabled: old?.enabled ?? true };
  state.jobs = await window.castor.saveJob(job); renderJobs(); closeJobModal();
});
window.castor.onJobsUpdated((jobs) => { state.jobs = jobs || []; renderJobs(); });
window.castor.onJobNotification((n) => { if (n?.body) { const el = $("#job-empty"); if (el) el.title = n.body; } });

/* ---------- sections repliables de la sidebar ---------- */
function applySectionCollapsed(sec, collapsed) {
  sec.classList.toggle("collapsed", collapsed);
  const head = sec.querySelector(".sb-section__head");
  if (head) head.setAttribute("aria-expanded", String(!collapsed));
}

function initSections() {
  document.querySelectorAll(".sb-section[data-collapsible]").forEach((sec) => {
    const name = sec.dataset.collapsible;
    const stored = loadPersisted()["sec:" + name];
    const collapsed =
      stored != null
        ? stored
        : sec.dataset.defaultCollapsed === "true";
    applySectionCollapsed(sec, collapsed);
    sec.querySelector(".sb-section__head").addEventListener("click", () => {
      const now = sec.classList.contains("collapsed");
      applySectionCollapsed(sec, !now);
      persist({ ["sec:" + name]: !now });
    });
  });
}

/* ---------- boot ---------- */
(async function boot() {
  const info = await window.castor.appInfo?.();
  state.platform = info?.platform || null;
  state.version = info?.version ? "v" + info.version : "";
  $("#app-version").textContent = state.version;
  $("#app-version").title = "Clique pour vérifier les mises à jour";
  document.querySelectorAll(".beaver-slot").forEach((el) => (el.innerHTML = LOGO_SVG));

  state.jobs = (await window.castor.listJobs?.()) || [];
  renderJobs();

  state.skills = (await window.castor.storeGet("skills")) || DEFAULT_SKILLS;
  if (!(await window.castor.storeGet("skills"))) {
    await window.castor.storeSet("skills", state.skills);
  }
  state.memory = (await window.castor.storeGet("memory")) || [];
  state.usage = (await window.castor.storeGet("usage")) || {
    totalTokens: 0,
    requests: 0,
    history: [],
  };
  if (!Array.isArray(state.usage.history)) state.usage.history = [];
  // l'historique persisté alimente le popover dès le lancement
  state.reqHistory = state.usage.history.map((h) => ({
    ts: h.ts,
    model: h.model || "?",
    provider: null,
    inTok: h.inTok || 0,
    outTok: h.outTok || 0,
    cachedTok: h.cachedTok || 0,
    ms: h.ms || 0,
    tps: 0,
    firstTokenMs: null,
    real: false,
  }));

  await loadConversations();
  state.projects = (await window.castor.storeGet("projects")) || [];
  const ws = await window.castor.restoreWorkspace();
  if (ws.ok) {
    applyWorkspace(ws);
    refreshFileTree();
  }
  renderProjects();

  const prefs2 = await loadPersisted();
  applyTheme(resolveTheme(prefs2));
  setChatMode(prefs2.chatMode === "plan" ? "plan" : "build");
  state.planCollapsed = Boolean(prefs2.planCollapsed);
  $("#sp-view-plan").classList.toggle("collapsed", state.planCollapsed);
  $("#plan-collapse").classList.toggle("rotated", state.planCollapsed);
  if (prefs2.panelOpen) {
    setPanel(true);
    setPanelTab(state.panelTab);
  }

  initSections();
  initResizers();
  renderConvList();
  renderProjects();
  renderSkills();
  renderMemory();
  renderUsage();
  updateSendState();
  initProviders();
  window.castor.onUpdateStatus?.(renderUpdate);
  $("#input").focus();
})();
