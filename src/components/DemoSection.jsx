import { useState, useEffect } from "react";
import Icon from "./Icon.jsx";
import AnimatedHeading from "./AnimatedHeading.jsx";

const DEMOS = [
  {
    id: "agents",
    icon: "layers",
    title: "Agents parallèles",
    desc: "Trois refactors en même temps ? Chaque agent vit dans son panneau, sans se marcher dessus.",
  },
  {
    id: "providers",
    icon: "plug",
    title: "Multi-providers",
    desc: "Branche OpenRouter, Groq, OpenCode Zen ou un modèle local. Change de cerveau à chaud.",
  },
  {
    id: "keys",
    icon: "lock",
    title: "Clés chiffrées",
    desc: "Tes clés API sont stockées avec le coffre du système. Jamais en clair.",
  },
  {
    id: "speed",
    icon: "zap",
    title: "Optimisé",
    desc: "Démarrage instantané, streaming token par token, stats de latence en direct.",
  },
];

/* ── Mockups interactifs par feature ── */

function AgentsMockup() {
  const [agents, setAgents] = useState([
    { label: "refactor auth", scope: "src/auth/**", pct: 0, done: false },
    { label: "fix tests e2e", scope: "tests/e2e", pct: 0, done: false },
    { label: "migration v3", scope: "db/migrations", pct: 0, done: false },
  ]);

  useEffect(() => {
    const intervals = agents.map((a, i) => {
      const speed = 0.8 + i * 0.4;
      return setInterval(() => {
        setAgents((prev) =>
          prev.map((ag, j) => {
            if (j !== i || ag.done) return ag;
            const next = Math.min(100, ag.pct + Math.random() * speed);
            return { ...ag, pct: next, done: next >= 100 };
          })
        );
      }, 120);
    });
    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <div className="demo-mockup demo-mockup--agents">
      <div className="demo-mockup__bar">
        <span className="dot dot--red" />
        <span className="dot dot--yellow" />
        <span className="dot dot--green" />
        <em>Castor Desktop</em>
      </div>
      <div className="demo-mockup__body">
        <div className="demo-agents">
          {agents.map((a, i) => (
            <div key={i} className="demo-agent">
              <div className="demo-agent__head">
                <span className={`pulse-dot ${a.done ? "pulse-dot--done" : ""}`} />
                <strong>{a.label}</strong>
              </div>
              <code>{a.scope}</code>
              <div className="demo-agent__track">
                <div
                  className="demo-agent__fill"
                  style={{ width: `${a.pct}%` }}
                />
              </div>
              <span className="demo-agent__pct">
                {a.done ? "✓" : `${Math.round(a.pct)}%`}
              </span>
            </div>
          ))}
        </div>
        <div className="demo-diff">
          <span className="ln ln--add">+ export const guard = withRole("admin")</span>
          <span className="ln ln--del">- const guard = requireAuth()</span>
          <span className="ln">  app.use("/admin", guard)</span>
        </div>
      </div>
    </div>
  );
}

function ProvidersMockup() {
  const [selected, setSelected] = useState(0);
  const providers = [
    { name: "OpenRouter", tag: "Cloud", color: "var(--accent)" },
    { name: "Groq", tag: "Rapide", color: "var(--river)" },
    { name: "Ollama", tag: "Local", color: "var(--sage)" },
  ];

  return (
    <div className="demo-mockup demo-mockup--providers">
      <div className="demo-mockup__bar">
        <span className="dot dot--red" />
        <span className="dot dot--yellow" />
        <span className="dot dot--green" />
        <em>Castor Desktop — Provider</em>
      </div>
      <div className="demo-mockup__body">
        <div className="demo-providers">
          {providers.map((p, i) => (
            <button
              key={i}
              type="button"
              className={`demo-provider ${i === selected ? "demo-provider--active" : ""}`}
              style={{ "--provider-color": p.color }}
              onClick={() => setSelected(i)}
            >
              <span className="demo-provider__dot" />
              <div>
                <strong>{p.name}</strong>
                <span className="demo-provider__tag">{p.tag}</span>
              </div>
              {i === selected && <span className="demo-provider__check">✓</span>}
            </button>
          ))}
        </div>
        <div className="demo-provider-info">
          <span className="demo-provider-info__label">Cerveau actif</span>
          <strong style={{ color: providers[selected].color }}>
            {providers[selected].name}
          </strong>
          <span className="demo-provider-info__change">
            Change à chaud · aucun restart
          </span>
        </div>
      </div>
    </div>
  );
}

function KeysMockup() {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="demo-mockup demo-mockup--keys">
      <div className="demo-mockup__bar">
        <span className="dot dot--red" />
        <span className="dot dot--yellow" />
        <span className="dot dot--green" />
        <em>Castor Desktop — Sécurité</em>
      </div>
      <div className="demo-mockup__body">
        <div className="demo-keys">
          <div className="demo-vault">
            <span className="demo-vault__icon">🔒</span>
            <div>
              <strong>Coffre du système</strong>
              <span>safeStorage · AES-256-GCM</span>
            </div>
          </div>
          <div className="demo-key-row">
            <span className="demo-key-label">OpenRouter</span>
            <code className="demo-key-value">
              {revealed ? "sk-or-v1-abc...xyz" : "••••••••••••••••"}
            </code>
            <button
              type="button"
              className="demo-key-toggle"
              onClick={() => setRevealed(!revealed)}
            >
              {revealed ? "Masquer" : "Révéler"}
            </button>
          </div>
          <div className="demo-key-row">
            <span className="demo-key-label">Groq</span>
            <code className="demo-key-value">••••••••••••••••</code>
            <span className="demo-key-status">Verrouillé</span>
          </div>
          <div className="demo-key-note">
            Jamais en clair · Jamais envoyé · Toujours chez toi
          </div>
        </div>
      </div>
    </div>
  );
}

