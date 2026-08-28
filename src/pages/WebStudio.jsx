import { useEffect, useRef, useState } from "react";
import Hills from "../components/Hills.jsx";
import ModelSelect from "../components/ModelSelect.jsx";
import { useNavigate } from "../lib/NavigationContext.jsx";
import {
  generateSite,
  generateWithAI,
  titleFromHtml,
  THEME_LIST,
} from "../lib/generator.js";
import { fetchFreeModels } from "../lib/openrouter.js";
import { useApiKey } from "../lib/useApiKey.js";
import {
  DEFAULT_MODEL,
  shortName,
  sortModelsByPreference,
  slugify,
} from "../lib/utils.js";

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

function loadProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function WebStudio() {
  const navigate = useNavigate();
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
  const [keyDraft, setKeyDraft] = useState("");
  const [keyOpen, setKeyOpen] = useState(false);
  const [apiKey, saveKeyState] = useApiKey();

  const timers = useRef([]);
  const buildCtrl = useRef(null); // aborte la génération IA au démontage
  const tabUrlRef = useRef(null);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      buildCtrl.current?.abort();
      if (tabUrlRef.current) URL.revokeObjectURL(tabUrlRef.current);
    },
    []
  );
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  function flash(msg) {
    setToast(msg);
    later(() => setToast(""), 2200);
  }

  // chargement des modèles gratuits au montage
  useEffect(() => {
    let alive = true;
    fetchFreeModels()
      .then((list) => alive && setModels(sortModelsByPreference(list).slice(0, 14)))
      .catch(() => alive && setModels([]));
    return () => {
      alive = false;
    };
  }, []);

  const currentModel = models.find((m) => m.id === modelId);
  const aiReady = Boolean(apiKey.trim()) && Boolean(modelId);

  function saveKey() {
    saveKeyState(keyDraft);
    setKeyDraft("");
    setKeyOpen(false);
    flash(keyDraft.trim() ? "Clé enregistrée — l'IA génère tes sites ✓" : "Clé effacée — retour aux gabarits locaux");
  }

  function clearKey() {
    saveKeyState("");
    flash("Clé effacée — retour aux gabarits locaux");
  }

  async function buildWithAI(site, signal) {
    setLogs((p) => [...p, `✔ appel OpenRouter · ${shortName(currentModel?.id, currentModel?.name)}`]);
    const html = await generateWithAI({
      prompt,
      model: modelId,
      apiKey: apiKey.trim(),
      themeName: theme,
      signal,
    });
    const title = titleFromHtml(html, prompt);
    return {
      ...site,
      html,
      title,
      slug: slugify(title) || "site-ia",
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
      const ctrl = new AbortController();
      buildCtrl.current = ctrl;
      let site = null;
      if (aiReady) {
        try {
          site = await buildWithAI({ theme }, ctrl.signal);
        } catch (err) {
          if (err.name !== "AbortError") {
            setLogs((p) => [
              ...p,
              `⚠ IA indisponible (${String(err.message || "erreur").slice(0, 60)}) — repli gabarits locaux`,
            ]);
          }
        }
      }
      if (!site) site = generateSite(prompt, theme);

      const replaced = projects.some((p) => p.slug === site.slug);
      setResult(site);
      const next = [site, ...projects.filter((p) => p.slug !== site.slug)].slice(0, 12);
      setProjects(next);
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
      setPhase("done");
      if (replaced) flash("Un projet au même nom existait — il a été remplacé");
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
    // le HTML généré par l'IA ne doit jamais tourner same-origin :
    // enfermé dans une iframe sandboxée (origine opaque), il ne peut ni lire
    // la clé API du localStorage ni toucher à window.opener.
    const escaped = result.html.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
    const wrapper =
      '<!doctype html><html><head><meta charset="utf-8">' +
      "<title>Aperçu Castor</title>" +
      "<style>html,body{margin:0;height:100%}iframe{display:block;border:0;width:100%;height:100%}</style>" +
      '</head><body><iframe sandbox="allow-scripts allow-forms allow-modals" ' +
      `srcdoc="${escaped}"></iframe></body></html>`;
    if (tabUrlRef.current) URL.revokeObjectURL(tabUrlRef.current);
    const url = URL.createObjectURL(new Blob([wrapper], { type: "text/html" }));
    tabUrlRef.current = url;
    window.open(url, "_blank", "noopener");
  }

  function downloadHtml(site) {
    const blob = new Blob([site.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${site.slug}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyCode() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.html);
      flash("Code copié dans le presse-papier ✓");
    } catch {
      flash("Copie impossible — accès au presse-papier refusé");
    }
  }

  return (
    <div className="studio">
      <section className="hero hero--product studio__hero">
        <div className="hero__glow hero__glow--lime" aria-hidden="true" />
        <Hills />
        <a className="back" href="/castor/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>← Accueil</a>
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
            aria-label="Décris l'app à construire"
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
                aria-label="Clé API OpenRouter"
              />
              <button className="mini-btn mini-btn--primary" onClick={saveKey}>
                Enregistrer
              </button>
              {apiKey && (
                <button className="mini-btn" onClick={clearKey}>
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
                  aria-pressed={theme === name}
                />
              ))}
              <em>{theme ? `thème ${theme}` : "thème auto"}</em>
            </div>

            <ModelSelect
              models={models}
              modelId={modelId}
              onSelect={setModelId}
              aiReady={aiReady}
              emptyLabel="Gratuits OpenRouter indisponibles — gabarits locaux actifs."
              loadingLabel="Chargement…"
            />

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
                <span key={`${i}-${l}`}>
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
                <span className="preview-url">aperçu local · {result.slug}.html</span>
                <span className="preview-kind">{result.kindLabel}</span>
                <button onClick={openTab}>Nouvel onglet ↗</button>
                <button onClick={() => downloadHtml(result)}>Télécharger .html</button>
                <button onClick={copyCode}>Copier le code</button>
              </div>
              <div className="mockup studio__frame">
                <div className="mockup__bar">
                  <span /> <span /> <span />
                  <em>{result.title}</em>
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
                <code>{p.slug}.html · fichier local</code>
                <footer>
                  <button className="mini-btn mini-btn--primary" onClick={() => openProject(p)}>
                    Ouvrir
                  </button>
                  <button className="mini-btn" onClick={() => downloadHtml(p)} aria-label={`Télécharger ${p.title}`}>
                    ⬇
                  </button>
                  <button
                    className="mini-btn"
                    onClick={() => removeProject(p.slug)}
                    aria-label={`Supprimer ${p.title}`}
                  >
                    ✕
                  </button>
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
