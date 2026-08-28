const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { parseTodos } = require("../lib/todos");

describe("parseTodos", () => {
  it("extrait les cases vides", () => {
    const todos = parseTodos("- [ ] étape 1\n- [ ] étape 2");
    assert.equal(todos.length, 2);
    assert.equal(todos[0].label, "étape 1");
    assert.equal(todos[0].done, false);
    assert.equal(todos[1].done, false);
  });

  it("extrait les cases cochées", () => {
    const todos = parseTodos("- [x] fait\n- [ ] à faire");
    assert.equal(todos.length, 2);
    assert.equal(todos[0].done, true);
    assert.equal(todos[1].done, false);
  });

  it("déduplique les labels identiques", () => {
    const todos = parseTodos("- [ ] étape 1\n- [x] étape 1");
    assert.equal(todos.length, 1);
    assert.equal(todos[0].done, true); // la version cochée l'emporte
  });

  it("gère le format * au lieu de -", () => {
    const todos = parseTodos("* [ ] opt A\n* [x] opt B");
    assert.equal(todos.length, 2);
    assert.equal(todos[0].label, "opt A");
    assert.equal(todos[1].done, true);
  });

  it("renvoie [] pour texte vide ou null", () => {
    assert.deepEqual(parseTodos(""), []);
    assert.deepEqual(parseTodos(null), []);
    assert.deepEqual(parseTodos("pas de todos ici"), []);
  });

  it("gère un gros plan multi-lignes", () => {
    const md = `
- [ ] lire la structure
- [ ] proposer un plan
- [x] écrire le code
- [x] écrire les tests
- [ ] déployer
`;
    const todos = parseTodos(md);
    assert.equal(todos.length, 5);
    assert.equal(todos.filter((t) => t.done).length, 2);
  });
});
