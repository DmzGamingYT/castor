/* Dictionnaire de traductions FR → EN.
   Utilisé via t(key) qui renvoie la traduction ou la clé FR par défaut. */

const dict = {
  /* header / nav */
  nav_home: { fr: "Accueil", en: "Home" },
  nav_desktop: { fr: "Desktop", en: "Desktop" },
  nav_studio: { fr: "Studio", en: "Studio" },
  nav_cli: { fr: "CLI", en: "CLI" },
  nav_progress: { fr: "Avancement", en: "Progress" },
  nav_cloud: { fr: "Cloud", en: "Cloud" },
  download: { fr: "Télécharger", en: "Download" },

  /* hero accueil */
  hero_kicker: { fr: "Gratuit pour toujours. Sans mauvaise surprise.", en: "Free forever. No surprises." },
  hero_h1_a: { fr: "Donne-lui un chantier.", en: "Give it a project." },
  hero_h1_b: { fr: "Il construit.", en: "It builds." },
  hero_sub: {
    fr: "Castor est un agent de code qui bâtit tes projets bloc par bloc.",
    en: "Castor is a coding agent that builds your projects block by block.",
  },
  hero_sub2: {
    fr: "Cloud ou sous ton toit, avec les modèles que tu choisis.",
    en: "Cloud or on your machine, with the models you choose.",
  },
  hero_cta: { fr: "Télécharger Desktop", en: "Download Desktop" },
  hero_demo: { fr: "Voir la démo", en: "See the demo" },

  /* étapes */
  step1_title: { fr: "Tu donnes un chantier", en: "You give a project" },
  step1_desc: { fr: "Une phrase suffit. Pas de config.", en: "One sentence. No config." },
  step2_title: { fr: "Le castor construit", en: "Castor builds" },
  step2_desc: { fr: "Structure, styles, tests, bloc par bloc.", en: "Structure, styles, tests, block by block." },
  step3_title: { fr: "Tu valides, c'est à toi", en: "You approve, it's yours" },
  step3_desc: { fr: "Le code t'appartient, point.", en: "The code is yours. Period." },

  /* footer */
  footer_tagline: { fr: "Les abonnements ont coulé.", en: "Subscriptions sank." },
  footer_tagline2: { fr: "Le code est gratuit.", en: "Code is free." },

  /* Cloud */
  cloud_hero_h1: { fr: "Connecte un repo. Construis.", en: "Connect a repo. Build." },
  cloud_hero_sub: {
    fr: "Connecte n'importe quel repo GitHub, obtient un sandbox cloud avec preview live, et construis avec des modèles gratuits.",
    en: "Connect any GitHub repo, get a cloud sandbox with live preview, and build with free models.",
  },

  /* accessibilité */
  discord_label: { fr: "Rejoindre le Discord", en: "Join the Discord" },
  github_label: { fr: "Voir sur GitHub", en: "View on GitHub" },
};

/* pipeline : fr par défaut */
const store = (() => {
  let lang = "fr";
  return { get: () => lang, set: (l) => { lang = l; } };
})();

export function setLang(l) { store.set(l); }

export function t(key) {
  const entry = dict[key];
  if (!entry) return key;
  return entry[store.get()] || entry.fr;
}
