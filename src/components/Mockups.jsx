function WindowChrome({ title, children }) {
  return (
    <div className="mockup">
      <div className="mockup__bar">
        <span /> <span /> <span />
        <em>{title}</em>
      </div>
      <div className="mockup__body">{children}</div>
    </div>
  );
}

function DesktopMock() {
  return (
    <WindowChrome title="Castor Desktop">
      <div className="mk-agents">
        {[
          ["refactor auth", 72, "src/auth/**"],
          ["fix tests e2e", 41, "tests/e2e"],
          ["migration v3", 88, "db/migrations"],
        ].map(([label, pct, scope], i) => (
          <div key={i} className="mk-agent">
            <div className="mk-agent__head">
              <span className="pulse-dot" />
              <strong>{label}</strong>
            </div>
            <code>{scope}</code>
            <div className="mk-agent__track">
              <div className="mk-agent__fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="mk-agent__pct">{pct}%</span>
          </div>
        ))}
      </div>
      <div className="mk-diff">
        <span className="ln ln--add">+ export const guard = withRole("admin")</span>
        <span className="ln ln--del">- const guard = requireAuth()</span>
        <span className="ln">  app.use("/admin", guard)</span>
      </div>
    </WindowChrome>
  );
}

function CliMock() {
  return (
    <WindowChrome title="castor — zsh">
      <pre className="mk-term">
<span className="t-accent">◆ castor</span><span className="t-dim"> · Qwenn Max · ~/api</span>

<span className="t-dim">›</span> ajoute du rate limiting sur /checkout

<span className="t-dim">✔</span> Lit 34 fichiers · mappe les routes API
<span className="t-ok">✔</span> Écrit src/middleware/rateLimit.ts
<span className="t-ok">✔</span> Tests : 18 passés, 0 échoué

<span className="t-dim">Fait · 3 fichiers ·</span> <span className="t-accent">0 €</span><span className="cursor">▊</span></pre>
    </WindowChrome>
  );
}

function WebMock() {
  return (
    <WindowChrome title="castor web — constructeur">
      <div className="mk-split">
        <div className="mk-prompt">
          <span className="t-dim">›</span> un site de recettes végé avec recherche
          <div className="mk-btn">Construire</div>
        </div>
        <div className="mk-browser">
          <div className="mk-browser__bar"><span /><span /><span /></div>
          <div className="mk-site">
            <div className="mk-site__nav" />
            <div className="mk-site__hero" />
            <div className="mk-site__cards">
              <span /><span /><span />
            </div>
          </div>
          <div className="mk-url">vegrecette-7f2.castor.app</div>
        </div>
      </div>
    </WindowChrome>
  );
}

function CloudMock() {
  return (
    <WindowChrome title="castor cloud — acme/storefront">
      <div className="mk-repo">
        <span className="mk-branch">⎇ fix/checkout-limit</span>
        <span className="mk-status">sandbox · dev server sur :3000</span>
      </div>
      <div className="mk-diff">
        <span className="ln ln--add">+ import {"{ rateLimit }"} from "./rateLimit"</span>
        <span className="ln">  export async function POST(req) {"{"}</span>
        <span className="ln ln--add">+   await rateLimit(req, {"{ max: 20 }"})</span>
        <span className="ln ln--del">-   const body = await req.json()</span>
        <span className="ln">  {"}"}</span>
      </div>
      <div className="mk-tabs">
        <span>Preview</span><span>Code</span><span className="on">Diff</span><span>Terminal</span>
      </div>
    </WindowChrome>
  );
}

function ChatMock() {
  return (
    <WindowChrome title="castor chat">
      <div className="mk-chat">
        <p className="mk-q">Pourquoi mon useEffect tourne deux fois ?</p>
        <p className="mk-a">
          En mode strict, React monte volontairement tes composants deux fois en dev…
        </p>
        <div className="mk-sources">
          <span>react.dev</span><span>stackoverflow</span><span>github issue #24830</span>
        </div>
      </div>
    </WindowChrome>
  );
}

const MAP = {
  desktop: DesktopMock,
  cli: CliMock,
  web: WebMock,
  cloud: CloudMock,
  chat: ChatMock,
};

export default function Mockup({ variant }) {
  const Cmp = MAP[variant];
  return Cmp ? <Cmp /> : null;
}
