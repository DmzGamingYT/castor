import { useState, useEffect, useRef, useMemo } from "react";
import AnimatedHeading from "../components/AnimatedHeading.jsx";
import Icon from "../components/Icon.jsx";
import { useLanguage } from "../lib/LanguageContext.jsx";

/* Réponses pour les commandes inconnues */
function unknownResponse(t, cmd) {
  return t("cli_unknown").replace("{cmd}", cmd);
}

/* Simulation de typewriter */
function useTypewriter(text, speed = 12, active = false) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed, active]);

  return { displayed, done };
}

/* Ligne de sortie avec couleurs */
function OutputLine({ line, type }) {
  if (type === "ok") return <span className="cli-ok">{line}</span>;
  if (type === "dim") return <span className="cli-dim">{line}</span>;
  if (type === "accent") return <span className="cli-accent">{line}</span>;
  if (type === "warn") return <span className="cli-warn">{line}</span>;
  return <>{line}</>;
}

/* Entrée utilisateur dans le terminal */
function TerminalInput({ onSubmit, disabled, value, setValue, inputRef, onHistoryNav }) {
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <form className="cli-input" onSubmit={handleSubmit}>
      <span className="cli-prompt">›</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            onSubmit("__tab__");
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            onHistoryNav?.("up");
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            onHistoryNav?.("down");
          }
        }}
        disabled={disabled}
        placeholder={t("cli_placeholder")}
        className="cli-input__field"
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        aria-label={t("cli_aria")}
      />
      <span className="cli-cursor">▊</span>
    </form>
  );
}

/* Composant d'une ligne de commande + réponse */
function CommandLine({ entry }) {
  const { displayed, done } = useTypewriter(
    entry.output,
    entry.output.length > 200 ? 4 : 10,
    true
  );

  return (
    <div className="cli-entry">
      <div className="cli-command">
        <span className="cli-prompt">›</span> {entry.command}
      </div>
      <pre className="cli-output">
        <OutputLine line={displayed} type={entry.type} />
        {!done && <span className="cli-cursor">▊</span>}
      </pre>
    </div>
  );
}

/* ── carte de la sidebar ── */
function SideCard({ icon, title, children }) {
  return (
    <div className="cli-side__card">
      <div className="cli-side__card-head">
        <Icon name={icon} size={15} />
        <strong>{title}</strong>
      </div>
      {children}
    </div>
  );
}

/* ── mémo de commandes (cheat sheet) ── */
function CommandPalette({ t, onPick }) {
  const entries = [
    ["/help", "cli_d_help"],
    ["/demo", "cli_d_demo"],
    ["/provider", "cli_d_provider"],
    ["/model", "cli_d_model"],
    ["/tools", "cli_d_tools"],
    ["/skills", "cli_d_skills"],
    ["/memory", "cli_d_memory"],
    ["/todo", "cli_d_todo"],
    ["/usage", "cli_d_usage"],
    ["/clear", "cli_d_clear"],
    ["/exit", "cli_d_exit"],
  ];
  return (
    <SideCard icon="terminal" title={t("cli_palette_title")}>
      <ul className="cli-palette">
        {entries.map(([cmd, key]) => (
          <li key={cmd}>
            <button
              type="button"
              className="cli-palette__cmd"
              onClick={() => onPick(cmd)}
              title={t(key)}
            >
              <code>{cmd}</code>
              <span>{t(key)}</span>
            </button>
          </li>
        ))}
      </ul>
    </SideCard>
  );
}

