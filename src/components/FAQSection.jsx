import { useState } from "react";
import AnimatedHeading from "./AnimatedHeading.jsx";

/* mêmes questions que le JSON-LD FAQPage dans index.html — une seule source
   à maintenir à jour dans les deux endroits. */
const FAQS = [
  {
    q: "Comment peut-il être gratuit ?",
    a: "Le projet est open source (licence MIT) et tourne sur ta machine ou ton navigateur. Côté IA, les studios passent par le tier gratuit d'OpenRouter avec ta propre clé : aucun serveur à financer, donc aucun abonnement. Pas de publicité, pas de revente de données.",
  },
  {
    q: "Quels modèles puis-je utiliser ?",
    a: "Ceux que tu branches : Ox Alpha, Nemotron, Laguna et les autres gratuits via OpenRouter, Groq pour l'inférence ultra-rapide, OpenCode Zen pour le code, ou tes propres modèles locaux via Ollama et LM Studio.",
  },
  {
    q: "Mes données sont-elles collectées ?",
    a: "Non. Tes conversations et tes projets sont stockés uniquement dans ton navigateur (localStorage). Ta clé API aussi. Rien ne transite vers nos serveurs — il n'y en a pas : tes requêtes vont directement du navigateur au provider que tu as choisi.",
  },
  {
    q: "Dans quels pays est-ce disponible ?",
    a: "Partout où il y a internet : tout tourne chez toi, il n'y a rien à débloquer. Seule dépendance : la disponibilité des providers de modèles depuis ton pays (OpenRouter, Groq…).",
  },
  {
    q: "Pourquoi créer une clé OpenRouter ?",
    a: "Elle donne accès aux modèles gratuits des studios Web et Chat. Elle se crée en 30 secondes sur openrouter.ai, se colle une seule fois dans l'app et reste dans ton navigateur. Sans clé, les studios restent utilisables en mode démo locale et avec les gabarits hors-ligne.",
  },
];

function FaqItem({ faq, open, onToggle, index }) {
  return (
    <div className={`faq__item ${open ? "faq__item--open" : ""}`}>
      <button
        type="button"
        className="faq__question"
        onClick={() => onToggle(index)}
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
      >
        <span className="faq__q-icon" aria-hidden="true">?</span>
        <span>{faq.q}</span>
        <span className="faq__chevron" aria-hidden="true">⌄</span>
      </button>
      <div id={`faq-answer-${index}`} className="faq__answer" role="region">
        <p>{faq.a}</p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex((cur) => (cur === i ? -1 : i));

  return (
    <section className="section faq">
      <AnimatedHeading variant="words">Des questions ? Le castor répond.</AnimatedHeading>
      <p className="section-sub">
        Tout est gratuit, open source et local. Voici ce qu'on nous demande le plus.
      </p>
      <div className="faq__list">
        {FAQS.map((faq, i) => (
          <FaqItem
            key={i}
            faq={faq}
            index={i}
            open={openIndex === i}
            onToggle={toggle}
          />
        ))}
      </div>
    </section>
  );
}
