/**
 * Micro-visualisations animées pour les cartes de fonctionnalités.
 * Chaque visuel illustre réellement le concept de la feature.
 */

/* --- Agents parallèles : 3 panneaux avec progressions désynchronisées --- */
export function AgentsVisual() {
  const agents = [
    { name: "auth.js", color: "var(--accent)", width: "78%", delay: "0s" },
    { name: "tests", color: "var(--wood)", width: "55%", delay: "0.4s" },
    { name: "docs", color: "var(--river)", width: "90%", delay: "0.8s" },
  ];
  return (
    <div className="mv mv-agents" aria-hidden="true">
      {agents.map((a) => (
        <div key={a.name} className="mv-agents__panel">
          <div className="mv-agents__head">
            <span className="mv-agents__dot" style={{ background: a.color }} />
            <code>{a.name}</code>
          </div>
          <div className="mv-agents__track">
            <div
              className="mv-agents__fill"
              style={{ width: a.width, background: a.color, animationDelay: a.delay }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* --- Multi-providers : chips des providers avec point actif --- */
export function ProvidersVisual() {
  const providers = [
    { name: "OpenRouter", on: true },
    { name: "Groq", on: true },
    { name: "Ollama", on: false },
    { name: "LM Studio", on: false },
  ];
  return (
    <div className="mv mv-providers" aria-hidden="true">
      {providers.map((p) => (
        <span key={p.name} className={`mv-providers__chip ${p.on ? "on" : ""}`}>
          <span className="mv-providers__dot" />
          {p.name}
        </span>
      ))}
      <span className="mv-providers__swap">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 8h13M13 4l4 4-4 4M20 16H7M11 12l-4 4 4 4" />
        </svg>
        switch à chaud
      </span>
    </div>
  );
}

/* --- Clés chiffrées : clé qui se verrouille dans un coffre --- */
export function KeysVisual() {
  return (
    <div className="mv mv-keys" aria-hidden="true">
      <span className="mv-keys__key">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="8" cy="14" r="4" />
          <path d="M11 11L20 2M16 6l3 3" />
        </svg>
        sk-or-v1…
      </span>
      <span className="mv-keys__arrow">→</span>
      <span className="mv-keys__vault">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4M12 15v2" />
        </svg>
        safeStorage
      </span>
      <span className="mv-keys__status">chiffrée ✓</span>
    </div>
  );
}

/* --- Optimisé : stats de latence / débit en direct --- */
export function SpeedVisual() {
  return (
    <div className="mv mv-speed" aria-hidden="true">
      <div className="mv-speed__stat">
        <span className="mv-speed__value">0.9s</span>
        <span className="mv-speed__label">démarrage</span>
      </div>
      <div className="mv-speed__stat">
        <span className="mv-speed__value">
          48 <small>t/s</small>
        </span>
        <span className="mv-speed__label">débit</span>
      </div>
      <div className="mv-speed__stat">
        <span className="mv-speed__value">
          210 <small>ms</small>
        </span>
        <span className="mv-speed__label">latence</span>
      </div>
    </div>
  );
}

/* Map interne (non exportée pour rester fast-refresh : résoluble dans le fichier) */
const FEATURE_VISUALS = {
  layers: AgentsVisual,
  plug: ProvidersVisual,
  lock: KeysVisual,
  zap: SpeedVisual,
};

export default function FeatureVisual({ icon }) {
  const Visual = FEATURE_VISUALS[icon];
  if (!Visual) return null;
  return <Visual />;
}

/* ============================================================
   Illustrations pour les 3 étapes — mini mockups
   ============================================================ */

/* Étape 1 : fenêtre desktop qui s'ouvre */
export function StepOpenVisual() {
  return (
    <div className="sv sv-open" aria-hidden="true">
      <div className="sv-open__win">
        <div className="sv-open__bar">
          <i /><i /><i />
        </div>
        <div className="sv-open__body">
          <span className="sv-open__logo">🦫</span>
          <span className="sv-open__title">Castor</span>
        </div>
      </div>
    </div>
  );
}

/* Étape 2 : sélecteur de modèle */
export function StepModelVisual() {
  return (
    <div className="sv sv-model" aria-hidden="true">
      <span className="sv-model__row on">◉ Groq · rapide</span>
      <span className="sv-model__row">○ OpenRouter</span>
      <span className="sv-model__row">○ Ollama local</span>
    </div>
  );
}

/* Étape 3 : diff validé */
export function StepDiffVisual() {
  return (
    <div className="sv sv-diff" aria-hidden="true">
      <span className="sv-diff__ln add">+ guard ajouté</span>
      <span className="sv-diff__ln del">- old auth</span>
      <span className="sv-diff__ok">✓ validé</span>
    </div>
  );
}

/* Map interne non exportée — voir FEATURE_VISUALS ci-dessus */
const STEP_VISUALS = {
  0: StepOpenVisual,
  1: StepModelVisual,
  2: StepDiffVisual,
};

export function StepVisual({ index }) {
  const Visual = STEP_VISUALS[index];
  if (!Visual) return null;
  return <Visual />;
}
