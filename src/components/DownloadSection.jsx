import { useEffect, useRef, useState } from "react";
import Icon, { BeaverMark } from "./Icon.jsx";
import { useNavigate } from "../lib/NavigationContext.jsx";
import { APP_VERSION } from "../lib/version.js";
import { useLanguage } from "../lib/LanguageContext.jsx";

const PLATFORMS = [
  { os: "mac", icon: "apple", label: "macOS", sub: "mac_sub" },
  { os: "win", icon: "windows", label: "Windows", sub: "win_sub" },
  { os: "linux", icon: "linux", label: "Linux", sub: "linux_sub" },
];

const FEATURES = [
  { icon: "zap", key: "dl_feat_start" },
  { icon: "lock", key: "dl_feat_keys" },
  { icon: "plug", key: "dl_feat_multi" },
  { icon: "layers", key: "dl_feat_agents" },
  { icon: "clock", key: "dl_feat_sched" },
  { icon: "split", key: "dl_feat_split" },
];

/* ─── Mockup de l'installateur ─── */
function InstallerMockup({ active }) {
  const { t } = useLanguage();
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
          <em>{t("dl_win_title")}</em>
        </div>
        <div className="dl-mockup__body">
          {/* Sidebar */}
          <div className="dl-mockup__sidebar">
            <span className="dl-mockup__sidebar-logo">
              <BeaverMark size={20} />
            </span>
            {[t("dl_step_req"), t("dl_step_install"), t("dl_step_config"), t("dl_step_ready")].map((label, i) => (
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
                  {t("dl_install")}
                </button>
              </div>
            )}
            {step === 1 && (
              <div className="dl-mockup__progress-wrap">
                <span className="dl-mockup__pkg-icon">📦</span>
                <strong>{t("dl_installing")}</strong>
                <div className="dl-mockup__progress">
                  <div className="dl-mockup__progress-fill" style={{ width: "65%" }} />
                </div>
                <span className="dl-mockup__progress-label">{t("dl_copy_files")}</span>
              </div>
            )}
            {step === 2 && (
              <div className="dl-mockup__progress-wrap">
                <span className="dl-mockup__pkg-icon">⚙️</span>
                <strong>{t("dl_step_config")}</strong>
                <div className="dl-mockup__progress">
                  <div className="dl-mockup__progress-fill dl-mockup__progress-fill--alt" style={{ width: "100%" }} />
                </div>
                <span className="dl-mockup__progress-label">{t("dl_shortcut")}</span>
              </div>
            )}
            {step >= 3 && (
              <div className="dl-mockup__done">
                <span className="dl-mockup__done-icon">🦫</span>
                <strong>{t("dl_installed")}</strong>
                <span className="dl-mockup__done-sub">{t("dl_ready_build")}</span>
                <div className="dl-mockup__done-actions">
                  <button className="btn btn--primary btn--sm" type="button">
                    {t("dl_launch")}
                  </button>
                  <button className="btn btn--ghost btn--sm" type="button">
                    {t("dl_close")}
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
  const { t } = useLanguage();
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
            <BeaverMark size={14} /> {t("dl_eyebrow")}
          </span>
          <h2>{t("dl_heading_a")}<br /><span className="hero__accent">{t("dl_heading_b")}</span></h2>
          <p className="dl-section__desc">
            {t("dl_desc")}
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
                  <small>{t(p.sub)}</small>
                </span>
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="dl-section__cta">
            <button type="button" className="btn btn--primary btn--lg" onClick={onDownload}>
              {t("dl_cta")}
            </button>
            <a
              className="btn btn--ghost btn--lg"
              href="/castor/desktop"
              onClick={(e) => { e.preventDefault(); navigate("/desktop"); }}
            >
              {t("dl_learn_more")}
            </a>
          </div>

          {/* Feature pills */}
          <div className="dl-section__features">
            {FEATURES.map((f) => (
              <span key={f.key} className="dl-section__pill">
                <Icon name={f.icon} size={14} />
                {t(f.key)}
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
