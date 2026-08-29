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

/* Compte les occurrences non chevauchantes d'une sous-chaîne. */
function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  let n = 0;
  let i = 0;
  while ((i = haystack.indexOf(needle, i)) !== -1) {
    n++;
    i += needle.length;
  }
  return n;
}

/*
 * Recherche/remplacement dans un fichier existant.
 * oldText trouvé 0 fois → erreur descriptive ; n fois (n>1) → refus
 * (et liste des numéros de lignes, pour que le modèle resserre son ancre) ;
 * exactement 1 fois → remplacement. Le diff retourné alimente l'approbation.
 */
function editFile(root, rel, oldText, newText, expected = null) {
  const abs = safeResolve(root, rel);
  const st = fs.statSync(abs);
  if (!st.isFile()) throw new Error(`pas un fichier : ${rel}`);
  const content = fs.readFileSync(abs, "utf8");
  if (oldText === "") throw new Error("oldText vide — utilise write_file pour créer un fichier");
  if (oldText === content) throw new Error("oldText identique au fichier — rien à remplacer");

  const n = countOccurrences(content, oldText);
  if (n === 0) throw new Error("oldText introuvable (copie exacte requise, avec l'indentation)");
  if (n > 1) {
    const lines = [];
    let i = 0;
    while ((i = content.indexOf(oldText, i)) !== -1) {
      lines.push(content.slice(0, i).split("\n").length);
      i += oldText.length;
    }
    throw new Error(
      `oldText présent ${n} fois (lignes ${lines.join(", ")}) — ajoute du contexte autour pour le rendre unique`
    );
  }

  const expectedCount = expected == null ? 1 : Number(expected);
  if (!Number.isInteger(expectedCount) || expectedCount < 1)
    throw new Error("expected remplacements invalide (entier ≥ 1)");
  if (n !== expectedCount)
    throw new Error(`expected=${expectedCount} mais ${n} occurrence(s) trouvée(s)`);

  const newContent = content.replace(oldText, newText);
  return { abs, newContent, diff: diffLines(content, newContent) };
}

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
    entries = entries
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

/* ============================================================
   Diff multi-hunks (ligne à ligne) → texte façon unified diff.
   Les changements séparés donnent des hunks séparés : c'est ce qui
   permet la validation « hunk par hunk » dans l'interface.
   ============================================================ */
const CONTEXT_LINES = 3;
const MAX_ALIGN = 120; // fenêtre de recherche d'un point d'alignement entre deux zones

/* Découpe la zone modifiée (entre préfixe et suffixe communs) en blocs :
   suites communes et modifications { del, add }. L'alignement cherche le
   point le plus proche (coût del+add minimal) dans une fenêtre bornée. */
function splitBlocks(a, b) {
  const blocks = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      let r = 1;
      while (i + r < a.length && j + r < b.length && a[i + r] === b[j + r]) r++;
      blocks.push({ type: "common", lines: a.slice(i, i + r) });
      i += r;
      j += r;
      continue;
    }
    let best = null;
    const maxWin = Math.min(MAX_ALIGN, a.length - i, b.length - j);
    for (let s = 1; s <= 2 * maxWin && !best; s++) {
      for (let del = 0; del <= maxWin; del++) {
        const add = s - del;
        if (add < 0 || add > maxWin) continue;
        if (i + del >= a.length || j + add >= b.length) continue;
        if (a[i + del] === b[j + add]) {
          best = { del, add };
          break;
        }
      }
    }
    if (best) {
      blocks.push({
        type: "change",
        del: a.slice(i, i + best.del),
        add: b.slice(j, j + best.add),
      });
      i += best.del;
      j += best.add;
    } else {
      blocks.push({ type: "change", del: a.slice(i), add: b.slice(j) });
      i = a.length;
      j = b.length;
    }
  }
  return blocks;
}

