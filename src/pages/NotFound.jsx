import { useEffect } from "react";
import { BeaverMark } from "../components/Icon.jsx";
import { useNavigate } from "../lib/NavigationContext.jsx";
import { useLanguage } from "../lib/LanguageContext.jsx";

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t("nf_title_doc");
  }, [t]);

  return (
    <section className="section notfound">
      <div className="notfound__tile" aria-hidden="true">
        <BeaverMark size={64} />
        <span className="notfound__halo" aria-hidden="true" />
      </div>
      <span className="hero__badge">{t("nf_badge")}</span>
      <h1 className="notfound__title">
        {t("nf_title_pre")}<span className="hero__accent">{t("nf_title_hl")}</span>.
      </h1>
      <p className="section-sub">
        {t("nf_sub")}
      </p>
      <div className="notfound__actions">
        <button type="button" className="btn btn--primary btn--lg" onClick={() => navigate("/")}>
          {t("nf_home")}
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--lg"
          onClick={() => navigate("/", "demo")}
        >
          {t("nf_demo")}
        </button>
      </div>
      <p className="notfound__hint">
        {t("nf_hint")}
      </p>
    </section>
  );
}