import { useState } from "react";
import AnimatedHeading from "./AnimatedHeading.jsx";

const FAQS = [
  {
    q: "Comment peut-il être gratuit ?",
    a: "Le projet est open source (licence MIT) et tourne sur ta machine ou ton navigateur. Côté IA, les studios passent par le tier gratuit d'OpenRouter avec ta propre clé : aucun serveur à financer, donc aucun abonnement. Pas de publicité, pas de revente de données.",
  },
  {
    q: "Quels modèles puis-je utiliser ?",
    a: "Ceux que tu branches : Ox Alpha, Nemotron, Laguna et les autres gratuits via OpenRouter, Groq pour l'inférence ultra-rapide, OpenCode Zen pour le code, ou tes propres modèles locaux via Ollama et LM Studio. La page Modèles recense les gratuits du moment.",
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

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="section faq">
      <AnimatedHeading variant="words">Questions fréquentes</AnimatedHeading>
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
