const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ORIGINAL_HOME = process.env.HOME;
const FAKE_HOME = path.join(process.cwd(), "__test_castor_ctx__");

before(() => {
  fs.mkdirSync(FAKE_HOME, { recursive: true });
  process.env.HOME = FAKE_HOME;
});

after(() => {
  process.env.HOME = ORIGINAL_HOME;
  fs.rmSync(FAKE_HOME, { recursive: true, force: true });
});

function freshCtx() {
  const modPath = require.resolve("../lib/context");
  delete require.cache[modPath];
  return require("../lib/context");
}

describe("context — providers", () => {
  it("fournit la liste des providers", () => {
    const ctx = freshCtx();
    assert.ok(Array.isArray(ctx.PROVIDERS));
    assert.ok(ctx.PROVIDERS.length >= 4);
    assert.ok(ctx.PROVIDERS.find((p) => p.id === "openrouter"));
    assert.ok(ctx.PROVIDERS.find((p) => p.id === "groq"));
  });

  it("provider() retourne le provider courant", () => {
    const ctx = freshCtx();
    assert.equal(ctx.provider().id, "openrouter"); // défaut
  });

  it("setProvider change le provider et reset le modèle", () => {
    const ctx = freshCtx();
    ctx.setModel("custom-model");
    ctx.setProvider("groq");
    assert.equal(ctx.provider().id, "groq");
    assert.equal(ctx.cfg().model, null);
  });

  it("currentModel() utilise le defaultModel si pas de modèle défini", () => {
    const ctx = freshCtx();
    assert.equal(ctx.currentModel(), ctx.provider().defaultModel);
  });

  it("currentModel() utilise le modèle défini", () => {
    const ctx = freshCtx();
    ctx.setModel("my-model");
    assert.equal(ctx.currentModel(), "my-model");
  });
});

describe("context — messages", () => {
  it("démarre avec un tableau vide", () => {
    const ctx = freshCtx();
    assert.deepEqual(ctx.messages(), []);
  });

  it("pushMessage / popMessage", () => {
    const ctx = freshCtx();
    ctx.pushMessage({ role: "user", content: "hi" });
    ctx.pushMessage({ role: "assistant", content: "hello" });
    assert.equal(ctx.messages().length, 2);
    const last = ctx.popMessage();
    assert.equal(last.content, "hello");
    assert.equal(ctx.messages().length, 1);
  });

  it("trimMessages coupe les anciens messages", () => {
    const ctx = freshCtx();
    for (let i = 0; i < 50; i++) {
      ctx.pushMessage({ role: "user", content: `msg ${i}` });
    }
    ctx.trimMessages(10);
    assert.equal(ctx.messages().length, 10);
    assert.ok(ctx.messages()[0].content.includes("40")); // les plus récents gardés
  });
});

describe("context — memory", () => {
  it("addMemoryEntry ajoute et persiste", () => {
    const ctx = freshCtx();
    ctx.addMemoryEntry("fait test");
    assert.equal(ctx.memory().length, 1);
    assert.equal(ctx.memory()[0].text, "fait test");
  });

  it("setMemory remplace et persiste", () => {
    const ctx = freshCtx();
    ctx.setMemory([{ id: 1, text: "a" }, { id: 2, text: "b" }]);
    assert.equal(ctx.memory().length, 2);
  });
});

describe("context — tools / session", () => {
  it("toolsEnabled est true par défaut", () => {
    const ctx = freshCtx();
    assert.equal(ctx.toolsEnabled(), true);
  });

  it("setToolsEnabled toggle", () => {
    const ctx = freshCtx();
    ctx.setToolsEnabled(false);
    assert.equal(ctx.toolsEnabled(), false);
  });

  it("autoSessionName génère un nom basé sur la date", () => {
    const ctx = freshCtx();
    const name = ctx.autoSessionName();
    assert.ok(name.startsWith("session-"));
    assert.ok(name.length > 15);
  });
});
