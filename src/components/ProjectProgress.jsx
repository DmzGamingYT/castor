import { useEffect, useRef, useMemo } from "react";
import AnimatedHeading from "./AnimatedHeading.jsx";
import Icon from "./Icon.jsx";
import { ROADMAP, STATUS_META } from "../data/roadmap.js";

const BOT_OPEN_EVENT = "castor-bot:open";
const REPO_URL = "https://github.com/DmzGamingYT/castor";

const WEIGHT = { "livré": 1, "en cours": 0.6, "bientôt": 0.3, "exploration": 0.1 };
const STATUS_ORDER = ["livré", "en cours", "bientôt", "exploration"];
const STATUS_COLORS = {
  "livré": "#4caf7d",
  "en cours": "var(--accent)",
  "bientôt": "var(--river)",
  "exploration": "var(--sage)",
};

const CAT_META = {
  app:  { label: "App Desktop", sub: "L'app et ses agents",  icon: "desktop", color: "var(--accent)" },
  site: { label: "Site",        sub: "Le site web Castor",    icon: "globe",   color: "var(--river)" },
  models: { label: "Modèles",   sub: "Cerveaux IA & outils",  icon: "brain",   color: "var(--sage)" },
};

function allItems() { return Object.values(ROADMAP).flatMap((b) => b.items); }
function catPct(items) {
  if (!items.length) return 0;
  return Math.round((items.reduce((s, i) => s + (WEIGHT[i.status] ?? 0), 0) / items.length) * 100);
}

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ── Anneau de progression animé ── */
function ProgressRing({ pct, size = 180, stroke = 14 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  const ref = useRef(null);
  const numRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      /* pose .in : déclenche l'animation du remplissage de l'anneau */
      el.classList.add("in");
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
    }, { threshold: 0.35 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(rafRef.current); };
  }, [pct]);

  return (
    <div className="aev-ring" ref={ref} style={{ "--ring-size": `${size}px`, "--ring-offset": offset }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="aev-ring__svg">
        <defs>
          <linearGradient id="aevGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-2, #efb65a)" />
            <stop offset="100%" stopColor="var(--accent-deep, #a06509)" />
          </linearGradient>
        </defs>
        <circle className="aev-ring__track" cx={size/2} cy={size/2} r={r} strokeWidth={stroke} />
        <circle className="aev-ring__fill" cx={size/2} cy={size/2} r={r} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={circ} />
      </svg>
      <div className="aev-ring__center">
        <span className="aev-ring__num" ref={numRef}>0</span>
        <span className="aev-ring__pct">%</span>
      </div>
    </div>
  );
}

/* ── Mini barre de progression ── */
function MiniBar({ pct, color }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="aev-minibar" ref={ref} style={{ "--bar-color": color, "--bar-w": `${pct}%` }}>
      <div className="aev-minibar__fill" />
    </div>
  );
}

/* ── Carte stat d'une catégorie ── */
function StatCard({ catKey, index }) {
  const meta = CAT_META[catKey];
  const items = ROADMAP[catKey].items;
  const pct = catPct(items);
  const ref = useReveal();
  const counts = useMemo(() => {
    const c = {};
    items.forEach((it) => { c[it.status] = (c[it.status] || 0) + 1; });
    return c;
  }, [items]);

  return (
    <article
      className="aev-stat"
      ref={ref}
      style={{ "--cat-color": meta.color, "--d": `${index * 100}ms` }}
    >
      <div className="aev-stat__icon" aria-hidden="true">
        <Icon name={meta.icon} size={24} />
      </div>
      <div className="aev-stat__info">
        <h3>{meta.label}</h3>
        <p>{meta.sub}</p>
      </div>
      <div className="aev-stat__pct">{pct}<span>%</span></div>
      <MiniBar pct={pct} color={meta.color} />
      <div className="aev-stat__counts">
        {STATUS_ORDER.filter((s) => counts[s]).map((s) => (
          <span key={s} className={`aev-stat__chip aev-stat__chip--${s.replace(" ", "-")}`}>
            <i style={{ background: STATUS_COLORS[s] }} />
            {counts[s]} {s === "livré" ? "livré" : s === "en cours" ? "en cours" : s === "bientôt" ? "bientôt" : "exo"}
          </span>
        ))}
      </div>
    </article>
  );
}

