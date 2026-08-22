import { useEffect, useMemo, useRef, useState } from "react";
import Hills from "../components/Hills.jsx";
import Icon from "../components/Icon.jsx";
import { fetchFreeOpenRouter } from "../lib/openrouter.js";
import {
  SNAPSHOT,
  SNAPSHOT_DATE,
  PROVIDERS,
  TYPES,
  formatCtx,
} from "../data/models.js";

const TYPE_CLASS = {
  multimodal: "tag--multimodal",
  vision: "tag--vision",
  raisonnement: "tag--raisonnement",
  code: "tag--code",
  rapide: "tag--rapide",
  outils: "tag--outils",
};

/* cache module : évite de re-fetch à chaque visite de la page */
let liveCache = null; // { entries }

export default function Models() {
  const [entries, setEntries] = useState(liveCache ? liveCache.entries : SNAPSHOT);
  const [status, setStatus] = useState(() =>
    liveCache
      ? { loading: false, live: true, error: null, count: liveCache.entries.filter((e) => e.live).length }
      : { loading: true, live: false, error: null, count: 0 }
  );
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [activeTypes, setActiveTypes] = useState(new Set());
  const reqRef = useRef(0);
  const aliveRef = useRef(true);

  async function refresh() {
    const myReq = ++reqRef.current;
    setStatus((s) => ({ ...s, loading: true, error: null }));
    try {
      const live = await fetchFreeOpenRouter();
      if (!aliveRef.current || reqRef.current !== myReq) return; // démontage ou requête plus récente
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
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (tab !== "all" && e.provider !== tab) return false;
      if (activeTypes.size && ![...activeTypes].some((t) => e.types.includes(t)))
        return false;
      if (query && !`${e.name} ${e.id}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [entries, tab, q, activeTypes]);

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
        <Hills />
        <a className="back" href="#/">← Accueil</a>
        <h1>
          Modèles <span className="hero__accent">gratuits</span>
        </h1>
        <p className="hero__sub">
          Ce que tu peux utiliser pour 0 € sur chaque provider — avec son type
          (multimodal, code, raisonnement…) et sa fenêtre de contexte.
        </p>

        <div className="models__status">
          <button
            className="btn btn--ghost btn--sm"
            onClick={refresh}
            disabled={status.loading}
          >
            ↻ Actualiser
          </button>
          {status.loading ? (
            <span role="status">Actualisation…</span>
          ) : status.live ? (
            <span className="ok" role="status">
              ● Live OpenRouter : {status.count} modèles gratuits · autres providers :
              vérifié le {SNAPSHOT_DATE}
            </span>
          ) : (
            <span className={status.error ? "ko" : ""} role="status">
              {status.error
                ? `Live indisponible (${status.error}) — instantané du ${SNAPSHOT_DATE}`
                : `Instantané du ${SNAPSHOT_DATE}`}
            </span>
          )}
        </div>
      </section>

      <section className="section section--tight models__controls">
        <div className="tabs" role="tablist" aria-label="Filtrer par provider">
          {["all", ...Object.keys(PROVIDERS)].map((key) => (
            <button
              key={key}
              className={`tab ${tab === key ? "tab--on" : ""}`}
              onClick={() => setTab(key)}
              role="tab"
              aria-selected={tab === key}
            >
              {key === "all" ? "Tous" : PROVIDERS[key].label}
            </button>
          ))}
        </div>

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
          <div className="type-filters">
            {Object.entries(TYPES).map(([key, label]) => (
              <button
                key={key}
                className={`chip-btn ${TYPE_CLASS[key]} ${
                  activeTypes.has(key) ? "chip-btn--on" : ""
                }`}
                onClick={() => toggleType(key)}
                aria-pressed={activeTypes.has(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="models__count" role="status">
          {filtered.length} modèle{filtered.length > 1 ? "s" : ""}
        </p>

        <div className="models__grid">
          {filtered.map((m) => (
            <article key={m.id} className="model-card">
              <header className="model-card__head">
                <h3>{m.name}</h3>
                <span className={`provider-badge provider-badge--${m.provider}`}>
                  {PROVIDERS[m.provider]?.label || m.provider}
                </span>
              </header>
              <code className="model-card__id">{m.id}</code>
              <div className="model-card__tags">
                {m.types.map((t) => (
                  <span key={t} className={`tag ${TYPE_CLASS[t]}`}>
                    {TYPES[t] || t}
                  </span>
                ))}
                <span className="tag tag--ctx">contexte {formatCtx(m.ctx)}</span>
              </div>
              {m.live && <span className="model-card__live">live</span>}
            </article>
          ))}
          {!filtered.length && (
            <p className="empty-note">Aucun modèle ne correspond — essaie un autre filtre.</p>
          )}
        </div>
      </section>
    </div>
  );
}
