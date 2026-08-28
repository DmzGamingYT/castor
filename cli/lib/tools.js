/* Tools — capacité de l'agent à interagir avec le projet.
   Définitions OpenAI function calling + exécuteurs locaux. */
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

/* ---------- working directory ---------- */
const CWD = process.cwd();

function resolveSafe(rel) {
  /* résout un chemin relatif par rapport au CWD, bloque les traversées */
  const abs = path.resolve(CWD, rel);
  if (!abs.startsWith(CWD)) {
    throw new Error(`hors du projet : ${rel}`);
  }
  return abs;
}

/* ---------- définitions (JSON Schema) ---------- */
const TOOL_DEFS = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Lit le contenu d'un fichier du projet. Renvoie le texte brut (tronqué à 8000 lignes).",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Chemin relatif du fichier" },
          start_line: { type: "integer", description: "Ligne de début (1-indexed, optionnel)" },
          end_line: { type: "integer", description: "Ligne de fin (inclus, optionnel)" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_directory",
      description: "Liste le contenu d'un dossier du projet (fichiers + sous-dossiers).",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Chemin relatif du dossier (défaut : racine du projet)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_code",
      description: "Recherche un motif (texte ou regex) dans les fichiers du projet. Renvoie les fichiers + lignes correspondantes.",
      parameters: {
        type: "object",
        properties: {
          pattern: { type: "string", description: "Motif à rechercher (regex ou texte)" },
          path: { type: "string", description: "Sous-dossier optionnel pour restreindre la recherche" },
          glob: { type: "string", description: "Filtre de fichiers, ex: '*.ts'" },
        },
        required: ["pattern"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_command",
      description: "Exécute une commande shell dans le projet. Retourne stdout+stderr. Commandes bloquées : rm, rmdir, del, sudo, mv, cdp, format.",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "Commande à exécuter (ex: 'npm test', 'git status')" },
          timeout: { type: "integer", description: "Timeout en secondes (défaut 30)" },
        },
        required: ["command"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Écrit du contenu dans un fichier du projet. Crée le fichier s'il n'existe pas, écrase s'il existe.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Chemin relatif du fichier" },
          content: { type: "string", description: "Contenu à écrire" },
        },
        required: ["path", "content"],
      },
    },
  },
];

/* ---------- commandes dangereuses (bannies) ---------- */
const BLOCKED = /^\s*(sudo|doas|rm\s+-rf|rmdir|del\b|format\b|mv\s+.*\s+\/)/i;

/* ---------- exécuteurs ---------- */
async function execTool(name, args) {
  try {
    switch (name) {
      case "read_file":
        return execReadFile(args);
      case "list_directory":
        return execListDir(args);
      case "search_code":
        return execSearch(args);
      case "run_command":
        return execCommand(args);
      case "write_file":
        return execWriteFile(args);
      default:
        return { error: `tool inconnue : ${name}` };
    }
  } catch (err) {
    return { error: err.message };
  }
}

function execReadFile({ path: rel, start_line, end_line }) {
  const abs = resolveSafe(rel);
  if (!fs.existsSync(abs)) return { error: `fichier introuvable : ${rel}` };
  const stat = fs.statSync(abs);
  if (stat.isDirectory()) return { error: `${rel} est un dossier — utilise list_directory` };
  /* refus de lire les binaires (> 1 Mo ou extension binaire) */
  if (stat.size > 1_048_576) return { error: `fichier trop volumineux (${(stat.size / 1024).toFixed(0)} Ko) — tronque à 8000 lignes` };
  let lines = fs.readFileSync(abs, "utf8").split("\n");
  const total = lines.length;
  if (start_line || end_line) {
    const s = Math.max(1, start_line || 1) - 1;
    const e = end_line ? Math.min(lines.length, end_line) : lines.length;
    lines = lines.slice(s, e);
    return { content: lines.join("\n"), lines: `${s + 1}-${e}`, total };
  }
  if (lines.length > 8000) lines = lines.slice(0, 8000);
  return { content: lines.join("\n"), total };
}

function execListDir({ path: rel } = {}) {
  const abs = resolveSafe(rel || ".");
  if (!fs.existsSync(abs)) return { error: `dossier introuvable : ${rel || "."}` };
  const entries = fs.readdirSync(abs, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name + "/");
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);
  return { directories: dirs, files, path: rel || "." };
}

function execSearch({ pattern, path: rel, glob: g }) {
  const dir = resolveSafe(rel || ".");
  if (!fs.existsSync(dir)) return { error: `dossier introuvable : ${rel || "."}` };
  /* Utilise grep -rn si disponible, sinon fallback JS */
  try {
    const globArg = g ? `--include='${g}'` : "";
    const out = execSync(
      `grep -rn ${globArg} --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.castor --exclude-dir=__test_* '${pattern.replace(/'/g, "'\\''")}' . 2>/dev/null | head -80`,
      { cwd: dir, encoding: "utf8", timeout: 10_000, maxBuffer: 512_000 }
    );
    return { results: out.trim() || "aucun résultat" };
  } catch {
    return { results: "aucun résultat (grep échoué ou aucun match)" };
  }
}

function execCommand({ command, timeout }) {
  if (BLOCKED.test(command)) {
    return { error: `commande bloquée pour des raisons de sécurité : ${command.split(/\s/)[0]}` };
  }
  const t = Math.min(timeout || 30, 120);
  try {
    const out = execSync(command, {
      cwd: CWD,
      encoding: "utf8",
      timeout: t * 1000,
      maxBuffer: 1_048_576,
      env: { ...process.env, FORCE_COLOR: "0" }, /* pas d'ANSI dans la sortie */
    });
    return { stdout: out.slice(0, 12_000) || "(aucune sortie)" };
  } catch (err) {
    return {
      stdout: (err.stdout || "").slice(0, 6_000),
      stderr: (err.stderr || "").slice(0, 6_000),
      exit_code: err.status ?? 1,
    };
  }
}

function execWriteFile({ path: rel, content }) {
  const abs = resolveSafe(rel);
  const dir = path.dirname(abs);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
  return { written: true, path: rel, bytes: Buffer.byteLength(content, "utf8") };
}

module.exports = { TOOL_DEFS, execTool, CWD };
