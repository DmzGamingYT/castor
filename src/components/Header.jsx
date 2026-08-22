import { useEffect, useState } from "react";
import { BeaverMark } from "./Icon.jsx";
import { useTheme } from "../lib/useTheme.js";

const LINKS = [
  { href: "#/", route: "/", label: "Accueil" },
  { href: "#/models", route: "/models", label: "Modèles" },
  { href: "#/desktop", route: "/desktop", label: "Desktop" },
  { href: "#/cli", route: "/cli", label: "CLI" },
  { href: "#/#produits", route: null, label: "Produits" },
  { href: "#/#faq", route: null, label: "FAQ" },
];

export default function Header({ route, onDownload }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* referme le menu mobile à chaque navigation */
  useEffect(() => {
    setMenuOpen(false);
  }, [route]);

  return (
    <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
      <a className="logo" href="#/">
        <span className="logo__tile" aria-hidden="true">
          <BeaverMark size={18} />
        </span>
        <span className="logo__name">castor</span>
      </a>

      <nav id="site-nav" className={`nav ${menuOpen ? "nav--open" : ""}`} aria-label="Navigation principale">
        {LINKS.map((l) => (
          <a
            key={l.href}
            className={l.route && route === l.route ? "nav__link--active" : ""}
            href={l.href}
            onClick={() => setMenuOpen(false)}
          >
            {l.label}
          </a>
        ))}
      </nav>

      <div className="header__actions">
        <button
          type="button"
          className="theme-btn"
          onClick={toggle}
          aria-label={theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"}
          title={theme === "dark" ? "Thème clair" : "Thème sombre"}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
        <button type="button" className="btn btn--primary btn--sm" onClick={onDownload}>
          Télécharger
        </button>
        <button
          type="button"
          className="nav-burger"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}
