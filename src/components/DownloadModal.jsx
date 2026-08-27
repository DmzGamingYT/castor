import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";

/* Les binaires sont servis depuis la dernière Release GitHub
   (public/downloads/ reste un cache local ignoré par git).
   Chaque OS propose un installer recommandé + des versions portables. */
const RELEASE_BASE =
  "https://github.com/DmzGamingYT/castor/releases/latest/download";

const HINTS = {
  mac: "Ouvre le .dmg et glisse Castor.app dans tes Applications. Si macOS bloque au premier lancement (app non notarisée) : Réglages → Confidentialité et sécurité → « Ouvrir même ainsi », ou dans un terminal : xattr -cr /Applications/Castor.app",
  win: "Lance l'installateur, choisis ton dossier : Castor s'installe avec un raccourci bureau et menu démarrer.",
  linux: "Deb : sudo apt install ./Castor-Linux-arm64.deb (ou gdebi). AppImage : chmod +x puis double-clic.",
};

const UNINSTALL = {
  mac: "Désinstallation complète : scripts/uninstall-macos.sh du dépôt (retire l'app, les réglages et les données locales).",
  win: "Désinstallation propre : Paramètres → Applications → « Castor Desktop » → Désinstaller (le raccourci et les réglages sont retirés avec).",
  linux:
    "Désinstallation : sudo apt remove castor-desktop (pour le .deb) — l'AppImage se supprime en supprimant le fichier, puis ~/.config/castor-desktop.",
};

function detectOS() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Mac/i.test(ua)) return "mac";
  if (/Win/i.test(ua)) return "win";
  if (/Linux|X11/i.test(ua)) return "linux";
  return null;
}

/* lie le nom de fichier à l'architecture détectée (win) ou par défaut (arm64) */
function buildFiles(os, arch) {
  const a = os === "win" && arch === "x86" ? "x64" : "arm64";
  switch (os) {
    case "mac":
      return {
        installer: { file: `Castor-macOS-arm64.dmg`, sub: "Apple Silicon · glisser-déposer", size: "~96 Mo" },
        alts: [
          { file: `Castor-macOS-arm64.zip`, label: "Version portable (zip, sans installation)" },
          { file: `Castor-macOS-x64.dmg`, label: "Mac Intel (x64) — installateur" },
        ],
      };
    case "win":
      return {
        installer: { file: `Castor-Windows-${a}-setup.exe`, sub: `${a === "x64" ? "Intel/AMD (x64)" : "ARM"} · installateur`, size: "~115 Mo" },
        alts: [
          { file: `Castor-Windows-${a}-portable.zip`, label: "Version portable (zip, sans installation)" },
          a === "arm64"
            ? { file: `Castor-Windows-x64-setup.exe`, label: "PC Intel/AMD (x64) — installateur" }
            : { file: `Castor-Windows-arm64-setup.exe`, label: "PC ARM — installateur" },
        ],
      };
    case "linux":
      return {
        installer: { file: `Castor-Linux-arm64.deb`, sub: "Debian / Ubuntu · paquet .deb", size: "~95 Mo" },
        alts: [
          { file: `Castor-Linux-arm64.AppImage`, label: "AppImage portable (toutes distros)" },
          { file: `Castor-Linux-arm64.tar.gz`, label: "Archive tar.gz portable" },
        ],
      };
    default:
      return null;
  }
}

export default function DownloadModal({ open, onClose }) {
  const [started, setStarted] = useState(null);
  const [arch, setArch] = useState(null); // "arm" | "x86" | null
  const detected = detectOS();
  const panelRef = useRef(null);
  const restoreRef = useRef(null);

  /* détection de l'architecture (Chromium uniquement — sinon on reste neutre) */
  useEffect(() => {
    if (!open) return;
    const uad = navigator.userAgentData;
    if (!uad?.getHighEntropyValues) return;
    let alive = true;
    uad
      .getHighEntropyValues(["architecture"])
      .then((v) => {
        if (!alive) return;
        const a = String(v.architecture || "").toLowerCase();
        setArch(a === "arm" ? "arm" : a === "x86" ? "x86" : null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [open]);

  /* focus trap + Échap + restauration du focus à la fermeture */
  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement;
    panelRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setStarted(null);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="dl-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Télécharger Castor"
    >
      <div className="dl-modal" onClick={(e) => e.stopPropagation()} ref={panelRef} tabIndex={-1}>
        <button className="dl-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>

        <span className="hero__badge">Gratuit · sans compte</span>
        <h3>Télécharger Castor Desktop</h3>
        <p className="dl-sub">
          {detected && detected !== "ios"
            ? "Ta plateforme est présélectionnée — installateur ou portable, un clic et c'est parti."
            : detected === "ios"
              ? "Castor Desktop n'existe pas sur iOS — sur Mac, ouvre castor depuis Safari :"
              : "Choisis ta plateforme :"}
        </p>

        {detected !== "ios" && (
          <div className="dl-list">
            {["mac", "win", "linux"].map((os) => {
              const files = buildFiles(os, arch);
              if (!files) return null;
              const rec = detected === os;
              return (
                <div key={os} className="dl-os">
                  <a
                    className={`os-row ${rec ? "os-row--rec" : ""}`}
                    href={`${RELEASE_BASE}/${files.installer.file}`}
                    download
                    onClick={() => setStarted(os)}
                  >
                    <span className="os-row__icon" aria-hidden="true">
                      <Icon name={os === "mac" ? "apple" : os} size={24} />
                    </span>
                    <span className="os-row__meta">
                      <strong>
                        {os === "mac" ? "macOS" : os === "win" ? "Windows" : "Linux"}
                        {rec && (
                          <em className="os-row__badge">
                            {os === "win" && arch === "x86"
                              ? "x64 — adapté à ton appareil"
                              : "installateur recommandé"}
                          </em>
                        )}
                      </strong>
                      <small>
                        {files.installer.sub} · {files.installer.size}
                      </small>
                    </span>
                    <span className="os-row__action" aria-hidden="true">⬇</span>
                  </a>
                  <div className="os-row__alts">
                    {files.alts.map((alt) => (
                      <a
                        key={alt.file}
                        href={`${RELEASE_BASE}/${alt.file}`}
                        download
                        onClick={() => setStarted(os)}
                      >
                        {alt.label}
                      </a>
                    ))}
                  </div>
                  {started === os && (
                    <p className="dl-note" role="status">
                      <strong>Téléchargement lancé ✓</strong> {HINTS[os]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {started && (
          <p className="dl-note" role="status">
            <strong>Pour désinstaller plus tard :</strong> {UNINSTALL[started]}
          </p>
        )}

        <p className="dl-foot">
          Multi-providers : OpenRouter, Groq, OpenCode Zen, modèles locaux.
        </p>
      </div>
    </div>
  );
}
