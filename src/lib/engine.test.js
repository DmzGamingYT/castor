import { describe, expect, it } from "vitest";
import { demoAnswer, streamDemo } from "./chatEngine.js";
import { generateSite, titleFromHtml, THEME_LIST } from "./generator.js";

describe("generateSite", () => {
  it("renvoie un document HTML autonome", () => {
    const site = generateSite("Un blog de recettes végé");
    expect(site.html).toMatch(/^<!doctype html>/i);
    expect(site.html).toContain("</html>");
  });
  it("détecte le bon gabarit selon le prompt", () => {
    expect(generateSite("Un quiz de révision").kind).toBe("quiz");
    expect(generateSite("Un tracker d'habitudes").kind).toBe("todo");
    expect(generateSite("Le portfolio d'un photographe").kind).toBe("portfolio");
  });
  it("échappe le titre extrait du prompt", () => {
    const site = generateSite('un site "<script>alert(1)</script>"');
    expect(site.html).not.toContain("<script>alert");
  });
  it("respecte le thème demandé", () => {
    const site = generateSite("un site", "ciel");
    expect(site.theme).toBe("ciel");
    expect(THEME_LIST).toContain("ciel");
  });
});

describe("titleFromHtml", () => {
  it("lit la balise <title>", () => {
    expect(titleFromHtml("<html><title>Mon beau site</title></html>", "x")).toBe(
      "Mon beau site"
    );
  });
  it("retombe sur le h1 puis sur le prompt", () => {
    expect(titleFromHtml("<h1>Titre H1</h1>", "fallback")).toBe("Titre H1");
    expect(titleFromHtml("<div>rien</div>", "un tracker d'habitudes")).toBeTruthy();
  });
});

describe("mode démo", () => {
  it("répond toujours quelque chose de non vide", () => {
    expect(demoAnswer("explique-moi les llm")).toContain("LLM");
    expect(demoAnswer("question hors sujet")).toContain("mode démo");
  });
  it("streamDemo respecte l'abort", async () => {
    const ctrl = new AbortController();
    ctrl.abort();
    let calls = 0;
    await streamDemo("un texte assez long pour plusieurs mots", () => calls++, ctrl.signal);
    expect(calls).toBe(0);
  });
  it("streamDemo délivre tout le texte sans abort", async () => {
    let acc = "";
    await streamDemo("mot1 mot2 mot3", (d) => (acc += d));
    expect(acc).toContain("mot1");
    expect(acc).toContain("mot3");
  });
});
