import { useEffect, useRef, useState, useCallback } from "react";
import { BeaverMark } from "./Icon.jsx";
import { useApiKey } from "../lib/useApiKey.js";
import { streamChat } from "../lib/chatEngine.js";
import { DEFAULT_MODEL } from "../lib/utils.js";
import { ROADMAP, STATUS_META, PRODUCT_NOTES, SITE_HINTS } from "../data/roadmap.js";
import "./CastorBot.css";

const HISTORY_STORE = "castor-bot-history";
const AI_STORE = "castor-bot-ai";
const OPEN_EVENT = "castor-bot:open";

/* ============================================================
   Moteur local — base de connaissance
   ============================================================ */

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function roadmapText(cat) {
  const block = ROADMAP[cat];
  const lines = block.items.map(
    (it) => `${STATUS_META[it.status].emoji} **${it.title}** (${STATUS_META[it.status].label}) — ${it.desc}`
  );
  return `**${block.label} — les chantiers à venir :**\n\n${lines.join("\n\n")}`;
}

const KB = [
  {
    keys: ["roadmap", "a venir", "avenir", "bientot", "nouveaute", "nouveautes", "prochain", "futur", "planning", "avancement"],
    reply: () =>
      `Voici les chantiers en cours chez Castor 🔨\n\n` +
      Object.keys(ROADMAP)
        .map(
          (k) =>
            `**${ROADMAP[k].label}** : ${ROADMAP[k].items
              .filter((i) => i.status !== "livré")
              .slice(0, 2)
              .map((i) => i.title)
              .join(" · ")}`
        )
        .join("\n\n") +
      `\n\nDemande-moi **app**, **site** ou **modèles** pour le détail — ou explore la section « Avancement » du site !`,
    chips: ["📱 App Desktop", "🌐 Site", "🧠 Modèles"],
  },
  {
    keys: ["\\bapp\\b", "desktop", "application"],
    reply: () => roadmapText("app"),
    chips: ["📥 Télécharger", "🧠 Modèles"],
  },
  {
    keys: ["\\bsite\\b", "\\bweb(?!studio)\\b", "\\bpage\\b"],
    reply: () => roadmapText("site"),
    chips: ["📱 App Desktop", "🧠 Modèles"],
  },
  {
    keys: ["modele", "modeles", "model", "models", "cerveau", "llm", "ia gratuite"],
    reply: () => roadmapText("models") + `\n\n📄 ${SITE_HINTS.models}`,
    chips: ["📥 Télécharger", "🔒 Vie privée"],
  },
  {
    keys: ["telecharger", "telechargement", "installer", "installation", "download", "install"],
    reply: () =>
      `📥 **C'est par ici :**\n\n${SITE_HINTS.install}\n\nSur la page **Desktop** tu trouveras les 3 installateurs avec la détection de ton OS.`,
    chips: ["📱 App Desktop", "💰 Prix"],
  },
  {
    keys: ["prix", "gratuit", "abonnement", "payant", "cout", "argent", "tarif"],
    reply: () =>
      `💰 **0 €, pour toujours.**\n\nOpen source (MIT), sans compte, sans limite. Les studios passent par le tier gratuit d'OpenRouter avec ta propre clé — aucun serveur à financer, donc aucun abonnement.`,
    chips: ["🔒 Vie privée", "🧠 Modèles"],
  },
  {
    keys: ["provider", "providers", "openrouter", "groq", "ollama", "lm studio", "opencode", "\\bcle\\b", "\\bapi\\b"],
    reply: () =>
      `🔌 **Branche le cerveau que tu veux :**\n\n• **OpenRouter** — des dizaines de modèles gratuits\n• **Groq** — inférence ultra-rapide\n• **Ollama / LM Studio** — 100% local, même hors ligne\n• **OpenCode Zen** — spécialisé code\n\nTa clé se crée en 30 s sur openrouter.ai et reste dans ton navigateur.`,
    chips: ["🧠 Modèles", "🔒 Vie privée"],
  },
  {
    keys: ["vie privee", "privee", "prive", "donnee", "donnees", "securite", "confidentialite", "tracking"],
    reply: () => `🔒 **Zéro collecte.**\n\n${SITE_HINTS.privacy}\n\nConversations et projets : localStorage uniquement. Pas de serveur, pas de pub, pas de revente.`,
    chips: ["🔌 Providers", "💰 Prix"],
  },
  {
    keys: ["\\bchat(?!bot)\\b", "studio"],
    reply: () => `${PRODUCT_NOTES.chat}\n\nOuvre-le depuis le menu **Chat** en haut !`,
    chips: ["📥 Télécharger", "🧠 Modèles"],
  },
  {
    keys: ["\\bcloud\\b"],
    reply: () => `☁️ ${PRODUCT_NOTES.cloud}\n\nTu peux suivre l'avancement sur GitHub — lien en bas de page !`,
    chips: ["🚀 Roadmap", "📥 Télécharger"],
  },
  {
    keys: ["\\bcli\\b", "terminal", "commande"],
    reply: () => `⌨️ ${PRODUCT_NOTES.cli}`,
    chips: ["📥 Télécharger", "🚀 Roadmap"],
  },
  {
    keys: ["bonjour", "salut", "hello", "\\bhi\\b", "coucou", "\\byo\\b", "hey", "\\bcc\\b"],
    reply: () =>
      `🦫 Salut ! Je suis **Castor Bot** — en ligne 24/7.\n\nJe connais les **choses à venir** de Castor sur le bout des pattes. Que veux-tu savoir ?`,
    chips: ["🚀 Roadmap", "📥 Télécharger", "🧠 Modèles"],
  },
  {
    keys: ["merci", "super", "genial", "top", "cool", "parfait"],
    reply: () => `🦫 Avec plaisir ! Je reste ici 24/7 — bon chantier ! ⚒️`,
    chips: ["🚀 Roadmap"],
  },
  {
    keys: ["qui es tu", "tu es qui", "castor bot", "t'es quoi", "helper", "assistant"],
    reply: () =>
      `🦫 Je suis **Castor Bot** — un script local (et un LLM si tu branches ta clé OpenRouter). Je connais la roadmap par cœur et je ne quitte jamais le chantier : **24/7, même hors ligne**.`,
    chips: ["🚀 Roadmap", "🔌 Providers"],
  },
];

