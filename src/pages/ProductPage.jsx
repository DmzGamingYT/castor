import { useEffect, useState } from "react";
import Mockup from "../components/Mockups.jsx";
import Hills from "../components/Hills.jsx";
import Icon from "../components/Icon.jsx";
import DownloadCompare from "../components/DownloadCompare.jsx";
import FeatureVisual, { StepVisual } from "../components/FeatureVisuals.jsx";
import { PRODUCTS, bySlug } from "../data/products.jsx";
import { useNavigate } from "../lib/NavigationContext.jsx";
function PlatformBadge({ os, icon }) {
  return (
    <span className="platform-badge" title={os}>
      <Icon name={icon} size={14} />
      <span>{os}</span>
    </span>
  );
}

function ProductHero({ product, onDownload }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(product.installCmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* presse-papier refusé — la commande reste sélectionnable dans <code> */
    }
  }

  return (
    <section className="hero hero--product">
      <div className="hero__glow hero__glow--lime" aria-hidden="true" />
      <div className="hero__glow hero__glow--wood" aria-hidden="true" />
      <div className="hero__glow hero__glow--river" aria-hidden="true" />
      <Hills />
      <a className="back" href="/castor/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>← Tous les produits</a>
      {product.tag && <span className="hero__badge">{product.tag}</span>}
      <h1>
        <Icon name={product.icon} size={38} className="h1-icon" />{" "}
        <span className="hero__accent">{product.name}</span>
      </h1>
      <p className="hero__sub">{product.tagline}</p>

      {product.installCmd ? (
        <div id="installer" className="install">
          <code>$ {product.installCmd}</code>
          <button className="install__copy" onClick={copyInstall}>
            {copied ? "copié ✓" : "copier"}
          </button>
        </div>
      ) : null}

      <div className="hero__actions">
        {product.slug === "desktop" ? (
          <button type="button" className="btn btn--primary btn--lg" onClick={onDownload}>
            {product.cta}
          </button>
        ) : (
          <a
            className="btn btn--primary btn--lg"
            href="/castor/#installer"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById("installer");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {product.cta}
          </a>
        )}
        <a
          className="btn btn--ghost btn--lg"
          href="/castor/#produits"
          onClick={(e) => { e.preventDefault(); navigate("/", "produits"); }}
        >
          Tous les produits →
        </a>
      </div>

      {product.slug === "desktop" && (
        <div className="platform-badges">
          <PlatformBadge os="macOS" icon="apple" />
          <PlatformBadge os="Windows" icon="windows" />
          <PlatformBadge os="Linux" icon="linux" />
        </div>
      )}

      <div className="mockup-wrap">
        <Mockup variant={product.mockup} />
      </div>
    </section>
  );
}

function DesktopHowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Ouvre Castor Desktop",
      desc: "Un seul clic. Pas de terminal, pas de config. L'app démarre en une seconde.",
      color: "var(--accent)",
    },
    {
      num: "02",
      title: "Crée un agent, choisis ton modèle",
      desc: "OpenRouter, Groq, Ollama… branche le cerveau que tu veux. Chaque agent a son propre espace.",
      color: "var(--wood)",
    },
    {
      num: "03",
      title: "L'agent construit, tu valides",
      desc: "Structure, styles, tests : tout est monté devant toi. Chaque fichier est lisible et modifiable.",
      color: "var(--river)",
    },
  ];

  return (
    <section className="section desktop-how">
      <span className="dl-compare__badge">
        <Icon name="zap" size={14} /> Simple et rapide
      </span>
      <h2>En trois étapes.</h2>
      <p className="section-sub">Pas de tunnel magique : tu vois chaque étape.</p>
      <div className="desktop-how__grid">
        {steps.map((s, i) => (
          <article key={s.num} className="desktop-how__step" style={{ "--step-color": s.color }}>
            <span className="desktop-how__num" aria-hidden="true">{s.num}</span>
            <div className="desktop-how__illu" aria-hidden="true">
              <StepVisual index={i} />
            </div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            {i < steps.length - 1 && (
              <span className="desktop-how__connector" aria-hidden="true">
                <svg width="40" height="20" viewBox="0 0 40 20">
                  <path d="M0,10 C15,10 25,10 40,10" stroke="var(--step-color)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.4" />
                  <circle cx="38" cy="10" r="3" fill="var(--step-color)" opacity="0.5" />
                </svg>
              </span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function DesktopComparison() {
  const products = [
    {
      name: "Desktop",
      tag: "Recommandé",
      desc: "App complète, agents parallèles, multi-providers, clés chiffrées.",
      highlight: true,
      icon: "desktop",
      color: "var(--accent)",
      perks: ["100% local", "Agents parallèles", "Clés chiffrées"],
    },
    {
      name: "Cloud",
      tag: "Bientôt",
      desc: "IDE cloud complet. Branché sur tes repos GitHub.",
      highlight: false,
      icon: "cloud",
      color: "var(--river)",
      perks: ["Zéro installation", "GitHub sync", "Sandbox réel"],
    },
    {
      name: "Chat",
      tag: null,
      desc: "Réponses longues et sourcées. Pour comprendre, pas pour coder.",
      highlight: false,
      icon: "chat",
      color: "var(--sage)",
      perks: ["Recherche web", "Sources citées", "Mode réflexion"],
    },
  ];

  return (
    <section className="section desktop-compare">
      <h2>Pourquoi Desktop ?</h2>
      <p className="section-sub">Trois produits, un seul cas d'usage : coder plus vite.</p>
      <div className="desktop-compare__grid">
        {products.map((p) => (
          <article
            key={p.name}
            className={`desktop-compare__card ${p.highlight ? "desktop-compare__card--hero" : ""}`}
          >
            <div className="desktop-compare__card-top">
              <span
                className="desktop-compare__icon"
                style={{
                  background: `color-mix(in srgb, ${p.color} 12%, transparent)`,
                  color: p.color,
                }}
              >
                <Icon name={p.icon} size={22} />
              </span>
              {p.tag && <span className="desktop-compare__tag">{p.tag}</span>}
            </div>
            <h3>Castor {p.name}</h3>
            <p>{p.desc}</p>
            <ul className="desktop-compare__perks">
              {p.perks.map((perk) => (
                <li key={perk}>
                  <span style={{ color: p.color }}>✓</span> {perk}
                </li>
              ))}
            </ul>
            <span className="desktop-compare__link">
              {p.highlight ? "Découvrir →" : p.tag === "Bientôt" ? "Reste informé →" : "En savoir plus →"}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function DesktopCta({ onDownload }) {
  return (
    <section className="section desktop-cta">
      <div className="desktop-cta__inner">
        <h2>Prêt à construire ?</h2>
        <p>Castor Desktop est gratuit. Pas d'abonnement, pas de limite.</p>
        <button type="button" className="btn btn--primary btn--lg" onClick={onDownload}>
          Télécharger Castor Desktop
        </button>
        <code className="desktop-cta__note">Gratuit · Open source · Multi-providers</code>
      </div>
    </section>
  );
}

export default function ProductPage({ slug, onDownload }) {
  const navigate = useNavigate();
  // hook toujours appelé, avant tout retour anticipé
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const product = bySlug(slug);
  if (!product) return null;

  const others = PRODUCTS.filter((p) => p.slug !== slug);

  const isDesktop = slug === "desktop";

  return (
    <>
      <ProductHero product={product} onDownload={onDownload} />

      {isDesktop && <DownloadCompare onDownload={onDownload} />}
      {isDesktop && <DesktopHowItWorks />}

      <section className="section">
        <h2>{product.desc.split(".")[0]}.</h2>
        <p className="section-sub">{product.desc}</p>
        <div className="features-grid">
          {product.features.map((f) => (
            <article key={f.title} className="feature-card">
              <div className="feature-card__top">
                <span className="feature-card__icon" aria-hidden="true">
                  <Icon name={f.icon} size={24} />
                </span>
                <h3>{f.title}</h3>
              </div>
              <p>{f.desc}</p>
              <div className="feature-card__visual">
                <FeatureVisual icon={f.icon} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {isDesktop && <DesktopComparison />}

      {isDesktop && <DesktopCta onDownload={onDownload} />}

      <section className="section section--tight">
        <div className="next-products">
          <h3>Continuer l'exploration</h3>
          <div className="next-products__row">
            {others.map((p) => (
              <a
                key={p.slug}
                className="next-link"
                href={`/castor/${p.slug}`}
                onClick={(e) => { e.preventDefault(); navigate(`/${p.slug}`); }}
              >
                <Icon name={p.icon} size={16} /> {p.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
