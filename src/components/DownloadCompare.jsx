import { PLATFORMS, RELEASE_BASE, buildFiles, detectOS } from "../data/platforms.js";
import { useArch } from "../lib/useArch.js";
import Icon from "./Icon.jsx";

export default function DownloadCompare({ platformFiles, onDownload }) {
  const detected = detectOS();
  const arch = useArch();
  /* par défaut : détecte l'architecture automatiquement (build x64/ARM64 correct) */
  const filesFor = platformFiles ?? ((os) => buildFiles(os, arch));

  return (
    <section className="section dl-compare" id="telecharger">
      <span className="dl-compare__badge">
        <Icon name="download" size={14} /> Téléchargement gratuit
      </span>
      <h2>Disponible sur toutes tes machines</h2>
      <p className="section-sub">
        Un seul castor, trois habitats. Choisis le tien.
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
                <span className="dl-compare__detected">Ton OS ✓</span>
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
                <code>{p.install}</code>
              </p>
            </article>
          );
        })}
      </div>

      {onDownload && (
        <div className="dl-compare__cta">
          <button type="button" className="btn btn--primary btn--lg" onClick={onDownload}>
            <Icon name="download" size={18} />
            Télécharger maintenant
          </button>
          <span className="dl-compare__note">Gratuit · Open source · Multi-providers</span>
        </div>
      )}

      {/* Nouvelles fonctionnalités v0.3.0 */}
      <div className="dl-compare__new-features">
        <span className="dl-compare__badge">
          <Icon name="zap" size={14} /> Nouveautés v0.3.0
        </span>
        <div className="dl-compare__new-grid">
          {[
            { icon: "clock", title: "Agents planifiés", desc: "Programme des agents pour qu'ils travaillent la nuit." },
            { icon: "split", title: "Diff côte à côte", desc: "Compare avant/après, valide hunk par hunk." },
            { icon: "chat", title: "Assistant IA embarqué", desc: "Castor Bot 24/7 dans l'app." },
            { icon: "refresh", title: "Sync multi-postes", desc: "Export/import entre machines." },
            { icon: "plug", title: "Serveurs MCP", desc: "Branche des outils externes à tes agents." },
            { icon: "palette", title: "Thèmes personnalisables", desc: "Couleur d'accent libre." },
          ].map((f) => (
            <article key={f.title} className="dl-compare__new-card">
              <span className="dl-compare__new-icon"><Icon name={f.icon} size={20} /></span>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}