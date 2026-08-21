import { useEffect } from "react";
import Mockup from "../components/Mockups.jsx";
import Hills from "../components/Hills.jsx";
import Icon from "../components/Icon.jsx";
import { PRODUCTS, bySlug } from "../data/products.jsx";

function ProductHero({ product, onDownload }) {
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
          <button
            className="install__copy"
            onClick={() => navigator.clipboard?.writeText(product.installCmd)}
          >
            copier
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
