import { useEffect, useRef, useState } from "react";
import { shortName } from "../lib/utils.js";
import { useLanguage } from "../lib/LanguageContext.jsx";

/* Sélecteur de modèle partagé par les deux studios.
   Accessible : aria-haspopup / aria-expanded, fermeture au clic extérieur
   et à Échap, sélection au clic (plus de hack onMouseDown + setTimeout). */
export default function ModelSelect({
  models,
  modelId,
  onSelect,
  aiReady,
}) {
  const { t } = useLanguage();
  const emptyLabel = t("ms_empty");
  const loadingLabel = t("ms_loading");
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = models.find((m) => m.id === modelId);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="model-select" ref={rootRef}>
      <button
        type="button"
        className="model-select__btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("ms_aria_choose")}
      >
        <span className={`engine-dot ${aiReady ? "engine-dot--on" : ""}`} />
        {current
          ? shortName(current.id, current.name)
          : models.length > 0
            ? t("ms_choose")
            : loadingLabel}
        <em>▾</em>
      </button>
      {open && (
        <ul className="model-menu" role="listbox" aria-label={t("ms_aria_list")}>
          {models.length === 0 && <li className="ms-empty">{emptyLabel}</li>}
          {models.map((m) => (
            <li key={m.id} role="option" aria-selected={m.id === modelId}>
              <button
                type="button"
                className={`ms-item ${m.id === modelId ? "ms-item--on" : ""}`}
                onClick={() => {
                  onSelect(m.id);
                  setOpen(false);
                }}
              >
                <span>{shortName(m.id, m.name)}</span>
                <small>{m.ctx ? Math.round(m.ctx / 1024) + "k" : "—"}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
