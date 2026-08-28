export const PRODUCTS = [
  {
    slug: "desktop",
    icon: "desktop",
    tag: "Nouveau",
    name: "Castor Desktop",
    tagline: "Tous tes agents. Une seule fenêtre.",
    desc: "Lance plusieurs agents en parallèle sur ta machine, chacun dans son espace de travail isolé. Connecte OpenRouter, Groq, OpenCode Zen ou tes modèles locaux.",
    cta: "Télécharger Castor Desktop",
    mockup: "desktop",
    features: [
      { icon: "layers", title: "Agents parallèles", desc: "Trois refactors en même temps ? Chaque agent vit dans son panneau, sans se marcher dessus." },
      { icon: "plug", title: "Multi-providers", desc: "Branche OpenRouter, Groq, OpenCode Zen ou un modèle local Ollama / LM Studio. Change de cerveau à chaud." },
      { icon: "lock", title: "Clés chiffrées", desc: "Tes clés API sont stockées avec le coffre du système via safeStorage. Jamais en clair." },
      { icon: "zap", title: "Optimisé", desc: "Démarrage instantané, streaming token par token, stats de latence et de débit en direct." },
    ],
  },
  {
    slug: "cloud",
    icon: "cloud",
    tag: "Bientôt",
    name: "Castor Cloud",
    tagline: "Un sandbox complet pour chaque repo.",
    desc: "En développement : éditeur, terminal et agent dans un vrai IDE cloud, branché sur n'importe quel dépôt GitHub public ou privé. Rien à installer.",
    cta: "Découvrir la vision",
    mockup: "cloud",
    features: [
      { icon: "branch", title: "Branché sur GitHub", desc: "Ouvre un repo, Castor créera sa branche et travaillera dessus." },
      { icon: "box", title: "Sandbox réel", desc: "Dépendances, dev server, tests : tout tournera dans un environnement isolé." },
      { icon: "eye", title: "Preview intégrée", desc: "Visualise le résultat pendant que l'agent code." },
      { icon: "spark", title: "Zéro lock-in", desc: "Tout restera poussable sur GitHub. Tu pars quand tu veux, avec tout." },
    ],
  },
  {
    slug: "chat",
    icon: "chat",
    tag: null,
    name: "Castor Chat",
    tagline: "La réponse longue, pas la réponse chère.",
    desc: "Un chat IA gratuit qui cherche, lit les sources et réfléchit en profondeur avant de répondre. Fini l'abonnement juste pour poser des questions.",
    cta: "Ouvrir Castor Chat",
    mockup: "chat",
    features: [
      { icon: "search", title: "Recherche web", desc: "Il consulte des sources récentes et te les cite." },
      { icon: "brain", title: "Mode réflexion", desc: "Pour les problèmes corsés, il raisonne étape par étape." },
      { icon: "paperclip", title: "Fichiers & code", desc: "Balance un extrait, une stack trace ou un PDF dans la conversation." },
      { icon: "spark", title: "Gratuit, vraiment", desc: "Pas de quota qui expire au pire moment." },
    ],
  },
];

export const bySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);
