import Icon from "./Icon.jsx";
const RELEASE_BASE =
  "https://github.com/DmzGamingYT/castor/releases/latest/download";

export const PLATFORMS = [
  {
    os: "mac",
    name: "macOS",
    icon: "apple",
    color: "var(--accent)",
    installer: { file: "Castor-macOS-arm64.dmg", sub: "Apple Silicon", size: "~96 Mo" },
    alts: [
      { file: "Castor-macOS-arm64.zip", label: "Portable (zip)" },
      { file: "Castor-macOS-x64.dmg", label: "Intel (x64)" },
    ],
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
    installer: { file: "Castor-Windows-arm64-setup.exe", sub: "ARM64", size: "~115 Mo" },
    alts: [
      { file: "Castor-Windows-arm64-portable.zip", label: "Portable (zip)" },
      { file: "Castor-Windows-x64-setup.exe", label: "Intel/AMD (x64)" },
    ],
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
    installer: { file: "Castor-Linux-arm64.deb", sub: "Debian / Ubuntu", size: "~95 Mo" },
    alts: [
      { file: "Castor-Linux-arm64.AppImage", label: "AppImage (toutes distros)" },
      { file: "Castor-Linux-arm64.tar.gz", label: "Archive tar.gz" },
    ],
    features: [
      "Paquet .deb ou AppImage",
      "Clés API chiffrées via libsecret",
      "Zéro dépendance système",
      "Léger et rapide",
    ],
    install: "sudo apt install ./Castor.deb",
  },
];

function detectOS() {
  const ua = navigator.userAgent;
  if (/Mac/i.test(ua)) return "mac";
  if (/Win/i.test(ua)) return "win";
  if (/Linux|X11/i.test(ua)) return "linux";
  return null;
}

export default function DownloadCompare({ onDownload }) {
  const detected = detectOS();

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
          return (
            <article
              key={p.os}
              className={`dl-compare__card ${isDetected ? "dl-compare__card--detected" : ""}`}
            >
              {isDetected && (
                <span className="dl-compare__detected">Ton OS ✓</span>
              )}

              <div className="dl-compare__header">
                <span className="dl-compare__icon" style={{ background: `color-mix(in srgb, ${p.color} 14%, transparent)` }}>
                  <Icon name={p.icon} size={28} />
                </span>
                <div>
                  <h3>{p.name}</h3>
                  <span className="dl-compare__size">{p.installer.size}</span>
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
                  href={`${RELEASE_BASE}/${p.installer.file}`}
                  download
                >
                  <Icon name="download" size={16} />
                  {p.installer.sub}
                </a>
                {p.alts.map((alt) => (
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
    </section>
  );
}
