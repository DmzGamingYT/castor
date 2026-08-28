const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execTool } = require("../lib/tools");

const CWD = process.cwd();
const TEST_DIR = path.join(CWD, "__test_castor_tools__");

before(() => {
  fs.mkdirSync(TEST_DIR, { recursive: true });
  fs.mkdirSync(path.join(TEST_DIR, "src"), { recursive: true });
  fs.writeFileSync(path.join(TEST_DIR, "hello.txt"), "bonjour le monde\nligne 2\nligne 3\n");
  fs.writeFileSync(path.join(TEST_DIR, "src", "app.js"), 'console.log("app");\nfunction foo() {}\n');
});

after(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

/*
 * Les tools résolvent les chemins par rapport à process.cwd() (CWD de tools.js).
 * On ne peut pas changer ce CWD dans les tests (capturé au load).
 * Solution : on crée les fichiers dans CWD et on les nettoie après.
 */
const REL_DIR = "__test_castor_tools__";

describe("read_file", () => {
  it("lit un fichier existant", async () => {
    const result = await execTool("read_file", { path: `${REL_DIR}/hello.txt` });
    assert.ok(result.content.includes("bonjour le monde"));
    assert.ok(result.total >= 3); // 3 ou 4 lignes selon le trailing newline
  });

  it("gère les lignes start/end", async () => {
    const result = await execTool("read_file", { path: `${REL_DIR}/hello.txt`, start_line: 2, end_line: 2 });
    assert.equal(result.content, "ligne 2");
    assert.equal(result.lines, "2-2");
  });

  it("erreur sur fichier introuvable", async () => {
    const result = await execTool("read_file", { path: `${REL_DIR}/nope.txt` });
    assert.ok(result.error);
    assert.ok(result.error.includes("introuvable"));
  });

  it("erreur sur traversée de chemin", async () => {
    const result = await execTool("read_file", { path: "../../etc/passwd" });
    assert.ok(result.error);
    assert.ok(result.error.includes("hors du projet"));
  });
});

describe("list_directory", () => {
  it("liste les fichiers et dossiers", async () => {
    const result = await execTool("list_directory", { path: REL_DIR });
    assert.ok(result.files.includes("hello.txt"));
    assert.ok(result.directories.includes("src/"));
  });

  it("liste un sous-dossier", async () => {
    const result = await execTool("list_directory", { path: `${REL_DIR}/src` });
    assert.ok(result.files.includes("app.js"));
  });
});

describe("search_code", () => {
  it("trouve un motif dans les fichiers", async () => {
    const result = await execTool("search_code", { pattern: "bonjour", path: REL_DIR });
    assert.ok(result.results.includes("hello.txt"));
    assert.ok(result.results.includes("bonjour"));
  });

  it("renvoie aucun résultat si pas de match", async () => {
    const result = await execTool("search_code", { pattern: "ZZZZXUniquePattern98765", path: REL_DIR });
    // grep peut renvoyer "aucun résultat" ou une chaîne vide (pas de match)
    const hasNoResult = result.results.includes("aucun résultat") || result.results.trim() === "" || result.results.includes("grep échoué");
    assert.ok(hasNoResult, `Résultat inattendu: ${result.results}`);
  });
});

describe("run_command", () => {
  it("exécute une commande simple", async () => {
    const result = await execTool("run_command", { command: "echo hello" });
    assert.ok(result.stdout.includes("hello"));
  });

  it("bannit les commandes dangereuses", async () => {
    const result = await execTool("run_command", { command: "sudo rm -rf /" });
    assert.ok(result.error);
    assert.ok(result.error.includes("bloquée"));
  });

  it("capture les erreurs", async () => {
    const result = await execTool("run_command", { command: "ls /nonexistent_path_abc123" });
    assert.ok(result.exit_code !== 0 || result.stderr || result.stdout);
  });
});

describe("write_file", () => {
  it("écrit un fichier", async () => {
    const result = await execTool("write_file", { path: `${REL_DIR}/output.txt`, content: "test 123" });
    assert.equal(result.written, true);
    const fullPath = path.join(CWD, REL_DIR, "output.txt");
    assert.ok(fs.existsSync(fullPath));
    assert.equal(fs.readFileSync(fullPath, "utf8"), "test 123");
    // nettoyage
    fs.unlinkSync(fullPath);
  });

  it("crée les sous-dossiers nécessaires", async () => {
    const result = await execTool("write_file", { path: `${REL_DIR}/deep/nested/file.txt`, content: "deep" });
    assert.equal(result.written, true);
    const fullPath = path.join(CWD, REL_DIR, "deep", "nested", "file.txt");
    assert.ok(fs.existsSync(fullPath));
    // nettoyage
    fs.rmSync(path.join(CWD, REL_DIR, "deep"), { recursive: true, force: true });
  });

  it("erreur sur traversée de chemin", async () => {
    const result = await execTool("write_file", { path: "../../evil.txt", content: "nope" });
    assert.ok(result.error);
  });
});