/* ── Liste détaillée d'une catégorie ── */
function CategorySection({ catKey, index }) {
  const meta = CAT_META[catKey];
  const items = ROADMAP[catKey].items;
  const pct = catPct(items);
  const ref = useReveal();

  const grouped = useMemo(() => {
    const g = {};
    STATUS_ORDER.forEach((s) => { g[s] = items.filter((it) => it.status === s); });
    return g;
  }, [items]);

  /* ne crée que les colonnes réellement présentes (pas de 4ᵉ vide) */
  const activeCols = STATUS_ORDER.filter((s) => grouped[s].length > 0).length;

  return (
    <div className="aev-cat" ref={ref} style={{ "--cat-color": meta.color, "--d": `${index * 80}ms`, "--cols": activeCols }}>
      <div className="aev-cat__header">
        <div className="aev-cat__icon" aria-hidden="true">
          <Icon name={meta.icon} size={20} />
        </div>
        <div className="aev-cat__title">
          <h3>{meta.label}</h3>
          <p>{meta.sub}</p>
        </div>
        <div className="aev-cat__pct">{pct}<span>%</span></div>
      </div>

      <div className="aev-cat__columns">

        {STATUS_ORDER.map((s) => (
          grouped[s].length > 0 && (
            <div key={s} className={`aev-col aev-col--${s.replace(" ", "-")}`}>
              <div className="aev-col__head">
                <span className="aev-col__dot" style={{ background: STATUS_COLORS[s] }} />
                <span>{STATUS_META[s].label}</span>
                <span className="aev-col__count">{grouped[s].length}</span>
              </div>
              <ul className="aev-col__list">
                {grouped[s].map((it) => (
                  <li key={it.title} className="aev-item">
                    <span className="aev-item__title">{it.title}</span>
                    <span className="aev-item__desc">{it.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

/* ── Composant principal ── */
export default function ProjectProgress() {
  const headRef = useReveal();
  const items = allItems();
  const pct = Math.round((items.reduce((s, i) => s + (WEIGHT[i.status] ?? 0), 0) / items.length) * 100);
  const counts = useMemo(() => {
    const c = {};
    STATUS_ORDER.forEach((s) => { c[s] = 0; });
    items.forEach((i) => { c[i.status] = (c[i.status] || 0) + 1; });
    return c;
  }, [items]);

  const askBot = () => window.dispatchEvent(new CustomEvent(BOT_OPEN_EVENT));

  return (
    <section className="section aev" id="avancement" aria-label="Avancement du projet">
      {/* ── Hero ── */}
      <div className="aev-hero" ref={headRef}>
        <span className="aev-hero__badge">🧱 Avancement du projet</span>
        <AnimatedHeading variant="words">Le chantier avance, patte après patte</AnimatedHeading>
        <p className="section-sub">
          Ce qui est livré, ce qu'on construit et ce qui arrive — sans fausse promesse ni date artificielle.
        </p>
      </div>

      {/* ── Anneau + stats globales ── */}
      <div className="aev-dashboard">
        <div className="aev-dash__ring">
          <ProgressRing pct={pct} size={200} stroke={16} />
          <p className="aev-dash__label">avancement global</p>
          <p className="aev-dash__total">{items.length} chantiers</p>
        </div>

        <div className="aev-dash__stats">
          {Object.keys(ROADMAP).map((k, i) => (
            <StatCard key={k} catKey={k} index={i} />
          ))}
        </div>
      </div>

      {/* ── Répartition visuelle ── */}
      <div className="aev-dist">
        <div className="aev-dist__bar">
          {STATUS_ORDER.map((s) =>
            counts[s] ? (
              <div
                key={s}
                className={`aev-dist__seg aev-dist__seg--${s.replace(" ", "-")}`}
                style={{ "--seg-w": `${(counts[s] / items.length) * 100}%` }}
                title={`${counts[s]} ${s}`}
              />
            ) : null
          )}
        </div>
        <ul className="aev-dist__legend">
          {STATUS_ORDER.map((s) => (
            <li key={s} className="aev-dist__legend-item">
              <span className="aev-dist__dot" style={{ background: STATUS_COLORS[s] }} />
              <strong>{counts[s]}</strong> {s === "livré" ? "livrés" : s === "en cours" ? "en cours" : s === "bientôt" ? "bientôt" : "explorations"}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Détail par catégorie ── */}
      <div className="aev-categories">
        {Object.keys(ROADMAP).map((k, i) => (
          <CategorySection key={k} catKey={k} index={i} />
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="aev-cta">
        <p>Une question sur un chantier ?</p>
        <div className="aev-cta__actions">
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
