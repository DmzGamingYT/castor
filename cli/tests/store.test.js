const { describe, it, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/* On utilise un répertoire temporaire pour ne pas polluer ~/.castor */
const ORIGINAL_HOME = process.env.HOME;
const FAKE_HOME = path.join(process.cwd(), "__test_castor_store__");

before(() => {
  fs.mkdirSync(FAKE_HOME, { recursive: true });
  process.env.HOME = FAKE_HOME;
});

after(() => {
  process.env.HOME = ORIGINAL_HOME;
  fs.rmSync(FAKE_HOME, { recursive: true, force: true });
});

/* Recharger le module pour qu'il prenne en compte le HOME modifié */
function freshStore() {
  const modPath = require.resolve("../lib/store");
  delete require.cache[modPath];
  return require("../lib/store");
}

describe("store — config", () => {
  it("crée une config par défaut si rien n'existe", () => {
    const store = freshStore();
    const cfg = store.loadConfig();
    assert.equal(cfg.provider, "openrouter");
    assert.equal(cfg.model, null);
    assert.ok(typeof cfg.keys === "object");
    assert.equal(cfg.usage.requests, 0);
  });

  it("sauvegarde et recharge la config", () => {
    const store = freshStore();
    const cfg = store.loadConfig();
    cfg.provider = "groq";
    cfg.model = "llama-3";
    cfg.keys.groq = "test-key-123";
    store.saveConfig(cfg);

    const store2 = freshStore();
    const cfg2 = store2.loadConfig();
    assert.equal(cfg2.provider, "groq");
    assert.equal(cfg2.model, "llama-3");
    assert.equal(cfg2.keys.groq, "test-key-123");
  });
});

describe("store — memory", () => {
  it("charge un tableau vide par défaut", () => {
    const store = freshStore();
    const mem = store.loadMemory();
    assert.deepEqual(mem, []);
  });

  it("sauvegarde et recharge la mémoire", () => {
    const store = freshStore();
    const mem = [{ id: 1, text: "toujours en français" }];
    store.saveMemory(mem);

    const store2 = freshStore();
    assert.deepEqual(store2.loadMemory(), mem);
  });
});

describe("store — sessions", () => {
  beforeEach(() => {
    /* nettoyer le dossier sessions avant chaque test */
    const sessionsDir = path.join(FAKE_HOME, ".castor", "sessions");
    if (fs.existsSync(sessionsDir)) {
      fs.rmSync(sessionsDir, { recursive: true, force: true });
    }
  });

  it("sauvegarde et liste une session", () => {
    const store = freshStore();
    const name = store.saveSession("test-sess", {
      messages: [{ role: "user", content: "hello" }],
      todos: [],
      provider: "openrouter",
      model: "test",
    });
    assert.equal(name, "test-sess");

    const list = store.listSessions();
    assert.equal(list.length, 1);
    assert.equal(list[0].name, "test-sess");
    assert.equal(list[0].messageCount, 1);
    assert.equal(list[0].summary, "hello");
  });

  it("charge une session par nom", () => {
    const store = freshStore();
    store.saveSession("test-sess", {
      messages: [{ role: "user", content: "hello" }],
      todos: [],
      provider: "openrouter",
      model: "test",
    });
    const sess = store.loadSession("test-sess");
    assert.ok(sess);
    assert.equal(sess.messages.length, 1);
    assert.equal(sess.provider, "openrouter");
  });

  it("renvoie null pour une session inexistante", () => {
    const store = freshStore();
    assert.equal(store.loadSession("nope"), null);
  });

  it("supprime une session", () => {
    const store = freshStore();
    store.saveSession("test-sess", {
      messages: [{ role: "user", content: "hi" }],
      todos: [],
      provider: "",
      model: "",
    });
    assert.equal(store.deleteSession("test-sess"), true);
    assert.equal(store.listSessions().length, 0);
    assert.equal(store.loadSession("test-sess"), null);
  });

  it("sanitise les noms dangereux", () => {
    const store = freshStore();
    const name = store.saveSession("../../etc/passwd", {
      messages: [], todos: [], provider: "", model: "",
    });
    assert.ok(!name.includes(".."));
    assert.ok(!name.includes("/"));
  });

  it("trie les sessions par date décroissante", async () => {
    const store = freshStore();
    store.saveSession("aaa", { messages: [{ role: "user", content: "premier" }], todos: [], provider: "", model: "" });
    await new Promise((r) => setTimeout(r, 30));
    store.saveSession("bbb", { messages: [{ role: "user", content: "deuxième" }], todos: [], provider: "", model: "" });

    const list = store.listSessions();
    assert.equal(list.length, 2);
    assert.equal(list[0].name, "bbb"); // le plus récent en premier
  });
});
