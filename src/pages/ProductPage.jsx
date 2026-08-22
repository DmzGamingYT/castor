import { useEffect, useState } from "react";
import Mockup from "../components/Mockups.jsx";
import Hills from "../components/Hills.jsx";
import Icon from "../components/Icon.jsx";
import { PRODUCTS, bySlug } from "../data/products.jsx";

/* Bloc de commande copiable, look terminal cohérent avec le reste du site */
function CopyCmd({ cmd }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* presse-papier refusé — la commande reste sélectionnable */
    }
  }

  return (
    <div className="copy-cmd">
      <code>{cmd}</code>
      <button
        type="button"
        className="copy-cmd__btn"
        onClick={copy}
        aria-label={`Copier la commande « ${cmd} »`}
      >
        {copied ? "copié ✓" : "copier"}
      </button>
    </div>
  );
}

const CLI_COMMANDS = [
  ["/provider", "changer de cerveau (OpenRouter, Groq, local…)"],
  ["/model", "choisir le modèle"],
  ["/key", "enregistrer une clé API"],
  ["/skills", "voir les compétences /review /tests…"],
  ["/demo", "aperçu hors-ligne, sans clé"],
  ["/help", "toutes les commandes"],
];

function CliInstall() {
  return (
    <section id="installation" className="section section--tight cli-install">
      <h2>Installer Castor CLI</h2>
      <p className="section-sub">
        Prérequis : Node.js ≥ 18 — vérifie avec <code>node --version</code>.
      </p>

      <div className="cli-install__grid">
        <article className="install-method install-method--reco">
          <header>
            <span className="install-method__num">1</span>
            <h3>Via npm</h3>
            <em>recommandé</em>
          </header>
          <CopyCmd cmd="npm i -g castor-cli" />
          <p>
            La commande <code>castor</code> devient disponible dans ton terminal.
            Mise à jour : <code>npm update -g castor-cli</code>.
          </p>
        </article>

        <article className="install-method">
          <header>
            <span className="install-method__num">2</span>
            <h3>Sans rien installer</h3>
          </header>
          <CopyCmd cmd="npx castor-cli" />
          <p>Pour essayer en une commande, sans installation globale.</p>
        </article>

        <article className="install-method">
          <header>
            <span className="install-method__num">3</span>
            <h3>Depuis les sources</h3>
          </header>
          <CopyCmd cmd="git clone https://github.com/DmzGamingYT/castor && cd castor/cli && npm link" />
          <p>Ideal pour contribuer — le binaire suit tes modifications.</p>
        </article>
      </div>

      <div className="cli-install__start">
        <div className="cli-install__steps">
          <h3>Premier lancement · 30 secondes</h3>
          <ol>
            <li>
              Lance <code>castor</code> — le guide te demande ton provider
              (OpenRouter, Groq, Zen…) ou un modèle local via Ollama / LM Studio.
            </li>
            <li>
              Colle ta clé gratuite si besoin — elle reste dans{" "}
              <code>~/.castor/</code>, jamais envoyée ailleurs.
            </li>
            <li>
              C'est tout. <code>/demo</code> pour voir le rendu sans clé,
              <code> /help</code> pour toutes les commandes.
            </li>
          </ol>
        </div>

        <div className="cli-install__cmds">
          <h3>Commandes de base</h3>
          <table>
            <tbody>
              {CLI_COMMANDS.map(([cmd, role]) => (
                <tr key={cmd}>
                  <td><code>{cmd}</code></td>
                  <td>{role}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
