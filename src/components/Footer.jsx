import Hills from "./Hills.jsx";
import { BeaverMark } from "./Icon.jsx";
import { useNavigate } from "../lib/NavigationContext.jsx";

export default function Footer({ onDownload }) {
  const navigate = useNavigate();
  return (
    <footer className="footer">
      <div className="footer__cta">
        <Hills />
        <div className="footer__cta-inner">
          <p className="footer__tagline">
            Les abonnements ont coulé.
            <br />
            <span className="hero__accent">Le code est gratuit.</span>
          </p>
          <button type="button" className="btn btn--primary btn--lg" onClick={onDownload}>
            Télécharger Castor Desktop
          </button>

        </div>
      </div>
      <div className="footer__bottom">
        <span className="logo logo--footer">
          <span className="logo__tile logo__tile--sm" aria-hidden="true">
            <BeaverMark size={15} />
          </span>
          castor
        </span>
        <nav className="footer__nav">
          <a href="/castor/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Accueil</a>
          <a href="/castor/desktop" onClick={(e) => { e.preventDefault(); navigate("/desktop"); }}>Desktop</a>
          <a href="/castor/cloud" onClick={(e) => { e.preventDefault(); navigate("/cloud"); }}>Cloud</a>
          <a href="/castor/chat" onClick={(e) => { e.preventDefault(); navigate("/chat"); }}>Chat</a>
        </nav>
        <span className="footer__copy">© 2026 Castor. Créé par <strong>Alessio Innangi</strong>.</span>
      </div>
    </footer>
  );
}
