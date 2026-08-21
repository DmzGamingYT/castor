import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";

const BUILDS = [
  {
    id: "mac",
    icon: "apple",
    label: "macOS",
    sub: "Apple Silicon · zip",
    file: "Castor-macOS-arm64.zip",
    size: "94 Mo",
  },
  {
    id: "win",
    icon: "windows",
    label: "Windows",
    sub: "arm64 · portable zip",
    file: "Castor-Windows-arm64-portable.zip",
    size: "115 Mo",
  },
  {
    id: "linux",
    icon: "linux",
    label: "Linux",
    sub: "arm64 · tar.gz portable",
    file: "Castor-Linux-arm64.tar.gz",
    size: "106 Mo",
  },
];

const HINTS = {
  mac: "Ouvre le zip et glisse Castor.app dans tes Applications. Si macOS bloque au premier lancement (app non notarisée) : Réglages → Confidentialité et sécurité → « Ouvrir même ainsi », ou dans un terminal : xattr -cr /Applications/Castor.app",
  win: "Dézippe l'archive puis lance Castor.exe — rien à installer.",
  linux: "Extrais l'archive puis lance le binaire Castor.",
};

export function detectOS() {
  const ua = navigator.userAgent;
  if (/Mac|iPhone|iPad/i.test(ua)) return "mac";
  if (/Win/i.test(ua)) return "win";
  if (/Linux|X11/i.test(ua)) return "linux";
  return null;
}

export default function DownloadModal({ open, onClose }) {
  const [started, setStarted] = useState(null);
  const detected = detectOS();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
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
      <div className="dl-modal" onClick={(e) => e.stopPropagation()}>
        <button className="dl-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>

        <span className="hero__badge">Gratuit · sans compte</span>
        <h3>Télécharger Castor Desktop</h3>
        <p className="dl-sub">
          {detected
            ? "Ta plateforme est présélectionnée — un clic et c'est parti."
            : "Choisis ta plateforme :"}
        </p>

        <div className="dl-list">
          {BUILDS.map((b) => (
            <a
              key={b.id}
              className={`os-row ${detected === b.id ? "os-row--rec" : ""}`}
              href={`/downloads/${b.file}`}
              download
              onClick={() => setStarted(b.id)}
            >
              <span className="os-row__icon" aria-hidden="true">
                <Icon name={b.icon} size={24} />
              </span>
              <span className="os-row__meta">
                <strong>
                  {b.label}
                  {detected === b.id && (
                    <em className="os-row__badge">recommandé pour toi</em>
                  )}
                </strong>
                <small>{b.sub} · {b.size}</small>
              </span>
              <span className="os-row__action" aria-hidden="true">⬇</span>
            </a>
          ))}
        </div>

        {started && (
          <p className="dl-note" role="status">
            <strong>Téléchargement lancé ✓</strong> {HINTS[started]}
          </p>
        )}

        <p className="dl-foot">
          Multi-providers : OpenRouter, Groq, OpenCode Zen, modèles locaux.
        </p>
      </div>
    </div>
  );
}
