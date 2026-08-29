/* Tests du cœur des outils (safeResolve, buildTree, readFileCapped, diffLines,
   previewWrite, applyWrite, runCommand) — module pur, aucune dépendance Electron.
   Lancement : node --test desktop/tests/ */
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const {
  safeResolve,
  buildTree,
  readFileCapped,
  diffLines,
  previewWrite,
  applyWrite,
  runCommand,
} = require("../src/tools");

let ROOT = "";

before(() => {
  ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "castor-tools-"));
  fs.mkdirSync(path.join(ROOT, "src"), { recursive: true });
  fs.mkdirSync(path.join(ROOT, "node_modules"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "src", "app.js"), "export const x = 1;\n");
  fs.writeFileSync(path.join(ROOT, "README.md"), "# Castor\n\nSalut.\n");
  // fichier assez gros pour tester la troncature (250 ko)
  fs.writeFileSync(path.join(ROOT, "big.bin"), Buffer.alloc(250 * 1024, 0x41));
});

after(() => {
  fs.rmSync(ROOT, { recursive: true, force: true });
});

describe("safeResolve", () => {
  it("résout un chemin normal dans le workspace", () => {
    const abs = safeResolve(ROOT, "src/app.js");
    assert.equal(abs, path.join(ROOT, "src", "app.js"));
  });

  it("interdit de sortir du workspace", () => {
    assert.throws(() => safeResolve(ROOT, "../secret.txt"), /espace de travail/);
    assert.throws(() => safeResolve(ROOT, "/etc/passwd"), /espace de travail/);
  });

  it("gère un chemin vide comme la racine", () => {
    assert.equal(safeResolve(ROOT, ""), ROOT);
    assert.equal(safeResolve(ROOT, null), ROOT);
  });
});

describe("buildTree", () => {
  it("construit l'arborescence, dossiers d'abord, node_modules ignoré", () => {
    const t = buildTree(ROOT);
    assert.equal(t.type, "dir");
    const names = t.children.map((c) => c.name);
    assert.ok(names.includes("src"));
    assert.ok(names.includes("README.md"));
    assert.ok(!names.includes("node_modules"), "node_modules doit être ignoré");
    // les dossiers précèdent les fichiers
    assert.ok(names.indexOf("src") < names.indexOf("README.md"));
    const src = t.children.find((c) => c.name === "src");
    assert.deepEqual(
      src.children.map((c) => c.name),
      ["app.js"]
    );
  });

  it("plafonne la profondeur sans planter", () => {
    const deep = path.join(ROOT, "a", "b", "c", "d", "e", "f", "g", "h", "i");
    fs.mkdirSync(deep, { recursive: true });
    const t = buildTree(ROOT);
    // pas d'exception, l'arbre est un objet valide
    assert.equal(t.type, "dir");
    assert.ok(Array.isArray(t.children));
  });
});

describe("readFileCapped", () => {
  it("lit un petit fichier en entier", () => {
    const r = readFileCapped(ROOT, "README.md");
    assert.equal(r.truncated, false);
    assert.ok(r.content.includes("Castor"));
  });

  it("tronque un gros fichier à 200 ko", () => {
    const r = readFileCapped(ROOT, "big.bin");
    assert.equal(r.truncated, true);
    assert.equal(r.bytes, 250 * 1024);
    assert.ok(r.content.length <= 200 * 1024);
  });

  it("reste confiné au workspace", () => {
    assert.throws(() => readFileCapped(ROOT, "../evil.txt"), /espace de travail/);
  });

  it("échoue sur un fichier inexistant", () => {
    assert.throws(() => readFileCapped(ROOT, "missing.txt"));
  });
});

describe("diffLines", () => {
  it("retourne un diff unified quand il y a des changements", () => {
    const d = diffLines("ligne 1\nligne 2\nligne 3\n", "ligne 1\nligne MODIF\nligne 3\n");
    assert.ok(d.includes("-ligne 2"));
    assert.ok(d.includes("+ligne MODIF"));
    assert.ok(d.startsWith("@@"));
  });

  it("retourne null quand rien ne change", () => {
    assert.equal(diffLines("abc\ndef\n", "abc\ndef\n"), null);
  });

  it("gère les valeurs null/undefined comme chaînes vides", () => {
    assert.ok(diffLines(null, "nouveau\n").includes("+nouveau"));
    assert.equal(diffLines("", ""), null);
  });
});

describe("previewWrite", () => {
  it("détecte un fichier existant (modification)", () => {
    const p = previewWrite(ROOT, "README.md", "# Autre titre\n");
    assert.equal(p.isNew, false);
    assert.ok(p.oldContent.includes("Castor"));
    assert.ok(p.diff.includes("-"));
    // rien n'est écrit
    assert.ok(fs.readFileSync(path.join(ROOT, "README.md"), "utf8").includes("Castor"));
  });

  it("détecte un nouveau fichier (création)", () => {
    const p = previewWrite(ROOT, "src/new.ts", "export const y = 2;\n");
    assert.equal(p.isNew, true);
    assert.equal(p.oldContent, "");
    assert.equal(fs.existsSync(path.join(ROOT, "src", "new.ts")), false);
  });
});

describe("applyWrite", () => {
  it("écrit un nouveau fichier en créant les dossiers parents", () => {
    const abs = applyWrite(ROOT, "lib/deep/util.js", "export default 42;\n");
    assert.equal(abs, path.join(ROOT, "lib", "deep", "util.js"));
    assert.equal(fs.readFileSync(abs, "utf8"), "export default 42;\n");
  });

  it("écrase un fichier existant", () => {
    applyWrite(ROOT, "README.md", "Écrasé.\n");
    assert.equal(fs.readFileSync(path.join(ROOT, "README.md"), "utf8"), "Écrasé.\n");
  });
});

describe("runCommand", () => {
  it("exécute une commande et capture sa sortie", async () => {
    const r = await runCommand("echo coucou", ROOT);
    assert.equal(r.code, 0);
    assert.ok(r.output.includes("coucou"));
  });

  it("capture une commande qui échoue", async () => {
    const r = await runCommand("exit 3", ROOT);
    assert.equal(r.code, 3);
  });

  it("retourne une sortie propre quand il n'y en a pas", async () => {
    const r = await runCommand("true", ROOT);
    assert.equal(r.code, 0);
    assert.equal(r.output, "(aucune sortie)");
  });

  it("plafonne la sortie à 8000 caractères", async () => {
    const r = await runCommand("yes a | head -c 20000", ROOT);
    // 8000 caractères + le marqueur de troncature
    assert.ok(r.output.length <= 8000 + "\n…(tronqué)".length);
    assert.ok(r.output.endsWith("…(tronqué)"));
  });
});
