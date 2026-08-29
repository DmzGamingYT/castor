import { describe, expect, it } from "vitest";
import { buildFiles, normalizeArch } from "./platforms.js";

describe("normalizeArch", () => {
  it("mappe arm → arm64", () => {
    expect(normalizeArch("arm")).toBe("arm64");
    expect(normalizeArch("ARM")).toBe("arm64");
  });
  it("mappe x86 → x64", () => {
    expect(normalizeArch("x86")).toBe("x64");
    expect(normalizeArch("X86")).toBe("x64");
  });
  it("traite uniquement les valeurs UA brutes (déjà normalisées → null)", () => {
    expect(normalizeArch("x64")).toBeNull();
    expect(normalizeArch("arm64")).toBeNull();
  });
  it("renvoie null pour une archi inconnue ou absente", () => {
    expect(normalizeArch("")).toBeNull();
    expect(normalizeArch(undefined)).toBeNull();
    expect(normalizeArch(null)).toBeNull();
    expect(normalizeArch("riscv")).toBeNull();
  });
});

describe("buildFiles · macOS", () => {
  it("propose le build Apple Silicon, l'archi n'a pas d'effet", () => {
    const f = buildFiles("mac", "arm64");
    expect(f.installer.file).toBe("Castor-macOS-arm64.dmg");
    expect(f.installer.sub).toBe("Apple Silicon");
    expect(buildFiles("mac", "x64").installer.file).toBe("Castor-macOS-arm64.dmg");
  });
  it("liste les alternatives portable + Intel", () => {
    const f = buildFiles("mac", "arm64");
    expect(f.alts.map((a) => a.file)).toEqual([
      "Castor-macOS-arm64.zip",
      "Castor-macOS-x64.dmg",
    ]);
  });
});

describe("buildFiles · Windows", () => {
  it("sélectionne le build x64 détecté", () => {
    const f = buildFiles("win", "x64");
    expect(f.installer.file).toBe("Castor-Windows-x64-setup.exe");
    expect(f.installer.sub).toBe("Intel/AMD (x64)");
    expect(f.alts.map((a) => a.file)).toEqual([
      "Castor-Windows-x64-portable.zip",
      "Castor-Windows-arm64-setup.exe",
    ]);
  });
  it("sélectionne le build arm64 détecté", () => {
    const f = buildFiles("win", "arm64");
    expect(f.installer.file).toBe("Castor-Windows-arm64-setup.exe");
    expect(f.installer.sub).toBe("ARM64");
    expect(f.alts.map((a) => a.file)).toEqual([
      "Castor-Windows-arm64-portable.zip",
      "Castor-Windows-x64-setup.exe",
    ]);
  });
  it("retombe sur arm64 quand l'archi est inconnue", () => {
    expect(buildFiles("win", null).installer.file).toBe(
      "Castor-Windows-arm64-setup.exe"
    );
  });
});

describe("buildFiles · Linux", () => {
  it("propose le build arm64 deb + alternatives", () => {
    const f = buildFiles("linux", null);
    expect(f.installer.file).toBe("Castor-Linux-arm64.deb");
    expect(f.installer.sub).toBe("Debian / Ubuntu");
    expect(f.alts.map((a) => a.file)).toEqual([
      "Castor-Linux-arm64.AppImage",
      "Castor-Linux-arm64.tar.gz",
    ]);
  });
});

describe("buildFiles · OS inconnu", () => {
  it("renvoie null", () => {
    expect(buildFiles("ios", null)).toBeNull();
    expect(buildFiles("tata", "x64")).toBeNull();
  });
});