/* Assemble les blocs en hunks unifiés avec contexte (≤ CONTEXT_LINES lignes). */
function toUnifiedHunks(blocks, firstOldLine) {
  const hunks = [];
  let pending = []; // lignes communes pas encore rattachées
  let oldNo = firstOldLine;
  let newNo = firstOldLine;
  let cur = null;

  const emit = () => {
    if (!cur) return;
    hunks.push({
      oldStart: cur.oldStart,
      newStart: cur.newStart,
      oldCount: cur.oldCount,
      newCount: cur.newCount,
      lines: cur.lines,
    });
    cur = null;
  };

  for (const b of blocks) {
    if (b.type === "common") {
      const n = b.lines.length;
      oldNo += n;
      newNo += n;
      if (cur) {
        const kept = b.lines.slice(0, CONTEXT_LINES);
        for (const l of kept) {
          cur.lines.push(" " + l);
          cur.oldCount++;
          cur.newCount++;
        }
        if (kept.length < n) pending = b.lines.slice(CONTEXT_LINES);
        emit();
      } else {
        pending.push(...b.lines);
      }
      continue;
    }
    if (!cur) {
      const ctx = pending.slice(-CONTEXT_LINES);
      cur = {
        oldStart: oldNo - ctx.length,
        newStart: newNo - ctx.length,
        oldCount: ctx.length,
        newCount: ctx.length,
        lines: ctx.map((l) => " " + l),
      };
      pending = [];
    }
    for (const l of b.del) {
      cur.lines.push("-" + l);
      cur.oldCount++;
    }
    for (const l of b.add) {
      cur.lines.push("+" + l);
      cur.newCount++;
    }
    oldNo += b.del.length;
    newNo += b.add.length;
  }
  emit();
  return hunks;
}

/* Diff ligne à ligne → texte façon unified diff (multi-hunks).
   Retourne null quand rien ne change. */
function diffLines(oldText, newText, contextLines = CONTEXT_LINES) {
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

  const aMid = a.slice(p, a.length - s);
  const bMid = b.slice(p, b.length - s);
  if (!aMid.length && !bMid.length) return null;

  const blocks = splitBlocks(aMid, bMid);
  const hunks = toUnifiedHunks(blocks, p + 1);
  return hunks
    .map(
      (h) =>
        `@@ -${h.oldStart},${h.oldCount} +${h.newStart},${h.newCount} @@` +
        "\n" +
        h.lines.join("\n")
    )
    .join("\n");
}

/* Analyse un diff unifié : renvoie les hunks avec leurs côtés avant/après
   et les marqueurs de suppression/ajout (pour le rendu côte à côte). */
function parseUnifiedDiff(text) {
  const lines = String(text || "").split("\n");
  const hunks = [];
  let cur = null;
  for (const line of lines) {
    const m = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (m) {
      cur = {
        oldStart: Number(m[1]),
        oldCount: Number(m[2] || 1),
        newStart: Number(m[3]),
        newCount: Number(m[4] || 1),
        oldSide: [],
        newSide: [],
        oldDel: [],
        newAdd: [],
      };
      hunks.push(cur);
      continue;
    }
    if (!cur) continue;
    const t = line[0];
    if (t === "\\") continue; // marqueur « pas de saut de ligne final »
    if (t === " " || t === "-") {
      cur.oldSide.push(line.slice(1));
      cur.oldDel.push(t === "-");
    }
    if (t === " " || t === "+") {
      cur.newSide.push(line.slice(1));
      cur.newAdd.push(t === "+");
    }
  }
  return hunks;
}

/* Applique uniquement les hunks acceptés (true) à un contenu de base.
   Chaque côté ancien est un bloc contigu du fichier, donc le remplacement
   se fait par ancre unique — le tout en mémoire, appliqué d'un coup. */
function applyHunks(content, hunks, accepted) {
  let cur = String(content ?? "");
  let applied = 0;
  hunks.forEach((h, i) => {
    if (accepted && accepted[i] === false) return;
    const oldText = h.oldSide.join("\n");
    const newText = h.newSide.join("\n");
    if (oldText === newText) return; // hunk sans changement
    if (oldText === "") {
      // insertion pure : n'arrive que sur un fichier vierge (création)
      if (cur !== "") throw new Error(`hunk ${i + 1} : insertion sans ancre sur fichier non vide`);
      // préserve le saut de ligne final (le diff en perd la trace)
      cur = newText.endsWith("\n") ? newText : newText + "\n";
      applied++;
      return;
    }
    const n = countOccurrences(cur, oldText);
    if (n === 0) throw new Error(`hunk ${i + 1} : ancrage introuvable — applique le fichier complet à la main`);
    if (n > 1) throw new Error(`hunk ${i + 1} : ancrage ambigu (${n} fois) — applique le fichier complet à la main`);
    cur = cur.replace(oldText, newText);
    applied++;
  });
  return { content: cur, applied };
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
  parseUnifiedDiff,
  applyHunks,
  previewWrite,
  applyWrite,
  editFile,
  runCommand,
};
