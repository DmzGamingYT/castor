import { useEffect, useState } from "react";
import { BeaverMark } from "./Icon.jsx";

export default function Header({ route, onDownload }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
      <a className="logo" href="#/">
        <span className="logo__tile" aria-hidden="true">
          <BeaverMark size={18} />
        </span>
        <span className="logo__name">castor</span>
      </a>
      <nav className="nav">
        <a className={route === "/" ? "nav__link--active" : ""} href="#/">
          Accueil
        </a>
        <a className={route === "/models" ? "nav__link--active" : ""} href="#/models">
          Modèles
        </a>
        <a className={route === "/desktop" ? "nav__link--active" : ""} href="#/desktop">
          Desktop
        </a>
        <a className={route === "/cli" ? "nav__link--active" : ""} href="#/cli">
          CLI
        </a>
        <a href="#/#produits">Produits</a>
        <a href="#/#faq">FAQ</a>
      </nav>
      <button type="button" className="btn btn--primary btn--sm" onClick={onDownload}>
        Télécharger
      </button>
    </header>
  );
}
