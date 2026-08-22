import { useEffect, useRef, useState } from "react";
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

function detectOS() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Mac/i.test(ua)) return "mac";
  if (/Win/i.test(ua)) return "win";
  if (/Linux|X11/i.test(ua)) return "linux";
  return null;
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
            ? "Ta plateforme est présélectionnée — un clic et c'est parti."
            : detected === "ios"
              ? "Castor Desktop n'existe pas sur iOS — sur Mac, ouvre castor depuis Safari :"
              : "Choisis ta plateforme :"}
        </p>

        {detected !== "ios" && (
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
                    {detected === b.id &&
                      (arch === "x86" ? (
                        <em className="os-row__badge">⚠ build arm64 — ton appareil semble x86</em>
                      ) : (
                        <em className="os-row__badge">recommandé pour toi</em>
                      ))}
                  </strong>
                  <small>{b.sub} · {b.size}</small>
                </span>
                <span className="os-row__action" aria-hidden="true">⬇</span>
              </a>
            ))}
          </div>
        )}

        {arch === "x86" && detected !== "ios" && (
          <p className="dl-note" role="status">
            <strong>⚠ Ton appareil semble x86_64.</strong> Seules des builds arm64 sont
            disponibles pour l'instant — le fichier risque de ne pas fonctionner sur ta machine.
          </p>
        )}

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
