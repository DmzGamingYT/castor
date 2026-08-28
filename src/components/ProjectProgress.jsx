import { useEffect, useRef } from "react";
import AnimatedHeading from "./AnimatedHeading.jsx";
import { ROADMAP, STATUS_META } from "../data/roadmap.js";

const BOT_OPEN_EVENT = "castor-bot:open";
const REPO_URL = "https://github.com/DmzGamingYT/castor";

/* poids d'avancement par statut → pourcentage de catégorie */
const WEIGHT = { "livré": 1, "en cours": 0.6, "bientôt": 0.3, "exploration": 0.1 };
const COLORS = { app: "var(--accent)", site: "var(--river)", models: "var(--sage)" };
const SUBS = {
  app: "L'app Desktop et ses agents",
  site: "Le site et les studios web",
  models: "Les cerveaux et leurs superpouvoirs",
};

function categoryProgress(items) {
  if (!items.length) return 0;
  return Math.round((items.reduce((s, i) => s + (WEIGHT[i.status] ?? 0), 0) / items.length) * 100);
}

/* révèle un élément quand il entre dans le viewport */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/* anneau de progression SVG animé à l'entrée dans le viewport */
function ProgressRing({ value, color }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.style.setProperty("--ring-value", value);
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  const R = 34;
  const C = (2 * Math.PI * R).toFixed(1);
  return (
    <div className="prog-ring" ref={ref} style={{ "--ring-color": color, "--ring-circ": C }} aria-hidden="true">
      <svg viewBox="0 0 80 80" width="80" height="80">
        <circle className="prog-ring__bg" cx="40" cy="40" r={R} />
        <circle className="prog-ring__fg" cx="40" cy="40" r={R} strokeDasharray={C} />
      </svg>
      <span className="prog-ring__num">{value}<i>%</i></span>
    </div>
  );
}

function StatusCount() {
  const counts = { "livré": 0, "en cours": 0, "bientôt": 0, "exploration": 0 };
  Object.values(ROADMAP).forEach((b) => b.items.forEach((i) => { counts[i.status] = (counts[i.status] || 0) + 1; }));
  return (
    <div className="prog-counts" role="list">
      {Object.entries(counts).map(([status, n]) => (
        <span key={status} className={`prog-count prog-count--${status.replace(" ", "-")}`} role="listitem">
          <i aria-hidden="true">{STATUS_META[status].emoji}</i> {n} {STATUS_META[status].label.toLowerCase()}
          {n > 1 ? "s" : ""}
        </span>
      ))}
    </div>
  );
}

function CategoryCard({ catKey, index }) {
  const block = ROADMAP[catKey];
  const pct = categoryProgress(block.items);
  const ref = useReveal();
  const color = COLORS[catKey];

  return (
    <article
      className="prog-card"
      ref={ref}
      style={{ "--cat-color": color, "--d": `${index * 120}ms` }}
      aria-label={`${block.label} — avancement ${pct}%`}
    >
      <header className="prog-card__head">
        <div className="prog-card__title">
          <h3>{block.label}</h3>
          <p>{SUBS[catKey]}</p>
        </div>
        <ProgressRing value={pct} color={color} />
      </header>

      <ul className="prog-card__list">
        {block.items.map((it, i) => (
          <li
            key={it.title}
            className={`prog-item prog-item--${it.status.replace(" ", "-")}`}
            style={{ "--d": `${index * 120 + 150 + i * 70}ms` }}
          >
            <span className="prog-item__dot" aria-hidden="true" />
            <div className="prog-item__body">
              <strong>
                {it.title}
                <span className="prog-item__pill">
                  {STATUS_META[it.status].emoji} {STATUS_META[it.status].label}
                </span>
              </strong>
              <p>{it.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function ProjectProgress() {
  const headRef = useReveal();

  const askBot = () => window.dispatchEvent(new CustomEvent(BOT_OPEN_EVENT));

  return (
    <section className="section prog" id="avancement" aria-label="Avancement du projet">
      <div className="prog__head" ref={headRef}>
        <span className="prog__badge">🔨 Avancement du projet</span>
        <AnimatedHeading variant="words">Le chantier avance, patte après patte</AnimatedHeading>
        <p className="section-sub">
          Ce qui est livré, ce qu'on construit et ce qui arrive — sans fausse promesse ni date artificielle.
        </p>
        <StatusCount />
      </div>

      <div className="prog__grid">
        {Object.keys(ROADMAP).map((k, i) => (
          <CategoryCard key={k} catKey={k} index={i} />
        ))}
      </div>

      <div className="prog__cta">
        <p>Une question sur un chantier ?</p>
        <div className="prog__cta-actions">
          <button type="button" className="btn btn--primary" onClick={askBot}>
            🦫 Demander au Castor Bot
          </button>
          <a className="btn btn--ghost" href={REPO_URL} target="_blank" rel="noreferrer">
            ⭐ Suivre sur GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
