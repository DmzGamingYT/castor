import { describe, expect, it } from "vitest";
import { shortId } from "./models.js";

describe("shortId", () => {
  it("retire le préfixe provider", () => {
    expect(shortId("stealth/ox-alpha")).toBe("ox-alpha");
    expect(shortId("nvidia/nemotron-3-ultra-550b-a55b:free")).toBe(
      "nemotron-3-ultra-550b-a55b"
    );
  });
  it("retire le suffixe :free", () => {
    expect(shortId("poolside/laguna-s-2.1:free")).toBe("laguna-s-2.1");
  });
  it("garde les suffixes utiles (taille locale)", () => {
    expect(shortId("qwen3-coder:30b")).toBe("qwen3-coder:30b");
  });
  it("laisse un id simple intact", () => {
    expect(shortId("llama-3.3-70b-versatile")).toBe("llama-3.3-70b-versatile");
  });
  it("ne jette pas si l'id est absent", () => {
    expect(shortId()).toBe("");
    expect(shortId(undefined)).toBe("");
  });
});
