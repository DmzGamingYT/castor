import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  renderMarkdown,
  shortName,
  shouldSubmit,
  slugify,
  sortModelsByPreference,
} from "./utils.js";

describe("shortName", () => {
  it("retire le suffixe (free)", () => {
    expect(shortName("x/y:free", "Modèle (free)")).toBe("Modèle");
  });
  it("retombe sur l'id si pas de nom", () => {
    expect(shortName("stealth/ox-alpha")).toBe("stealth/ox-alpha");
  });
  it("ne jette pas si id et name sont absents", () => {
    expect(shortName(undefined, undefined)).toBe("");
  });
});

describe("slugify", () => {
  it("gère les accents et la ponctuation", () => {
    expect(slugify("Portfolio d'un photographe !")).toBe("portfolio-d-un-photographe");
  });
  it("tronque à 28 caractères", () => {
    expect(slugify("a".repeat(50))).toHaveLength(28);
    expect(slugify("Le portfolio d'un photographe animalier")).toMatch(/^le-portfolio-d-un-photograph/);
  });
  it("a toujours une valeur de repli", () => {
    expect(slugify("!!!")).toBe("mon-site");
  });
});

describe("escapeHtml / renderMarkdown", () => {
  it("échappe le HTML dangereux", () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).not.toContain("<img");
  });
  it("ne laisse passer aucune balise via le markdown", () => {
    const out = renderMarkdown('<script>alert("xss")</script>');
    expect(out).not.toContain("<script>");
    expect(out).toContain("&lt;script&gt;");
  });
  it("transforme gras, italique, listes et code inline", () => {
    const out = renderMarkdown("**gras**\n*italique*\n- puce\n1. num `code`");
    expect(out).toContain("<strong>gras</strong>");
    expect(out).toContain("<em>italique</em>");
    expect(out).toContain("• puce");
    expect(out).toContain("1. num");
    expect(out).toContain("<code>code</code>");
  });
  it("transforme les blocs de code en <pre>", () => {
    const out = renderMarkdown("avant\n```js\nconst x = 1;\n```\naprès");
    expect(out).toContain("<pre>");
    expect(out).toContain("const x = 1;");
  });
});

describe("sortModelsByPreference", () => {
  it("place les modèles préférés en premier, puis trie par contexte", () => {
    const list = [
      { id: "a/long", ctx: 1000000 },
      { id: "poolside/laguna-xs-2.1:free", ctx: 262144 },
      { id: "b/mid", ctx: 500000 },
      { id: "stealth/ox-alpha", ctx: 1048576 },
    ];
    const sorted = sortModelsByPreference(list);
    expect(sorted[0].id).toBe("stealth/ox-alpha");
    expect(sorted[1].id).toBe("poolside/laguna-xs-2.1:free");
    expect(sorted[2].id).toBe("a/long");
    expect(sorted[3].id).toBe("b/mid");
  });
  it("ne mute pas la liste d'origine", () => {
    const list = [{ id: "a", ctx: 1 }, { id: "b", ctx: 2 }];
    sortModelsByPreference(list);
    expect(list[0].id).toBe("a");
  });
});

describe("shouldSubmit (garde IME)", () => {
  const evt = (key, extra = {}) => ({
    key,
    shiftKey: false,
    nativeEvent: {},
    ...extra,
  });
  it("valide Entrée simple", () => {
    expect(shouldSubmit(evt("Enter"))).toBe(true);
  });
  it("refuse Shift+Entrée", () => {
    expect(shouldSubmit(evt("Enter", { shiftKey: true }))).toBe(false);
  });
  it("refuse Entrée pendant une composition IME", () => {
    expect(shouldSubmit(evt("Enter", { nativeEvent: { isComposing: true } }))).toBe(false);
  });
});
