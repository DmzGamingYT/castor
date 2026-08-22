import { describe, expect, it } from "vitest";
import { parseTodos } from "../cli/lib/todos.js";

describe("parseTodos", () => {
  it("extrait les cases cochées et non cochées", () => {
    const t = parseTodos("- [ ] lire le projet\n- [x] écrire le code\n* [ ] tester");
    expect(t).toHaveLength(3);
    expect(t[0]).toEqual({ label: "lire le projet", done: false });
    expect(t[1]).toEqual({ label: "écrire le code", done: true });
    expect(t[2].label).toBe("tester");
  });

  it("coche une entrée re-déclarée plus bas", () => {
    const t = parseTodos("- [ ] étape A\n...texte...\n- [x] étape A");
    expect(t).toHaveLength(1);
    expect(t[0].done).toBe(true);
  });

  it("déduplique les libellés", () => {
    expect(parseTodos("- [ ] x\n- [ ] x")).toHaveLength(1);
  });

  it("ignore les listes sans case", () => {
    expect(parseTodos("- simple puce\n1. numérotée")).toHaveLength(0);
  });

  it("ne jette pas sur une entrée vide ou non-string", () => {
    expect(parseTodos("")).toHaveLength(0);
    expect(parseTodos(null)).toHaveLength(0);
    expect(parseTodos(undefined)).toHaveLength(0);
  });
});
