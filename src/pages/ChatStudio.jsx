import { memo, useEffect, useRef, useState } from "react";
import { fetchFreeModels } from "../lib/openrouter.js";
import { useApiKey } from "../lib/useApiKey.js";
import ModelSelect from "../components/ModelSelect.jsx";
import AnimatedHeading from "../components/AnimatedHeading.jsx";
import { BeaverMark } from "../components/Icon.jsx";
import { useNavigate } from "../lib/NavigationContext.jsx";
import {
  DEFAULT_MODEL,
  renderMarkdown,
  shouldSubmit,
  sortModelsByPreference,
} from "../lib/utils.js";
import { streamChat, demoAnswer, streamDemo } from "../lib/chatEngine.js";

const STORE = "castor-chats";
const ACTIVE_STORE = "castor-active-chat";
const MODEL_STORE = "castor-model";

function loadChats() {
  try {
    return JSON.parse(localStorage.getItem(STORE) || "[]");
  } catch {
    return [];
  }
}

function loadStored(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v === null || v === undefined ? fallback : v;
  } catch {
    return fallback;
  }
}

function store(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / mode privé */
  }
}

/* Une bulle = un composant mémoïsé : pendant le stream, seules la bulle
   en cours et son contenu changent — le reste du fil ne re-render pas. */
const Message = memo(function Message({ role, content }) {
  return (
    <div className={`cmsg cmsg--${role}`}>
      <span className="cmsg__avatar" aria-hidden="true">
        {role === "assistant" ? <BeaverMark size={20} /> : "👤"}
      </span>
      <div className="cmsg__bubble">
        {role === "assistant" ? (
          <span dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
        ) : (
          content
        )}
      </div>
    </div>
  );
});

