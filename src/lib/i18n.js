/* ============================================================
   i18n — Traductions FR / EN pour le site Castor
   ============================================================ */

export const LANGUAGES = {
  fr: { label: "Français", flag: "🇫🇷" },
  en: { label: "English", flag: "🇬🇧" },
};

export const translations = {
  /* ── Navigation ── */
  nav: {
    accueil: { fr: "Accueil", en: "Home" },
    desktop: { fr: "Desktop", en: "Desktop" },
    studio: { fr: "Studio", en: "Studio" },
    cli: { fr: "CLI", en: "CLI" },
    templates: { fr: "Templates", en: "Templates" },
    avancement: { fr: "Avancement", en: "Roadmap" },
    cloud: { fr: "Cloud", en: "Cloud" },
    chat: { fr: "Chat", en: "Chat" },
    telecharger: { fr: "Télécharger", en: "Download" },
  },

  /* ── Hero ── */
  hero: {
    badge: { fr: "Gratuit pour toujours. Sans mauvaise surprise.", en: "Free forever. No surprises." },
    h1a: { fr: "Donne-lui un chantier.", en: "Give it a project." },
    h1b: { fr: "Il construit.", en: "It builds." },
    sub: {
      fr: "Castor est un agent de code qui bâtit tes projets bloc par bloc. Cloud ou sous ton toit, avec les modèles que tu choisis.",
      en: "Castor is a code agent that builds your projects block by block. Cloud or on your machine, with the models you choose.",
    },
    cta: { fr: "Télécharger Desktop", en: "Download Desktop" },
    demo: { fr: "Voir la démo", en: "See the demo" },
  },

  /* ── Features ── */
  features: {
    title: { fr: "Essaie Castor Desktop", en: "Try Castor Desktop" },
    sub: {
      fr: "Explore les fonctionnalités — clique pour voir chaque feature en action.",
      en: "Explore the features — click to see each one in action.",
    },
    agents: {
      title: { fr: "Agents parallèles", en: "Parallel agents" },
      desc: {
        fr: "Trois refactors en même temps ? Chaque agent vit dans son panneau, sans se marcher dessus.",
        en: "Three refactors at the same time? Each agent lives in its own pane, without stepping on each other.",
      },
    },
    providers: {
      title: { fr: "Multi-providers", en: "Multi-providers" },
      desc: {
        fr: "Branche OpenRouter, Groq, OpenCode Zen ou un modèle local. Change de cerveau à chaud.",
        en: "Connect OpenRouter, Groq, OpenCode Zen or a local model. Switch brains on the fly.",
      },
    },
    keys: {
      title: { fr: "Clés chiffrées", en: "Encrypted keys" },
      desc: {
        fr: "Tes clés API sont stockées avec le coffre du système. Jamais en clair.",
        en: "Your API keys are stored with the system vault. Never in plain text.",
      },
    },
    speed: {
      title: { fr: "Optimisé", en: "Optimized" },
      desc: {
        fr: "Démarrage instantané, streaming token par token, stats de latence en direct.",
        en: "Instant startup, token-by-token streaming, live latency stats.",
      },
    },
  },

  /* ── Testimonials ── */
  testimonials: {
    title: { fr: "Ils ont donné un chantier.", en: "They gave it a project." },
    sub: {
      fr: "Retours de vrais utilisateurs — pas de fake, pas de script.",
      en: "Real user feedback — no fakes, no scripts.",
    },
  },

  /* ── Avancement ── */
  avancement: {
    badge: { fr: "Avancement du projet", en: "Project roadmap" },
    title: { fr: "Le chantier avance, patte après patte", en: "The project moves forward, paw by paw" },
    sub: {
      fr: "Ce qui est livré, ce qu'on construit et ce qui arrive — sans fausse promesse ni date artificielle.",
      en: "What's delivered, what's being built, and what's coming — no false promises or artificial dates.",
    },
    global: { fr: "avancement global du chantier", en: "overall project progress" },
    chantiers: { fr: "chantiers sur la feuille de route", en: "projects on the roadmap" },
    livres: { fr: "livrés", en: "delivered" },
    encours: { fr: "en cours", en: "in progress" },
    bientot: { fr: "bientôt", en: "coming soon" },
    explorations: { fr: "explorations", en: "explorations" },
    question: { fr: "Une question sur un chantier ?", en: "A question about a project?" },
    bot: { fr: "Demander au Castor Bot", en: "Ask the Castor Bot" },
    github: { fr: "Suivre sur GitHub", en: "Follow on GitHub" },
  },

  /* ── FAQ ── */
  faq: {
    title: { fr: "Des questions ? Le castor répond.", en: "Questions? The beaver answers." },
    sub: {
      fr: "Tout est gratuit, open source et local. Voici ce qu'on nous demande le plus.",
      en: "Everything is free, open source and local. Here's what people ask us the most.",
    },
  },

  /* ── Download ── */
  download: {
    badge: { fr: "TÉLÉCHARGEMENT", en: "DOWNLOAD" },
    title: { fr: "Installe Castor. Commence à builder.", en: "Install Castor. Start building." },
    sub: {
      fr: "Un installateur par plateforme. Pas de compte, pas d'abonnement, pas de limite. Le castor s'installe en quelques secondes.",
      en: "One installer per platform. No account, no subscription, no limits. The beaver installs in seconds.",
    },
    cta: { fr: "Télécharger Castor Desktop", en: "Download Castor Desktop" },
    more: { fr: "En savoir plus →", en: "Learn more →" },
  },

  /* ── Footer ── */
  footer: {
    tagline1: { fr: "Les abonnements ont coulé.", en: "Subscriptions have sunk." },
    tagline2: { fr: "Le code est gratuit.", en: "The code is free." },
  },

  /* ── Templates Page ── */
  templates: {
    badge: { fr: "Templates", en: "Templates" },
    title: { fr: "Points de départ générés par Castor", en: "Starting points generated by Castor" },
    sub: {
      fr: "Choisis un template, décris ton projet, et Castor construit la base en quelques secondes.",
      en: "Choose a template, describe your project, and Castor builds the base in seconds.",
    },
    how: { fr: "Comment ça marche ?", en: "How it works?" },
    step1: { fr: "Choisis un template", en: "Choose a template" },
    step2: { fr: "Décris ton projet en une phrase", en: "Describe your project in one sentence" },
    step3: { fr: "Castor génère la base", en: "Castor generates the base" },
    step4: { fr: "Personnalise et déploie", en: "Customize and deploy" },
  },

  /* ── CLI Page ── */
  cli: {
    badge: { fr: "CLI en ligne", en: "CLI online" },
    title: { fr: "Essaie la CLI sans rien installer", en: "Try the CLI without installing anything" },
    sub: {
      fr: "Un terminal interactif — tape tes commandes et vois le castor répondre.",
      en: "An interactive terminal — type your commands and watch the beaver respond.",
    },
    placeholder: { fr: "tape /help pour commencer…", en: "type /help to get started…" },
    quick: { fr: "Commandes rapides :", en: "Quick commands:" },
  },
};

/* ── Hook simple pour accéder aux traductions ── */
export function t(lang, key) {
  const keys = key.split(".");
  let val = translations;
  for (const k of keys) {
    if (val && typeof val === "object") val = val[k];
    else return key;
  }
  if (val && typeof val === "object") return val[lang] || val.fr || key;
  return key;
}
