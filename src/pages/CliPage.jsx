import { useState, useEffect, useRef } from "react";
import AnimatedHeading from "../components/AnimatedHeading.jsx";

/* ── Commandes simulées de la CLI Castor ── */
const COMMANDS = {
  help: {
    output: `Commandes disponibles :

  /help          Affiche cette aide
  /provider      Liste les providers disponibles
  /provider <n>  Change de provider
  /model         Liste les modèles du provider actif
  /model <id>    Change de modèle
  /key <clé>     Enregistre une clé API
  /tools         Liste les tools disponibles
  /tools on|off  Active/désactive les tools
  /skills        Liste les compétences
  /skill <nom>   Active une compétence
  /memory        Affiche la mémoire
  /remember <f>  Ajoute un fait en mémoire
  /todo          Affiche le plan en cours
  /usage         Statistiques d'utilisation
  /save [nom]    Sauvegarde la session
  /load <nom>    Restaure une session
  /history       Liste les sessions sauvegardées
  /clear         Efface la conversation
  /demo          Lance une démo rapide
  /exit          Quitte le REPL
`,
    type: "dim",
  },
  provider: {
    output: `Providers disponibles :
  1. OpenRouter       Multi-modèles cloud · clé requise
  2. Groq             Ultra-rapide · clé requise
  3. OpenCode Zen     Spécialisé code · clé requise
  4. Ollama           100% local · aucun service tiers
  5. LM Studio        100% local · interface graphique

  /provider <nom|numéro> pour changer`,
    type: "dim",
  },
  model: {
    output: `Modèles OpenRouter :
  1. openrouter/auto          · 200k
  2. google/gemma-3-27b-it    · 128k
  3. meta-llama/llama-4-scout · 128k
  4. mistralai/devstral-small · 64k
  5. qwen/qwen3-30b-a3b       · 128k

  /model <id|numéro> pour changer`,
    type: "dim",
  },
  tools: {
    output: `Tools disponibles :
  read_file        Lit un fichier du projet
  edit_file        Édite un fichier existant
  create_file      Crée un nouveau fichier
  list_dir         Liste le contenu d'un répertoire
  search           Recherche dans le code
  terminal         Exécute une commande shell
  web_search       Recherche sur le web

  /tools on — activer · /tools off — désactiver`,
    type: "dim",
  },
  skills: {
    output: `Compétences :
  /refactor       Refactorisation intelligente
  /test           Génère des tests
  /review         Revue de code
  /doc            Génère de la documentation

  /skill <nom> active pour la prochaine demande`,
    type: "dim",
  },
  memory: {
    output: `Mémoire (0) :
  vide — /remember <fait>`,
    type: "dim",
  },
  todo: {
    output: `Aucun plan en cours — pose une tâche multi-étapes.`,
    type: "dim",
  },
  usage: {
    output: `requêtes : 0  tokens cumulés : ~0  coût : 0 €`,
    type: "dim",
  },
  history: {
    output: `Aucune session sauvegardée — /save <nom> pour créer une session`,
    type: "dim",
  },
  clear: {
    output: `✓ conversation effacée`,
    type: "ok",
  },
  demo: {
    output: `◆ castor · Qwenn Max · ~/api

› ajoute du rate limiting sur /checkout

✔ Lit 34 fichiers · mappe les routes API
✔ Écrit src/middleware/rateLimit.ts
✔ Tests : 18 passés, 0 échoué

Fait · 3 fichiers · 0 €`,
    type: "normal",
  },
  exit: {
    output: `À bientôt ! 🦫`,
    type: "ok",
  },
};

/* Réponses pour les commandes inconnues */
function unknownResponse(cmd) {
  return `Commande inconnue : /${cmd} — /help pour la liste`;
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
  return <>{line}</>;
}

/* Entrée utilisateur dans le terminal */
function TerminalInput({ onSubmit, disabled }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

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
        disabled={disabled}
        placeholder="tape /help pour commencer…"
        className="cli-input__field"
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        aria-label="Commande CLI"
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

export default function CliPage() {
  const [history, setHistory] = useState([
    {
      command: "bienvenue",
      output: `◆ Castor CLI — l'agent de code en ligne de commande

Tape /help pour voir la liste des commandes.
Essaie /demo pour une démonstration rapide.
Ou décris un chantier en langage naturel.

  Exemples :
    /provider          → voir les providers
    /model             → voir les modèles
    /demo              → lancer une démo
    un blog de recettes végé → créer un site
`,
      type: "accent",
    },
  ]);
  const [waiting, setWaiting] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  const handleSubmit = (cmd) => {
    const key = cmd.replace(/^\//, "").toLowerCase().split(/\s+/)[0];
    const response = COMMANDS[key] || {
      output: unknownResponse(key),
      type: "warn",
    };

    setHistory((prev) => [...prev, { command: cmd, ...response }]);
    setWaiting(true);

    /* délai simulant le traitement */
    setTimeout(() => setWaiting(false), 300 + Math.random() * 400);
  };

  return (
    <section className="section cli-page">
      <div className="cli-page__head">
        <span className="prog__badge">⌨️ CLI en ligne</span>
        <AnimatedHeading variant="words">
          Essaie la CLI sans rien installer
        </AnimatedHeading>
        <p className="section-sub">
          Un terminal interactif — tape tes commandes et vois le castor répondre.
        </p>
      </div>

      <div className="cli-terminal">
        <div className="cli-terminal__bar">
          <span className="dot dot--red" />
          <span className="dot dot--yellow" />
          <span className="dot dot--green" />
          <em>castor — zsh</em>
        </div>
        <div className="cli-terminal__body" ref={scrollRef}>
          {history.map((entry, i) => (
            <CommandLine key={i} entry={entry} />
          ))}
          <TerminalInput onSubmit={handleSubmit} disabled={waiting} />
        </div>
      </div>

      <div className="cli-page__hints">
        <p className="cli-page__hint-title">Commandes rapides :</p>
        <div className="cli-page__chips">
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
      </div>
    </section>
  );
}
