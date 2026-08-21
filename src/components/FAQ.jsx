import { useState } from "react";

const FAQS = [
  {
    q: "Comment peut-il être gratuit ?",
    a: "Le cœur de Castor est porté par la communauté open source et par les options d'équipe (support prioritaire, sandboxes partagées). Pas de publicité, pas de revente de données, pas de contrepartie cachée.",
  },
  {
    q: "Quels modèles utilisez-vous ?",
    a: "Nous agrégeons les meilleurs modèles open-weight du moment (Mistralou, Qwenn, LamaLibre…) et basculons automatiquement selon la tâche. Vous pouvez aussi choisir le modèle dans les réglages.",
  },
  {
    q: "Mes données sont-elles collectées ?",
    a: "Vos conversations ne sont jamais revendues ni utilisées pour l'entraînement sans votre accord explicite. Seules des métriques anonymisées alimentent les statistiques publiques.",
  },
  {
    q: "Dans quels pays est-ce disponible ?",
    a: "Partout. Si vous avez une connexion internet, ça marche. La page Live montre l'activité en temps réel.",
  },
  {
    q: "C'est quoi le mode limité ?",
    a: "En cas de forte affluence, les requêtes passent sur un modèle plus léger. Vous pouvez passer devant la file en regardant une pub, ou simplement attendre votre tour.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="section faq">
      <h2>Questions fréquentes</h2>
      <div className="faq__list">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className={`faq__item ${isOpen ? "faq__item--open" : ""}`}>
              <button
                className="faq__q"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
              >
                <span className="faq__num">{String(i + 1).padStart(2, "0")}</span>
                {f.q}
                <span className="faq__chevron" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && <p className="faq__a">{f.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
