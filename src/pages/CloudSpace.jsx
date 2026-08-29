import { useEffect, useRef, useState } from "react";
import Hills from "../components/Hills.jsx";
import Icon, { BeaverMark } from "../components/Icon.jsx";
import ModelSelect from "../components/ModelSelect.jsx";
import { generateSite, generateWithAI, titleFromHtml } from "../lib/generator.js";
import { fetchFreeModels } from "../lib/openrouter.js";
import { useApiKey } from "../lib/useApiKey.js";
import {
  DEFAULT_MODEL,
  escapeHtml,
  renderMarkdown,
  shortName,
  slugify,
  sortModelsByPreference,
} from "../lib/utils.js";
import { useNavigate } from "../lib/NavigationContext.jsx";

/* ------------------------------------------------------------------
   Espace Cloud — le sandbox cloud essayable, 100 % dans le navigateur.
   Inspiré du pattern « Freebuff Cloud » : deux cartes d'action
   (repo GitHub / projet sur mesure), puis un workspace interactif.
   - Repo tapé à la main  → vérifié en RÉEL via l'API publique GitHub
     (fichiers réels, preview du README ou de index.html).
   - Repos de démo        → clone simulé déterministe.
   - Projet sur mesure    → plan, puis IA réelle (OpenRouter, clé de
     l'utilisateur) avec repli sur les gabarits locaux.
   ------------------------------------------------------------------ */

const GH = "https://api.github.com";

const DEMO_REPOS = [
  { repo: "acme/storefront", prompt: "une landing page moderne pour une boutique" },
  { repo: "castor/recettes-vege", prompt: "un blog de recettes végé de saison" },
  { repo: "notes/minimalistes", prompt: "une app de notes minimaliste" },
  { repo: "atelier/illustrateur", prompt: "le portfolio d'un illustrateur" },
  { repo: "stats/dashboard", prompt: "un tableau de bord météo minimaliste" },
  { repo: "ecole/planetes", prompt: "un quiz de révision sur les planètes" },
];

const PLAN_CHIPS = [
  "un tracker d'habitudes avec streak",
  "le portfolio d'un photographe animalier",
  "un quiz de révision sur les planètes",
  "un blog de recettes végé de saison",
];

const AGENT_STEPS = [
  "carte du chantier lue",
  "structure générée",
  "styles appliqués",
  "contenu monté",
  "tests passés",
];

const GITHUB_STEPS = [
  "repo vérifié",
  "fichiers cartographiés",
  "README analysé",
  "preview branchée",
  "chantier prêt",
];

/* fichiers révélés au fil des étapes (gabarits locaux) */
const FILE_STEPS = [
  [{ path: "README.md", depth: 0 }],
  [
    { path: "package.json", depth: 0 },
    { path: "index.html", depth: 0 },
  ],
  [{ path: "src", depth: 0 }, { path: "src/styles.css", depth: 1 }],
  [{ path: "src/app.js", depth: 1 }],
  [{ path: "tests", depth: 0 }, { path: "tests/app.test.js", depth: 1 }],
];

const STEP_MS = 1050; // durée de chaque étape de construction

