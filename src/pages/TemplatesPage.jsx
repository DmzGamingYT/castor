import { useState } from "react";
import AnimatedHeading from "../components/AnimatedHeading.jsx";
import { useLanguage } from "../lib/LanguageContext.jsx";

/* ── Templates disponibles ── */
const TEMPLATES = [
  {
    id: "blog",
    icon: "📝",
    name: "tpl_blog_name",
    tag: "tpl_blog_tag",
    desc: "tpl_blog_desc",
    features: ["tpl_blog_f1", "tpl_blog_f2", "tpl_blog_f3", "tpl_blog_f4"],
    color: "var(--accent)",
    prompt: "tpl_blog_prompt",
  },
  {
    id: "portfolio",
    icon: "🎨",
    name: "tpl_portfolio_name",
    tag: "tpl_portfolio_tag",
    desc: "tpl_portfolio_desc",
    features: ["tpl_portfolio_f1", "tpl_portfolio_f2", "tpl_portfolio_f3", "tpl_portfolio_f4"],
    color: "var(--river)",
    prompt: "tpl_portfolio_prompt",
  },
  {
    id: "dashboard",
    icon: "📊",
    name: "tpl_dashboard_name",
    tag: "tpl_dashboard_tag",
    desc: "tpl_dashboard_desc",
    features: ["tpl_dashboard_f1", "tpl_dashboard_f2", "tpl_dashboard_f3", "tpl_dashboard_f4"],
    color: "var(--sage)",
    prompt: "tpl_dashboard_prompt",
  },
  {
    id: "landing",
    icon: "🚀",
    name: "tpl_landing_name",
    tag: "tpl_landing_tag",
    desc: "tpl_landing_desc",
    features: ["tpl_landing_f1", "tpl_landing_f2", "tpl_landing_f3", "tpl_landing_f4"],
    color: "var(--accent)",
    prompt: "tpl_landing_prompt",
  },
  {
    id: "ecommerce",
    icon: "🛒",
    name: "tpl_ecommerce_name",
    tag: "tpl_ecommerce_tag",
    desc: "tpl_ecommerce_desc",
    features: ["tpl_ecommerce_f1", "tpl_ecommerce_f2", "tpl_ecommerce_f3", "tpl_ecommerce_f4"],
    color: "var(--wood)",
    prompt: "tpl_ecommerce_prompt",
  },
  {
    id: "saas",
    icon: "☁️",
    name: "tpl_saas_name",
    tag: "tpl_saas_tag",
    desc: "tpl_saas_desc",
    features: ["tpl_saas_f1", "tpl_saas_f2", "tpl_saas_f3", "tpl_saas_f4"],
    color: "var(--river)",
    prompt: "tpl_saas_prompt",
  },
];

/* ── Carte template ── */
function TemplateCard({ t, template, selected, onSelect }) {
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
          <h3 className="tpl-card__name">{t(template.name)}</h3>
          {template.tag && <span className="tpl-card__tag">{t(template.tag)}</span>}
        </div>
      </div>
      <p className="tpl-card__desc">{t(template.desc)}</p>
      <ul className="tpl-card__features">
        {template.features.map((f) => (
          <li key={f}>{t(f)}</li>
        ))}
      </ul>
      <div className="tpl-card__prompt">
        <span className="tpl-card__prompt-label">{t("tpl_example")}</span>
        <code>{t(template.prompt)}</code>
      </div>
    </button>
  );
}

export default function TemplatesPage() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState("blog");
  const active = TEMPLATES.find((tp) => tp.id === selected);

  return (
    <section className="section templates-page">
      <div className="templates-page__head">
        <span className="prog__badge">{t("tpl_badge")}</span>
        <AnimatedHeading variant="words">
          {t("tpl_heading")}
        </AnimatedHeading>
        <p className="section-sub">
          {t("tpl_sub")}
        </p>
      </div>

      <div className="templates-page__grid">
        {/* Colonne gauche : carte template sélectionnée + aperçu */}
        <div className="templates-page__preview">
          {active && (
            <div className="tpl-preview">
              <div className="tpl-preview__bar">
                <span className="dot dot--red" />
                <span className="dot dot--yellow" />
                <span className="dot dot--green" />
                <em>{t(active.name).toLowerCase()}.castor.app</em>
              </div>
              <div className="tpl-preview__body" style={{ "--tpl-color": active.color }}>
                <div className="tpl-preview__nav">
                  <span className="tpl-preview__logo">{active.icon}</span>
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
          )}
          {active && (
            <div className="templates-page__preview-info">
              <h3>{active.icon} {t(active.name)}</h3>
              <p>{t(active.desc)}</p>
              <code className="templates-page__preview-prompt">
                castor init {t(active.prompt)}
              </code>
            </div>
          )}
        </div>

        {/* Colonne droite : liste des templates */}
        <div className="templates-page__list">
          {TEMPLATES.map((tp) => (
            <TemplateCard
              key={tp.id}
              t={t}
              template={tp}
              selected={selected === tp.id}
              onSelect={setSelected}
            />
          ))}
        </div>
      </div>

      <div className="templates-page__cta">
        <p>{t("tpl_cta_q")}</p>
        <ol className="templates-page__steps">
          <li><strong>1.</strong> {t("tpl_step1")}</li>
          <li><strong>2.</strong> {t("tpl_step2")}</li>
          <li><strong>3.</strong> {t("tpl_step3")}</li>
          <li><strong>4.</strong> {t("tpl_step4")}</li>
        </ol>
      </div>
    </section>
  );
}