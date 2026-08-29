import { useEffect, useRef, useState } from "react";
import Icon, { BeaverMark } from "./Icon.jsx";
import { PLATFORMS, RELEASE_BASE, buildFiles, detectOS } from "../data/platforms.js";
import { useArch } from "../lib/useArch.js";

const UNINSTALL = {
  mac: "scripts/uninstall-macos.sh du dépôt",
  win: "Paramètres → Applications → « Castor Desktop » → Désinstaller",
  linux: "sudo apt remove castor-desktop (deb) — ou supprime l'AppImage + ~/.config/castor-desktop",
};

export default function DownloadModal({ open, onClose }) {
  const [started, setStarted] = useState(null);
  const arch = useArch();
  const detected = detectOS();
  const panelRef = useRef(null);
  const restoreRef = useRef(null);

  /* focus trap + Échap + restauration du focus */
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

        <div className="dl-modal__header">
          <span className="dl-modal__logo"><BeaverMark size={36} /></span>
          <h3>Télécharger Castor Desktop</h3>
          <p className="dl-sub">
            {detected && detected !== "ios"
              ? "Ton OS est détecté — un clic et c'est parti."
              : detected === "ios"
                ? "Castor Desktop n'existe pas sur iOS — ouvre-le depuis Safari sur Mac."
                : "Choisis ton habitat :"}
          </p>
        </div>

        {detected !== "ios" && (
          <div className="dl-modal__grid">
            {PLATFORMS.map((p) => {
              const files = buildFiles(p.os, arch);
              if (!files) return null;
              const rec = detected === p.os;
              return (
                <article
                  key={p.os}
                  className={`dl-compare__card ${rec ? "dl-compare__card--detected" : ""}`}
                >
                  {rec && <span className="dl-compare__detected">Ton OS ✓</span>}

                  <div className="dl-compare__header">
                    <span
                      className="dl-compare__icon"
                      style={{ background: `color-mix(in srgb, ${p.color} 14%, transparent)` }}
                    >
                      <Icon name={p.icon} size={28} />
                    </span>
                    <div>
                      <h3>{p.name}</h3>
                      <span className="dl-compare__size">{files.installer.size}</span>
                    </div>
                  </div>

                  <ul className="dl-compare__features">
                    {p.features.map((f) => (
                      <li key={f}>
                        <span className="dl-compare__check" style={{ color: p.color }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="dl-compare__actions">
                    <a
                      className="btn btn--primary btn--sm"
                      href={`${RELEASE_BASE}/${files.installer.file}`}
                      download
                      onClick={() => setStarted(p.os)}
                    >
                      <Icon name="download" size={16} />
                      {files.installer.sub}
                    </a>
                    {files.alts.map((alt) => (
                      <a
                        key={alt.file}
                        className="dl-compare__alt"
                        href={`${RELEASE_BASE}/${alt.file}`}
                        download
                        onClick={() => setStarted(p.os)}
                      >
                        {alt.label}
                      </a>
                    ))}
                  </div>

                  <p className="dl-compare__install">
                    <Icon name="terminal" size={13} />
                    <code>{p.install}</code>
                  </p>
                </article>
              );
            })}
          </div>
        )}

        {started && (
          <div className="dl-success" role="status">
            <span className="dl-success__icon">✓</span>
            <div>
              <strong>Téléchargement lancé</strong>
              <p>Pour désinstaller plus tard : {UNINSTALL[started]}</p>
            </div>
          </div>
        )}

        <p className="dl-footer-note">Gratuit · Open source · Multi-providers</p>
      </div>
    </div>
  );
}
