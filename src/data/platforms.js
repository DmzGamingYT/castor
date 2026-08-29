/* Source de vérité des plateformes de téléchargement.
   Partagée entre DownloadCompare (section de la page) et
   DownloadModal (modale avec détection d'architecture). */

export const RELEASE_BASE =
  "https://github.com/DmzGamingYT/castor/releases/latest/download";

/* OS détecté (y compris iOS, présent pour le message de la modale). */
export function detectOS() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Mac/i.test(ua)) return "mac";
  if (/Win/i.test(ua)) return "win";
  if (/Linux|X11/i.test(ua)) return "linux";
  return null;
}

/* Architecture UA normalisée vers "x64" | "arm64" | null. */
export function normalizeArch(uaArch) {
  const a = String(uaArch || "").toLowerCase();
  if (a === "arm") return "arm64";
  if (a === "x86") return "x64";
  return null;
}

/* Fichiers d'installation par OS. L'architecture ne sert qu'à Windows. */
const OS_FILES = {
  mac: () => ({
    installer: { file: "Castor-macOS-arm64.dmg", sub: "Apple Silicon", size: "~96 Mo" },
    alts: [
      { file: "Castor-macOS-arm64.zip", label: "Portable (zip)" },
      { file: "Castor-macOS-x64.dmg", label: "Intel (x64)" },
    ],
  }),
  win: (arch) => {
    const a = arch === "x64" ? "x64" : "arm64";
    return {
      installer: {
        file: `Castor-Windows-${a}-setup.exe`,
        sub: a === "x64" ? "Intel/AMD (x64)" : "ARM64",
        size: "~115 Mo",
      },
      alts: [
        { file: `Castor-Windows-${a}-portable.zip`, label: "Portable (zip)" },
        a === "arm64"
          ? { file: "Castor-Windows-x64-setup.exe", label: "Intel/AMD (x64)" }
          : { file: "Castor-Windows-arm64-setup.exe", label: "ARM64" },
      ],
    };
  },
  linux: () => ({
    installer: { file: "Castor-Linux-arm64.deb", sub: "Debian / Ubuntu", size: "~95 Mo" },
    alts: [
      { file: "Castor-Linux-arm64.AppImage", label: "AppImage (toutes distros)" },
      { file: "Castor-Linux-arm64.tar.gz", label: "Archive tar.gz" },
    ],
  }),
};

/* Fichiers liés à l'OS et à l'architecture détectée (null si OS inconnu). */
export function buildFiles(os, arch) {
  return OS_FILES[os] ? OS_FILES[os](arch) : null;
}

export const PLATFORMS = [
  {
    os: "mac",
    name: "macOS",
    icon: "apple",
    color: "var(--accent)",
    features: [
      "Glisser-déposer dans Applications",
      "Clés API chiffrées via Keychain",
      "Notifications natives",
      "Menubar intégrée",
    ],
    install: "Ouvre le .dmg → glisse Castor.app",
  },
  {
    os: "win",
    name: "Windows",
    icon: "windows",
    color: "var(--river)",
    features: [
      "Installateur avec raccourci bureau",
      "Clés API chiffrées via DPAPI",
      "Menu démarrer intégré",
      "Mise à jour auto",
    ],
    install: "Lance l'installateur → terminé",
  },
  {
    os: "linux",
    name: "Linux",
    icon: "linux",
    color: "var(--sage)",
    features: [
      "Paquet .deb ou AppImage",
      "Clés API chiffrées via libsecret",
      "Zéro dépendance système",
      "Léger et rapide",
    ],
    install: "sudo apt install ./Castor.deb",
  },
];