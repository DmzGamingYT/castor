const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { estTok, fmtTok, sseEvents } = require("../lib/ui");

describe("estTok", () => {
  it("estime ~4 caractères par token", () => {
    assert.equal(estTok(0), 0);
    assert.equal(estTok(4), 1);
    assert.equal(estTok(5), 2); // arrondi supérieur
    assert.equal(estTok(100), 25);
  });
});

describe("fmtTok", () => {
  it("affiche le nombre brut en dessous de 10k", () => {
    assert.equal(fmtTok(0), "0");
    assert.equal(fmtTok(42), "42");
    assert.equal(fmtTok(9999), "9999");
  });

  it("affiche en k au-dessus de 10k", () => {
    assert.equal(fmtTok(10000), "10.0k");
    assert.equal(fmtTok(15000), "15.0k");
    assert.equal(fmtTok(123456), "123.5k");
  });
});

describe("sseEvents", () => {
  it("extrait les lignes data: d'un buffer SSE", () => {
    const buf = "data: {\"choices\":[]}\n\ndata: [DONE]\n\n";
    const events = sseEvents(buf);
    assert.equal(events.length, 2);
    assert.equal(events[0], '{"choices":[]}');
    assert.equal(events[1], "[DONE]");
  });

  it("ignore les lignes non-data", () => {
    const buf = "event: message\ndata: hello\n\n";
    const events = sseEvents(buf);
    assert.equal(events.length, 1);
    assert.equal(events[0], "hello");
  });

  it("renvoie [] pour un buffer vide", () => {
    assert.deepEqual(sseEvents(""), []);
    assert.deepEqual(sseEvents("pas du SSE"), []);
  });

  it("gère les fragments multi-lignes", () => {
    const buf = "data: line1\ndata: line2\n\n";
    const events = sseEvents(buf);
    assert.equal(events.length, 2);
  });
});
