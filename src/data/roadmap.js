/* ============================================================
   Roadmap Castor — source de vérité du chatbot (et du site).
   Édite ce fichier pour mettre à jour les réponses du bot :
   status : "livré" | "en cours" | "bientôt" | "exploration"
   ============================================================ */

export const STATUS_META = {
  "livré": { label: "Livré", emoji: "✅" },
  "en cours": { label: "En cours", emoji: "🔨" },
  "bientôt": { label: "Bientôt", emoji: "🚀" },
  "exploration": { label: "Exploration", emoji: "🔬" },
};

export const ROADMAP = {
  app: {
    label: "📱 App Desktop",
    name: "App Desktop",
    icon: "desktop",
    items: [
      {
        status: "livré",
        title: "Agents planifiés",
        desc: "Lance un refactor chaque nuit à 2h — le castor travaille pendant que tu dors.",
      },
      {
        status: "livré",
        title: "Diff côte à côte",
        desc: "Compare avant/après en split view, valide hunk par hunk.",
      },
      {
        status: "livré",
        title: "Assistant IA embarqué",
        desc: "Le chatbot 24/7 directement dans l'app Desktop : roadmap, aide et astuces sans quitter ton chantier.",
      },
      {
        status: "livré",
        title: "Synchronisation multi-postes",
        desc: "Export/import JSON de tes conversations, clés et projets entre machines.",
      },
      {
        status: "livré",
        title: "Serveurs MCP",
        desc: "Branche des outils externes (base de données, Figma, docs) à tes agents via le protocole MCP.",
      },
      {
        status: "livré",
        title: "Thèmes personnalisables",
        desc: "Choisis ta couleur d'accent parmi les presets ou une couleur libre.",
      },
    ],
  },
  site: {
    label: "🌐 Site",
    name: "Site",
    icon: "globe",
    items: [
      {
        status: "livré",
        title: "Page CLI dédiée",
        desc: "Terminal interactif en ligne pour essayer la CLI sans rien installer.",
      },
      {
        status: "en cours",
        title: "Templates de projets",
        desc: "Blog, portfolio, dashboard : des points de départ générés par Castor.",
      },
      {
        status: "en cours",
        title: "Version anglaise",
        desc: "i18n complet du site et des studios.",
      },
    ],
  },
  models: {
    label: "🧠 Modèles",
    name: "Modèles",
    icon: "brain",
    items: [
      {
        status: "en cours",
        title: "Benchmarks hebdo",
        desc: "Classement des modèles gratuits sur des tâches de code réelles, chaque semaine.",
      },
      {
        status: "bientôt",
        title: "Sélection auto du modèle",
        desc: "Castor choisit le cerveau optimal selon la tâche : rapide pour le fix, réfléchi pour l'archi.",
      },
      {
        status: "bientôt",
        title: "Vision dans Desktop",
        desc: "Envoie une maquette ou un screenshot à ton agent pour qu'il code le design.",
      },
      {
        status: "exploration",
        title: "Profils de contexte long",
        desc: "Dépôts entiers indexés pour les grosses refactors multi-fichiers.",
      },
    ],
  },
};

/* ---------- fiche produit synthétique (pour le moteur local) ---------- */

export const PRODUCT_NOTES = {
  desktop: "Castor Desktop — agents parallèles sur ta machine, multi-providers (OpenRouter, Groq, OpenCode Zen, Ollama, LM Studio), clés chiffrées via safeStorage. Gratuit, open source.",
  web: "Castor Web — studio de génération de sites dans le navigateur : prompt → aperçu instantané → export HTML autonome.",
  cloud: "Castor Cloud — en développement : IDE cloud complet branché sur GitHub, sandbox réel, preview intégrée.",
  chat: "Castor Chat — chat IA gratuit avec recherche web, mode réflexion et fichiers joints.",
  cli: "Castor CLI — l'agent en ligne de commande, conscient du repo, avec diffs lisibles.",
};

export const SITE_HINTS = {
  models: "Les modèles gratuits du moment (OpenRouter, Groq, OpenCode Zen…) se choisissent directement dans les studios Web et Chat, ou dans Castor Desktop.",
  install: "Téléchargement sur la page Desktop ou via la bulle 📥 de l'accueil. Installateurs macOS (Apple Silicon/Intel), Windows (x64/ARM) et Linux (.deb/AppImage).",
  privacy: "Aucune donnée collectée : tout tourne dans ton navigateur ou ta machine. Ta clé API ne quitte jamais ton appareil.",
};
