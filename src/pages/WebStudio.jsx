import { useEffect, useRef, useState } from "react";
import Hills from "../components/Hills.jsx";
import Icon from "../components/Icon.jsx";
import {
  generateSite,
  generateWithAI,
  fetchFreeModels,
  titleFromHtml,
  THEME_LIST,
} from "../lib/generator.js";

const SUGGESTIONS = [
  "Le portfolio d'un photographe animalier",
  "Un blog de recettes végé de saison",
  "Un tableau de bord météo minimaliste",
  "Un quiz de révision sur les planètes",
  "Un tracker d'habitudes avec streak",
];

const BUILD_LOG = [
  "✔ carte du chantier lue",
  "✔ structure générée",
  "✔ styles appliqués",
  "✔ interactions branchées",
  "✔ responsive vérifié",
];

const STORE_KEY = "castor-web-projects";
const OR_KEY_STORE = "castor-or-key";
const DEFAULT_MODEL = "stealth/ox-alpha";

function loadProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
  } catch {
    return [];
  }
}

function shortName(id, name) {
  return (name || id).replace(/\s*\(free\)\s*$/i, "");
}

export default function WebStudio() {
  const [prompt, setPrompt] = useState("");
  const [theme, setTheme] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [projects, setProjects] = useState(loadProjects);
  const [toast, setToast] = useState("");

  // modèles OpenRouter
  const [models, setModels] = useState([]);
  const [modelId, setModelId] = useState(DEFAULT_MODEL);
  const [menuOpen, setMenuOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(OR_KEY_STORE) || "");
  const [keyDraft, setKeyDraft] = useState("");
  const [keyOpen, setKeyOpen] = useState(false);

  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  function flash(msg) {
    setToast(msg);
    later(() => setToast(""), 2200);
  }

  // chargement des modèles gratuits au montage
  useEffect(() => {
    fetchFreeModels()
      .then((list) => {
        // préférence : les modèles mis en avant en premier
        const pref = [
          "stealth/ox-alpha",
          "nvidia/nemotron-3-ultra-550b-a55b:free",
          "poolside/laguna-s-2.1:free",
          "nvidia/nemotron-3.5-lightning:free",
          "poolside/laguna-xs-2.1:free",
        ];
        list.sort((a, b) => {
          const ia = pref.indexOf(a.id), ib = pref.indexOf(b.id);
          if (ia !== -1 || ib !== -1)
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
          return (b.ctx || 0) - (a.ctx || 0);
        });
        setModels(list.slice(0, 14));
      })
      .catch(() => setModels([]));
  }, []);

  const currentModel = models.find((m) => m.id === modelId);
  const aiReady = Boolean(apiKey.trim()) && Boolean(modelId);

  function saveKey() {
    const v = keyDraft.trim();
    setApiKey(v);
    localStorage.setItem(OR_KEY_STORE, v);
    setKeyDraft("");
    setKeyOpen(false);
    flash(v ? "Clé enregistrée — l'IA génère tes sites ✓" : "Clé effacée — retour aux gabarits locaux");
  }

  async function buildWithAI(site) {
    setLogs((p) => [...p, `✔ appel OpenRouter · ${shortName(currentModel?.id, currentModel?.name)}`]);
    const html = await generateWithAI({
      prompt,
      model: modelId,
      apiKey: apiKey.trim(),
      themeName: theme,
    });
    const title = titleFromHtml(html, prompt);
    return {
      ...site,
      html,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28) || "site-ia",
      kindLabel: `IA · ${shortName(currentModel?.id, currentModel?.name).slice(0, 22)}`,
    };
  }

  function build() {
    if (phase === "building" || !prompt.trim()) return;
    setPhase("building");
    setLogs([`› ${prompt.trim()}`]);
    setResult(null);

    BUILD_LOG.forEach((line, i) => later(() => setLogs((p) => [...p, line]), 420 * (i + 1)));

    later(async () => {
      let site = null;
      if (aiReady) {
        try {
          site = await buildWithAI({ theme });
        } catch (err) {
          setLogs((p) => [...p, `⚠ IA indisponible (${String(err.message).slice(0, 60)}) — repli gabarits locaux`]);
        }
      }
      if (!site) site = generateSite(prompt, theme);

      setResult(site);
      const next = [site, ...projects.filter((p) => p.slug !== site.slug)].slice(0, 12);
      setProjects(next);
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
      setPhase("done");
      later(
        () => document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" }),
        80
      );
    }, 420 * (BUILD_LOG.length + 1));
  }

  function openProject(p) {
    setResult(p);
    setPrompt(p.title);
    setPhase("done");
    later(
      () => document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" }),
      80
    );
  }

  function removeProject(slug) {
    const next = projects.filter((p) => p.slug !== slug);
    setProjects(next);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    if (result?.slug === slug) setResult(null);
  }

  function openTab() {
    if (!result) return;
    const blob = new Blob([result.html], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  }

  function download() {
    if (!result) return;
    const blob = new Blob([result.html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${result.slug}.html`;
    a.click();
  }

  async function copyCode() {
    if (!result) return;
    await navigator.clipboard?.writeText(result.html);
    flash("Code copié dans le presse-papier ✓");
  }

  return (
    <div className="studio">
      <section className="hero hero--product studio__hero">
        <div className="hero__glow hero__glow--lime" aria-hidden="true" />
        <Hills />
        <a className="back" href="#/">← Accueil</a>
        <span className="hero__badge">Castor Web · modèles gratuits OpenRouter</span>
        <h1>
          Qu'est-ce qu'on <span className="hero__accent">construit ?</span>
        </h1>

        <div className="composer-card">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) build();
            }}
            placeholder="Décris l'app à construire… ex : un tracker d'habitudes avec streak"
            rows={3}
            disabled={phase === "building"}
            spellCheck="false"
          />

          {keyOpen && (
            <div className="key-row">
              <input
                type="password"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveKey()}
                placeholder="sk-or-v1-… (reste dans ton navigateur)"
                spellCheck="false"
                autoFocus
              />
              <button className="mini-btn mini-btn--primary" onClick={saveKey}>
                Enregistrer
              </button>
              {apiKey && (
                <button className="mini-btn" onClick={() => { setApiKey(""); localStorage.removeItem(OR_KEY_STORE); flash("Clé effacée"); }}>
                  Effacer
                </button>
              )}
            </div>
          )}

          <div className="composer-card__row">
            <div className="theme-dots" title="Thème du site généré">
              {THEME_LIST.map((name) => (
                <button
                  key={name}
                  className={`dot-btn dot-btn--${name} ${theme === name ? "dot-btn--on" : ""}`}
                  onClick={() => setTheme(theme === name ? null : name)}
                  aria-label={`Thème ${name}`}
                />
              ))}
              <em>{theme ? `thème ${theme}` : "thème auto"}</em>
            </div>

            {/* sélecteur de modèle */}
            <div className="model-select">
              <button
                className="model-select__btn"
                onClick={() => setMenuOpen(!menuOpen)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 180)}
              >
                <span className={`engine-dot ${aiReady ? "engine-dot--on" : ""}`} />
                {currentModel ? shortName(currentModel.id, currentModel.name) : "Chargement…"}
                <em>▾</em>
              </button>
              {menuOpen && (
                <ul className="model-menu">
                  {models.length === 0 && (
                    <li className="ms-empty">Gratuits OpenRouter indisponibles — gabarits locaux actifs.</li>
                  )}
                  {models.map((m) => (
                    <li key={m.id}>
                      <button
                        className={`ms-item ${m.id === modelId ? "ms-item--on" : ""}`}
                        onMouseDown={() => {
                          setModelId(m.id);
                          setMenuOpen(false);
                        }}
                      >
                        <span>{shortName(m.id, m.name)}</span>
                        <small>{m.ctx ? Math.round(m.ctx / 1024) + "k" : "—"}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              className={`mini-btn ${apiKey ? "mini-btn--ok" : ""}`}
              onClick={() => setKeyOpen(!keyOpen)}
              title="Clé OpenRouter — requise même pour les modèles gratuits"
            >
              {apiKey ? "clé ✓" : "clé ?"}
            </button>

            <button
              className="send-btn"
              onClick={build}
              disabled={phase === "building" || !prompt.trim()}
              aria-label="Construire"
            >
              {phase === "building" ? "…" : "⬆"}
            </button>
          </div>
        </div>

        {!apiKey && (
          <p className="studio__hint">
            Sans clé : gabarits locaux instantanés. Avec une clé OpenRouter gratuite :
            les modèles du menu génèrent du code sur mesure.
          </p>
        )}

        <ul className="studio__chips">
          {SUGGESTIONS.map((s) => (
            <li key={s}>
              <button
                className="dam__chip"
                disabled={phase === "building"}
                onClick={() => {
                  setPrompt(s);
                  document.querySelector(".composer-card textarea")?.focus();
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {(phase !== "idle" || result) && (
        <section id="preview" className="section section--tight studio__result">
          {phase === "building" && (
            <pre className="dam__log studio__log">
              {logs.map((l, i) => (
                <span key={i}>
                  {l.startsWith("›") ? (
                    <span className="t-accent">{l}</span>
                  ) : l.startsWith("⚠") ? (
                    <span style={{ color: "var(--danger)" }}>{l}</span>
                  ) : (
                    <span className="t-ok">{l}</span>
                  )}
                  {"\n"}
                </span>
              ))}
              <span className="cursor">▊</span>
            </pre>
          )}

          {phase === "done" && result && (
            <>
              <div className="preview-bar">
                <span className="preview-url">{result.slug}.castor.app</span>
                <span className="preview-kind">{result.kindLabel}</span>
                <button onClick={openTab}>Nouvel onglet ↗</button>
                <button onClick={download}>Télécharger .html</button>
                <button onClick={copyCode}>Copier le code</button>
              </div>
              <div className="mockup studio__frame">
                <div className="mockup__bar">
                  <span /> <span /> <span />
                  <em>{result.slug}.castor.app</em>
                </div>
                <iframe
                  title={`Aperçu ${result.title}`}
                  srcDoc={result.html}
                  sandbox="allow-scripts"
                  className="studio__iframe"
                />
              </div>
            </>
          )}
        </section>
      )}

      <section className="section section--tight studio__projects">
        <h2>
          Tes projets {projects.length > 0 && <small>({projects.length})</small>}
        </h2>

        {projects.length === 0 ? (
          <div className="studio__empty">
            <strong>Aucun projet pour l'instant</strong>
            <p>Utilise le composeur au-dessus pour décrire ta première app.</p>
          </div>
        ) : (
          <div className="studio__grid">
            {projects.map((p) => (
              <article key={p.slug + p.createdAt} className="project-card">
                <header>
                  <b>{p.title}</b>
                  <span className={`provider-badge provider-badge--${p.theme || "ambre"}`}>
                    {p.kindLabel}
                  </span>
                </header>
                <code>{p.slug}.castor.app</code>
                <footer>
                  <button className="mini-btn mini-btn--primary" onClick={() => openProject(p)}>
                    Ouvrir
                  </button>
                  <button
                    className="mini-btn"
                    onClick={() => {
                      const blob = new Blob([p.html], { type: "text/html" });
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(blob);
                      a.download = `${p.slug}.html`;
                      a.click();
                    }}
                  >
                    ⬇
                  </button>
                  <button className="mini-btn" onClick={() => removeProject(p.slug)}>✕</button>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>

      {toast && <div className="studio__toast">{toast}</div>}
    </div>
  );
}
