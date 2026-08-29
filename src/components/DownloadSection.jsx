import { useEffect, useRef, useState } from "react";
import Icon, { BeaverMark } from "./Icon.jsx";
import { useNavigate } from "../lib/NavigationContext.jsx";
import { APP_VERSION } from "../lib/version.js";

const PLATFORMS = [
  { os: "mac", icon: "apple", label: "macOS", sub: "Apple Silicon · .dmg" },
  { os: "win", icon: "windows", label: "Windows", sub: "x64 · installateur" },
  { os: "linux", icon: "linux", label: "Linux", sub: "Deb · AppImage" },
];

const FEATURES = [
  { icon: "zap", label: "Démarrage < 1s" },
  { icon: "lock", label: "Clés chiffrées" },
  { icon: "plug", label: "Multi-providers" },
  { icon: "layers", label: "Agents parallèles" },
  { icon: "clock", label: "Agents planifiés" },
  { icon: "split", label: "Diff côte à côte" },
];

/* ─── Mockup de l'installateur ─── */
function InstallerMockup({ active }) {
  const [step, setStep] = useState(0);
  const timers = useRef([]);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    timers.current.forEach(clearTimeout);
    timers.current = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3400),
    ];
    return () => timers.current.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="dl-mockup">
      <div className="dl-mockup__window">
        <div className="dl-mockup__bar">
          <span className="dot dot--red" />
          <span className="dot dot--yellow" />
          <span className="dot dot--green" />
          <em>Castor Desktop — Installateur</em>
        </div>
        <div className="dl-mockup__body">
          {/* Sidebar */}
          <div className="dl-mockup__sidebar">
            <span className="dl-mockup__sidebar-logo">
              <BeaverMark size={20} />
            </span>
            {["Prérequis", "Installation", "Configuration", "Prêt"].map((label, i) => (
              <div key={label} className={`dl-mockup__step ${step >= i ? "dl-mockup__step--done" : ""}`}>
                <span className="dl-mockup__step-dot">
                  {step > i ? "✓" : step === i ? <span className="pulse-dot" /> : ""}
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
          {/* Main */}
          <div className="dl-mockup__main">
            {step === 0 && (
              <div className="dl-mockup__idle">
                <span className="dl-mockup__pkg-icon">📦</span>
                <strong>Castor Desktop</strong>
                <span className="dl-mockup__ver">v{APP_VERSION} · 96 Mo</span>
                <button className="btn btn--primary btn--sm" type="button">
                  Installer
                </button>
              </div>
            )}
            {step === 1 && (
              <div className="dl-mockup__progress-wrap">
                <span className="dl-mockup__pkg-icon">📦</span>
                <strong>Installation en cours…</strong>
                <div className="dl-mockup__progress">
                  <div className="dl-mockup__progress-fill" style={{ width: "65%" }} />
                </div>
                <span className="dl-mockup__progress-label">Copie des fichiers…</span>
              </div>
            )}
            {step === 2 && (
              <div className="dl-mockup__progress-wrap">
                <span className="dl-mockup__pkg-icon">⚙️</span>
                <strong>Configuration</strong>
                <div className="dl-mockup__progress">
                  <div className="dl-mockup__progress-fill dl-mockup__progress-fill--alt" style={{ width: "100%" }} />
                </div>
                <span className="dl-mockup__progress-label">Raccourci bureau créé ✓</span>
              </div>
            )}
            {step >= 3 && (
              <div className="dl-mockup__done">
                <span className="dl-mockup__done-icon">🦫</span>
                <strong>Castor est installé !</strong>
                <span className="dl-mockup__done-sub">Prêt à construire tes projets.</span>
                <div className="dl-mockup__done-actions">
                  <button className="btn btn--primary btn--sm" type="button">
                    Lancer Castor
                  </button>
                  <button className="btn btn--ghost btn--sm" type="button">
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* floating beaver mascot */}
      <span className={`dl-mockup__beaver ${step >= 3 ? "dl-mockup__beaver--celebrate" : ""}`} aria-hidden="true">
        🦫
      </span>
    </div>
  );
}

/* ─── Section complète ─── */
export default function DownloadSection({ onDownload }) {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="dl-section" id="telecharger" ref={sectionRef}>
      <div className="dl-section__inner">
        {/* Colonne gauche : texte */}
        <div className="dl-section__text">
          <span className="dl-section__eyebrow">
            <BeaverMark size={14} /> Téléchargement
          </span>
          <h2>Installe Castor.<br /><span className="hero__accent">Commence à builder.</span></h2>
          <p className="dl-section__desc">
            Un installateur par plateforme. Pas de compte, pas d'abonnement,
            pas de limite. Le castor s'installe en quelques secondes.
          </p>

          {/* Platform badges */}
          <div className="dl-section__platforms">
            {PLATFORMS.map((p) => (
              <button
                key={p.os}
                type="button"
                className="dl-section__platform"
                onClick={onDownload}
              >
                <Icon name={p.icon} size={18} />
                <span className="dl-section__platform-info">
                  <strong>{p.label}</strong>
                  <small>{p.sub}</small>
                </span>
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="dl-section__cta">
            <button type="button" className="btn btn--primary btn--lg" onClick={onDownload}>
              Télécharger Castor Desktop
            </button>
            <a
              className="btn btn--ghost btn--lg"
              href="/castor/desktop"
              onClick={(e) => { e.preventDefault(); navigate("/desktop"); }}
            >
              En savoir plus →
            </a>
          </div>

          {/* Feature pills */}
          <div className="dl-section__features">
            {FEATURES.map((f) => (
              <span key={f.label} className="dl-section__pill">
                <Icon name={f.icon} size={14} />
                {f.label}
              </span>
            ))}
          </div>
        </div>

        {/* Colonne droite : mockup */}
        <div className="dl-section__visual">
          <InstallerMockup active={inView} />
        </div>
      </div>
    </section>
  );
}
