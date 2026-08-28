import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import { BeaverMark } from "./Icon.jsx";

const RELEASE_BASE =
  "https://github.com/DmzGamingYT/castor/releases/latest/download";

const HINTS = {
  mac: "Ouvre le .dmg et glisse Castor.app dans tes Applications. Si macOS bloque : Réglages → Confidentialité et sécurité → « Ouvrir même ainsi ».",
  win: "Lance l'installateur, choisis ton dossier : Castor s'installe avec un raccourci bureau et menu démarrer.",
  linux: "Deb : sudo apt install ./Castor-Linux-arm64.deb (ou gdebi). AppImage : chmod +x puis double-clic.",
};

const UNINSTALL = {
  mac: "scripts/uninstall-macos.sh du dépôt",
  win: "Paramètres → Applications → « Castor Desktop » → Désinstaller",
  linux: "sudo apt remove castor-desktop (deb) — ou supprime l'AppImage + ~/.config/castor-desktop",
};

function detectOS() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Mac/i.test(ua)) return "mac";
  if (/Win/i.test(ua)) return "win";
  if (/Linux|X11/i.test(ua)) return "linux";
  return null;
}

function buildFiles(os, arch) {
  const a = os === "win" && arch === "x86" ? "x64" : "arm64";
  switch (os) {
    case "mac":
      return {
        installer: { file: `Castor-macOS-arm64.dmg`, sub: "Apple Silicon · glisser-déposer", size: "~96 Mo" },
        alts: [
          { file: `Castor-macOS-arm64.zip`, label: "Version portable (zip)" },
          { file: `Castor-macOS-x64.dmg`, label: "Mac Intel (x64)" },
        ],
      };
    case "win":
      return {
        installer: { file: `Castor-Windows-${a}-setup.exe`, sub: `${a === "x64" ? "Intel/AMD (x64)" : "ARM"} · installateur`, size: "~115 Mo" },
        alts: [
          { file: `Castor-Windows-${a}-portable.zip`, label: "Version portable (zip)" },
          a === "arm64"
            ? { file: `Castor-Windows-x64-setup.exe`, label: "PC Intel/AMD (x64)" }
            : { file: `Castor-Windows-arm64-setup.exe`, label: "PC ARM" },
        ],
      };
    case "linux":
      return {
        installer: { file: `Castor-Linux-arm64.deb`, sub: "Debian / Ubuntu · .deb", size: "~95 Mo" },
        alts: [
          { file: `Castor-Linux-arm64.AppImage`, label: "AppImage (toutes distros)" },
          { file: `Castor-Linux-arm64.tar.gz`, label: "Archive tar.gz" },
        ],
      };
    default:
      return null;
  }
}

const OS_META = {
  mac: { label: "macOS", icon: "apple", color: "var(--accent)" },
  win: { label: "Windows", icon: "windows", color: "var(--river)" },
  linux: { label: "Linux", icon: "linux", color: "var(--sage)" },
};

export default function DownloadModal({ open, onClose }) {
  const [started, setStarted] = useState(null);
  const [arch, setArch] = useState(null);
  const detected = detectOS();
  const panelRef = useRef(null);
  const restoreRef = useRef(null);

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
    return () => { alive = false; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement;
    panelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll('a[href], button:not([disabled])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  useEffect(() => { if (!open) setStarted(null); }, [open]);

  if (!open) return null;

  return (
    <div className="dl-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Télécharger Castor">
      <div className="dl-modal" onClick={(e) => e.stopPropagation()} ref={panelRef} tabIndex={-1}>
        <button className="dl-close" onClick={onClose} aria-label="Fermer">×</button>

        {/* Header avec logo castor */}
        <div className="dl-modal__header">
          <span className="dl-modal__logo">
            <BeaverMark size={36} />
          </span>
          <h3>Télécharger Castor Desktop</h3>
          <p className="dl-sub">
            {detected && detected !== "ios"
              ? "Ta plateforme est détectée — un clic et c'est parti."
              : detected === "ios"
                ? "Castor Desktop n'existe pas sur iOS — ouvre-le depuis Safari sur Mac."
                : "Choisis ta plateforme :"}
          </p>
        </div>

        {detected !== "ios" && (
          <div className="dl-list">
            {["mac", "win", "linux"].map((os) => {
              const files = buildFiles(os, arch);
              if (!files) return null;
              const rec = detected === os;
              const meta = OS_META[os];
              return (
                <div key={os} className="dl-os">
                  <a
                    className={`os-row ${rec ? "os-row--rec" : ""}`}
                    href={`${RELEASE_BASE}/${files.installer.file}`}
                    download
                    onClick={() => setStarted(os)}
                  >
                    <span className="os-row__icon" aria-hidden="true">
                      <Icon name={meta.icon} size={22} />
                    </span>
                    <span className="os-row__meta">
                      <strong>
                        {meta.label}
                        {rec && <em className="os-row__badge">Recommandé</em>}
                      </strong>
                      <small>{files.installer.sub} · {files.installer.size}</small>
                    </span>
                    <span className="os-row__action" aria-hidden="true">⬇</span>
                  </a>
                  <div className="os-row__alts">
                    {files.alts.map((alt) => (
                      <a key={alt.file} href={`${RELEASE_BASE}/${alt.file}`} download onClick={() => setStarted(os)}>
                        {alt.label}
                      </a>
                    ))}
                  </div>
                  {started === os && (
                    <div className="dl-success" role="status">
                      <span className="dl-success__icon">✓</span>
                      <div>
                        <strong>Téléchargement lancé</strong>
                        <p>{HINTS[os]}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {started && (
          <div className="dl-uninstall">
            <Icon name="trash" size={14} />
            <span>Désinstallation : {UNINSTALL[started]}</span>
          </div>
        )}

        <p className="dl-footer-note">
          Multi-providers · Clés chiffrées · 100% gratuit
        </p>
      </div>
    </div>
  );
}