function SpeedMockup() {
  const [tokens, setTokens] = useState(0);
  const [latency, setLatency] = useState(42);

  useEffect(() => {
    const iv = setInterval(() => {
      setTokens((t) => t + Math.floor(Math.random() * 8 + 3));
      setLatency((l) => Math.max(18, Math.min(80, l + (Math.random() - 0.5) * 6)));
    }, 100);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="demo-mockup demo-mockup--speed">
      <div className="demo-mockup__bar">
        <span className="dot dot--red" />
        <span className="dot dot--yellow" />
        <span className="dot dot--green" />
        <em>Castor Desktop — Performance</em>
      </div>
      <div className="demo-mockup__body">
        <div className="demo-speed">
          <div className="demo-speed__stat">
            <span className="demo-speed__label">Tokens</span>
            <strong className="demo-speed__value">{tokens}</strong>
            <span className="demo-speed__unit">générés</span>
          </div>
          <div className="demo-speed__stat">
            <span className="demo-speed__label">Latence</span>
            <strong className="demo-speed__value">{Math.round(latency)}</strong>
            <span className="demo-speed__unit">ms</span>
          </div>
          <div className="demo-speed__stat">
            <span className="demo-speed__label">Débit</span>
            <strong className="demo-speed__value">{Math.round(tokens / ((Date.now() % 1000) / 1000 + 1))}</strong>
            <span className="demo-speed__unit">tok/s</span>
          </div>
        </div>
        <div className="demo-stream">
          <span className="demo-stream__cursor">▊</span>
          <span className="demo-stream__text">
            export function authenticate(req, res, next) {"{"}{"\n"}
            {"  "}const token = req.headers.authorization?.split(" ")[1];{"\n"}
            {"  "}if (!token) return res.status(401).json({"{"} error: "Missing token" {"}"});{"\n"}
          </span>
        </div>
      </div>
    </div>
  );
}

const MOCKUPS = {
  agents: AgentsMockup,
  providers: ProvidersMockup,
  keys: KeysMockup,
  speed: SpeedMockup,
};

export default function DemoSection() {
  const [active, setActive] = useState("agents");
  const ActiveMockup = MOCKUPS[active];

  return (
    <section className="section demo" id="demo">
      <AnimatedHeading variant="slide">Essaie Castor Desktop</AnimatedHeading>
      <p className="section-sub">
        Explore les fonctionnalités — clique pour voir chaque feature en action.
      </p>

      <div className="demo__tabs">
        {DEMOS.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`demo__tab ${active === d.id ? "demo__tab--active" : ""}`}
            onClick={() => setActive(d.id)}
          >
            <Icon name={d.icon} size={18} />
            <span>{d.title}</span>
          </button>
        ))}
      </div>

      <div className="demo__content">
        <div className="demo__info">
          <h3>{DEMOS.find((d) => d.id === active)?.title}</h3>
          <p>{DEMOS.find((d) => d.id === active)?.desc}</p>
        </div>
        <ActiveMockup />
      </div>
    </section>
  );
}