export default function ChatStudio() {
  const navigate = useNavigate();
  const [chats, setChats] = useState(loadChats);
  const [activeId, setActiveId] = useState(() => loadStored(ACTIVE_STORE, null));
  const [input, setInput] = useState("");
  const [streamingId, setStreamingId] = useState(null); // conversation en cours de stream
  const [models, setModels] = useState([]);
  const [modelId, setModelId] = useState(() => loadStored(MODEL_STORE, DEFAULT_MODEL));
  const [sideOpen, setSideOpen] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const [keyOpen, setKeyOpen] = useState(false);
  const [apiKey, saveKeyState] = useApiKey();

  const abortRef = useRef(null);
  const flushRef = useRef(null);
  const scrollRef = useRef(null);

  /* charge les modèles gratuits une fois */
  useEffect(() => {
    let alive = true;
    fetchFreeModels()
      .then((list) => alive && setModels(sortModelsByPreference(list).slice(0, 12)))
      .catch(() => alive && setModels([]));
    return () => {
      alive = false;
    };
  }, []);

  /* coupe le stream si on quitte la page */
  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (flushRef.current) clearInterval(flushRef.current);
    },
    []
  );

  /* persiste l'onglet actif et le modèle choisi */
  useEffect(() => store(ACTIVE_STORE, activeId), [activeId]);
  useEffect(() => store(MODEL_STORE, modelId), [modelId]);

  /* modèle effectif : celui enregistré, sinon le premier dispo (le modèle
     mémorisé peut avoir disparu de la liste live des gratuits). */
  const effectiveModelId = models.some((m) => m.id === modelId)
    ? modelId
    : (models[0]?.id || modelId);
  const activeChat = chats.find((c) => c.id === activeId) || null;
  const aiReady = Boolean(apiKey.trim());
  const streaming = streamingId !== null;

  function persist(updater) {
    setChats((prev) => {
      const next =
        typeof updater === "function"
          ? updater(prev)
          : prev.map((c) => (c.id === updater.id ? updater : c));
      try {
        localStorage.setItem(STORE, JSON.stringify(next.slice(0, 40)));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function newChat() {
    setActiveId(null);
    setInput("");
    setSideOpen(false);
  }

  function scrollDown() {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;

    // identifie ou crée la conversation — tout en mises à jour fonctionnelles
    let chatId;
    if (!activeChat) {
      chatId = Date.now();
      const chat = {
        id: chatId,
        title: text.slice(0, 42),
        model: modelId,
        messages: [
          { role: "user", content: text },
          { role: "assistant", content: "" },
        ],
        createdAt: Date.now(),
      };
      persist([chat, ...chats]);
      setActiveId(chatId);
    } else {
      chatId = activeChat.id;
      persist((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  { role: "user", content: text },
                  { role: "assistant", content: "" },
                ],
              }
            : c
        )
      );
    }

    const history = [
      ...(activeChat?.messages || []),
      { role: "user", content: text },
    ];

    setInput("");
    setStreamingId(chatId);
    scrollDown();

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    /* streaming throttlé : les deltas s'accumulent dans un buffer,
       peint au plus toutes les 60 ms — plus un re-render par token */
    let acc = "";
    let painted = 0;
    const flush = () => {
      if (painted >= acc.length) return;
      const chunk = acc.slice(painted);
      painted = acc.length;
      persist((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((m, i) =>
                  i === c.messages.length - 1 && m.role === "assistant"
                    ? { ...m, content: m.content + chunk }
                    : m
                ),
              }
            : c
        )
      );
      scrollDown();
    };
    flushRef.current = setInterval(flush, 60);

    const onDelta = (delta) => {
      acc += delta;
    };

    try {
      if (aiReady) {
        await streamChat({
          apiKey: apiKey.trim(),
          model: effectiveModelId,
          messages: history,
          onDelta,
          signal: ctrl.signal,
        });
      } else {
        await streamDemo(demoAnswer(text), onDelta, ctrl.signal);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        acc += `\n\n⚠ ${err.message || "erreur réseau"}`;
      }
    } finally {
      flush();
      if (flushRef.current) {
        clearInterval(flushRef.current);
        flushRef.current = null;
      }
      abortRef.current = null;
      setStreamingId(null);
      // purge les bulles vides
      persist((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, messages: c.messages.filter((m) => m.content || m.role === "user") }
            : c
        )
      );
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function saveKey() {
    saveKeyState(keyDraft);
    setKeyDraft("");
    setKeyOpen(false);
  }

  function clearKey() {
    saveKeyState("");
  }

  function removeChat(id) {
    if (streamingId === id) abortRef.current?.abort();
    persist((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  }

  const composerProps = {
    input,
    setInput,
    onSend: send,
    streaming,
    onStop: stop,
    keyOpen,
    setKeyOpen,
    keyDraft,
    setKeyDraft,
    onSaveKey: saveKey,
    onClearKey: clearKey,
    hasKey: aiReady,
    models,
    modelId: effectiveModelId,
    setModelId,
    aiReady,
  };

  const showCursorFor = (chatId) => streaming && streamingId === chatId;

  /* ---------- rendu ---------- */
  return (
    <div className={`chatapp ${sideOpen ? "chatapp--menu" : ""}`}>
      <aside className="chatapp__side">
        <div className="chatapp__brand">
          <span className="chatapp__brand-tile" aria-hidden="true"><BeaverMark size={22} /></span>
          <div>
            <strong>Castor Chat</strong>
            <span className="chatapp__brand-sub">gratuit · sans compte</span>
          </div>
        </div>
        <a className="back" href="/castor/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>← Accueil</a>
        <button className="newchat-btn" onClick={newChat}>＋ Nouvelle conversation</button>

        <div className="chatapp__list-label">
          Tes conversations {chats.length > 0 && <small>({chats.length})</small>}
        </div>
        <ul className="chatapp__list">
          {chats.length === 0 && (
            <li className="chatapp__empty">Elles apparaîtront ici.</li>
          )}
          {chats.map((c) => (
            <li key={c.id}>
              <button
                className={`chatapp__item ${c.id === activeId ? "on" : ""}`}
                onClick={() => {
                  setActiveId(c.id);
                  setSideOpen(false);
                }}
              >
                <span className="t">{c.title}</span>
                <button
                  className="del"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChat(c.id);
                  }}
                  aria-label={`Supprimer la conversation « ${c.title} »`}
                  title="Supprimer"
                >
                  ✕
                </button>
              </button>
            </li>
          ))}
        </ul>

        <div className="chatapp__foot">
          Par Castor · <a href="/castor/desktop" onClick={(e) => { e.preventDefault(); navigate("/desktop"); }}>essaie l'agent de code →</a>
        </div>
      </aside>

      <main className="chatapp__main">
        <div className="chatapp__topbar">
          <button
            type="button"
            className="chatapp__burger"
            onClick={() => setSideOpen(!sideOpen)}
            aria-expanded={sideOpen}
            aria-label="Afficher les conversations"
          >
            ☰
          </button>
          <span className="chatapp__topbar-title">
            {activeChat ? activeChat.title : "Nouvelle conversation"}
          </span>
          <span className={`chatapp__mode-pill ${aiReady ? "chatapp__mode-pill--ai" : ""}`} title={aiReady ? `Modèle : ${modelId}` : "Mode démo — ajoute une clé OpenRouter pour l'IA"}>
            <i aria-hidden="true" /> {aiReady ? "IA connectée" : "Démo locale"}
          </span>
        </div>

        {!aiReady && (
          <div className="demo-note" role="status">
            <span className="demo-note__beaver" aria-hidden="true">🦫</span>
            <span>
              <strong>Mode démo locale.</strong> Ajoute une clé OpenRouter gratuite
              (« clé ? » en bas) pour parler à un vrai modèle — rien ne sort de ton navigateur.
            </span>
          </div>
        )}

        {!activeChat ? (
          <div className="chatapp__welcome">
            <div className="chatapp__welcome-glow" aria-hidden="true" />
            <span className="chatapp__welcome-logo" aria-hidden="true">
              <BeaverMark size={52} />
            </span>
            <AnimatedHeading variant="gradient" tag="h1">
              Sur quoi je t'aide ?
            </AnimatedHeading>
            <Composer {...composerProps} />
            <ul className="studio__chips">
              {[
                "Explique-moi les LLM comme si j'avais 10 ans",
                "Une recette de crêpes inratable",
                "Comment débugger un useEffect infini ?",
              ].map((s) => (
                <li key={s}>
                  <button className="dam__chip" onClick={() => setInput(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
            <div className="chatapp__welcome-perks" aria-hidden="true">
              <span className="chatapp__perk">🔍 Réponses sourcées</span>
              <span className="chatapp__perk">🧠 Mode réflexion</span>
              <span className="chatapp__perk">📎 Fichiers & code</span>
              <span className="chatapp__perk">🔒 100% local</span>
            </div>
          </div>
        ) : (
          <>
            <div className="chatapp__thread" ref={scrollRef}>
              {activeChat.messages.map((m, i) => (
                <Message key={i} role={m.role} content={m.content} />
              ))}
              {showCursorFor(activeChat.id) && (
                <span className="cursor cursor--live" aria-hidden="true">
                  ▊
                </span>
              )}
            </div>
            <Composer {...composerProps} />
          </>
        )}
      </main>
    </div>
  );
}

/* Hors du composant parent : une identité stable, donc aucun remount
   à chaque frappe ni pendant le stream (le focus reste dans la textarea). */
function Composer({
  input,
  setInput,
  onSend,
  streaming,
  onStop,
  keyOpen,
  setKeyOpen,
  keyDraft,
  setKeyDraft,
  onSaveKey,
  onClearKey,
  hasKey,
  models,
  modelId,
  setModelId,
  aiReady,
}) {
  return (
    <div className="composer-card cchat-composer">
      {keyOpen && (
        <div className="key-row">
          <input
            type="password"
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSaveKey()}
            placeholder="sk-or-v1-… (reste dans ton navigateur)"
            autoFocus
            spellCheck="false"
            aria-label="Clé API OpenRouter"
          />
          <button className="mini-btn mini-btn--primary" onClick={onSaveKey}>
            Enregistrer
          </button>
          {hasKey && (
            <button className="mini-btn" onClick={onClearKey}>
              Effacer
            </button>
          )}
        </div>
      )}

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (shouldSubmit(e)) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Demande n'importe quoi…"
        rows={2}
        disabled={streaming}
        aria-label="Ton message"
      />

      <div className="composer-card__row">
        <ModelSelect
          models={models}
          modelId={modelId}
          onSelect={setModelId}
          aiReady={aiReady}
          emptyLabel="Modèles indisponibles — mode démo actif."
          loadingLabel={aiReady ? "…" : "démo locale"}
        />

        <button
          className={`mini-btn ${hasKey ? "mini-btn--ok" : ""}`}
          onClick={() => setKeyOpen(!keyOpen)}
          title="Clé OpenRouter gratuite — requise pour le vrai dialogue"
        >
          {hasKey ? "clé ✓" : "clé ?"}
        </button>

        {streaming ? (
          <button className="send-btn send-btn--stop" onClick={onStop} aria-label="Arrêter">
            ■
          </button>
        ) : (
          <button
            className="send-btn"
            onClick={onSend}
            disabled={!input.trim()}
            aria-label="Envoyer"
          >
            ⬆
          </button>
        )}
      </div>
    </div>
  );
}
