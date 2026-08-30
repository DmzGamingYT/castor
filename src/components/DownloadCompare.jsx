import { PLATFORMS, RELEASE_BASE, buildFiles, detectOS } from "../data/platforms.js";
import { useArch } from "../lib/useArch.js";
import Icon from "./Icon.jsx";
import { useLanguage } from "../lib/LanguageContext.jsx";

export default function DownloadCompare({ platformFiles, onDownload }) {
  const { t } = useLanguage();
  const detected = detectOS();
  const arch = useArch();
  /* par défaut : détecte l'architecture automatiquement (build x64/ARM64 correct) */
  const filesFor = platformFiles ?? ((os) => buildFiles(os, arch));

  return (
    <section className="section dl-compare" id="telecharger">
      <span className="dl-compare__badge">
        <Icon name="download" size={14} /> {t("dlc_badge")}
      </span>
      <h2>{t("dlc_heading")}</h2>
      <p className="section-sub">
        {t("dlc_sub")}
      </p>

      <div className="dl-compare__grid">
        {PLATFORMS.map((p) => {
          const isDetected = detected === p.os;
          const files = filesFor(p.os);
          if (!files) return null;
          return (
            <article
              key={p.os}
              className={`dl-compare__card ${isDetected ? "dl-compare__card--detected" : ""}`}
            >
              {isDetected && (
                <span className="dl-compare__detected">{t("dlc_your_os")}</span>
              )}

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
                {p.features.map((f, fi) => {
                  const label = t(`pf_${p.os}_f${fi}`) || f;
                  return (
                    <li key={f}>
                      <span className="dl-compare__check" style={{ color: p.color }}>✓</span>
                      {label}
                    </li>
                  );
                })}
              </ul>

              <div className="dl-compare__actions">
                <a
                  className="btn btn--primary btn--sm"
                  href={`${RELEASE_BASE}/${files.installer.file}`}
                  download
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
                  >
                    {alt.label}
                  </a>
                ))}
              </div>

              <p className="dl-compare__install">
                <Icon name="terminal" size={13} />
                <code>{t(`pf_${p.os}_install`) || p.install}</code>
              </p>
            </article>
          );
        })}
      </div>

      {onDownload && (
        <div className="dl-compare__cta">
          <button type="button" className="btn btn--primary btn--lg" onClick={onDownload}>
            <Icon name="download" size={18} />
            {t("dlc_now")}
          </button>
          <span className="dl-compare__note">{t("dlc_note")}</span>
        </div>
      )}

      {/* Nouvelles fonctionnalités v0.3.0 */}
      <div className="dl-compare__new-features">
        <span className="dl-compare__badge">
          <Icon name="zap" size={14} /> {t("dlc_new_badge")}
        </span>
        <div className="dl-compare__new-grid">
          {[
            { icon: "clock", t: "dlc_nf0_t", d: "dlc_nf0_d" },
            { icon: "split", t: "dlc_nf1_t", d: "dlc_nf1_d" },
            { icon: "chat", t: "dlc_nf2_t", d: "dlc_nf2_d" },
            { icon: "refresh", t: "dlc_nf3_t", d: "dlc_nf3_d" },
            { icon: "plug", t: "dlc_nf4_t", d: "dlc_nf4_d" },
            { icon: "palette", t: "dlc_nf5_t", d: "dlc_nf5_d" },
          ].map((f) => (
            <article key={f.t} className="dl-compare__new-card">
              <span className="dl-compare__new-icon"><Icon name={f.icon} size={20} /></span>
              <h4>{t(f.t)}</h4>
              <p>{t(f.d)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}