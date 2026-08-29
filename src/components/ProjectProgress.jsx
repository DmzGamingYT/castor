import { useEffect, useRef } from "react";
import AnimatedHeading from "./AnimatedHeading.jsx";
import Icon from "./Icon.jsx";
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
/* pluriels corrects (pas de "en courss" 😅) */
const PLURALS = {
  "livré": "livrés",
  "en cours": "en cours",
  "bientôt": "bientôt",
  "exploration": "explorations",
};
const STATUS_ORDER = ["livré", "en cours", "bientôt", "exploration"];

/* cadran : circonférence du cercle du gauge (r = 52) */
const RING_C = 2 * Math.PI * 52;

function categoryProgress(items) {
  if (!items.length) return 0;
  return Math.round((items.reduce((s, i) => s + (WEIGHT[i.status] ?? 0), 0) / items.length) * 100);
}

function allItems() {
  return Object.values(ROADMAP).flatMap((b) => b.items);
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

/* ── bannière vue d'ensemble : cadran + barre de chantier + distribution ── */
function Overview() {
  const items = allItems();
  const pct = Math.round(
    (items.reduce((s, i) => s + (WEIGHT[i.status] ?? 0), 0) / items.length) * 100
  );
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0]));
  items.forEach((i) => { counts[i.status] = (counts[i.status] || 0) + 1; });

  const ref = useReveal();

  /* déclenche le count-up quand .in est posé */
  const numRef = useRef(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const target = numRef.current;
        if (!target) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) { target.textContent = String(pct); return; }
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / 1400);
          const eased = 1 - Math.pow(1 - p, 3);
          target.textContent = String(Math.round(pct * eased));
          if (p < 1) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        /* cadran et barre se remplissent via la classe .in (CSS/--off) */
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [pct, ref]);

  const ringOffset = RING_C * (1 - pct / 100);

  return (
    <div
      className="prog-overview"
      ref={ref}
      style={{ "--off": ringOffset }}
      aria-label={`Avancement global du projet : ${pct}%`}
    >
      {/* panneau gauche : cadran de chantier */}
      <div className="prog-overview__score">
        <div className="prog-ring" aria-hidden="true">
          <svg viewBox="0 0 120 120" className="prog-ring__svg">
            <defs>
              <linearGradient id="progGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" />
                <stop offset="100%" />
              </linearGradient>
            </defs>
            <circle className="prog-ring__track" cx="60" cy="60" r="52" />
            <circle
              className="prog-ring__circle"
              cx="60"
              cy="60"
              r="52"
              stroke="url(#progGrad)"
            />
          </svg>
          <div className="prog-ring__center">
            <span className="prog-overview__num" ref={numRef}>0</span>
            <span className="prog-overview__pct">%</span>
          </div>
        </div>
        <p className="prog-overview__label">avancement global du chantier</p>
        <p className="prog-overview__total">{items.length} chantiers sur la feuille de route</p>
      </div>

      {/* panneau droit : barre maître + répartition */}
      <div className="prog-overview__bars">
        {/* barre maître style chantier : bandes animées + castor qui avance */}
        <div className="prog-master" aria-hidden="true">
          <div className="prog-master__fill" style={{ "--w": `${pct}%` }}>
            <span className="prog-master__beaver">🦫</span>
          </div>
        </div>

        {/* règle de chantier : repères tous les quarts */}
        <div className="prog-master__ticks" aria-hidden="true">
          {[25, 50, 75, 100].map((t) => (
            <span
              key={t}
              className={`prog-master__tick${t <= pct ? " prog-master__tick--done" : ""}`}
              style={{ left: `${t}%` }}
            >
              <i />
              {t}%
            </span>
          ))}
        </div>

        {/* distribution des statuts : segments proportionnels */}
        <div className="prog-dist" aria-hidden="true">
          {STATUS_ORDER.map((s) =>
            counts[s] ? (
              <span
                key={s}
                className={`prog-dist__seg prog-dist__seg--${s.replace(" ", "-")}`}
                style={{ "--w": `${(counts[s] / items.length) * 100}%` }}
                title={`${counts[s]} ${PLURALS[s]}`}
              />
            ) : null
          )}
        </div>

        {/* légende : pastilles décomptées */}
        <ul className="prog-legend" role="list">
          {STATUS_ORDER.map((s) => (
            <li
              key={s}
              className={`prog-legend__item prog-legend__item--${s.replace(" ", "-")}`}
              role="listitem"
            >
              <span className="prog-legend__dot" aria-hidden="true" />
              <strong className="prog-legend__count">{counts[s]}</strong>
              <span>{PLURALS[s]}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CategoryCard({ catKey, index }) {
  const block = ROADMAP[catKey];
  const pct = categoryProgress(block.items);
  const ref = useReveal();
  const color = COLORS[catKey];

  /* à faire : on masque ce qui est déjà livré — la liste complète
     des livrés est confiée au Castor Bot 🦫 */
  const todo = block.items.filter((it) => it.status !== "livré");
  const delivered = block.items.filter((it) => it.status === "livré");
  const askBot = () => window.dispatchEvent(new CustomEvent(BOT_OPEN_EVENT));

  return (
    <article
      className="prog-card"
      ref={ref}
      style={{ "--cat-color": color, "--w": `${pct}%`, "--d": `${index * 120}ms` }}
      aria-label={`${block.name} — avancement ${pct}%`}
    >
      <header className="prog-card__head">
        <div className="prog-card__title">
          <span className="prog-card__cat-icon" aria-hidden="true">
            <Icon name={block.icon} size={21} />
          </span>
          <div className="prog-card__title-text">
            <h3>{block.name}</h3>
            <p>{SUBS[catKey]}</p>
          </div>
        </div>
        <div className="prog-card__score">
          <span className="prog-card__pct" aria-hidden="true">
            {pct}<i>%</i>
          </span>
          <span className="prog-card__chants">{todo.length} chantiers à faire</span>
        </div>
      </header>

      {/* fine barre de progression de la catégorie */}
      <div className="prog-card__track" aria-hidden="true">
        <div className="prog-card__fill" />
      </div>

      <ul className="prog-card__list">
        {todo.map((it, i) => (
          <li
            key={it.title}
            className={`prog-item prog-item--${it.status.replace(" ", "-")}`}
            style={{ "--d": `${index * 120 + 150 + i * 70}ms` }}
          >
            <span className="prog-item__dot" aria-hidden="true" />
            <div className="prog-item__body">
              <div className="prog-item__top">
                <strong>{it.title}</strong>
                <span className="prog-item__pill" title={STATUS_META[it.status].label}>
                  <span aria-hidden="true">{STATUS_META[it.status].emoji}</span>
                  {STATUS_META[it.status].label}
                </span>
              </div>
              <p>{it.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      {delivered.length > 0 && (
        <button type="button" className="prog-card__done" onClick={askBot}>
          <span aria-hidden="true">✅</span>
          {delivered.length} déjà livré{delivered.length > 1 ? "s" : ""} — liste via le Castor Bot
        </button>
      )}
    </article>
  );
}

export default function ProjectProgress() {
  const headRef = useReveal();

  const askBot = () => window.dispatchEvent(new CustomEvent(BOT_OPEN_EVENT));

  return (
    <section className="section prog" id="avancement" aria-label="Avancement du projet">
      <div className="prog__head" ref={headRef}>
        <span className="prog__badge">🧱 Avancement du projet</span>
        <AnimatedHeading variant="words">Le chantier avance, patte après patte</AnimatedHeading>
        <p className="section-sub">
          Ce qui est livré, ce qu'on construit et ce qui arrive — sans fausse promesse ni date artificielle.
        </p>
      </div>

      <Overview />

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