/* wrapper « papier & encre » pour la preview d'un repo GitHub (README) */
function readmePreviewDoc(g) {
  const body = g.readme
    ? renderMarkdown(g.readme)
    : `<p>${escapeHtml(g.desc || "Aucune description.")}</p>`;
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>${escapeHtml(g.name)} — aperçu GitHub</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:ui-sans-serif,system-ui,sans-serif;background:#faf6ec;color:#2e3320;line-height:1.6}
.wrap{max-width:820px;margin:0 auto;padding:2.6rem 1.4rem}
header{border-bottom:1px solid #d8ccab;padding-bottom:1.2rem;margin-bottom:1.6rem}
.badge{display:inline-block;background:#fdf3dd;color:#a06509;border-radius:999px;padding:.22rem .8rem;font-size:.74rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
h1{font-size:1.8rem;letter-spacing:-.02em;margin:.6rem 0 .3rem}
.sub{color:#6b6450;font-size:.95rem}
main{color:#2e3320;font-size:.95rem}
main h1,main h2,main h3{margin:1.2rem 0 .5rem;font-size:1.15rem}
main h4{margin:1rem 0 .4rem;font-size:1rem}
main p{margin:.5rem 0}
main pre{background:#f2edd9;border:1px solid #e3dac0;border-radius:10px;padding:.8rem 1rem;overflow-x:auto;font-size:.82rem;margin:.6rem 0}
main code{background:#f2edd9;border-radius:5px;padding:.1rem .35rem;font-size:.85em}
main strong{color:#33260a}
main a{color:#1f7d9e}
footer{margin-top:2.6rem;color:#6b6450;font-size:.8rem;border-top:1px dashed #d8ccab;padding-top:1rem}
</style></head><body><div class="wrap">
<header><span class="badge">GitHub · ${escapeHtml(g.branch)}</span>
<h1>${escapeHtml(g.name)}</h1>
<p class="sub">${escapeHtml(g.desc || "")}${g.stars ? ` · ${g.stars} ⭐` : ""}</p></header>
<main>${body}</main>
<footer>Cartographié par Castor Cloud · ${escapeHtml(g.owner)}/${escapeHtml(g.name)}</footer>
</div></body></html>`;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: "application/vnd.github+json" } });
  if (res.status === 404) {
    const e = new Error("notfound");
    e.status = 404;
    throw e;
  }
  if (res.status === 403 || res.status === 429) {
    const e = new Error("rate");
    e.status = res.status;
    throw e;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function CloudSpace() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("landing"); // landing | connect | plan | sandbox
  const [repoDraft, setRepoDraft] = useState("");
  const [repoError, setRepoError] = useState("");
  const [ghState, setGhState] = useState("idle"); // idle | checking | err
  const [promptDraft, setPromptDraft] = useState("");
  const [planned, setPlanned] = useState(null); // plan généré pour un projet sur mesure
  const [planning, setPlanning] = useState(false); // génération IA en cours
  const [task, setTask] = useState(null); // { repo, prompt, site, kind, gh?, modelName?, note? }
  const [steps, setSteps] = useState(AGENT_STEPS);
  const [buildPhase, setBuildPhase] = useState("idle"); // idle | boot | build | done
  const [logs, setLogs] = useState([]);
  const [files, setFiles] = useState([]);
  const [codeLines, setCodeLines] = useState([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [tab, setTab] = useState("terminal"); // preview | code | terminal
  const [copied, setCopied] = useState(false);
  const [viewFile, setViewFile] = useState(null); // fichier sélectionné dans l'arborescence
  const [history, setHistory] = useState([]); // projets Cloud récents (localStorage)

  // IA réelle (OpenRouter) — clé partagée avec le studio Web
  const [models, setModels] = useState([]);
  const [modelId, setModelId] = useState(DEFAULT_MODEL);
  const [keyDraft, setKeyDraft] = useState("");
  const [keyOpen, setKeyOpen] = useState(false);
  const [apiKey, saveKeyState] = useApiKey();

  const timers = useRef([]);
  const buildCtrl = useRef(null);
  const termEndRef = useRef(null);
  const codeEndRef = useRef(null);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    buildCtrl.current?.abort();
  }, []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  // charger l'historique des projets Cloud au montage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("castor-cloud-history") || "[]");
      setHistory(saved);
    } catch {
      setHistory([]);
    }
  }, []);

  // sauvegarder un projet dans l'historique
  function saveToHistory(t) {
    if (!t?.site) return;
    const entry = {
      id: Date.now(),
      repo: t.repo,
      title: t.site.title,
      kind: t.kind,
      modelName: t.modelName || null,
      createdAt: new Date().toISOString(),
    };
    const updated = [entry, ...history.filter((h) => h.repo !== t.repo)].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("castor-cloud-history", JSON.stringify(updated));
  }

  // sauvegarder automatiquement quand le build est terminé
  useEffect(() => {
    if (buildPhase === "done" && task?.site) saveToHistory(task);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildPhase]);

  /* modèles gratuits OpenRouter (pour le flow Planifie) */
  useEffect(() => {
    let alive = true;
    fetchFreeModels()
      .then((list) => alive && setModels(sortModelsByPreference(list).slice(0, 14)))
      .catch(() => alive && setModels([]));
    return () => {
      alive = false;
    };
  }, []);

  /* auto-scroll du terminal et du code */
  useEffect(() => {
    termEndRef.current?.scrollIntoView({ block: "end" });
  }, [logs]);
  useEffect(() => {
    codeEndRef.current?.scrollIntoView({ block: "end" });
  }, [codeLines]);

  const aiReady = Boolean(apiKey.trim()) && Boolean(modelId);
  /* modèle effectif : le choix de l'utilisateur, sinon le premier dispo,
     sinon la valeur par défaut (le modèle par défaut peut avoir disparu
     de la liste live des gratuits). */
  const effectiveModelId = models.some((m) => m.id === modelId)
    ? modelId
    : (models[0]?.id || modelId);
  const currentModel = models.find((m) => m.id === effectiveModelId);

  function saveKey() {
    saveKeyState(keyDraft);
    setKeyDraft("");
    setKeyOpen(false);
  }

  function resetAll() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    buildCtrl.current?.abort();
    setMode("landing");
    setTask(null);
    setSteps(AGENT_STEPS);
    setBuildPhase("idle");
    setLogs([]);
    setFiles([]);
    setCodeLines([]);
    setStepIdx(-1);
    setTab("terminal");
    setPlanned(null);
    setPlanning(false);
    setGhState("idle");
    setRepoError("");
    setCopied(false);
  }

  /* ---------- le moteur du sandbox ---------- */
  function startSandbox(t) {
    let site = null;
    let htmlLines = [];
    let fileSteps = FILE_STEPS;
    let bootLogs = [];
    let st = AGENT_STEPS;

    if (t.kind === "github") {
      const g = t.gh;
      st = g.readme
        ? GITHUB_STEPS
        : GITHUB_STEPS.map((s) => (s === "README analysé" ? "structure lue" : s));
      const mk = (p) => ({ path: p, depth: p.includes("/") ? 1 : 0 });
      const per = Math.max(1, Math.ceil(g.files.length / st.length));
      fileSteps = Array.from({ length: st.length }, (_, i) =>
        g.files.slice(i * per, (i + 1) * per).map(mk)
      );
      const doc = g.indexHtml || readmePreviewDoc(g);
      site = { slug: g.name, title: g.name, html: doc, kindLabel: `GitHub · ${g.files.length} fichiers` };
      htmlLines = (g.readme || `# ${g.name}\n\n${g.desc || ""}`).split("\n");
      bootLogs = [
        `$ castor cloud connect ${t.repo}`,
        `✓ repo réel vérifié — ${g.stars} ⭐ · branche ${g.branch}`,
        `✓ ${g.files.length} fichiers cartographiés`,
        g.readme ? "✓ README analysé" : "✓ structure lue",
        "✓ preview branchée",
      ];
    } else {
      if (t.html) {
        const title = titleFromHtml(t.html, t.prompt);
        site = { title, slug: slugify(title), html: t.html, kindLabel: `IA · ${t.modelName}` };
      } else {
        site = generateSite(t.prompt, null);
      }
      htmlLines = site.html.split("\n");
      bootLogs = [
        `$ castor cloud connect ${t.repo}`,
        `✓ clone ok — 14 fichiers · branche castor/feat-${slugify(site.title).slice(0, 14)}`,
      ];
      if (t.modelName) bootLogs.push(`✓ appel OpenRouter · ${t.modelName}`);
      bootLogs.push("$ npm install", "✓ 186 paquets en 2.1 s", "$ npm run dev", "✓ dev server prêt — preview live sur :5173");
      if (t.note) bootLogs.unshift(`⚠ ${t.note}`);
    }

    const n = st.length;
    const reveal =
      t.kind === "github"
        ? Array.from({ length: n }, (_, i) =>
            Math.min(htmlLines.length, Math.ceil(((i + 1) * htmlLines.length) / n))
          )
        : [6, 10, 14, 18, htmlLines.length];
    const bootMs = bootLogs.length * 560 + 300;

    setTask({ ...t, site });
    setSteps(st);
    setMode("sandbox");
    setBuildPhase("boot");
    setLogs([]);
    setFiles([]);
    setCodeLines([]);
    setStepIdx(-1);
    setTab("terminal");
    setCopied(false);

    bootLogs.forEach((line, i) => later(() => setLogs((p) => [...p, line]), 200 + i * 560));
    later(() => setBuildPhase("build"), bootMs);

    st.forEach((step, i) => {
      const at = bootMs + i * STEP_MS;
      later(() => {
        setStepIdx(i);
        setFiles((p) => [...p, ...(fileSteps[i] || [])]);
        setCodeLines(htmlLines.slice(0, reveal[i]));
        setLogs((p) => [...p, `▸ ${step}`]);
      }, at);
    });

    later(() => {
      setBuildPhase("done");
      setStepIdx(n);
      setLogs((p) => [...p, "✓ chantier terminé — 0 € facturés"]);
      setTab("preview");
    }, bootMs + n * STEP_MS + 450);
  }

  /* ---------- connecter un repo ---------- */
  function connectRepo(repoArg) {
    let repo = (repoArg || repoDraft).trim();
    if (!repo) {
      setRepoError("Entre un repo au format owner/repo, ou choisis une démo.");
      return;
    }
    repo = repo.replace(/^https?:\/\/[^/]+\//, "").replace(/\.git$/, "").replace(/\/+$/, "");
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
      setRepoError("Format attendu : owner/repo (ex : acme/storefront).");
      return;
    }
    setRepoError("");
    const demo = DEMO_REPOS.find((d) => d.repo === repo);
    if (demo) {
      startSandbox({ repo: demo.repo, prompt: demo.prompt, kind: "repo" });
      return;
    }
    connectGithub(repo);
  }

  async function connectGithub(repo) {
    setGhState("checking");
    setRepoError("");
    const [owner, name] = repo.split("/");
    try {
      const meta = await fetchJson(`${GH}/repos/${owner}/${name}`);
      const branch = meta.default_branch || "main";
      const tree = await fetchJson(`${GH}/repos/${owner}/${name}/git/trees/${branch}?recursive=1`);
      const files = (tree.tree || [])
        .filter((t) => t.type === "blob" && !t.path.includes("node_modules"))
        .map((t) => t.path)
        .slice(0, 60);

      let readme = "";
      try {
        const rm = await fetchJson(`${GH}/repos/${owner}/${name}/readme`);
        readme = atob(rm.content || "").replace(/\r\n/g, "\n");
      } catch {
        /* pas de README — pas grave */
      }

      let indexHtml = "";
      if (files.includes("index.html")) {
        try {
          const r = await fetch(`https://raw.githubusercontent.com/${owner}/${name}/${branch}/index.html`);
          if (r.ok) indexHtml = await r.text();
        } catch {
          /* preview du README à la place */
        }
      }

      startSandbox({
        repo,
        prompt: `le site du projet ${name}`,
        kind: "github",
        gh: {
          owner,
          name,
          branch,
          desc: meta.description || "",
          stars: meta.stargazers_count ?? 0,
          files,
          readme,
          indexHtml,
        },
      });
    } catch (err) {
      setGhState("err");
      if (err.status === 404) {
        setRepoError("Repo introuvable sur GitHub. Vérifie l'orthographe (owner/repo) ou choisis une démo.");
      } else if (err.status === 403 || err.status === 429) {
        setRepoError("Limite de l'API GitHub atteinte (60 req/h sans clé). Reviens dans un moment ou choisis une démo.");
      } else {
        setRepoError(`GitHub indisponible (${String(err.message || "erreur").slice(0, 60)}) — choisis une démo.`);
      }
    }
  }

  /* ---------- planifier un projet sur mesure ---------- */
  function planProject() {
    const p = promptDraft.trim();
    if (!p) return;
    const site = generateSite(p, null);
    setPlanned({
      prompt: p,
      title: site.title,
      slug: site.slug,
      stack: aiReady
        ? ["HTML5", "CSS3", "JavaScript natif", `IA · ${shortName(effectiveModelId, currentModel?.name)}`]
        : ["HTML5", "CSS3", "JavaScript natif", "Gabarit Castor local"],
      files: ["index.html", "src/styles.css", "src/app.js", "tests/app.test.js"],
      steps: [...AGENT_STEPS],
    });
  }

  async function launchPlanned() {
    if (!planned || planning) return;
    if (!aiReady) {
      startSandbox({ repo: `castor/${planned.slug}`, prompt: planned.prompt, kind: "custom" });
      return;
    }
    setPlanning(true);
    const ctrl = new AbortController();
    buildCtrl.current = ctrl;
    const modelName = shortName(effectiveModelId, currentModel?.name);
    try {
      const html = await generateWithAI({
        prompt: planned.prompt,
        model: effectiveModelId,
        apiKey: apiKey.trim(),
        themeName: "ambre",
        signal: ctrl.signal,
      });
      startSandbox({
        repo: `castor/${planned.slug}`,
        prompt: planned.prompt,
        kind: "custom",
        html,
        modelName,
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        startSandbox({
          repo: `castor/${planned.slug}`,
          prompt: planned.prompt,
          kind: "custom",
          note: `IA indisponible (${String(err.message || "erreur").slice(0, 56)}) — repli gabarits locaux`,
        });
      }
    } finally {
      setPlanning(false);
    }
  }

  function downloadHtml() {
    if (!task?.site) return;
    const blob = new Blob([task.site.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${task.site.slug}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyCode() {
    if (!task?.site) return;
    try {
      await navigator.clipboard.writeText(task.site.html);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* presse-papier refusé */
    }
  }

  function shareLink() {
    if (!task?.site) return;
    const blob = new Blob([task.site.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    try {
      navigator.clipboard.writeText(url);
    } catch {
      /* presse-papier refusé */
    }
  }

  function deployNetlify() {
    if (!task?.site) return;
    window.open("https://app.netlify.com/drop", "_blank");
  }

  /* ---------- écran d'accueil : les deux cartes d'action ---------- */
  if (mode === "landing") {
    return (
      <div className="espace">
        <section className="hero hero--product espace__hero">
          <div className="hero__glow hero__glow--lime" aria-hidden="true" />
          <div className="hero__glow hero__glow--wood" aria-hidden="true" />
          <Hills />
          <a
            className="back"
            href="/castor/"
            onClick={(e) => { e.preventDefault(); navigate("/"); }}
          >
            ← Accueil
          </a>
          <span className="hero__badge">
            <Icon name="cloud" size={14} /> Espace Cloud · bêta
          </span>
          <h1>
            Connecte un repo. <span className="hero__accent">Construis.</span>
          </h1>
          <p className="hero__sub">
            Connecte n'importe quel repo GitHub, obtient un sandbox cloud avec
            preview live, et construis avec des modèles gratuits.
          </p>

          <div className="espace__cards">
            <button
              type="button"
              className="espace-card"
              onClick={() => setMode("connect")}
            >
              <span className="espace-card__icon" aria-hidden="true">
                <Icon name="github" size={28} />
              </span>
              <strong>Connecte ton premier repo</strong>
              <span className="espace-card__desc">
                Clone un projet GitHub existant dans le Cloud.
              </span>
              <em className="espace-card__cta">Connecter un repo →</em>
            </button>

            <button
              type="button"
              className="espace-card"
              onClick={() => setMode("plan")}
            >
              <span className="espace-card__icon" aria-hidden="true">
                <Icon name="tools" size={28} />
              </span>
              <span className="espace-card__badge">BETA</span>
              <strong>Planifie un projet sur mesure</strong>
              <span className="espace-card__desc">
                Décris ton idée, Castor planifie la stack avant d'écrire le code.
              </span>
              <em className="espace-card__cta">Planifier →</em>
            </button>
          </div>

          <p className="espace__vision">
            <button
              type="button"
              className="espace__vision-link"
              onClick={() => navigate("/cloud")}
            >
              Découvrir la vision Castor Cloud →
            </button>
          </p>
        </section>

        {history.length > 0 && (
          <section className="section espace__history">
            <h2>Projets récents</h2>
            <div className="espace__history-grid">
              {history.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  className="espace__history-card"
                  onClick={() => {
                    setRepoDraft(h.repo);
                    setMode("connect");
                    connectRepo(h.repo);
                  }}
                >
                  <span className="espace__history-icon" aria-hidden="true">
                    {h.kind === "github" ? "🐙" : "🤖"}
                  </span>
                  <strong>{h.title}</strong>
                  <span className="espace__history-repo">{h.repo}</span>
                  <span className="espace__history-meta">
                    {h.modelName ? `· ${h.modelName}` : ""} · {new Date(h.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="section espace__feedback">
          <div className="espace__feedback-text">
            <h2>Façonne l'avenir de Castor Cloud</h2>
            <p>On lit chaque retour. Ça prend moins d'une minute.</p>
          </div>
          <div className="espace__feedback-actions">
            <a
              className="btn btn--ghost"
              href="https://github.com/DmzGamingYT/castor/discussions"
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="chat" size={15} /> Discussions
            </a>
            <a
              className="btn btn--primary"
              href="https://github.com/DmzGamingYT/castor/issues/new"
              target="_blank"
              rel="noreferrer"
            >
              Partager un retour
            </a>
          </div>
        </section>
      </div>
    );
  }

  /* ---------- connecter un repo ---------- */
  if (mode === "connect") {
    return (
      <div className="espace">
        <section className="hero hero--product espace__hero espace__hero--flow">
          <div className="hero__glow hero__glow--lime" aria-hidden="true" />
          <Hills />
          <button type="button" className="back" onClick={() => setMode("landing")}>
            ← Espace Cloud
          </button>
          <span className="hero__badge">
            <Icon name="github" size={14} /> Connecter un repo
          </span>
          <h1>
            Quel repo <span className="hero__accent">ouvre-t-on ?</span>
          </h1>
          <p className="hero__sub">
            Un repo tapé à la main est vérifié en réel sur GitHub. Castor
            cartographie les fichiers et branche la preview.
          </p>

          <div className="espace__repo-form">
            <span className="espace__repo-mark" aria-hidden="true">⎇</span>
            <input
              value={repoDraft}
              onChange={(e) => { setRepoDraft(e.target.value); setRepoError(""); setGhState("idle"); }}
              onKeyDown={(e) => e.key === "Enter" && connectRepo()}
              placeholder="owner/repo — ex : dmzgamingyt/castor"
              spellCheck="false"
              autoFocus
              disabled={ghState === "checking"}
              aria-label="Nom du repo GitHub (owner/repo)"
            />
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => connectRepo()}
              disabled={!repoDraft.trim() || ghState === "checking"}
            >
              {ghState === "checking" ? "Vérification…" : "Connecter"}
            </button>
          </div>

          {ghState === "checking" && (
            <p className="espace__checking">
              <span className="espace__dots" aria-hidden="true"><span /><span /><span /></span>
              Vérification de {repoDraft} sur GitHub…
            </p>
          )}
          {repoError && <p className="espace__error">{repoError}</p>}

          <ul className="espace__chips">
            {DEMO_REPOS.map((d) => (
              <li key={d.repo}>
                <button
                  type="button"
                  className="dam__chip"
                  onClick={() => connectRepo(d.repo)}
                >
                  {d.repo}
                </button>
              </li>
            ))}
          </ul>

          <p className="espace__hint">
            Les démos restent simulées — un repo tapé à la main est vérifié en
            réel via l'API publique GitHub.
          </p>
        </section>
      </div>
    );
  }

  /* ---------- planifier un projet sur mesure ---------- */
  if (mode === "plan") {
    return (
      <div className="espace">
        <section className="hero hero--product espace__hero espace__hero--flow">
          <div className="hero__glow hero__glow--wood" aria-hidden="true" />
          <Hills />
          <button type="button" className="back" onClick={() => setMode("landing")}>
            ← Espace Cloud
          </button>
          <span className="hero__badge">
            <Icon name="tools" size={14} /> Planifier un projet · BETA
          </span>
          <h1>
            Décris ton <span className="hero__accent">idée.</span>
          </h1>
          <p className="hero__sub">
            Castor planifie la stack et les étapes avant d'écrire la moindre ligne.
          </p>

          {!planned ? (
            <>
              <textarea
                className="espace__prompt"
                value={promptDraft}
                onChange={(e) => setPromptDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) planProject();
                }}
                placeholder="ex : un tracker d'habitudes avec streak"
                rows={3}
                spellCheck="false"
                aria-label="Décris ton idée de projet"
              />

              <div className="composer-card__row espace__model-row">
                <ModelSelect
                  models={models}
                  modelId={effectiveModelId}
                  onSelect={setModelId}
                  aiReady={aiReady}
                  emptyLabel="Gratuits OpenRouter indisponibles — gabarits locaux."
                  loadingLabel="Chargement…"
                />
                <button
                  type="button"
                  className={`mini-btn ${apiKey ? "mini-btn--ok" : ""}`}
                  onClick={() => setKeyOpen(!keyOpen)}
                  title="Clé OpenRouter — requise même pour les modèles gratuits"
                >
                  {apiKey ? "clé ✓" : "clé ?"}
                </button>
              </div>

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
                  <button type="button" className="mini-btn mini-btn--primary" onClick={saveKey}>
                    Enregistrer
                  </button>
                  {apiKey && (
                    <button type="button" className="mini-btn" onClick={() => saveKeyState("")}>
                      Effacer
                    </button>
                  )}
                </div>
              )}

              <div className="espace__prompt-actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={planProject}
                  disabled={!promptDraft.trim()}
                >
                  Planifier →
                </button>
              </div>

              <ul className="espace__chips">
                {PLAN_CHIPS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      className="dam__chip"
                      onClick={() => setPromptDraft(s)}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>

              <p className="espace__hint">
                {aiReady
                  ? `IA prête — ${shortName(effectiveModelId, currentModel?.name)} générera le code.`
                  : "Sans clé : gabarits locaux instantanés. Avec une clé OpenRouter gratuite : génération sur mesure."}
              </p>
            </>
          ) : (
            <div className="espace__plan">
              <div className="espace__plan-head">
                <Icon name="tools" size={18} />
                Plan du chantier — <em>{planned.title}</em>
              </div>
              <div className="espace__plan-grid">
                <div className="espace__plan-col">
                  <h3>Stack</h3>
                  <ul>
                    {planned.stack.map((s) => (
                      <li key={s}>
                        <span className="t-ok" style={{ color: "var(--sage-deep)" }}>✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="espace__plan-col">
                  <h3>Fichiers</h3>
                  <ul>
                    {planned.files.map((f) => (
                      <li key={f}>
                        <code>{f}</code>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="espace__plan-col">
                  <h3>Étapes</h3>
                  <ol>
                    {planned.steps.map((s, i) => (
                      <li key={s}>
                        <span className="espace__plan-num">{i + 1}</span> {s}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
              <div className="espace__plan-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setPlanned(null)}>
                  Modifier
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={launchPlanned}
                  disabled={planning}
                >
                  {planning
                    ? "L'agent réfléchit…"
                    : aiReady
                      ? `Lancer la construction (${shortName(effectiveModelId, currentModel?.name)}) →`
                      : "Lancer la construction →"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }

  /* ---------- le sandbox ---------- */
  const isGithub = task.kind === "github";
  const pct = Math.round(((stepIdx + 1) / steps.length) * 100);

  return (
    <div className="espace">
      <section className="hero hero--product espace__hero espace__hero--sandbox">
        <div className="hero__glow hero__glow--lime" aria-hidden="true" />
        <button type="button" className="back" onClick={resetAll}>
          ← Espace Cloud
        </button>
        <span className="hero__badge">
          <Icon name="cloud" size={14} /> Sandbox · {task.repo}
        </span>

        <div className="espace__progress" aria-hidden="true">
          <span style={{ width: `${buildPhase === "done" ? 100 : pct}%` }} />
        </div>

        <div className="espace__sandbox">
          <div className="espace__sandbox-bar">
            <span className="dot dot--red" /><span className="dot dot--yellow" /><span className="dot dot--green" />
            <em>
              castor cloud — {task.repo} · ⎇ {isGithub ? task.gh.branch : `castor/feat-${slugify(task.site.title).slice(0, 14)}`}
            </em>
            <button
              type="button"
              className="espace__new"
              onClick={resetAll}
              aria-label="Nouveau chantier"
            >
              ↻
            </button>
          </div>

          <div className="espace__sandbox-body">
            <aside className="espace__tree" aria-label="Arborescence du chantier">
              <span className="espace__tree-repo">⎇ {isGithub ? task.gh.branch : "main"}</span>
              {files.map((f, i) => {
                const isDir = f.depth === 0 && files.some((ff) => ff.path.startsWith(f.path + "/"));
                return (
                  <button
                    key={`${f.path}-${i}`}
                    type="button"
                    className={`espace__tree-file ${viewFile === f.path ? "selected" : ""}`}
                    style={{ paddingLeft: 0.9 + f.depth * 1.1 }}
                    onClick={() => {
                      if (!isDir && buildPhase === "done") setViewFile(f.path);
                    }}
                    disabled={isDir || buildPhase !== "done"}
                  >
                    {isDir ? "▸ " : "· "}
                    {f.path}
                  </button>
                );
              })}
              {buildPhase !== "done" && <span className="cursor espace__tree-cursor">▊</span>}
            </aside>

            <div className="espace__main">
              {viewFile && buildPhase === "done" && (
                <div className="espace__file-viewer">
                  <div className="espace__file-viewer-head">
                    <span className="espace__file-viewer-name">📄 {viewFile}</span>
                    <button
                      type="button"
                      className="mini-btn"
                      onClick={() => setViewFile(null)}
                    >
                      Fermer
                    </button>
                  </div>
                  <pre className="espace__code">
                    {task.site?.html?.split("\n").map((l, i) => (
                      <span key={i} className="espace__code-line">
                        {String(i + 1).padStart(2, " ")}  {l || " "}
                      </span>
                    ))}
                  </pre>
                </div>
              )}
              <div className="espace__tabs" role="tablist" aria-label="Vues du sandbox">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "preview"}
                  className={tab === "preview" ? "on" : ""}
                  onClick={() => setTab("preview")}
                >
                  Preview
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "code"}
                  className={tab === "code" ? "on" : ""}
                  onClick={() => setTab("code")}
                >
                  Code
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "terminal"}
                  className={tab === "terminal" ? "on" : ""}
                  onClick={() => setTab("terminal")}
                >
                  Terminal
                </button>
              </div>

              {tab === "preview" && (
                <div className="espace__preview">
                  {buildPhase === "done" && task.site ? (
                    <iframe
                      title={`Aperçu ${task.site.title}`}
                      srcDoc={task.site.html}
                      sandbox="allow-scripts"
                      className="studio__iframe"
                    />
                  ) : (
                    <div className="espace__preview-wait">
                      <BeaverMark size={44} />
                      <span>{isGithub ? "Le castor cartographie…" : "Le castor construit…"}</span>
                      <span className="espace__dots" aria-hidden="true">
                        <span /><span /><span />
                      </span>
                    </div>
                  )}
                </div>
              )}

              {tab === "code" && (
                <pre className="espace__code">
                  {codeLines.map((l, i) => (
                    <span key={i} className="espace__code-line">
                      {String(i + 1).padStart(2, " ")}  {l || " "}
                    </span>
                  ))}
                  {buildPhase !== "done" && <span className="cursor">▊</span>}
                  <span ref={codeEndRef} />
                </pre>
              )}

              {tab === "terminal" && (
                <pre className="dam__log espace__term">
                  {logs.map((l, i) => (
                    <span key={`${i}-${l}`} className="dam__log-line">
                      {l.startsWith("$") ? (
                        <span className="t-accent">{l}</span>
                      ) : l.startsWith("✓") ? (
                        <span className="t-ok">{l}</span>
                      ) : l.startsWith("⚠") ? (
                        <span style={{ color: "#e89a84" }}>{l}</span>
                      ) : (
                        l
                      )}
                      {"\n"}
                    </span>
                  ))}
                  {buildPhase !== "done" && <span className="cursor">▊</span>}
                  <span ref={termEndRef} />
                </pre>
              )}
              {buildPhase === "done" && logs.some((l) => l.startsWith("⚠")) && (
                <div className="espace__retry">
                  <span>La génération a échoué — veuillez réessayer.</span>
                  <button
                    type="button"
                    className="mini-btn mini-btn--primary"
                    onClick={() => {
                      if (task.kind === "custom" && aiReady) {
                        resetAll();
                        setMode("plan");
                        setPromptDraft(task.prompt);
                      } else {
                        resetAll();
                        connectRepo(task.repo);
                      }
                    }}
                  >
                    Réessayer ↻
                  </button>
                </div>
              )}
            </div>

            <aside className="espace__steps" aria-label="Avancement">
              <strong className="espace__steps-title">{isGithub ? "Explorateur" : "Agent"}</strong>
              {steps.map((s, i) => (
                <span
                  key={s}
                  className={`espace__step ${i < stepIdx || buildPhase === "done" ? "done" : ""} ${i === stepIdx && buildPhase !== "done" ? "now" : ""}`}
                >
                  {i < stepIdx || buildPhase === "done" ? "✓" : i === stepIdx && buildPhase !== "done" ? "▸" : "·"} {s}
                </span>
              ))}
              {buildPhase === "done" && (
                <span className="espace__done">
                  Fait · prêt à exporter · 0 € facturés
                </span>
              )}
            </aside>
          </div>

          <div className="espace__sandbox-foot">
            <span className="espace__price">
              {task.modelName ? `0 € facturés · ${task.modelName}` : "0 € facturés"}
            </span>
            <div className="espace__sandbox-actions">
              <button
                type="button"
                className="mini-btn"
                onClick={copyCode}
                disabled={buildPhase !== "done"}
              >
                {copied ? "copié ✓" : "Copier le code"}
              </button>
              <button
                type="button"
                className="mini-btn"
                onClick={shareLink}
                disabled={buildPhase !== "done"}
                title="Copier le lien de preview"
              >
                Partager 🔗
              </button>
              <button
                type="button"
                className="mini-btn mini-btn--primary"
                onClick={deployNetlify}
                disabled={buildPhase !== "done"}
                title="Déployer sur Netlify (gratuit)"
              >
                Deploy 🚀
              </button>
              <button
                type="button"
                className="mini-btn"
                onClick={downloadHtml}
                disabled={buildPhase !== "done"}
              >
                Télécharger .html ⬇
              </button>
            </div>
          </div>
        </div>

        <p className="espace__hint">
          {isGithub
            ? "Repo réel vérifié via l'API GitHub — preview du README (ou de index.html)."
            : task.note
              ? task.note
              : task.modelName
                ? `Généré par ${task.modelName} — repli gabarits locaux si l'IA échoue.`
                : task.kind === "repo"
                  ? "Démo simulée — tape un vrai repo owner/repo pour le vérifier sur GitHub."
                  : "Projet généré par le gabarit local — aucune clé, aucun coût."}
        </p>
      </section>
    </div>
  );
}
