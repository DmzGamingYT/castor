import { afterEach, describe, expect, it, vi } from "vitest";
import ui from "../cli/lib/ui.js";

describe("ui (CLI)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sseEvents extrait les data: de plusieurs événements", () => {
    const raw = 'data: {"a":1}\n\ndata: [DONE]\n\n: keepalive\ndata: {"b":2}';
    expect(ui.sseEvents(raw)).toEqual(['{"a":1}', "[DONE]", '{"b":2}']);
  });

  it("sseEvents ignore les lignes vides et non-data", () => {
    expect(ui.sseEvents("event: ping\n\n")).toEqual([]);
  });

  it("estTok estime ~4 caractères par token", () => {
    expect(ui.estTok(0)).toBe(0);
    expect(ui.estTok(1)).toBe(1);
    expect(ui.estTok(400)).toBe(100);
  });

  it("fmtTok passe au format k au-delà de 10 000", () => {
    expect(ui.fmtTok(999)).toBe("999");
    expect(ui.fmtTok(15000)).toBe("15.0k");
  });
});
