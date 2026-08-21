import { useEffect, useRef, useState } from "react";

const SUGGESTIONS = [
  "un blog de recettes végé",
  "une app de notes minimaliste",
  "le portfolio d'un illustrateur",
];

const LOG_LINES = [
  "✔ carte du chantier lue",
  "✔ structure générée",
  "✔ styles appliqués",
  "✔ tests passés",
];

const BLOCK_COUNT = 5;

function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 26);
}

export default function DamScene() {
  const [phase, setPhase] = useState("idle"); // idle | work | done
  const [project, setProject] = useState(SUGGESTIONS[0]);
  const [built, setBuilt] = useState(0);
  const [logs, setLogs] = useState([]);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const start = (p) => {
    clearTimers();
    setProject(p);
    setPhase("work");
    setBuilt(0);
    setLogs([`› ${p}`]);

    // les blocs montent un à un
    for (let i = 1; i <= BLOCK_COUNT; i++) {
      later(() => setBuilt(i), 500 + i * 380);
    }
    // le journal défile pendant le chantier
    LOG_LINES.forEach((line, i) => {
      later(() => setLogs((prev) => [...prev, line]), 700 + (i + 1) * 520);
    });
    // fin du chantier
    later(() => setPhase("done"), 500 + (BLOCK_COUNT + 1) * 380);
  };

  // démo automatique au chargement
  useEffect(() => {
    timers.current.push(setTimeout(() => start(SUGGESTIONS[0]), 900));
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const url = `${slugify(project) || "mon-chantier"}.castor.app`;
  const working = phase === "work";

  return (
    <div className="dam">
      <form
        className="dam__input-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!working) start(project.trim() || SUGGESTIONS[0]);
        }}
      >
        <div className="dam__field">
          <span className="dam__prompt">›</span>
          <input
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="Décris ton chantier…"
            aria-label="Décris ton chantier"
            spellCheck="false"
          />
        </div>
        {phase === "done" ? (
          <button type="button" className="btn btn--ghost" onClick={() => start(project)}>
            Nouveau chantier ↺
          </button>
        ) : (
          <button type="submit" className="btn btn--primary" disabled={working}>
            {working ? "Chantier en cours…" : "Construire ⚒️"}
          </button>
        )}
      </form>

      <ul className="dam__chips">
        {SUGGESTIONS.map((s) => (
          <li key={s}>
            <button
              type="button"
              className="dam__chip"
              disabled={working}
              onClick={() => start(s)}
            >
              {s}
            </button>
          </li>
        ))}
      </ul>

      <div className="dam__stage">
        <div className="dam__browser">
          <div className="dam__browser-bar">
            <span /> <span /> <span />
            <em className={`dam__url ${phase === "done" ? "dam__url--on" : ""}`}>
              {phase === "done" ? url : working ? "en construction…" : "\u00A0"}
            </em>
          </div>
          <div className="dam__site">
            <div className={`blk blk--nav ${built > 0 ? "on" : ""}`} />
            <div className={`blk blk--hero ${built > 1 ? "on" : ""}`}>
              {built > 1 && <span className="blk__title" />}
            </div>
            <div className="blk-row">
              {[2, 3, 4].map((i) => (
                <div key={i} className={`blk blk--card ${built > i ? "on" : ""}`} />
              ))}
            </div>
            <div className={`blk blk--footer ${built > 4 ? "on" : ""}`} />
          </div>
          <span className={`dam__beaver ${working ? "dam__beaver--working" : ""} ${phase === "done" ? "dam__beaver--done" : ""}`} aria-hidden="true">
            🦫
          </span>
        </div>

        <pre className="dam__log" aria-live="polite">
          {logs.map((l, i) => (
            <span key={`${i}-${l}`} className="dam__log-line">
              {l.startsWith("›") ? <span className="t-accent">{l}</span> : <span className="t-ok">{l}</span>}
              {"\n"}
            </span>
          ))}
          {working && <span className="cursor">▊</span>}
          {phase === "done" && <span className="t-dim">{"\nFait · prêt à visiter · "}</span>}
          {phase === "done" && <span className="t-accent">0 € facturés</span>}
        </pre>
      </div>
    </div>
  );
}
