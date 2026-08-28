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
/* pluriels corrects (pas de "en courss" 😅) */
const PLURALS = {
  "livré": "livrés",
  "en cours": "en cours",
  "bientôt": "bientôt",
  "exploration": "explorations",
};
const STATUS_ORDER = ["livré", "en cours", "bientôt", "exploration"];

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

/* ── bannière vue d'ensemble : % global count-up + barre de chantier + distribution ── */
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
        /* la barre se remplit via la classe .in (CSS) */
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [pct, ref]);

  return (
    <div className="prog-overview" ref={ref} aria-label={`Avancement global du projet : ${pct}%`}>
      <div className="prog-overview__score">
        <span className="prog-overview__num" ref={numRef}>0</span>
        <span className="prog-overview__pct">%</span>
        <span className="prog-overview__label">avancement global du chantier</span>
      </div>

      {/* barre maître style chantier : bandes animées + castor qui avance */}
      <div className="prog-master" aria-hidden="true">
        <div className="prog-master__fill" style={{ "--w": `${pct}%` }}>
          <span className="prog-master__beaver">🦫</span>
        </div>
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

      <div className="prog-counts" role="list">
        {STATUS_ORDER.map((s) => (
          <span key={s} className={`prog-count prog-count--${s.replace(" ", "-")}`} role="listitem">
            <i aria-hidden="true">{STATUS_META[s].emoji}</i> {counts[s]} {PLURALS[s]}
          </span>
        ))}
      </div>
    </div>
  );
}

/* anneau de progression SVG animé à l'entrée dans le viewport */
function ProgressRing({ value, color }) {
  const ref = useRef(null);
  const numRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.style.setProperty("--ring-value", value);
          el.classList.add("in");
          io.disconnect();
          /* count-up du chiffre central */
          const num = numRef.current;
          if (num) {
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (reduce) { num.textContent = String(value); }
            else {
              const t0 = performance.now();
              const tick = (t) => {
                const p = Math.min(1, (t - t0) / 1200);
                const eased = 1 - Math.pow(1 - p, 3);
                num.firstChild.textContent = String(Math.round(value * eased));
                if (p < 1) rafRef.current = requestAnimationFrame(tick);
              };
              rafRef.current = requestAnimationFrame(tick);
            }
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  const R = 34;
  const C = (2 * Math.PI * R).toFixed(1);
  return (
    <div className="prog-ring" ref={ref} style={{ "--ring-color": color, "--ring-circ": C }} aria-hidden="true">
      <svg viewBox="0 0 80 80" width="80" height="80">
        <circle className="prog-ring__bg" cx="40" cy="40" r={R} />
        <circle className="prog-ring__fg" cx="40" cy="40" r={R} strokeDasharray={C} />
      </svg>
      <span className="prog-ring__num" ref={numRef}>0<i>%</i></span>
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
