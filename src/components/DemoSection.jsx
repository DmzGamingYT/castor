import { useState, useEffect, useRef } from "react";
import Icon from "./Icon.jsx";
import AnimatedHeading from "./AnimatedHeading.jsx";
import { useLanguage } from "../lib/LanguageContext.jsx";

const DEMOS = [
  { id: "agents", icon: "layers", title: "demo_agents_title", desc: "demo_agents_desc" },
  { id: "providers", icon: "plug", title: "demo_providers_title", desc: "demo_providers_desc" },
  { id: "keys", icon: "lock", title: "demo_keys_title", desc: "demo_keys_desc" },
  { id: "speed", icon: "zap", title: "demo_speed_title", desc: "demo_speed_desc" },
];

/* ── Mockups interactifs par feature ── */

function AgentsMockup() {
  const [agents, setAgents] = useState([
    { label: "refactor auth", scope: "src/auth/**", pct: 0, done: false },
    { label: "fix tests e2e", scope: "tests/e2e", pct: 0, done: false },
    { label: "migration v3", scope: "db/migrations", pct: 0, done: false },
  ]);

  useEffect(() => {
    /* 3 agents — on ne dépend pas du state pour ne pas recréer les intervalles */
    const intervals = [0, 1, 2].map((i) => {
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
  const { t } = useLanguage();
  const [selected, setSelected] = useState(0);
  const providers = [
    { name: "OpenRouter", tagKey: "demo_prov_cloud", color: "var(--accent)" },
    { name: "Groq", tagKey: "demo_prov_fast", color: "var(--river)" },
    { name: "Ollama", tagKey: "demo_prov_local", color: "var(--sage)" },
  ];

  return (
    <div className="demo-mockup demo-mockup--providers">
      <div className="demo-mockup__bar">
        <span className="dot dot--red" />
        <span className="dot dot--yellow" />
        <span className="dot dot--green" />
        <em>Castor Desktop — {t("demo_provider_bar")}</em>
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
                <span className="demo-provider__tag">{t(p.tagKey)}</span>
              </div>
              {i === selected && <span className="demo-provider__check">✓</span>}
            </button>
          ))}
        </div>
        <div className="demo-provider-info">
          <span className="demo-provider-info__label">{t("demo_active_brain")}</span>
          <strong style={{ color: providers[selected].color }}>
            {providers[selected].name}
          </strong>
          <span className="demo-provider-info__change">
            {t("demo_hot_swap")}
          </span>
        </div>
      </div>
    </div>
  );
}

function KeysMockup() {
  const { t } = useLanguage();
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="demo-mockup demo-mockup--keys">
      <div className="demo-mockup__bar">
        <span className="dot dot--red" />
        <span className="dot dot--yellow" />
        <span className="dot dot--green" />
        <em>Castor Desktop — {t("demo_secure_bar")}</em>
      </div>
      <div className="demo-mockup__body">
        <div className="demo-keys">
          <div className="demo-vault">
            <span className="demo-vault__icon">🔒</span>
            <div>
              <strong>{t("demo_vault")}</strong>
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
              {revealed ? t("demo_hide") : t("demo_reveal")}
            </button>
          </div>
          <div className="demo-key-row">
            <span className="demo-key-label">Groq</span>
            <code className="demo-key-value">••••••••••••••••</code>
            <span className="demo-key-status">{t("demo_locked")}</span>
          </div>
          <div className="demo-key-note">
            {t("demo_key_note")}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpeedMockup() {
  const { t } = useLanguage();
  const [tokens, setTokens] = useState(0);
  const [latency, setLatency] = useState(42);
  /* temps écoulé et cumul de tokens suivis par ref pour calculer le débit réel */
  const elapsedRef = useRef(0);
  const tokensRef = useRef(0);

  useEffect(() => {
    const iv = setInterval(() => {
      elapsedRef.current += 0.1;
      tokensRef.current += Math.floor(Math.random() * 8 + 3);
      setTokens(tokensRef.current);
      setLatency((l) => Math.max(18, Math.min(80, l + (Math.random() - 0.5) * 6)));
    }, 100);
    return () => clearInterval(iv);
  }, []);

  /* débit moyen : tokens générés / secondes écoulées (fluide, sans à-coups) */
  const tokPerSec = Math.round(tokens / Math.max(1, elapsedRef.current));

  return (
    <div className="demo-mockup demo-mockup--speed">
      <div className="demo-mockup__bar">
        <span className="dot dot--red" />
        <span className="dot dot--yellow" />
        <span className="dot dot--green" />
        <em>Castor Desktop — {t("demo_perf_bar")}</em>
      </div>
      <div className="demo-mockup__body">
        <div className="demo-speed">
          <div className="demo-speed__stat">
            <span className="demo-speed__label">{t("demo_tokens")}</span>
            <strong className="demo-speed__value">{tokens}</strong>
            <span className="demo-speed__unit">{t("demo_generated")}</span>
          </div>
          <div className="demo-speed__stat">
            <span className="demo-speed__label">{t("demo_latency")}</span>
            <strong className="demo-speed__value">{Math.round(latency)}</strong>
            <span className="demo-speed__unit">ms</span>
          </div>
          <div className="demo-speed__stat">
            <span className="demo-speed__label">{t("demo_throughput")}</span>
            <strong className="demo-speed__value">{tokPerSec}</strong>
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
  const { t } = useLanguage();
  const [active, setActive] = useState("agents");
  const ActiveMockup = MOCKUPS[active];
  const current = DEMOS.find((d) => d.id === active);

  return (
    <section className="section demo" id="demo">
      <AnimatedHeading variant="slide">{t("demo_heading")}</AnimatedHeading>
      <p className="section-sub">
        {t("demo_sub")}
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
            <span>{t(d.title)}</span>
          </button>
        ))}
      </div>

      <div className="demo__content">
        <div className="demo__info">
          <h3>{t(current?.title)}</h3>
          <p>{t(current?.desc)}</p>
        </div>
        <ActiveMockup />
      </div>
    </section>
  );
}