export default function CliPage() {
  const { t } = useLanguage();

  /* ── Commandes simulées de la CLI Castor ── */
  const COMMANDS = {
    help: { output: t("cli_help"), type: "dim" },
    provider: { output: t("cli_provider"), type: "dim" },
    model: { output: t("cli_model"), type: "dim" },
    tools: { output: t("cli_tools"), type: "dim" },
    skills: { output: t("cli_skills"), type: "dim" },
    memory: { output: t("cli_memory"), type: "dim" },
    todo: { output: t("cli_todo_empty"), type: "dim" },
    usage: { output: t("cli_usage"), type: "dim" },
    history: { output: t("cli_history"), type: "dim" },
    clear: { output: t("cli_cleared"), type: "ok" },
    demo: { output: t("cli_demo"), type: "normal" },
    exit: { output: t("cli_exit"), type: "ok" },
  };

  const ALL_CMDS = useMemo(
    () => [
      "/help", "/demo", "/provider", "/model", "/tools", "/skills",
      "/memory", "/remember", "/todo", "/usage", "/save", "/load",
      "/history", "/clear", "/exit",
    ],
    []
  );

  const [history, setHistory] = useState([
    {
      command: "bienvenue",
      output: t("cli_welcome"),
      type: "accent",
    },
  ]);
  const [waiting, setWaiting] = useState(false);
  const [draft, setDraft] = useState("");
  const [cmdLog, setCmdLog] = useState([]); // commandes tapées (pour ↑/↓)
  const [cmdIdx, setCmdIdx] = useState(-1);
  const [uptime, setUptime] = useState(0);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  /* uptime de session */
  useEffect(() => {
    const iv = setInterval(() => setUptime((u) => u + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  const uptimeLabel = useMemo(() => {
    const m = Math.floor(uptime / 60);
    const s = uptime % 60;
    return m > 0 ? `${m}m${String(s).padStart(2, "0")}s` : `${s}s`;
  }, [uptime]);

  const handleSubmit = (cmd) => {
    /* Tab → autocomplétion */
    if (cmd === "__tab__") {
      const cur = draft.trim();
      if (!cur) return;
      const hit = ALL_CMDS.find((c) => c.startsWith(cur.startsWith("/") ? cur : `/${cur}`));
      if (hit) setDraft(`${hit} `);
      return;
    }

    const key = cmd.replace(/^\//, "").toLowerCase().split(/\s+/)[0];
    const response = COMMANDS[key] || {
      output: cmd.startsWith("/")
        ? unknownResponse(t, key)
        : t("cli_nl_done")
            .replace("{prompt}", cmd.length > 42 ? `${cmd.slice(0, 42)}…` : cmd),
      type: cmd.startsWith("/") ? "warn" : "ok",
    };

    setHistory((prev) => [...prev, { command: cmd, ...response }]);
    setCmdLog((prev) => [cmd, ...prev].slice(0, 30));
    setCmdIdx(-1);
    setDraft("");
    setWaiting(true);

    /* délai simulant le traitement */
    setTimeout(() => setWaiting(false), 300 + Math.random() * 400);
  };

  /* ↑/↓ dans l'historique des commandes */
  const handleHistoryNav = (dir) => {
    if (!cmdLog.length) return;
    let idx = cmdIdx + (dir === "up" ? 1 : -1);
    idx = Math.max(-1, Math.min(idx, cmdLog.length - 1));
    setCmdIdx(idx);
    setDraft(idx === -1 ? "" : cmdLog[idx]);
  };

  return (
    <section className="section cli-page">
      <div className="cli-page__head">
        <span className="prog__badge">{t("cli_badge")}</span>
        <AnimatedHeading variant="words">
          {t("cli_heading")}
        </AnimatedHeading>
        <p className="section-sub">
          {t("cli_sub")}
        </p>
      </div>

      <div className="cli-layout">
        {/* ── colonne gauche : terminal ── */}
        <div className="cli-layout__main">
          <div className="cli-terminal">
            <div className="cli-terminal__bar">
              <span className="dot dot--red" />
              <span className="dot dot--yellow" />
              <span className="dot dot--green" />
              <em>castor — zsh</em>
              <span className="cli-terminal__stats">
                <span title={t("cli_stats_uptime")}>⏱ {uptimeLabel}</span>
                <span title={t("cli_stats_cmds")}>⌨ {cmdLog.length}</span>
              </span>
            </div>
            <div className="cli-terminal__body" ref={scrollRef}>
              {history.map((entry, i) => (
                <CommandLine key={i} entry={entry} />
              ))}
              <TerminalInput
                onSubmit={handleSubmit}
                disabled={waiting}
                value={draft}
                setValue={setDraft}
                inputRef={inputRef}
                onHistoryNav={handleHistoryNav}
              />
            </div>
          </div>

          <div className="cli-install">
            <div className="cli-install__head">
              <Icon name="download" size={15} />
              <strong>{t("cli_install_title")}</strong>
            </div>
            <div className="cli-install__rows">
              <code>cd cli && npm link</code>
              <span className="cli-install__sep">→</span>
              <code>castor</code>
            </div>
            <p className="cli-install__note">{t("cli_install_note")}</p>
          </div>
        </div>

        {/* ── colonne droite : commandes + mémo ── */}
        <aside className="cli-side">
          <SideCard icon="zap" title={t("cli_hints_title")}>
            <div className="cli-page__chips cli-side__chips">
              {["help", "demo", "provider", "model", "tools", "skills"].map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  className="cli-chip"
                  onClick={() => handleSubmit(`/${cmd}`)}
                  disabled={waiting}
                >
                  /{cmd}
                </button>
              ))}
            </div>
            <p className="cli-side__hint">{t("cli_side_hint")}</p>
          </SideCard>

          <CommandPalette t={t} onPick={(c) => handleSubmit(c)} />

          <SideCard icon="listCheck" title={t("cli_side_tip_title")}>
            <p className="cli-side__tip">{t("cli_side_tip")}</p>
          </SideCard>
        </aside>
      </div>
    </section>
  );
}
