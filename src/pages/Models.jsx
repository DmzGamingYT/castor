import { useEffect, useMemo, useRef, useState } from "react";
import Hills from "../components/Hills.jsx";
import Icon from "../components/Icon.jsx";
import AnimatedHeading from "../components/AnimatedHeading.jsx";
import { fetchFreeOpenRouter } from "../lib/openrouter.js";
import { useNavigate } from "../lib/NavigationContext.jsx";
import {
  SNAPSHOT,
  SNAPSHOT_DATE,
  PROVIDERS,
  TYPES,
  formatCtx,
  shortId,
} from "../data/models.js";

const TYPE_CLASS = {
  multimodal: "tag--multimodal",
  vision: "tag--vision",
  raisonnement: "tag--raisonnement",
  code: "tag--code",
  rapide: "tag--rapide",
  outils: "tag--outils",
};

const PROVIDER_COLORS = {
  openrouter: "var(--accent)",
  groq: "var(--river)",
  zen: "var(--sage)",
  local: "var(--text)",
};

const PROVIDER_ICONS = {
  openrouter: "zap",
  groq: "zap",
  zen: "code",
  local: "desktop",
};

const SORT_OPTIONS = [
  { key: "default", label: "Par défaut" },
  { key: "name", label: "Nom A→Z" },
  { key: "ctx", label: "Contexte ↓" },
  { key: "provider", label: "Par provider" },
];

/* cache module */
let liveCache = null;

