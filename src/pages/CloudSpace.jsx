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
import { useLanguage } from "../lib/LanguageContext.jsx";

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
  { repo: "acme/storefront", promptKey: "cs_demo_p0" },
  { repo: "castor/recettes-vege", promptKey: "cs_demo_p1" },
  { repo: "notes/minimalistes", promptKey: "cs_demo_p2" },
  { repo: "atelier/illustrateur", promptKey: "cs_demo_p3" },
  { repo: "stats/dashboard", promptKey: "cs_demo_p4" },
  { repo: "ecole/planetes", promptKey: "cs_demo_p5" },
];

const PLAN_CHIPS = ["cs_chip_0", "cs_chip_1", "cs_chip_2", "cs_chip_3"];

const AGENT_STEPS = ["cs_step_0", "cs_step_1", "cs_step_2", "cs_step_3", "cs_step_4"];

const GITHUB_STEPS = ["cs_gstep_0", "cs_gstep_1", "cs_gstep_2", "cs_gstep_3", "cs_gstep_4"];

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
  const { t } = useLanguage();
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
  function startSandbox(job) {
    let site = null;
    let htmlLines = [];
    let fileSteps = FILE_STEPS;
    let bootLogs = [];
    let st = AGENT_STEPS;

    if (job.kind === "github") {
      const g = job.gh;
      st = g.readme
        ? GITHUB_STEPS
        : GITHUB_STEPS.map((s) => (s === "cs_gstep_2" ? "cs_gh_no_readme" : s));
      const mk = (p) => ({ path: p, depth: p.includes("/") ? 1 : 0 });
      const per = Math.max(1, Math.ceil(g.files.length / st.length));
      fileSteps = Array.from({ length: st.length }, (_, i) =>
        g.files.slice(i * per, (i + 1) * per).map(mk)
      );
      const doc = g.indexHtml || readmePreviewDoc(g);
      site = { slug: g.name, title: g.name, html: doc, kindLabel: `GitHub · ${g.files.length} ${t("cs_log_files").replace("{count}", "").replace("✓ ", "").trim()}` };
      htmlLines = (g.readme || `# ${g.name}\n\n${g.desc || ""}`).split("\n");
      bootLogs = [
        t("cs_log_connect").replace("{repo}", job.repo),
        t("cs_log_repo_ok").replace("{stars}", String(g.stars)).replace("{branch}", g.branch),
        t("cs_log_files").replace("{count}", String(g.files.length)),
        g.readme ? t("cs_log_readme") : t("cs_log_struct"),
        t("cs_log_preview"),
      ];
    } else {
      if (job.html) {
        const title = titleFromHtml(job.html, job.prompt);
        site = { title, slug: slugify(title), html: job.html, kindLabel: `IA · ${job.modelName}` };
      } else {
        site = generateSite(job.prompt, null);
      }
      htmlLines = site.html.split("\n");
      bootLogs = [
        t("cs_log_connect").replace("{repo}", job.repo),
        t("cs_log_clone").replace("{slug}", slugify(site.title).slice(0, 14)),
      ];
      if (job.modelName) bootLogs.push(t("cs_log_or").replace("{model}", job.modelName));
      bootLogs.push(t("cs_log_npm_install"), t("cs_log_pkgs"), t("cs_log_dev"), t("cs_log_server"));
      if (job.note) bootLogs.unshift(`⚠ ${job.note}`);
    }

    const n = st.length;
    const reveal =
      job.kind === "github"
        ? Array.from({ length: n }, (_, i) =>
            Math.min(htmlLines.length, Math.ceil(((i + 1) * htmlLines.length) / n))
          )
        : [6, 10, 14, 18, htmlLines.length];
    const bootMs = bootLogs.length * 560 + 300;

    setTask({ ...job, site });
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
        setLogs((p) => [...p, `▸ ${t(step)}`]);
      }, at);
    });

    later(() => {
      setBuildPhase("done");
      setStepIdx(n);
      setLogs((p) => [...p, t("cs_log_done")]);
      setTab("preview");
    }, bootMs + n * STEP_MS + 450);
  }

  /* ---------- connecter un repo ---------- */
  function connectRepo(repoArg) {
    let repo = (repoArg || repoDraft).trim();
    if (!repo) {
      setRepoError(t("cs_err_empty"));
      return;
    }
    repo = repo.replace(/^https?:\/\/[^/]+\//, "").replace(/\.git$/, "").replace(/\/+$/, "");
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
      setRepoError(t("cs_err_format"));
      return;
    }
    setRepoError("");
    const demo = DEMO_REPOS.find((d) => d.repo === repo);
    if (demo) {
      startSandbox({ repo: demo.repo, prompt: t(demo.promptKey), kind: "repo" });
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
        prompt: t("cs_plan_prompt").replace("{name}", name),
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
        setRepoError(t("cs_err_notfound"));
      } else if (err.status === 403 || err.status === 429) {
        setRepoError(t("cs_err_rate"));
      } else {
        setRepoError(t("cs_err_gh").replace("{msg}", String(err.message || "erreur").slice(0, 60)));
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
        ? ["HTML5", "CSS3", "JavaScript natif", t("cs_ia_model").replace("{model}", shortName(effectiveModelId, currentModel?.name))]
        : ["HTML5", "CSS3", "JavaScript natif", t("cs_local_template")],
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
            {t("cs_home")}
          </a>
          <span className="hero__badge">
            <Icon name="cloud" size={14} /> {t("cs_espace_badge")}
          </span>
          <h1>
            {t("cs_h1_a")} <span className="hero__accent">{t("cs_h1_b")}</span>
          </h1>
          <p className="hero__sub">
            {t("cs_sub")}
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
              <strong>{t("cs_card1_t")}</strong>
              <span className="espace-card__desc">
                {t("cs_card1_d")}
              </span>
              <em className="espace-card__cta">{t("cs_card1_cta")}</em>
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
              <strong>{t("cs_card2_t")}</strong>
              <span className="espace-card__desc">
                {t("cs_card2_d")}
              </span>
              <em className="espace-card__cta">{t("cs_card2_cta")}</em>
            </button>
          </div>

          <p className="espace__vision">
            <button
              type="button"
              className="espace__vision-link"
              onClick={() => navigate("/cloud")}
            >
              {t("cs_vision")}
            </button>
          </p>
        </section>

        {history.length > 0 && (
          <section className="section espace__history">
            <h2>{t("cs_recent")}</h2>
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
            <h2>{t("cs_feedback_h")}</h2>
            <p>{t("cs_feedback_p")}</p>
          </div>
          <div className="espace__feedback-actions">
            <a
              className="btn btn--ghost"
              href="https://github.com/DmzGamingYT/castor/discussions"
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="chat" size={15} /> {t("cs_discussions")}
            </a>
            <a
              className="btn btn--primary"
              href="https://github.com/DmzGamingYT/castor/issues/new"
              target="_blank"
              rel="noreferrer"
            >
              {t("cs_share_feedback")}
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
            {t("cs_back")}
          </button>
          <span className="hero__badge">
            <Icon name="github" size={14} /> {t("cs_connect_badge")}
          </span>
          <h1>
            {t("cs_h1_repo_a")} <span className="hero__accent">{t("cs_h1_repo_b")}</span>
          </h1>
          <p className="hero__sub">
            {t("cs_repo_sub")}
          </p>

          <div className="espace__repo-form">
            <span className="espace__repo-mark" aria-hidden="true">⎇</span>
            <input
              value={repoDraft}
              onChange={(e) => { setRepoDraft(e.target.value); setRepoError(""); setGhState("idle"); }}
              onKeyDown={(e) => e.key === "Enter" && connectRepo()}
              placeholder={t("cs_repo_placeholder")}
              spellCheck="false"
              autoFocus
              disabled={ghState === "checking"}
              aria-label={t("cs_repo_aria")}
            />
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => connectRepo()}
              disabled={!repoDraft.trim() || ghState === "checking"}
            >
              {ghState === "checking" ? t("cs_checking") : t("cs_connect")}
            </button>
          </div>

          {ghState === "checking" && (
            <p className="espace__checking">
              <span className="espace__dots" aria-hidden="true"><span /><span /><span /></span>
              {t("cs_checking_repo").replace("{repo}", repoDraft)}
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
            {t("cs_demo_hint")}
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
            {t("cs_back")}
          </button>
          <span className="hero__badge">
            <Icon name="tools" size={14} /> {t("cs_plan_badge")}
          </span>
          <h1>
            {t("cs_h1_idea_a")} <span className="hero__accent">{t("cs_h1_idea_b")}</span>
          </h1>
          <p className="hero__sub">
            {t("cs_plan_sub")}
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
                placeholder={t("cs_prompt_placeholder")}
                rows={3}
                spellCheck="false"
                aria-label={t("cs_idea_aria")}
              />

              <div className="composer-card__row espace__model-row">
                <ModelSelect
                  models={models}
                  modelId={effectiveModelId}
                  onSelect={setModelId}
                  aiReady={aiReady}
                  emptyLabel={t("cs_empty_models")}
                  loadingLabel={t("cs_loading")}
                />
                <button
                  type="button"
                  className={`mini-btn ${apiKey ? "mini-btn--ok" : ""}`}
                  onClick={() => setKeyOpen(!keyOpen)}
                  title={t("cs_key_title")}
                >
                  {apiKey ? t("cs_key_ok") : t("cs_key_ask")}
                </button>
              </div>

              {keyOpen && (
                <div className="key-row">
                  <input
                    type="password"
                    value={keyDraft}
                    onChange={(e) => setKeyDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveKey()}
                    placeholder={t("cs_key_placeholder")}
                    spellCheck="false"
                    autoFocus
                    aria-label={t("cs_key_aria")}
                  />
                  <button type="button" className="mini-btn mini-btn--primary" onClick={saveKey}>
                    {t("cs_save")}
                  </button>
                  {apiKey && (
                    <button type="button" className="mini-btn" onClick={() => saveKeyState("")}>
                      {t("cs_clear")}
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
                  {t("cs_plan_btn")}
                </button>
              </div>

              <ul className="espace__chips">
                {PLAN_CHIPS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      className="dam__chip"
                      onClick={() => setPromptDraft(t(s))}
                    >
                      {t(s)}
                    </button>
                  </li>
                ))}
              </ul>

              <p className="espace__hint">
                {aiReady
                  ? t("cs_hint_ai").replace("{model}", shortName(effectiveModelId, currentModel?.name))
                  : t("cs_hint_nokey")}
              </p>
            </>
          ) : (
            <div className="espace__plan">
              <div className="espace__plan-head">
                <Icon name="tools" size={18} />
                {t("cs_plan_head")} <em>{planned.title}</em>
              </div>
              <div className="espace__plan-grid">
                <div className="espace__plan-col">
                  <h3>{t("cs_stack")}</h3>
                  <ul>
                    {planned.stack.map((s) => (
                      <li key={s}>
                        <span className="t-ok" style={{ color: "var(--sage-deep)" }}>✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="espace__plan-col">
                  <h3>{t("cs_files")}</h3>
                  <ul>
                    {planned.files.map((f) => (
                      <li key={f}>
                        <code>{f}</code>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="espace__plan-col">
                  <h3>{t("cs_steps")}</h3>
                  <ol>
                    {planned.steps.map((s, i) => (
                      <li key={s}>
                        <span className="espace__plan-num">{i + 1}</span> {t(s)}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
              <div className="espace__plan-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setPlanned(null)}>
                  {t("cs_edit")}
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={launchPlanned}
                  disabled={planning}
                >
                  {planning
                    ? t("cs_thinking")
                    : aiReady
                      ? t("cs_launch_model").replace("{model}", shortName(effectiveModelId, currentModel?.name))
                      : t("cs_launch")}
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
          {t("cs_back")}
        </button>
        <span className="hero__badge">
          <Icon name="cloud" size={14} /> {t("cs_sandbox_badge").replace("{repo}", task.repo)}
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
              aria-label={t("cs_new_aria")}
            >
              ↻
            </button>
          </div>

          <div className="espace__sandbox-body">
            <aside className="espace__tree" aria-label={t("cs_tree_aria")}>
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
                      {t("cs_close")}
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
              <div className="espace__tabs" role="tablist" aria-label={t("cs_tabs_aria")}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "preview"}
                  className={tab === "preview" ? "on" : ""}
                  onClick={() => setTab("preview")}
                >
                  {t("cwf_tab_preview")}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "code"}
                  className={tab === "code" ? "on" : ""}
                  onClick={() => setTab("code")}
                >
                  {t("cwf_tab_code")}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "terminal"}
                  className={tab === "terminal" ? "on" : ""}
                  onClick={() => setTab("terminal")}
                >
                  {t("cwf_tab_terminal")}
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
                      <span>{isGithub ? t("cs_wait_map") : t("cs_wait_build")}</span>
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
                  <span>{t("cs_retry_msg")}</span>
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
                    {t("cs_retry")}
                  </button>
                </div>
              )}
            </div>

            <aside className="espace__steps" aria-label={t("cs_steps_aria")}>
              <strong className="espace__steps-title">{isGithub ? t("cs_steps_explorer") : t("cs_steps_agent")}</strong>
              {steps.map((s, i) => (
                <span
                  key={s}
                  className={`espace__step ${i < stepIdx || buildPhase === "done" ? "done" : ""} ${i === stepIdx && buildPhase !== "done" ? "now" : ""}`}
                >
                  {i < stepIdx || buildPhase === "done" ? "✓" : i === stepIdx && buildPhase !== "done" ? "▸" : "·"} {t(s)}
                </span>
              ))}
              {buildPhase === "done" && (
                <span className="espace__done">
                  {t("cs_done")}
                </span>
              )}
            </aside>
          </div>

          <div className="espace__sandbox-foot">
            <span className="espace__price">
              {task.modelName ? t("cs_price_model").replace("{model}", task.modelName) : t("cs_price")}
            </span>
            <div className="espace__sandbox-actions">
              <button
                type="button"
                className="mini-btn"
                onClick={copyCode}
                disabled={buildPhase !== "done"}
              >
                {copied ? t("cs_copied") : t("cs_copy_code")}
              </button>
              <button
                type="button"
                className="mini-btn"
                onClick={shareLink}
                disabled={buildPhase !== "done"}
                title={t("cs_share_title")}
              >
                {t("cs_share")}
              </button>
              <button
                type="button"
                className="mini-btn mini-btn--primary"
                onClick={deployNetlify}
                disabled={buildPhase !== "done"}
                title={t("cs_deploy_title")}
              >
                {t("cs_deploy")}
              </button>
              <button
                type="button"
                className="mini-btn"
                onClick={downloadHtml}
                disabled={buildPhase !== "done"}
              >
                {t("cs_download")}
              </button>
            </div>
          </div>
        </div>

        <p className="espace__hint">
          {isGithub
            ? t("cs_hint_github")
            : task.note
              ? task.note
              : task.modelName
                ? t("cs_hint_gen").replace("{model}", task.modelName)
                : task.kind === "repo"
                  ? t("cs_hint_demo")
                  : t("cs_hint_local")}
        </p>
      </section>
    </div>
  );
}
