/* Persistance dans ~/.castor/ : config, mémoire, compétences. */
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(process.env.HOME || process.env.USERPROFILE, ".castor");
const CONFIG = path.join(DIR, "config.json");
const MEMORY = path.join(DIR, "memory.json");
const SKILLS = path.join(DIR, "skills.json");
const SESSIONS_DIR = path.join(DIR, "sessions");

function ensureDir() {
  fs.mkdirSync(DIR, { recursive: true, mode: 0o700 });
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

/* 0o600 : la config contient des clés API — lisible uniquement par l'utilisateur */
function writeJson(file, data) {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), { mode: 0o600 });
  try {
    fs.chmodSync(file, 0o600);
  } catch {
    /* best effort sur les systèmes sans permissions POSIX */
  }
}

const DEFAULT_SKILLS = [
  { name: "review", body: "Relis le code fourni comme un reviewer senior : points bloquants d'abord, puis suggestions concrètes avec extraits corrigés." },
  { name: "tests", body: "Propose des tests couvrant les cas limites du code fourni, prêts à coller dans le projet." },
  { name: "explique", body: "Explique pas à pas, avec une analogie simple, puis un résumé en 3 points." },
];

function loadConfig() {
  const cfg = readJson(CONFIG, {});
  /* on préserve les champs inconnus (ex. onboarded) tout en garantissant
     les valeurs par défaut des champs connus */
  return {
    ...cfg,
    onboarded: Boolean(cfg.onboarded),
    provider: cfg.provider || "openrouter",
    model: cfg.model ?? null, // null = defaultModel du provider
    keys: cfg.keys || {},
    usage: cfg.usage || { requests: 0, totalTokens: 0 },
  };
}

const saveConfig = (cfg) => writeJson(CONFIG, cfg);
const loadMemory = () => readJson(MEMORY, []);
const saveMemory = (m) => writeJson(MEMORY, m);

function loadSkills() {
  let s = readJson(SKILLS, null);
  if (!s) {
    s = DEFAULT_SKILLS;
    saveSkills(s);
  }
  return s;
}
const saveSkills = (s) => writeJson(SKILLS, s);

/* ---------- sessions ---------- */
function ensureSessionsDir() {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true, mode: 0o700 });
}

/**
 * Sauvegarde une session.
 * @param {string} name - nom (sera sanitisé en nom de fichier)
 * @param {{ messages: Array, provider: string, model: string, todos: Array }} data
 */
function saveSession(name, data) {
  ensureSessionsDir();
  const safe = name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
  const file = path.join(SESSIONS_DIR, `${safe}.json`);
  const session = {
    name: safe,
    created: new Date().toISOString(),
    provider: data.provider || "",
    model: data.model || "",
    messages: data.messages || [],
    todos: data.todos || [],
  };
  writeJson(file, session);
  return safe;
}

/** Charge une session par nom. Renvoie null si introuvable. */
function loadSession(name) {
  const safe = name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
  const file = path.join(SESSIONS_DIR, `${safe}.json`);
  return readJson(file, null);
}

/** Liste les sessions, triées par date décroissante. */
function listSessions() {
  ensureSessionsDir();
  try {
    const files = fs.readdirSync(SESSIONS_DIR).filter((f) => f.endsWith(".json"));
    return files
      .map((f) => {
        const data = readJson(path.join(SESSIONS_DIR, f), null);
        if (!data) return null;
        return {
          name: data.name || f.replace(".json", ""),
          created: data.created || "",
          provider: data.provider || "",
          model: data.model || "",
          messageCount: (data.messages || []).length,
          /* résumé : premier message utilisateur tronqué */
          summary: (data.messages || []).find((m) => m.role === "user")?.content?.slice(0, 60) || "(vide)",
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b.created > a.created ? 1 : -1));
  } catch {
    return [];
  }
}

/** Supprime une session. */
function deleteSession(name) {
  const safe = name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
  const file = path.join(SESSIONS_DIR, `${safe}.json`);
  try {
    fs.unlinkSync(file);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  DIR,
  loadConfig,
  saveConfig,
  loadMemory,
  saveMemory,
  loadSkills,
  saveSkills,
  saveSession,
  loadSession,
  listSessions,
  deleteSession,
};
