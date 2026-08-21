import Icon from "./Icon.jsx";

const PROMPTS = [
  {
    text: "Une carte interactive des boulangeries de ma ville, avec notes et horaires",
    site: "boulangeries-carte",
  },
  {
    text: "Un tableau de bord météo minimaliste pour la semaine",
    site: "meteo-semaine",
  },
  {
    text: "Un quiz de révision avec score et série de bonnes réponses",
    site: "quiz-revision",
  },
];

const TEMPLATES = [
  { icon: "palette", name: "Portfolio", desc: "Galerie, à-propos, contact." },
  { icon: "rocket", name: "Landing", desc: "Héros, preuve, appel à l'action." },
  { icon: "gauge", name: "Dashboard", desc: "Cartes, graphes, filtres." },
  { icon: "listCheck", name: "Blog", desc: "Articles, tags, lecture confortable." },
];

const DELIVERABLES = [
  { icon: "globe", title: "Son URL publique", desc: "Chaque projet naît hébergé, prêt à partager." },
  { icon: "download", title: "Le code complet", desc: "Export zip ou push GitHub — c'est ton bien." },
  { icon: "eye", title: "Un rendu responsive", desc: "Téléphone, tablette, écran large : géré d'entrée." },
  { icon: "zap", title: "Des fondations propres", desc: "HTML/CSS/JS lisibles, pas une soupe illisible." },
];

export default function WebShowcase() {
  return (
    <>
      <section className="section showcase">
        <h2>Une phrase suffit. La tienne ressemble à quoi ?</h2>
        <p className="section-sub">
          Décris ce que tu veux comme tu le dirais à un ami — Castor s'occupe du reste.
        </p>
        <div className="showcase__prompts">
          {PROMPTS.map((p) => (
            <article key={p.site} className="prompt-card">
              <span className="prompt-card__mark">›</span>
              <p>{p.text}</p>
              <code>{p.site}.castor.app</code>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tight">
        <h2>Partir d'un modèle</h2>
        <p className="section-sub">
          Pas d'inspiration ? Ces bases se personnalisent en une phrase.
        </p>
        <div className="showcase__templates">
          {TEMPLATES.map((t) => (
            <article key={t.name} className="template-card">
              <span className="template-card__icon" aria-hidden="true">
                <Icon name={t.icon} size={22} />
              </span>
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tight">
        <h2>Ce que tu obtiens, à chaque fois</h2>
        <div className="showcase__deliv">
          {DELIVERABLES.map((d) => (
            <div key={d.title} className="deliv-row">
              <span className="deliv-row__icon" aria-hidden="true">
                <Icon name={d.icon} size={20} />
              </span>
              <div>
                <strong>{d.title}</strong>
                <p>{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
