import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

/* le module CLI calcule son dossier au chargement depuis HOME/USERPROFILE :
   on repointe HOME vers un dossier temporaire AVANT de le charger
   (createRequire → chargement natif CommonJS, hors transformation Vite) */
let tmp;
let store;

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "castor-cli-test-"));
  process.env.HOME = tmp;
  process.env.USERPROFILE = tmp;
  const req = createRequire(process.cwd() + "/");
  const modPath = req.resolve("./cli/lib/store.js");
  delete req.cache[modPath]; // recharge le module avec le nouveau HOME
  store = req(modPath);
});

afterEach(() => {
  try {
    fs.rmSync(tmp, { recursive: true, force: true });
  } catch {
    /* rien */
  }
});

describe("store (CLI)", () => {
  it("loadConfig préserve le champ onboarded", () => {
    store.saveConfig({ onboarded: true, provider: "groq" });
    const cfg = store.loadConfig();
    expect(cfg.onboarded).toBe(true);
    expect(cfg.provider).toBe("groq");
  });

  it("loadConfig fournit des valeurs par défaut sûres", () => {
    const cfg = store.loadConfig();
    expect(cfg.onboarded).toBe(false);
    expect(cfg.provider).toBe("openrouter");
    expect(cfg.keys).toEqual({});
    expect(cfg.usage).toEqual({ requests: 0, totalTokens: 0 });
  });

  it("préserve les champs inconnus du futur", () => {
    store.saveConfig({ onboarded: true, customField: "ok" });
    expect(store.loadConfig().customField).toBe("ok");
  });

  it("écrit les fichiers sensibles en 0600", () => {
    store.saveMemory([{ id: 1, text: "secret" }]);
    const stat = fs.statSync(path.join(tmp, ".castor", "memory.json"));
    expect(stat.mode & 0o777).toBe(0o600);
  });
});
