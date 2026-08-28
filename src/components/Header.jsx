import { useEffect, useState } from "react";
import Icon, { BeaverMark } from "./Icon.jsx";
import { useTheme } from "../lib/useTheme.js";
import { useNavigate } from "../lib/NavigationContext.jsx";

const LINKS = [
  { path: "/", route: "/", label: "Accueil", icon: "home" },
  { path: "/models", route: "/models", label: "Modèles", icon: "layers" },
  { path: "/desktop", route: "/desktop", label: "Desktop", icon: "desktop" },
];

export default function Header({ route, onDownload }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

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
      {/* decorative accent line at top */}
      <div className="header__accent-bar" aria-hidden="true" />

      <a className="logo" href="/castor/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
        <span className="logo__tile" aria-hidden="true">
          <BeaverMark size={18} />
          <span className="logo__glow" aria-hidden="true" />
        </span>
        <span className="logo__name">castor</span>
        <span className="logo__badge">beta</span>
      </a>

      <nav id="site-nav" className={`nav ${menuOpen ? "nav--open" : ""}`} aria-label="Navigation principale">
        {LINKS.map((l) => (
          <a
            key={l.label}
            className={l.route && route === l.route ? "nav__link--active" : ""}
            href={`/castor${l.path}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(l.path, l.anchor);
              setMenuOpen(false);
            }}
          >
            <Icon name={l.icon} size={15} className="nav__link-icon" />
            {l.label}
            <span className="nav__underline" aria-hidden="true" />
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
          <span className="theme-btn__icon">{theme === "dark" ? "☀" : "☾"}</span>
        </button>
        <button type="button" className="btn btn--primary btn--sm header__cta" onClick={onDownload}>
          <span className="btn__shimmer" aria-hidden="true" />
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
          <span className="nav-burger__bar" />
          <span className="nav-burger__bar" />
          <span className="nav-burger__bar" />
        </button>
      </div>
    </header>
  );
}
