import Hills from "./Hills.jsx";
import { BeaverMark } from "./Icon.jsx";
import { APP_VERSION } from "../lib/version.js";
import { useLanguage } from "../lib/LanguageContext.jsx";

export default function Footer({ onDownload }) {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <div className="footer__cta">
        <Hills />
        <div className="footer__cta-inner">
          <p className="footer__tagline">
            {t("footer_tagline")}
            <br />
            <span className="hero__accent">{t("footer_tagline2")}</span>
          </p>
          <button type="button" className="btn btn--primary btn--lg" onClick={onDownload}>
            {t("dl_cta")}
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

        <span className="footer__copy">© 2026 Castor. {t("footer_created")} <strong>Alessio Innangi</strong>.</span>
        <a
          className="footer__version"
          href="https://github.com/DmzGamingYT/castor/releases"
          target="_blank"
          rel="noreferrer"
        >
          v{APP_VERSION} · {t("footer_ose")}
        </a>
      </div>
    </footer>
  );
}
