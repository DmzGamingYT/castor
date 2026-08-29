/* Tests du diff multi-hunks et de l'application partielle (hunk par hunk).
   Lancement : node --test desktop/tests/ */
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { diffLines, parseUnifiedDiff, applyHunks, applyWrite } = require("../src/tools");

let ROOT = "";

before(() => {
  ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "castor-hunks-"));
  fs.writeFileSync(
    path.join(ROOT, "app.js"),
    'const a = 1;\nconst b = 2;\nfunction foo() {\n  return a + b;\n}\nconst c = 3;\nconst d = 4;\n'
  );
});

after(() => {
  fs.rmSync(ROOT, { recursive: true, force: true });
});

describe("diffLines multi-hunks", () => {
  it("sépare en plusieurs hunks des changements distincts", () => {
    const oldTxt = "a\nb\nc\nd\ne\n";
    const newTxt = "a\nX\nc\nd\nY\n";
    const d = diffLines(oldTxt, newTxt);
    const nHunks = (d.match(/^@@/gm) || []).length;
    assert.equal(nHunks, 2);
    assert.ok(d.includes("-b"), "suppression du premier bloc");
    assert.ok(d.includes("+X"));
    assert.ok(d.includes("-e"), "suppression du second bloc");
    assert.ok(d.includes("+Y"));
  });

  it("reste sur un seul hunk pour un changement contigu", () => {
    const d = diffLines("ligne 1\nligne 2\nligne 3\n", "ligne 1\nligne MODIF\nligne 3\n");
    assert.equal((d.match(/^@@/gm) || []).length, 1);
    assert.ok(d.startsWith("@@"));
  });

  it("retourne null quand rien ne change", () => {
    assert.equal(diffLines("abc\ndef\n", "abc\ndef\n"), null);
  });

  it("produit un diff valide pour un nouveau fichier", () => {
    const d = diffLines("", "hello\nworld\n");
    assert.equal((d.match(/^@@/gm) || []).length, 1);
    assert.ok(d.includes("+hello"));
    assert.ok(d.includes("+world"));
  });
});

describe("parseUnifiedDiff", () => {
  it("extrait les côtés avant/après et les marqueurs", () => {
    const d = diffLines("a\nb\nc\nd\ne\n", "a\nX\nc\nd\nY\n");
    const hunks = parseUnifiedDiff(d);
    assert.equal(hunks.length, 2);
    const [h1, h2] = hunks;
    // le contexte qui suit est rattaché au hunk (séquence contiguë du fichier)
    assert.deepEqual(h1.oldSide, ["b", "c", "d"]);
    assert.deepEqual(h1.newSide, ["X", "c", "d"]);
    assert.deepEqual(h1.oldDel, [true, false, false]);
    assert.deepEqual(h1.newAdd, [true, false, false]);
    assert.deepEqual(h2.oldSide, ["e"]);
    assert.deepEqual(h2.newSide, ["Y"]);
    assert.equal(h1.oldStart, 2);
    assert.equal(h2.oldStart, 5);
  });

  it("contexte après changement inclus des deux côtés, non marqué", () => {
    const d = diffLines("a\nb\nc\nd\ne\n", "a\nX\nc\nd\nY\n");
    const h1 = parseUnifiedDiff(d)[0];
    assert.ok(h1.newSide.includes("c"), "contexte de fin présent côté nouveau");
    assert.equal(h1.oldDel[h1.oldSide.indexOf("c")], false);
    assert.equal(h1.newAdd[h1.newSide.indexOf("c")], false);
  });

  it("ignore les lignes sans marqueur de hunk (entêtes d'autres formats)", () => {
    assert.deepEqual(parseUnifiedDiff("diff --git a/x b/x\nindex 1..2\n@@ -1,1 +1,1 @@\n-old\n+new\n"), [
      { oldStart: 1, oldCount: 1, newStart: 1, newCount: 1, oldSide: ["old"], newSide: ["new"], oldDel: [true], newAdd: [true] },
    ]);
  });
});

describe("applyHunks", () => {
  const OLD = 'const a = 1;\nconst b = 2;\nfunction foo() {\n  return a + b;\n}\nconst c = 3;\nconst d = 4;\n';
  const NEW = 'const a = 1;\nconst b = 2;\nfunction foo() {\n  return a * b;\n}\nconst c = 99;\nconst d = 4;\n';

  it("tout accepter → contenu complet du fichier proposé", () => {
    const hunks = parseUnifiedDiff(diffLines(OLD, NEW));
    const r = applyHunks(OLD, hunks, hunks.map(() => true));
    assert.equal(r.content, NEW);
    assert.equal(r.applied, hunks.length);
  });

  it("n'accepter qu'un hunk → seul ce changement est appliqué", () => {
    const hunks = parseUnifiedDiff(diffLines(OLD, NEW));
    assert.equal(hunks.length, 2);
    const r = applyHunks(OLD, hunks, [true, false]);
    assert.ok(r.content.includes("a * b"), "premier changement appliqué");
    assert.ok(r.content.includes("const c = 3;"), "second changement ignoré");
    const r2 = applyHunks(OLD, hunks, [false, true]);
    assert.ok(r2.content.includes("const c = 99;"), "second hunk appliqué");
    assert.ok(r2.content.includes("return a + b;"), "premier hunk ignoré");
  });

  it("crée un fichier neuf avec une sélection partielle", () => {
    const NEW_FILE = "ligne 1\nligne 2\nligne 3\n";
    const hunks = parseUnifiedDiff(diffLines("", NEW_FILE));
    const r = applyHunks("", hunks, [true]);
    assert.equal(r.content, NEW_FILE);
    assert.equal(r.applied, 1);
  });

  it("échoue proprement sur un ancrage introuvable", () => {
    const hunks = parseUnifiedDiff(diffLines(OLD, NEW));
    assert.throws(() => applyHunks("contenu totalement différent\n", hunks, [true, false]), /introuvable/);
  });

  it("échoue proprement sur un ancrage ambigu", () => {
    const hunks = parseUnifiedDiff(diffLines("x\n", "y\n"));
    assert.throws(() => applyHunks("x\nx\nx\ny\nz\n", hunks, [true]), /ambigu/);
  });

  it("n'écrit rien en échec (application en mémoire)", () => {
    const hunks = parseUnifiedDiff(diffLines(OLD, NEW));
    let threw = false;
    try {
      applyHunks("contenu totalement différent\n", hunks, [true, false]);
    } catch {
      threw = true;
    }
    assert.ok(threw);
    // le fichier sur disque n'a pas bougé pendant la tentative
    assert.equal(fs.readFileSync(path.join(ROOT, "app.js"), "utf8"), 'const a = 1;\nconst b = 2;\nfunction foo() {\n  return a + b;\n}\nconst c = 3;\nconst d = 4;\n');
  });

  it("intégration : diff → sélection → applyWrite produit le fichier attendu", () => {
    const hunks = parseUnifiedDiff(diffLines(OLD, NEW));
    const r = applyHunks(OLD, hunks, [true, false]);
    applyWrite(ROOT, "app.js", r.content);
    assert.equal(
      fs.readFileSync(path.join(ROOT, "app.js"), "utf8"),
      'const a = 1;\nconst b = 2;\nfunction foo() {\n  return a * b;\n}\nconst c = 3;\nconst d = 4;\n'
    );
  });
});