/* ─── Provider Stats Bar ─── */
function ProviderStats({ entries, activeTab, onSelect }) {
  const counts = useMemo(() => {
    const c = {};
    for (const e of entries) {
      c[e.provider] = (c[e.provider] || 0) + 1;
    }
    return c;
  }, [entries]);

  const total = entries.length;

  return (
    <div className="model-stats">
      <button
        type="button"
        className={`model-stats__card ${activeTab === "all" ? "model-stats__card--active" : ""}`}
        onClick={() => onSelect("all")}
      >
        <span className="model-stats__icon" style={{ background: "linear-gradient(135deg, var(--accent), var(--river))" }}>
          <Icon name="layers" size={18} />
        </span>
        <span className="model-stats__info">
          <strong>{total}</strong>
          <small>Tous les modèles</small>
        </span>
      </button>
      {Object.entries(PROVIDERS).map(([key, p]) => (
        <button
          key={key}
          type="button"
          className={`model-stats__card ${activeTab === key ? "model-stats__card--active" : ""}`}
          onClick={() => onSelect(key)}
        >
          <span
            className="model-stats__icon"
            style={{ background: `color-mix(in srgb, ${PROVIDER_COLORS[key]} 18%, transparent)` }}
          >
            <Icon name={PROVIDER_ICONS[key]} size={18} style={{ color: PROVIDER_COLORS[key] }} />
          </span>
          <span className="model-stats__info">
            <strong>{counts[key] || 0}</strong>
            <small>{p.label}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

/* ─── Context Bar ─── */
function ContextBar({ ctx }) {
  const maxCtx = 1048576; // 1M
  const pct = Math.min(100, (ctx / maxCtx) * 100);
  const label = formatCtx(ctx);
  return (
    <div className="ctx-bar" title={`Fenêtre de contexte : ${label}`}>
      <div className="ctx-bar__track">
        <div
          className="ctx-bar__fill"
          style={{
            width: `${pct}%`,
            background: pct > 60
              ? "linear-gradient(90deg, var(--sage), var(--sage-deep))"
              : pct > 30
                ? "linear-gradient(90deg, var(--accent-2), var(--accent))"
                : "linear-gradient(90deg, var(--river), var(--river-deep))",
          }}
        />
      </div>
      <span className="ctx-bar__label">{label}</span>
    </div>
  );
}

/* ─── Model Card ─── */
function ModelCard({ model, index }) {
  const color = PROVIDER_COLORS[model.provider] || "var(--muted)";
  return (
    <article
      className="model-card model-card--v2"
      style={{ "--mc-color": color, animationDelay: `${Math.min(index, 11) * 0.05}s` }}
    >
      <div className="model-card__accent" />
      <div className="model-card__body">
        <header className="model-card__head">
          <span className="model-card__tile" aria-hidden="true">
            <Icon name={PROVIDER_ICONS[model.provider] || "zap"} size={18} />
          </span>
          <div className="model-card__idblock">
            <h3>{model.name}</h3>
            <code className="model-card__id" title={model.id}>
              {shortId(model.id)}
            </code>
          </div>
          <span className="model-card__provider">
            {PROVIDERS[model.provider]?.label || model.provider}
          </span>
        </header>
        <ContextBar ctx={model.ctx} />
        <div className="model-card__foot">
          <div className="model-card__tags">
            {model.types.map((t) => (
              <span key={t} className={`tag ${TYPE_CLASS[t]}`}>
                {TYPES[t] || t}
              </span>
            ))}
          </div>
          {model.live && <span className="model-card__live">live</span>}
        </div>
      </div>
    </article>
  );
}

/* ─── Skeleton de chargement ─── */
function SkeletonCard() {
  return (
    <div className="model-card model-card--skeleton" aria-hidden="true">
      <div className="model-card__body">
        <div className="skel skel--row">
          <div className="skel skel--tile" />
          <div className="skel skel--lines">
            <div className="skel skel--line" style={{ width: "80%" }} />
            <div className="skel skel--line" style={{ width: "55%" }} />
          </div>
        </div>
        <div className="skel skel--bar" />
        <div className="skel skel--row">
          <div className="skel skel--chip" />
          <div className="skel skel--chip" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Models() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState(liveCache ? liveCache.entries : SNAPSHOT);
  const [status, setStatus] = useState(() =>
    liveCache
      ? { loading: false, live: true, error: null, count: liveCache.entries.filter((e) => e.live).length }
      : { loading: true, live: false, error: null, count: 0 }
  );
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("default");
  const [activeTypes, setActiveTypes] = useState(new Set());
  const reqRef = useRef(0);
  const aliveRef = useRef(true);

  async function refresh() {
    const myReq = ++reqRef.current;
    setStatus((s) => ({ ...s, loading: true, error: null }));
    try {
      const live = await fetchFreeOpenRouter();
      if (!aliveRef.current || reqRef.current !== myReq) return;
      liveCache = { entries: [...live, ...SNAPSHOT.filter((e) => e.provider !== "openrouter")] };
      setEntries(liveCache.entries);
      setStatus({ loading: false, live: true, error: null, count: live.length });
    } catch (err) {
      if (!aliveRef.current || reqRef.current !== myReq) return;
      setStatus({ loading: false, live: false, error: err.message, count: 0 });
    }
  }

  useEffect(() => {
    if (!liveCache) refresh();
    return () => { aliveRef.current = false; };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const providerOrder = Object.keys(PROVIDERS);
    const list = entries.filter((e) => {
      if (tab !== "all" && e.provider !== tab) return false;
      if (activeTypes.size && ![...activeTypes].some((t) => e.types.includes(t))) return false;
      if (query && !`${e.name} ${e.id}`.toLowerCase().includes(query)) return false;
      return true;
    });
    if (sort === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name, "fr"));
    if (sort === "ctx") return [...list].sort((a, b) => b.ctx - a.ctx);
    if (sort === "provider")
      return [...list].sort(
        (a, b) => providerOrder.indexOf(a.provider) - providerOrder.indexOf(b.provider) || a.name.localeCompare(b.name, "fr")
      );
    return list;
  }, [entries, tab, q, sort, activeTypes]);

  function toggleType(t) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  return (
    <div className="models">
      <section className="hero hero--product models__hero">
        <div className="hero__glow hero__glow--lime" aria-hidden="true" />
        <div className="hero__glow hero__glow--river" aria-hidden="true" />
        <Hills />
        <a className="back" href="/castor/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>← Accueil</a>
        <AnimatedHeading variant="gradient" tag="h1">
          Modèles gratuits
        </AnimatedHeading>
        <p className="hero__sub">
          Ce que tu peux utiliser pour 0 € sur chaque provider — avec son type
          et sa fenêtre de contexte.
        </p>

        <div className="models__status">
          <button className="btn btn--ghost btn--sm" onClick={refresh} disabled={status.loading}>
            ↻ Actualiser
          </button>
          {status.loading ? (
            <span className="models__pill" role="status">
              <i className="models__pill-dot models__pill-dot--load" aria-hidden="true" /> Actualisation…
            </span>
          ) : status.live ? (
            <span className="models__pill models__pill--live" role="status">
              <i className="models__pill-dot" aria-hidden="true" /> Live OpenRouter · {status.count} modèles gratuits
            </span>
          ) : (
            <span className={`models__pill ${status.error ? "models__pill--ko" : ""}`} role="status">
              <i className="models__pill-dot models__pill-dot--ko" aria-hidden="true" /> {status.error ? `Hors ligne — snapshot ${SNAPSHOT_DATE}` : `Snapshot ${SNAPSHOT_DATE}`}
            </span>
          )}
        </div>
      </section>

      <section className="section section--tight models__controls">
        {/* Provider stats */}
        <ProviderStats entries={entries} activeTab={tab} onSelect={setTab} />

        {/* Filters */}
        <div className="models__filters">
          <label className="models__search">
            <Icon name="search" size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un modèle…"
              spellCheck="false"
              aria-label="Rechercher un modèle"
            />
          </label>
          <label className="models__sort">
            <span aria-hidden="true">↕</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Trier les modèles">
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </label>
          <div className="type-filters">
            {Object.entries(TYPES).map(([key, label]) => (
              <button
                key={key}
                className={`chip-btn ${TYPE_CLASS[key]} ${activeTypes.has(key) ? "chip-btn--on" : ""}`}
                onClick={() => toggleType(key)}
                aria-pressed={activeTypes.has(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="models__count" role="status">
          <strong>{filtered.length}</strong> modèle{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}
        </p>

        {/* Model grid */}
        <div className="models__grid models__grid--v2">
          {status.loading && !entries.some((e) => e.live)
            ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={`skel-${i}`} />)
            : null}
          {filtered.map((m, i) => (
            <ModelCard key={m.id} model={m} index={i} />
          ))}
          {!filtered.length && !status.loading && (
            <div className="models__empty">
              <span className="models__empty-icon" aria-hidden="true">🦫</span>
              <p>Aucun modèle ne correspond — essaie un autre filtre.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
