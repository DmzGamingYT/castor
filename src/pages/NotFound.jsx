import { useEffect } from "react";
import { BeaverMark } from "../components/Icon.jsx";
import { useNavigate } from "../lib/NavigationContext.jsx";

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Page introuvable — Castor";
  }, []);

  return (
    <section className="section notfound">
      <div className="notfound__tile" aria-hidden="true">
        <BeaverMark size={64} />
        <span className="notfound__halo" aria-hidden="true" />
      </div>
      <span className="hero__badge">Erreur 404</span>
      <h1 className="notfound__title">
        Cette page est encore <span className="hero__accent">en chantier</span>.
      </h1>
      <p className="section-sub">
        Le castor n'a rien trouvé ici. La planche a peut-être été déplacée,
        ou la route n'existe pas (encore).
      </p>
      <div className="notfound__actions">
        <button type="button" className="btn btn--primary btn--lg" onClick={() => navigate("/")}>
          Retour à l'accueil
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--lg"
          onClick={() => navigate("/", "demo")}
        >
          Voir la démo
        </button>
      </div>
      <p className="notfound__hint">
        Astuce : demande au 🦫 en bas à droite, il connaît toutes les routes du site.
      </p>
    </section>
  );
}
