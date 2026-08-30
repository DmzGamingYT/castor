import { useEffect, useState } from "react";
import Mockup from "../components/Mockups.jsx";
import Hills from "../components/Hills.jsx";
import Icon from "../components/Icon.jsx";
import DownloadCompare from "../components/DownloadCompare.jsx";
import { StepVisual } from "../components/FeatureVisuals.jsx";
import { bySlug } from "../data/products.jsx";
import { useNavigate } from "../lib/NavigationContext.jsx";
import { useLanguage } from "../lib/LanguageContext.jsx";

function PlatformBadge({ os, icon }) {
  return (
    <span className="platform-badge" title={os}>
      <Icon name={icon} size={14} />
      <span>{os}</span>
    </span>
  );
}

function ProductHero({ product, onDownload }) {
  const { t } = useLanguage();
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
      <a className="back" href="/castor/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>{t("pp_all_products")}</a>
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
            {copied ? t("pp_copied") : t("pp_copy")}
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
          {t("pp_all_products2")}
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
          aria-label={t("pp_zoom_label").replace("{name}", product.name)}
        >
          <Mockup variant={product.mockup} />
          <span className="mockup-zoom" aria-hidden="true">⌕ {t("pp_zoom")}</span>
        </button>
      </div>

      {lightbox && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} — ${t("pp_zoom")}`}
          onClick={() => setLightbox(false)}
        >
          <div className="lightbox__inner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox__close"
              onClick={() => setLightbox(false)}
              aria-label={t("pp_close_preview")}
            >
              ×
            </button>
            <div className="lightbox__frame">
              <Mockup variant={product.mockup} />
            </div>
            <p className="lightbox__caption">
              {t("pp_caption").replace("{name}", product.name)}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function DesktopHowItWorks() {
  const { t } = useLanguage();
  const steps = [
    {
      num: "01",
      title: t("how_s1_t"),
      desc: t("how_s1_d"),
      color: "var(--accent)",
    },
    {
      num: "02",
      title: t("how_s2_t"),
      desc: t("how_s2_d"),
      color: "var(--wood)",
    },
    {
      num: "03",
      title: t("how_s3_t"),
      desc: t("how_s3_d"),
      color: "var(--river)",
    },
  ];

  return (
    <section className="section desktop-how">
      <span className="dl-compare__badge">
        <Icon name="zap" size={14} /> {t("how_badge")}
      </span>
      <h2>{t("how_heading")}</h2>
      <p className="section-sub">{t("steps_sub")}</p>
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
  const { t } = useLanguage();
  const products = [
    {
      name: "Desktop",
      tag: t("dcomp_recommended"),
      desc: t("dcomp_desc_d"),
      highlight: true,
      icon: "desktop",
      color: "var(--accent)",
      perks: [t("dcomp_p1"), t("dcomp_p2"), t("dcomp_p3")],
    },
    {
      name: "Cloud",
      tag: t("dcomp_soon"),
      desc: t("dcomp_desc_c"),
      highlight: false,
      icon: "cloud",
      color: "var(--river)",
      perks: [t("dcomp_p4"), t("dcomp_p5"), t("dcomp_p6")],
    },
  ];

  return (
    <section className="section desktop-compare">
      <h2>{t("dcomp_heading")}</h2>
      <p className="section-sub">{t("dcomp_sub")}</p>
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
                {t("dcomp_discover")}
              </button>
            ) : p.tag === t("dcomp_soon") ? (
              <a
                className="desktop-compare__link"
                href="https://github.com/DmzGamingYT/castor"
                target="_blank"
                rel="noreferrer"
              >
                {t("dcomp_follow")}
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function DesktopCta({ onDownload }) {
  const { t } = useLanguage();
  return (
    <section className="section desktop-cta">
      <div className="desktop-cta__inner">
        <h2>{t("dcta_heading")}</h2>
        <p>{t("dcta_sub")}</p>
        <button type="button" className="btn btn--primary btn--lg" onClick={onDownload}>
          {t("dl_cta")}
        </button>
        <code className="desktop-cta__note">{t("dcta_note")}</code>
      </div>
    </section>
  );
}

function CloudWorkflow() {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setStep((s) => (s + 1) % 4);
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  const steps = [
    { label: t("cwf_s1"), icon: "branch", color: "var(--accent)" },
    { label: t("cwf_s2"), icon: "branch", color: "var(--wood)" },
    { label: t("cwf_s3"), icon: "hammer", color: "var(--river)" },
    { label: t("cwf_s4"), icon: "rocket", color: "var(--sage)" },
  ];
  const stepDetails = [t("cwf_d1"), t("cwf_d2"), t("cwf_d3"), t("cwf_d4")];

  return (
    <section className="section cloud-workflow">
      <span className="dl-compare__badge"><Icon name="zap" size={14} /> {t("cwf_badge")}</span>
      <h2>{t("cwf_heading")}</h2>
      <p className="section-sub">{t("cwf_sub")}</p>

      {/* ── étapes du pipeline, connectées par un rail ── */}
      <div className="cloud-flow">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`cloud-flow__step${i <= step ? " cloud-flow__step--done" : ""}${i === step ? " cloud-flow__step--current" : ""}`}
            style={{ "--s-color": s.color, "--d": `${i * 180}ms` }}
          >
            {i > 0 && <span className="cloud-flow__rail" aria-hidden="true" />}
            <span className="cloud-flow__badge" aria-hidden="true">
              {i < step ? <Icon name="checkCircle" size={18} /> : <Icon name={s.icon} size={18} />}
            </span>
            <strong>{s.label}</strong>
            <small>{stepDetails[i]}</small>
          </div>
        ))}
      </div>

      {/* ── mockup IDE : le chantier en cours ── */}
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
              <span className="cloud-workflow__status-time">{t("cwf_ago")}</span>
            </div>
            <div className="cloud-workflow__code">
              <span className="ln ln--add">+ import {'{'} rateLimit {'}'} from "./rateLimit"</span>
              <span className="ln">export async function POST(req) {'{'}</span>
              <span className="ln ln--add">+   await rateLimit(req, {'{'} max: 20 {'}'})</span>
              <span className="ln ln--del">-   const body = await req.json()</span>
              <span className="ln">{'}'}</span>
            </div>
            <div className="cloud-workflow__tabs">
              <span className={step === 2 ? "on" : ""}>{t("cwf_tab_preview")}</span>
              <span>{t("cwf_tab_code")}</span>
              <span className={step === 3 ? "on" : ""}>{t("cwf_tab_diff")}</span>
              <span>{t("cwf_tab_terminal")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CloudWaitlist() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  return (
    <section className="section cloud-waitlist">
      <div className="cloud-waitlist__inner">
        <span className="cloud-waitlist__beaver" aria-hidden="true">🦫</span>
        <span className="dl-compare__badge"><Icon name="spark" size={14} /> {t("cwl_badge")}</span>
        <h2>{t("cwl_heading")}</h2>
        <p className="section-sub">{t("cwl_sub")}</p>

        <div className="cloud-waitlist__counter">
          <strong>482</strong>
          <span>{t("cwl_count")}</span>
          <div className="cloud-waitlist__bar">
            <div className="cloud-waitlist__bar-fill" />
            <span className="cloud-waitlist__bar-dot" style={{ left: "64%" }} />
          </div>
          <span className="cloud-waitlist__goal">{t("cwl_goal")}</span>
        </div>

        {submitted ? (
          <div className="cloud-waitlist__done">
            <span className="cloud-waitlist__done-icon">✓</span>
            <strong>{t("cwl_done")}</strong>
            <p>{t("cwl_done_sub")}</p>
          </div>
        ) : (
          <form className="cloud-waitlist__form" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              required
              aria-label={t("cwl_email_aria")}
            />
            <button type="submit" className="btn btn--primary">{t("cwl_notify")}</button>
          </form>
        )}
      </div>
    </section>
  );
}

function CloudRoadmap() {
  const { t } = useLanguage();
  const milestones = [
    { date: "Q3 2026", title: t("cr_m1_t"), desc: t("cr_m1_d"), status: "done", emoji: "✅" },
    { date: "Q4 2026", title: t("cr_m2_t"), desc: t("cr_m2_d"), status: "wip", emoji: "🔨" },
    { date: "Q1 2027", title: t("cr_m3_t"), desc: t("cr_m3_d"), status: "soon", emoji: "🚀" },
    { date: "2027", title: t("cr_m4_t"), desc: t("cr_m4_d"), status: "explore", emoji: "🔬" },
  ];
  const STATUS_STYLE = {
    done: "cloud-milestone__pill--done",
    wip: "cloud-milestone__pill--wip",
    soon: "cloud-milestone__pill--soon",
    explore: "cloud-milestone__pill--explore",
  };
  const STATUS_KEY = {
    done: "cr_status_done",
    wip: "cr_status_wip",
    soon: "cr_status_soon",
    explore: "cr_status_explore",
  };

  return (
    <section className="section cloud-roadmap">
      <h2>{t("cr_heading")}</h2>
      <p className="section-sub">{t("cr_sub")}</p>
      <div className="cloud-roadmap__track">
        {milestones.map((m, i) => (
          <div key={i} className={`cloud-milestone ${m.status === "done" ? "cloud-milestone--done" : ""}`}>
            <div className="cloud-milestone__marker">
              <span className="cloud-milestone__dot" />
              {i < milestones.length - 1 && <span className="cloud-milestone__line" />}
            </div>
            <div className="cloud-milestone__card">
              <div className="cloud-milestone__head">
                <span className="cloud-milestone__date">{m.date}</span>
                <span className={`cloud-milestone__pill ${STATUS_STYLE[m.status]}`}>
                  <span aria-hidden="true">{m.emoji}</span> {t(STATUS_KEY[m.status])}
                </span>
              </div>
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
  const { t } = useLanguage();
  const layers = [
    {
      icon: "branch",
      title: "GitHub",
      desc: t("ca_l1_d"),
      tags: [t("ca_l1_t1"), t("ca_l1_t2"), t("ca_l1_t3")],
      main: false,
    },
    {
      icon: "cloud",
      title: "Castor Cloud",
      desc: t("ca_l2_d"),
      tags: [t("ca_l2_t1"), t("ca_l2_t2"), t("ca_l2_t3")],
      main: true,
    },
    {
      icon: "globe",
      title: "Preview live",
      desc: t("ca_l3_d"),
      tags: [t("ca_l3_t1"), t("ca_l3_t2"), t("ca_l3_t3")],
      main: false,
    },
  ];

  return (
    <section className="section cloud-arch">
      <h2>{t("ca_heading")}</h2>
      <p className="section-sub">{t("ca_sub")}</p>
      <div className="cloud-arch__stack">
        {layers.map((l, i) => (
          <div key={l.title} className="cloud-arch__layer-wrap" style={{ "--d": `${i * 140}ms` }}>
            <article className={`cloud-arch__layer${l.main ? " cloud-arch__layer--main" : ""}`}>
              <span className="cloud-arch__icon"><Icon name={l.icon} size={26} /></span>
              <div className="cloud-arch__info">
                <strong>{l.title}</strong>
                <span className="cloud-arch__desc">{l.desc}</span>
                <div className="cloud-arch__tags">
                  {l.tags.map((tag) => (
                    <span key={tag} className="cloud-arch__tag">{tag}</span>
                  ))}
                </div>
              </div>
              {l.main && <span className="cloud-arch__core">{t("ca_core")}</span>}
            </article>
            {i < layers.length - 1 && (
              <div className="cloud-arch__connector" aria-hidden="true">
                <svg width="28" height="44" viewBox="0 0 28 44">
                  <path d="M14 0 V36 M8 30 L14 36 L20 30" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function CloudComparison() {
  const { t } = useLanguage();
  const items = [
    { feature: t("cc_f1"), desktop: { v: t("cc_v_required"), ok: false }, cloud: { v: t("cc_v_none"), ok: true } },
    { feature: t("cc_f2"), desktop: { v: t("cc_v_local"), ok: true }, cloud: { v: t("cc_v_iso"), ok: true } },
    { feature: t("cc_f3"), desktop: { v: t("cc_v_manual"), ok: false }, cloud: { v: t("cc_v_auto"), ok: true } },
    { feature: t("cc_f4"), desktop: { v: t("cc_v_no"), ok: false }, cloud: { v: t("cc_v_yes_soon"), ok: true } },
    { feature: t("cc_f5"), desktop: { v: t("cc_v_yes"), ok: true }, cloud: { v: t("cc_v_no"), ok: false } },
    { feature: t("cc_f6"), desktop: { v: t("cc_v_yes"), ok: true }, cloud: { v: t("cc_v_yes"), ok: true } },
  ];

  function Cell({ v, cloud }) {
    if (v.ok) {
      return <span className={`cloud-compare__val cloud-compare__val--yes${cloud ? " cloud-compare__val--hl" : ""}`}><Icon name="checkCircle" size={15} /> {v.v}</span>;
    }
    return <span className={`cloud-compare__val cloud-compare__val--no${cloud ? " cloud-compare__val--hl" : ""}`}><i aria-hidden="true">✕</i> {v.v}</span>;
  }

  return (
    <section className="section cloud-compare">
      <h2>{t("cc_heading")}</h2>
      <p className="section-sub">{t("cc_sub")}</p>
      <div className="cloud-compare__table">
        <div className="cloud-compare__header">
          <span className="cloud-compare__feat">{t("cc_feature")}</span>
          <span className="cloud-compare__prod"><Icon name="desktop" size={16} /> Desktop</span>
          <span className="cloud-compare__prod cloud-compare__prod--highlight"><Icon name="cloud" size={16} /> Cloud</span>
        </div>
        {items.map((row, i) => (
          <div key={i} className="cloud-compare__row">
            <span className="cloud-compare__feat">{row.feature}</span>
            <Cell v={row.desktop} cloud={false} />
            <Cell v={row.cloud} cloud={true} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProductPage({ slug, onDownload }) {
  const { t } = useLanguage();
  // hook toujours appelé, avant tout retour anticipé
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const product = bySlug(slug);
  if (!product) return null;

  /* produit traduit : champs localisés remplacés depuis le dictionnaire */
  const tr = {
    ...product,
    tag: t(`pp_${slug}_tag`),
    tagline: t(`pp_${slug}_tagline`),
    desc: t(`pp_${slug}_desc`),
    cta: t(`pp_${slug}_cta`),
    features: product.features.map((f, i) => ({
      ...f,
      title: t(`pp_${slug}_f${i}_t`),
      desc: t(`pp_${slug}_f${i}_d`),
    })),
  };

  const isDesktop = slug === "desktop";

  return (
    <>
      <ProductHero product={tr} onDownload={onDownload} />

      {isDesktop && <DownloadCompare onDownload={onDownload} />}
      {isDesktop && <DesktopHowItWorks />}
      {slug === "cloud" && <CloudWorkflow />}
      {slug === "cloud" && <CloudArchitecture />}

      <section className="section">
        <h2>{tr.desc.split(".")[0]}.</h2>
        <p className="section-sub">{tr.desc}</p>
        <div className="features-grid">
          {tr.features.map((f) => (
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