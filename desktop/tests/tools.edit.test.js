/* Tests de editFile — module pur, aucune dépendance Electron.
   Lancement : node --test desktop/tests/ */
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { editFile } = require("../src/tools");

let ROOT = "";

before(() => {
  ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "castor-edit-"));
  fs.writeFileSync(
    path.join(ROOT, "app.js"),
    'const a = 1;\nconst a = 2;\nfunction foo() {\n  return a;\n}\n'
  );
  fs.writeFileSync(path.join(ROOT, "solo.txt"), "bonjour le monde\n");
});

after(() => {
  fs.rmSync(ROOT, { recursive: true, force: true });
});

describe("editFile", () => {
  it("remplace une occurrence unique et renvoie le diff", () => {
    const r = editFile(ROOT, "solo.txt", "bonjour", "salut");
    assert.ok(r.newContent.startsWith("salut le monde"));
    assert.ok(r.diff.includes("-bonjour le monde"));
    assert.ok(r.diff.includes("+salut le monde"));
    // editFile est une preview : rien n'est écrit, le fichier est intact
    assert.equal(
      fs.readFileSync(path.join(ROOT, "solo.txt"), "utf8"),
      "bonjour le monde\n"
    );
  });

  it("échoue si oldText est introuvable", () => {
    assert.throws(() => editFile(ROOT, "solo.txt", "XYZ", "abc"), /introuvable/);
  });

  it("refuse un oldText ambigu et cite les lignes", () => {
    assert.throws(
      () => editFile(ROOT, "app.js", "const a = ", "let a = "),
      /présent 2 fois \(lignes 1, 2\)/
    );
  });

  it("supprime du texte (newText vide)", () => {
    const r = editFile(ROOT, "app.js", "\nfunction foo() {\n  return a;\n}\n", "\n");
    assert.ok(!r.newContent.includes("foo"));
    assert.ok(r.diff.includes("-function foo()"));
  });

  it("reste confiné au workspace", () => {
    assert.throws(
      () => editFile(ROOT, "../outside.txt", "x", "y"),
      /espace de travail/
    );
  });

  it("échoue sur un fichier inexistant", () => {
    assert.throws(() => editFile(ROOT, "nope.txt", "a", "b"));
  });
});
