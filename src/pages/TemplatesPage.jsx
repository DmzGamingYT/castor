import { useState } from "react";
import AnimatedHeading from "../components/AnimatedHeading.jsx";

/* ── Templates disponibles ── */
const TEMPLATES = [
  {
    id: "blog",
    icon: "📝",
    name: "Blog",
    tag: "Populaire",
    desc: "Un blog minimaliste avec articles, catégories et recherche.",
    features: ["Articles MD/HTML", "Catégories & tags", "Page à propos", "RSS intégré"],
    color: "var(--accent)",
    prompt: "un blog de recettes végé avec recherche par ingrédients",
  },
  {
    id: "portfolio",
    icon: "🎨",
    name: "Portfolio",
    tag: "Recommandé",
    desc: "Mets en valeur tes projets avec une galerie interactive.",
    features: ["Galerie responsive", "Filtres par catégorie", "Page projet détaillée", "Formulaire contact"],
    color: "var(--river)",
    prompt: "le portfolio d'un illustrateur freelance avec galerie et contact",
  },
  {
    id: "dashboard",
    icon: "📊",
    name: "Dashboard",
    tag: "Pro",
    desc: "Un tableau de bord avec graphiques et statistiques.",
    features: ["Charts interactifs", "KPIs en temps réel", "Thème sombre", "Export données"],
    color: "var(--sage)",
    prompt: "un dashboard analytics avec graphiques et KPIs",
  },
  {
    id: "landing",
    icon: "🚀",
    name: "Landing Page",
    tag: "Rapide",
    desc: "Une page de vente efficace avec CTA et témoignages.",
    features: ["Hero accrocheur", "Section fonctionnalités", "Témoignages", "Pricing & FAQ"],
    color: "var(--accent)",
    prompt: "une landing page pour une app de productivité avec pricing",
  },
  {
    id: "ecommerce",
    icon: "🛒",
    name: "E-commerce",
    tag: "Avancé",
    desc: "Une boutique en ligne avec panier et paiement.",
    features: ["Catalogue produits", "Panier & checkout", "Compte client", "Gestion stock"],
    color: "var(--wood)",
    prompt: "une boutique en ligne de vêtements vintage avec panier",
  },
  {
    id: "saas",
    icon: "☁️",
    name: "SaaS",
    tag: "Business",
    desc: "Un site pour ton produit SaaS avec auth et dashboard.",
    features: ["Page marketing", "Inscription/Login", "Dashboard user", "Settings & profil"],
    color: "var(--river)",
    prompt: "un site SaaS pour un outil de gestion de projets avec auth",
  },
];

/* ── Aperçu interactif d'un template ── */
function TemplatePreview({ template }) {
  return (
    <div className="tpl-preview">
      <div className="tpl-preview__bar">
        <span className="dot dot--red" />
        <span className="dot dot--yellow" />
        <span className="dot dot--green" />
        <em>{template.name.toLowerCase()}.castor.app</em>
      </div>
      <div className="tpl-preview__body" style={{ "--tpl-color": template.color }}>
        {/* Simulated site preview */}
        <div className="tpl-preview__nav">
          <span className="tpl-preview__logo">{template.icon}</span>
          <span className="tpl-preview__links">
            <span /><span /><span />
          </span>
        </div>
        <div className="tpl-preview__hero">
          <div className="tpl-preview__h1" />
          <div className="tpl-preview__sub" />
          <div className="tpl-preview__cta" />
        </div>
        <div className="tpl-preview__cards">
          <div className="tpl-preview__card" />
          <div className="tpl-preview__card" />
          <div className="tpl-preview__card" />
        </div>
      </div>
    </div>
  );
}

/* ── Carte template ── */
function TemplateCard({ template, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`tpl-card ${selected ? "tpl-card--selected" : ""}`}
      style={{ "--tpl-color": template.color }}
      onClick={() => onSelect(template.id)}
    >
      <div className="tpl-card__head">
        <span className="tpl-card__icon">{template.icon}</span>
        <div>
          <h3 className="tpl-card__name">{template.name}</h3>
          {template.tag && <span className="tpl-card__tag">{template.tag}</span>}
        </div>
      </div>
      <p className="tpl-card__desc">{template.desc}</p>
      <ul className="tpl-card__features">
        {template.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <div className="tpl-card__prompt">
        <span className="tpl-card__prompt-label">Exemple :</span>
        <code>{template.prompt}</code>
      </div>
    </button>
  );
}

export default function TemplatesPage() {
  const [selected, setSelected] = useState("blog");
  const active = TEMPLATES.find((t) => t.id === selected);

  return (
    <section className="section templates-page">
      <div className="templates-page__head">
        <span className="prog__badge">🏗️ Templates</span>
        <AnimatedHeading variant="words">
          Points de départ générés par Castor
        </AnimatedHeading>
        <p className="section-sub">
          Choisis un template, décris ton projet, et Castor construit la base en quelques secondes.
        </p>
      </div>

      <div className="templates-page__grid">
        {/* Colonne gauche : carte template sélectionnée + aperçu */}
        <div className="templates-page__preview">
          {active && <TemplatePreview template={active} />}
          {active && (
            <div className="templates-page__preview-info">
              <h3>{active.icon} {active.name}</h3>
              <p>{active.desc}</p>
              <code className="templates-page__preview-prompt">
                castor init {active.prompt}
              </code>
            </div>
          )}
        </div>

        {/* Colonne droite : liste des templates */}
        <div className="templates-page__list">
          {TEMPLATES.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              selected={selected === t.id}
              onSelect={setSelected}
            />
          ))}
        </div>
      </div>

      <div className="templates-page__cta">
        <p>Comment ça marche ?</p>
        <ol className="templates-page__steps">
          <li><strong>1.</strong> Choisis un template</li>
          <li><strong>2.</strong> Décris ton projet en une phrase</li>
          <li><strong>3.</strong> Castor génère la base</li>
          <li><strong>4.</strong> Personnalise et déploie</li>
        </ol>
      </div>
    </section>
  );
}
