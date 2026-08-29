import { useEffect, useState } from "react";
import Mockup from "../components/Mockups.jsx";
import Hills from "../components/Hills.jsx";
import Icon from "../components/Icon.jsx";
import DownloadCompare from "../components/DownloadCompare.jsx";
import { StepVisual } from "../components/FeatureVisuals.jsx";
import { bySlug } from "../data/products.jsx";
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
  const [lightbox, setLightbox] = useState(false);
  const navigate = useNavigate();

  /* lightbox : Échap ou clic sur le fond pour fermer, scroll verrouillé */
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

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
        <button
          type="button"
          className="mockup-lightbox"
          onClick={() => setLightbox(true)}
          aria-label={`Agrandir l'aperçu de ${product.name}`}
        >
          <Mockup variant={product.mockup} />
          <span className="mockup-zoom" aria-hidden="true">⌕ Agrandir</span>
        </button>
      </div>

      {lightbox && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Aperçu de ${product.name}`}
          onClick={() => setLightbox(false)}
        >
          <div className="lightbox__inner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox__close"
              onClick={() => setLightbox(false)}
              aria-label="Fermer l'aperçu"
            >
              ×
            </button>
            <div className="lightbox__frame">
              <Mockup variant={product.mockup} />
            </div>
            <p className="lightbox__caption">
              {product.name} — aperçu agrandi
            </p>
          </div>
        </div>
      )}
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
  const navigate = useNavigate();
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
            {p.highlight ? (
              <button
                type="button"
                className="desktop-compare__link desktop-compare__link--btn"
                onClick={() => document.getElementById("telecharger")?.scrollIntoView({ behavior: "smooth" })}
              >
                Découvrir →
              </button>
            ) : p.tag === "Bientôt" ? (
              <a
                className="desktop-compare__link"
                href="https://github.com/DmzGamingYT/castor"
                target="_blank"
                rel="noreferrer"
              >
                Suivre le projet →
              </a>
            ) : (
              <button
                type="button"
                className="desktop-compare__link desktop-compare__link--btn"
                onClick={() => navigate("/chat")}
              >
                Essayer Castor Chat →
              </button>
            )}
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

function CloudWorkflow() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setStep((s) => (s + 1) % 4);
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  const steps = [
    { label: "Ouvre un repo GitHub", icon: "branch", color: "var(--accent)" },
    { label: "Castor crée une branche", icon: "branch", color: "var(--wood)" },
    { label: "L'agent code en sandbox", icon: "hammer", color: "var(--river)" },
    { label: "Preview live + push", icon: "rocket", color: "var(--sage)" },
  ];

  return (
    <section className="section cloud-workflow">
      <span className="dl-compare__badge"><Icon name="zap" size={14} /> Workflow automatisé</span>
      <h2>De GitHub à la production.</h2>
      <p className="section-sub">Ouvre un repo, Castor fait le reste.</p>
      <div className="cloud-workflow__mockup">
        <div className="cloud-workflow__bar">
          <span className="dot dot--red" /><span className="dot dot--yellow" /><span className="dot dot--green" />
          <em>castor cloud — acme/storefront</em>
        </div>
        <div className="cloud-workflow__body">
          <div className="cloud-workflow__sidebar">
            <span className="cloud-workflow__repo">⎇ main</span>
            {steps.map((s, i) => (
              <div key={i} className={`cloud-workflow__step ${i <= step ? "active" : ""} ${i === step ? "current" : ""}`}>
                <span className="cloud-workflow__step-dot" style={{ background: i <= step ? s.color : "var(--border)" }} />
                <span>{s.label}</span>
                {i === step && <span className="cloud-workflow__pulse" />}
              </div>
            ))}
          </div>
          <div className="cloud-workflow__main">
            <div className="cloud-workflow__status">
              <span className="pulse-dot" style={{ background: steps[step].color }} />
              <strong>{steps[step].label}</strong>
            </div>
            <div className="cloud-workflow__code">
              <span className="ln ln--add">+ import {'{'} rateLimit {'}'} from "./rateLimit"</span>
              <span className="ln">export async function POST(req) {'{'}</span>
              <span className="ln ln--add">+   await rateLimit(req, {'{'} max: 20 {'}'})</span>
              <span className="ln ln--del">-   const body = await req.json()</span>
              <span className="ln">{'}'}</span>
            </div>
            <div className="cloud-workflow__tabs">
              <span className={step === 2 ? "on" : ""}>Preview</span>
              <span>Code</span>
              <span className={step === 3 ? "on" : ""}>Diff</span>
              <span>Terminal</span>
            </div>
          </div>
        </div>
      </div>
      <div className="cloud-workflow__steps-legend">
        {steps.map((s, i) => (
          <div key={i} className={`cloud-workflow__legend-item ${i <= step ? "active" : ""}`}>
            <span className="cloud-workflow__legend-num" style={{ background: i <= step ? s.color : "var(--border)" }}>{i + 1}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CloudWaitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  return (
    <section className="section cloud-waitlist">
      <div className="cloud-waitlist__inner">
        <span className="dl-compare__badge"><Icon name="spark" size={14} /> Bientôt disponible</span>
        <h2>Rejoins la liste d'attente.</h2>
        <p className="section-sub">Soyez les premiers à tester Castor Cloud dès sa sortie.</p>
        {submitted ? (
          <div className="cloud-waitlist__done">
            <span className="cloud-waitlist__done-icon">✓</span>
            <strong>Tu es sur la liste !</strong>
            <p>On te prévient dès que Cloud est prêt.</p>
          </div>
        ) : (
          <form className="cloud-waitlist__form" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              required
              aria-label="Adresse email"
            />
            <button type="submit" className="btn btn--primary">Notifier-moi</button>
          </form>
        )}
      </div>
    </section>
  );
}

function CloudRoadmap() {
  const milestones = [
    { date: "Q3 2026", title: "Alpha privée", desc: "Sandbox basique, éditeur, terminal.", done: true },
    { date: "Q4 2026", title: "Beta publique", desc: "Preview live, GitHub sync, multi-branche.", done: false },
    { date: "Q1 2027", title: "Agent intégré", desc: "L'agent code directement dans le sandbox cloud.", done: false },
    { date: "2027", title: "Launch", desc: "Multi-collaborateur, CI/CD intégré, monitoring.", done: false },
  ];

  return (
    <section className="section cloud-roadmap">
      <h2>Roadmap.</h2>
      <p className="section-sub">Un produit qui avance, pas un vaporware.</p>
      <div className="cloud-roadmap__track">
        {milestones.map((m, i) => (
          <div key={i} className={`cloud-roadmap__item ${m.done ? "done" : ""}`}>
            <div className="cloud-roadmap__marker">
              <span className="cloud-roadmap__dot" />
              {i < milestones.length - 1 && <span className="cloud-roadmap__line" />}
            </div>
            <div className="cloud-roadmap__content">
              <span className="cloud-roadmap__date">{m.date}</span>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CloudArchitecture() {
  return (
    <section className="section cloud-arch">
      <h2>Comment ça marche.</h2>
      <p className="section-sub">De ton GitHub à ton navigateur, en 3 couches.</p>
      <div className="cloud-arch__diagram">
        <div className="cloud-arch__layer">
          <span className="cloud-arch__icon"><Icon name="branch" size={28} /></span>
          <strong>GitHub</strong>
          <span className="cloud-arch__desc">Ton repo, tes branches</span>
        </div>
        <div className="cloud-arch__arrow"><svg width="48" height="24" viewBox="0 0 48 24"><path d="M0,12 L40,12 M34,6 L40,12 L34,18" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" /></svg></div>
        <div className="cloud-arch__layer cloud-arch__layer--main">
          <span className="cloud-arch__icon"><Icon name="cloud" size={28} /></span>
          <strong>Castor Cloud</strong>
          <span className="cloud-arch__desc">Sandbox isolé · Agent IA · Dev server</span>
        </div>
        <div className="cloud-arch__arrow"><svg width="48" height="24" viewBox="0 0 48 24"><path d="M0,12 L40,12 M34,6 L40,12 L34,18" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" /></svg></div>
        <div className="cloud-arch__layer">
          <span className="cloud-arch__icon"><Icon name="globe" size={28} /></span>
          <strong>Preview live</strong>
          <span className="cloud-arch__desc">Résultat instantané</span>
        </div>
      </div>
    </section>
  );
}

function CloudComparison() {
  const items = [
    { feature: "Installation", desktop: "Requise", cloud: "Aucune" },
    { feature: "Espace de travail", desktop: "Local", cloud: "Cloud isolé" },
    { feature: "GitHub sync", desktop: "Manuel", cloud: "Automatique" },
    { feature: "Multi-collaborateur", desktop: "Non", cloud: "Oui (bientôt)" },
    { feature: "Offline", desktop: "Oui", cloud: "Non" },
    { feature: "Gratuit", desktop: "Oui", cloud: "Oui" },
  ];

  return (
    <section className="section cloud-compare">
      <h2>Desktop vs Cloud.</h2>
      <p className="section-sub">Deux façons de coder, même philosophie : gratuit et open source.</p>
      <div className="cloud-compare__table">
        <div className="cloud-compare__header">
          <span className="cloud-compare__feat">Fonctionnalité</span>
          <span className="cloud-compare__prod"><Icon name="desktop" size={16} /> Desktop</span>
          <span className="cloud-compare__prod cloud-compare__prod--highlight"><Icon name="cloud" size={16} /> Cloud</span>
        </div>
        {items.map((row, i) => (
          <div key={i} className="cloud-compare__row">
            <span className="cloud-compare__feat">{row.feature}</span>
            <span className="cloud-compare__val">{row.desktop}</span>
            <span className="cloud-compare__val cloud-compare__val--hl">{row.cloud}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProductPage({ slug, onDownload }) {
  // hook toujours appelé, avant tout retour anticipé
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const product = bySlug(slug);
  if (!product) return null;

  const isDesktop = slug === "desktop";

  return (
    <>
      <ProductHero product={product} onDownload={onDownload} />

      {isDesktop && <DownloadCompare onDownload={onDownload} />}
      {isDesktop && <DesktopHowItWorks />}
      {slug === "cloud" && <CloudWorkflow />}
      {slug === "cloud" && <CloudArchitecture />}

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

            </article>
          ))}
        </div>
      </section>

      {isDesktop && <DesktopComparison />}
      {slug === "cloud" && <CloudComparison />}

      {isDesktop && <DesktopCta onDownload={onDownload} />}
      {slug === "cloud" && <CloudWaitlist />}
      {slug === "cloud" && <CloudRoadmap />}


    </>
  );
}
