import { describe, expect, it } from "vitest";
import { PROVIDERS, isChatModel } from "../cli/lib/providers.js";

describe("providers (CLI)", () => {
  it("chaque provider a les champs requis", () => {
    for (const p of PROVIDERS) {
      expect(p.id).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.baseURL).toMatch(/^https?:\/\//);
      expect(typeof p.needsKey).toBe("boolean");
      if (p.needsKey) {
        expect(p.keyUrl).toMatch(/^https?:\/\//);
      }
    }
  });

  it("les ids sont uniques et le premier est openrouter", () => {
    const ids = PROVIDERS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids[0]).toBe("openrouter");
  });

  it("isChatModel exclut modération et musique", () => {
    expect(isChatModel("openai/gpt-4o")).toBe(true);
    expect(isChatModel("x/content-safety-1")).toBe(false);
    expect(isChatModel("lyria-music")).toBe(false);
    expect(isChatModel(undefined)).toBe(true);
  });
});
