import { useEffect, useState } from "react";
import Mockup from "../components/Mockups.jsx";
import Hills from "../components/Hills.jsx";
import Icon from "../components/Icon.jsx";
import { PRODUCTS, bySlug } from "../data/products.jsx";

/* Bloc de commande copiable, look terminal cohérent avec le reste du site.
   Accepte une commande (string) ou plusieurs lignes (array). */
function CopyCmd({ cmd }) {
  const [copied, setCopied] = useState(false);
  const lines = Array.isArray(cmd) ? cmd : [cmd];
  const full = lines.join(" && ");

  async function copy() {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* presse-papier refusé — la commande reste sélectionnable */
    }
  }

  return (
    <div className="copy-cmd">
      <pre className="copy-cmd__code">
        {lines.map((l, i) => (
          <span key={i}>
            {i > 0 && "\n"}
            {l}
          </span>
        ))}
      </pre>
      <button
        type="button"
        className="copy-cmd__btn"
        onClick={copy}
        aria-label={`Copier la commande « ${full} »`}
      >
        {copied ? "✓" : "⧉"}
      </button>
    </div>
  );
}

const CLI_COMMANDS = [
  ["/provider", "changer de cerveau"],
  ["/model", "choisir le modèle"],
  ["/key", "clé API"],
  ["/skills", "compétences"],
  ["/demo", "hors-ligne"],
  ["/help", "tout"],
];

function CliInstall() {
  return (
    <section id="installation" className="section section--tight cli-install">
      <h2>Installer Castor CLI</h2>
      <p className="section-sub">
        Node.js ≥ 18 requis · <code>node --version</code> pour vérifier
      </p>

      <div className="cli-install__grid">
        <article className="install-method install-method--reco">
          <header>
            <span className="install-method__num">1</span>
            <h3>Via npm</h3>
            <em>recommandé</em>
          </header>
          <CopyCmd cmd="npm i -g castor-cli" />
          <p>Commande <code>castor</code> disponible partout ✓</p>
        </article>

        <article className="install-method">
          <header>
            <span className="install-method__num">2</span>
            <h3>Sans installer</h3>
          </header>
          <CopyCmd cmd="npx castor-cli" />
          <p>Essai express, zéro installation</p>
        </article>

        <article className="install-method">
          <header>
            <span className="install-method__num">3</span>
            <h3>Sources</h3>
          </header>
          <CopyCmd
            cmd={[
              "git clone https://github.com/DmzGamingYT/castor",
              "cd castor/cli && npm link",
            ]}
          />
          <p>Pour contribuer</p>
        </article>
      </div>

      <div className="cli-install__strip">
        <div className="cli-install__start">
          <strong>Premier lancement</strong>
          <ol>
            <li>Lance <code>castor</code>, choisis ton provider</li>
            <li>Colle ta clé — elle reste dans <code>~/.castor/</code></li>
            <li><code>/demo</code> pour tester sans clé</li>
          </ol>
        </div>

        <div className="cli-install__cmds">
          {CLI_COMMANDS.map(([cmd, role]) => (
            <span key={cmd} className="cmd-pill" title={role}>
              <code>{cmd}</code> {role}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductHero({ product, onDownload }) {
  const [copied, setCopied] = useState(false);

  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(product.installCmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* presse-papier refusé — la commande reste sélectionnable dans <code> */
    }
  }

  return (
    <section className="hero hero--product">
      <div className="hero__glow hero__glow--lime" aria-hidden="true" />
      <div className="hero__glow hero__glow--wood" aria-hidden="true" />
      <div className="hero__glow hero__glow--river" aria-hidden="true" />
      <Hills />
      <a className="back" href="#/">← Tous les produits</a>
      {product.tag && <span className="hero__badge">{product.tag}</span>}
      <h1>
        <Icon name={product.icon} size={38} className="h1-icon" />{" "}
        <span className="hero__accent">{product.name}</span>
      </h1>
      <p className="hero__sub">{product.tagline}</p>

      {product.installCmd ? (
        <div id="installer" className="install">
          <code>$ {product.installCmd}</code>
          <button className="install__copy" onClick={copyInstall}>
            {copied ? "copié ✓" : "copier"}
          </button>
        </div>
      ) : null}

      <div className="hero__actions">
        {product.slug === "desktop" ? (
          <button type="button" className="btn btn--primary btn--lg" onClick={onDownload}>
            {product.cta}
          </button>
        ) : (
          <a className="btn btn--primary btn--lg" href="#/#installer">
            {product.cta}
          </a>
        )}
        <a className="btn btn--ghost btn--lg" href="#/#produits">
          Tous les produits →
        </a>
      </div>

      <div className="mockup-wrap">
        <Mockup variant={product.mockup} />
      </div>
    </section>
  );
}

export default function ProductPage({ slug, onDownload }) {
  // hook toujours appelé, avant tout retour anticipé
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const product = bySlug(slug);
  if (!product) return null;

  const others = PRODUCTS.filter((p) => p.slug !== slug);

  return (
    <>
      <ProductHero product={product} onDownload={onDownload} />

      <section className="section">
        <h2>{product.desc.split(".")[0]}.</h2>
        <p className="section-sub">{product.desc}</p>
        <div className="products__grid">
          {product.features.map((f) => (
            <article key={f.title} className="product-card">
              <span className="product-card__icon" aria-hidden="true">
                <Icon name={f.icon} size={26} />
              </span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {slug === "cli" && <CliInstall />}

      <section className="section section--tight">
        <div className="next-products">
          <h3>Continuer l'exploration</h3>
          <div className="next-products__row">
            {others.map((p) => (
              <a key={p.slug} className="next-link" href={`#/${p.slug}`}>
                <Icon name={p.icon} size={16} /> {p.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
