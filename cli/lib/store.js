/* Persistance dans ~/.castor/ : config, mémoire, compétences. */
const fs = require("node:fs");
const path = require("node:path");

const DIR = path.join(process.env.HOME || process.env.USERPROFILE, ".castor");
const CONFIG = path.join(DIR, "config.json");
const MEMORY = path.join(DIR, "memory.json");
const SKILLS = path.join(DIR, "skills.json");

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

module.exports = {
  DIR,
  loadConfig,
  saveConfig,
  loadMemory,
  saveMemory,
  loadSkills,
  saveSkills,
};
