import { PRODUCTS } from "../data/products.jsx";
import Icon from "./Icon.jsx";

export default function Products() {
  return (
    <section id="produits" className="section products">
      <h2>Cinq produits. Zéro euro.</h2>
      <p className="section-sub">
        Tout ce dont tu as besoin pour coder avec l'IA — clique pour explorer.
      </p>
      <div className="products__grid">
        {PRODUCTS.map((p) => (
          <a key={p.slug} className="product-card product-card--link" href={`#/${p.slug}`}>
            {p.tag && <span className="product-card__tag">{p.tag}</span>}
            <span className="product-card__icon" aria-hidden="true">
              <Icon name={p.icon} size={26} />
            </span>
            <h3>{p.name}</h3>
            <p>{p.tagline}</p>
            <span className="product-card__more">Découvrir →</span>
          </a>
        ))}
      </div>
    </section>
  );
}