function answerLocal(text) {
  const n = norm(text);
  for (const entry of KB) {
    for (const key of entry.keys) {
      if (new RegExp(key).test(n)) return { text: entry.reply(), chips: entry.chips };
    }
  }
  return null;
}

const FALLBACK = {
  text: `🦫 Celle-là n'est pas dans ma tête de castor.\n\nEssaie une suggestion — ou active le **mode IA** pour une vraie conversation !`,
  chips: ["🚀 Roadmap", "📥 Télécharger", "🧠 Modèles", "💰 Prix"],
};

const WELCOME = {
  role: "bot",
  text: `🦫 Salut ! **Castor Bot** à ton service.\n\nJe te garde au courant des **choses à venir** : app, site, modèles. Clique sur une suggestion 👇`,
  chips: ["🚀 Roadmap", "📱 App Desktop", "🧠 Modèles", "📥 Télécharger"],
};

function systemPrompt() {
  const rm = Object.keys(ROADMAP)
    .map((k) => {
      const b = ROADMAP[k];
      return `${b.label}:\n${b.items.map((i) => `- [${i.status}] ${i.title} — ${i.desc}`).join("\n")}`;
    })
    .join("\n\n");
  const prod = Object.entries(PRODUCT_NOTES).map(([k, v]) => `- ${k}: ${v}`).join("\n");
  return (
    `Tu es Castor Bot, l'assistant discret du site de Castor (agent de code gratuit, open source MIT, par DmzGamingYT). ` +
    `Réponds en français, amical et concis (max 120 mots). ` +
    `Tu connais la roadmap officielle — présente-la comme les chantiers à venir, sans jamais promettre de dates précises. ` +
    `Téléchargement : page Desktop du site, gratuit pour toujours, sans compte.\n\n` +
    `ROADMAP OFFICIELLE :\n${rm}\n\nPRODUITS :\n${prod}\n\nVIE PRIVÉE : ${SITE_HINTS.privacy}`
  );
}

/* ---------- rendu mini-markdown : **gras** + sauts de ligne ---------- */

function RichText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>
            {p.split("\n").map((line, j, arr) => (
              <span key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </span>
        )
      )}
    </>
  );
}

/* ============================================================
   Composant
   ============================================================ */

