/* context.js — État partagé de la CLI, encapsulé derrière une interface propre.

   Chaque module importe ctx et accède aux données via les getters.
   Les mutations passent par les setters dédiées (qui gèrent la persistance). */

const store = require("./store");
const { PROVIDERS } = require("./providers");

const VERSION = "0.1.0";

/* ---------- état interne ---------- */
const _state = {
  cfg: store.loadConfig(),
  memory: store.loadMemory(),
  skills: store.loadSkills(),
  stickySkill: null,
  messages: [],
  lastTodos: [],
  abortCtrl: null,
  toolsEnabled: true,
  currentSessionName: null,
};

/* ---------- getters ---------- */
const cfg = () => _state.cfg;
const memory = () => _state.memory;
const skills = () => _state.skills;
const stickySkill = () => _state.stickySkill;
const messages = () => _state.messages;
const lastTodos = () => _state.lastTodos;
const abortCtrl = () => _state.abortCtrl;
const toolsEnabled = () => _state.toolsEnabled;
const currentSessionName = () => _state.currentSessionName;

/* ---------- setters ---------- */
function setAbortCtrl(ctrl) { _state.abortCtrl = ctrl; }
function setToolsEnabled(v) { _state.toolsEnabled = v; }
function setStickySkill(s) { _state.stickySkill = s; }
function setLastTodos(t) { _state.lastTodos = t; }
function setCurrentSessionName(n) { _state.currentSessionName = n; }

function setMessages(m) { _state.messages = m; }
function pushMessage(msg) { _state.messages.push(msg); }
function popMessage() { return _state.messages.pop(); }
function trimMessages(max = 40) {
  if (_state.messages.length > max) _state.messages = _state.messages.slice(-max);
}

function addMemoryEntry(text) {
  _state.memory.push({ id: Date.now(), text });
  store.saveMemory(_state.memory);
}
function setMemory(m) {
  _state.memory = m;
  store.saveMemory(_state.memory);
}

/* ---------- providers / modèle ---------- */
function provider() {
  return PROVIDERS.find((p) => p.id === _state.cfg.provider) || PROVIDERS[0];
}
function currentModel() {
  return _state.cfg.model || provider().defaultModel;
}

/* ---------- config ---------- */
function saveConfig() { store.saveConfig(_state.cfg); }
function setProvider(id) {
  _state.cfg.provider = id;
  _state.cfg.model = null;
  saveConfig();
}
function setModel(m) {
  _state.cfg.model = m;
  saveConfig();
}
function setKey(key) {
  _state.cfg.keys[_state.cfg.provider] = key;
  saveConfig();
}
function usageInc(tokens) {
  _state.cfg.usage.requests += 1;
  _state.cfg.usage.totalTokens += tokens;
  saveConfig();
}

/* ---------- sessions ---------- */
function saveSession(name) {
  const saved = store.saveSession(name, {
    messages: _state.messages,
    todos: _state.lastTodos,
    provider: provider().id,
    model: currentModel(),
  });
  _state.currentSessionName = saved;
  return saved;
}
function loadSession(name) {
  const session = store.loadSession(name);
  if (!session) return null;
  _state.messages = session.messages || [];
  _state.lastTodos = session.todos || [];
  _state.currentSessionName = session.name;
  if (session.provider) {
    _state.cfg.provider = session.provider;
    saveConfig();
  }
  if (session.model) _state.cfg.model = session.model;
  return session;
}
function autoSessionName() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `session-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

module.exports = {
  VERSION,
  PROVIDERS,
  // getters
  cfg, memory, skills, stickySkill, messages, lastTodos,
  abortCtrl, toolsEnabled, currentSessionName,
  // setters
  setAbortCtrl, setToolsEnabled, setStickySkill, setLastTodos,
  setCurrentSessionName, setMessages, pushMessage, popMessage, trimMessages,
  // memory
  addMemoryEntry, setMemory,
  // providers / model
  provider, currentModel,
  // config
  saveConfig, setProvider, setModel, setKey, usageInc,
  // sessions
  saveSession, loadSession, autoSessionName,
};
