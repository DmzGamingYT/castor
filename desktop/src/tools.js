/* Outils de l'atelier — exécutés côté main, confinés à l'espace de travail.
   Module pur (aucune dépendance Electron) pour rester testable. */
const fs = require("node:fs");
const path = require("node:path");
const { exec } = require("node:child_process");

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "release",
  "coverage",
  "__pycache__",
  ".next",
  ".cache",
  ".venv",
]);
const MAX_TREE_ENTRIES = 1500;
const MAX_TREE_DEPTH = 8;
const MAX_READ_BYTES = 200 * 1024; // 200 ko
const MAX_CMD_OUTPUT = 8000;
const DEFAULT_CMD_TIMEOUT = 60_000;

/* Résout un chemin relatif au workspace en interdisant d'en sortir. */
function safeResolve(root, rel) {
  const abs = path.resolve(root, String(rel || ""));
  if (abs !== root && !abs.startsWith(root + path.sep)) {
    const err = new Error(`chemin hors de l'espace de travail : ${rel}`);
    err.code = "EESCAPE";
    throw err;
  }
  return abs;
}

/* Arborescence récursive plafonnée : { name, type:"dir"|"file", children? } */
function buildTree(root) {
  const rootStat = fs.statSync(root);
  const tree = { name: path.basename(root), type: "dir", children: [] };
  let count = 0;

  const walk = (dir, node, depth) => {
    if (depth > MAX_TREE_DEPTH || count >= MAX_TREE_ENTRIES) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    entries
      .filter((e) => !IGNORED_DIRS.has(e.name))
      .sort((a, b) => {
        const da = a.isDirectory() ? 0 : 1;
        const db = b.isDirectory() ? 0 : 1;
        return da - db || a.name.localeCompare(b.name);
      });

    for (const e of entries) {
      if (count >= MAX_TREE_ENTRIES) return;
      if (e.isDirectory()) {
        count++;
        const child = { name: e.name, type: "dir", children: [] };
        node.children.push(child);
        walk(path.join(dir, e.name), child, depth + 1);
      } else if (e.isFile()) {
        count++;
        node.children.push({ name: e.name, type: "file" });
      }
    }
  };

  walk(root, tree, 1);
  void rootStat;
  return tree;
}

/* Lecture de fichier plafonnée : { content, truncated, bytes } */
function readFileCapped(root, rel) {
  const abs = safeResolve(root, rel);
  const st = fs.statSync(abs);
  if (!st.isFile()) throw new Error(`pas un fichier : ${rel}`);
  if (st.size > MAX_READ_BYTES) {
    const fd = fs.openSync(abs, "r");
    try {
      const buf = Buffer.alloc(MAX_READ_BYTES);
      fs.readSync(fd, buf, 0, MAX_READ_BYTES, 0);
      return {
        content: buf.toString("utf8"),
        truncated: true,
        bytes: st.size,
      };
    } finally {
      fs.closeSync(fd);
    }
  }
  return {
    content: fs.readFileSync(abs, "utf8"),
    truncated: false,
    bytes: st.size,
  };
}

/* Diff ligne à ligne (préfixe/suffixe communs) → texte façon unified diff. */
function diffLines(oldText, newText, contextLines = 3) {
  const a = String(oldText ?? "").split("\n");
  const b = String(newText ?? "").split("\n");

  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let s = 0;
  while (
    s < a.length - p &&
    s < b.length - p &&
    a[a.length - 1 - s] === b[b.length - 1 - s]
  )
    s++;

  const removed = a.slice(p, a.length - s);
  const added = b.slice(p, b.length - s);
  if (!removed.length && !added.length) return null;

  const ctxStart = Math.max(0, p - contextLines);
  const ctxEndA = Math.min(a.length, a.length - s + contextLines);
  const lines = [];

  for (let i = ctxStart; i < p; i++) lines.push(` ${a[i]}`);
  for (const l of removed) lines.push(`-${l}`);
  for (const l of added) lines.push(`+${l}`);
  for (let i = a.length - s; i < ctxEndA; i++) lines.push(` ${a[i]}`);

  const oldCount = p + removed.length - ctxStart;
  const newCount = p + added.length - ctxStart;
  const header = `@@ -${ctxStart + 1},${oldCount} +${ctxStart + 1},${newCount} @@`;
  return `${header}\n${lines.join("\n")}`;
}

/* Aperçu d'écriture SANS écrire : ancien contenu, diff, statut création. */
function previewWrite(root, rel, content) {
  const abs = safeResolve(root, rel);
  let oldContent = "";
  let isNew = true;
  try {
    const st = fs.statSync(abs);
    if (st.isFile()) {
      oldContent = fs.readFileSync(abs, "utf8");
      isNew = false;
    }
  } catch {
    /* le fichier n'existe pas encore */
  }
  return {
    abs,
    isNew,
    oldContent,
    diff: diffLines(oldContent, content),
  };
}

/* Applique une écriture validée (crée les dossiers parents). */
function applyWrite(root, rel, content) {
  const abs = safeResolve(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
  return abs;
}

/* Exécute une commande shell dans le workspace, sortie plafonnée. */
function runCommand(command, cwd, timeoutMs = DEFAULT_CMD_TIMEOUT) {
  return new Promise((resolve) => {
    exec(
      command,
      {
        cwd,
        timeout: Math.min(Math.max(timeoutMs, 1000), 180_000),
        maxBuffer: 1024 * 1024,
        env: { ...process.env, NO_COLOR: "1" },
      },
      (err, stdout, stderr) => {
        if (err?.killed) {
          resolve({
            code: null,
            output: `Délai dépassé (${Math.round(timeoutMs / 1000)} s).\n${cap(
              stdout
            )}${cap(stderr)}`,
          });
          return;
        }
        const code = err ? err.code ?? 1 : 0;
        let out = "";
        if (stdout) out += cap(stdout.toString());
        if (stderr) out += (out ? "\n--- stderr ---\n" : "") + cap(stderr.toString());
        resolve({ code, output: out || "(aucune sortie)" });
      }
    );
  });
}

function cap(s) {
  const t = s.trim();
  return t.length > MAX_CMD_OUTPUT ? t.slice(0, MAX_CMD_OUTPUT) + "\n…(tronqué)" : t;
}

module.exports = {
  safeResolve,
  buildTree,
  readFileCapped,
  diffLines,
  previewWrite,
  applyWrite,
  runCommand,
};