export default function CastorBot() {
  const [open, setOpen] = useState(false);
  const [apiKey] = useApiKey();
  const [aiMode, setAiMode] = useState(() => {
    try { return localStorage.getItem(AI_STORE) === "1"; } catch { return false; }
  });
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed.slice(-40);
      }
    } catch { /* history corrompue — welcome */ }
    return [WELCOME];
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(HISTORY_STORE, JSON.stringify(messages.slice(-40))); } catch { /* ok */ }
  }, [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, busy]);

  /* coupure du stream à la fermeture */
  useEffect(() => {
    if (!open) abortRef.current?.abort?.();
  }, [open]);

  /* ouverture pilotée depuis le site (section Avancement) */
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  const send = useCallback(
    async (raw) => {
      const text = (typeof raw === "string" ? raw : input).trim();
      if (!text || busy) return;
      setInput("");

      const userMsg = { role: "user", text };
      setMessages((m) => [...m, userMsg, { role: "bot", text: "", chips: [] }]);
      setBusy(true);

      const useAI = aiMode && apiKey;

      if (!useAI) {
        const local = answerLocal(text);
        await new Promise((r) => setTimeout(r, 400 + Math.random() * 350));
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "bot", ...(local || FALLBACK) };
          return copy;
        });
        setBusy(false);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      const history = [...messages, userMsg]
        .slice(-8)
        .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }));
      try {
        await streamChat({
          apiKey,
          model: DEFAULT_MODEL,
          signal: controller.signal,
          messages: [{ role: "system", content: systemPrompt() }, ...history],
          onDelta: (delta) => {
            setMessages((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              copy[copy.length - 1] = { ...last, text: last.text + delta };
              return copy;
            });
          },
        });
      } catch (e) {
        if (e.name !== "AbortError") {
          const local = answerLocal(text);
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = {
              role: "bot",
              text: `⚠️ Modèle indisponible — je repasse en mode local.\n\n` + (local?.text || FALLBACK.text),
              chips: local?.chips || FALLBACK.chips,
            };
            return copy;
          });
        }
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [aiMode, apiKey, busy, input, messages]
  );

  const toggleAi = () => {
    setAiMode((v) => {
      try { localStorage.setItem(AI_STORE, v ? "0" : "1"); } catch { /* ok */ }
      return !v;
    });
  };

  const hasKey = Boolean(apiKey);
  const lastIsBotTyping = busy && messages[messages.length - 1]?.role === "bot" && !messages[messages.length - 1]?.text;

  return (
    <div className={`cbot ${open ? "cbot--open" : ""}`}>
      {/* ── Panneau ── */}
      <section className="cbot-panel" role="dialog" aria-label="Castor Bot — assistant 24/7" aria-hidden={!open}>
        <header className="cbot-panel__head">
          <span className="cbot-panel__avatar" aria-hidden="true"><BeaverMark size={24} /></span>
          <div className="cbot-panel__id">
            <strong>Castor Bot</strong>
            <span className="cbot-panel__status"><i aria-hidden="true" /> En ligne · 24/7</span>
          </div>
          <button
            type="button"
            className={`cbot-switch ${aiMode ? "cbot-switch--on" : ""} ${!hasKey ? "cbot-switch--off-dis" : ""}`}
            onClick={toggleAi}
            disabled={!hasKey}
            title={hasKey ? "Basculer entre mode local et mode IA (OpenRouter)" : "Ajoute ta clé OpenRouter dans Castor Chat pour activer l'IA"}
            aria-pressed={aiMode}
          >
            <span className="cbot-switch__track"><span className="cbot-switch__thumb" /></span>
            <span className="cbot-switch__label">IA</span>
          </button>
          <button type="button" className="cbot-panel__close" onClick={() => setOpen(false)} aria-label="Fermer l'assistant">×</button>
        </header>

        {!hasKey && (
          <p className="cbot-panel__hint">
            💡 Colle ta clé OpenRouter gratuite dans <strong>Castor Chat</strong> pour débloquer le mode IA.
          </p>
        )}

        <div className="cbot-panel__scroll" ref={scrollRef} aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`cbot-msg cbot-msg--${m.role}`}>
              {m.role === "bot" && (
                <span className="cbot-msg__avatar" aria-hidden="true"><BeaverMark size={18} /></span>
              )}
              <div className="cbot-msg__col">
                {!(lastIsBotTyping && i === messages.length - 1) && (
                  <div className="cbot-msg__bubble">
                    <RichText text={m.text} />
                  </div>
                )}
                {lastIsBotTyping && i === messages.length - 1 && (
                  <div className="cbot-msg__bubble cbot-msg__bubble--typing" aria-label="Castor Bot écrit">
                    <span /><span /><span />
                  </div>
                )}
                {m.role === "bot" && m.chips?.length > 0 && i === messages.length - 1 && !busy && (
                  <div className="cbot-msg__chips">
                    {m.chips.map((c) => (
                      <button key={c} type="button" className="cbot-chip" onClick={() => send(c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form className="cbot-panel__input" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pose ta question…"
            aria-label="Message pour Castor Bot"
            spellCheck="false"
          />
          <button type="submit" className="cbot-panel__send" disabled={busy || !input.trim()} aria-label="Envoyer">
            ➤
          </button>
        </form>
      </section>

      {/* ── Bulle ── */}
      <button
        type="button"
        className="cbot-bubble"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer Castor Bot" : "Ouvrir Castor Bot — assistant 24/7"}
      >
        <span className="cbot-bubble__face" aria-hidden="true">
          {open ? "×" : <BeaverMark size={26} />}
        </span>
        {!open && <span className="cbot-bubble__dot" aria-hidden="true" />}
      </button>
    </div>
  );
}
