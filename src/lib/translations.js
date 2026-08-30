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

  /* Manifeste */
  mani_1_pre: { fr: "Le code n'est pas ", en: "Code isn't " },
  mani_1_hl: { fr: "un abonnement", en: "a subscription" },
  mani_2_pre: { fr: "Ton modèle, ton choix. ", en: "Your model, your choice. " },
  mani_2_hl: { fr: "Cloud ou sous ton toit", en: "Cloud or on your machine" },
  mani_3_pre: { fr: "0 € n'est pas une promo. ", en: "0 € isn't a promo. " },
  mani_3_hl: { fr: "C'est la règle.", en: "It's the rule." },

  /* Steps */
  steps_heading: { fr: "Le chantier en trois coups de patte", en: "The project in three strokes" },
  steps_sub: { fr: "Pas de tunnel magique : tu vois chaque étape.", en: "No magic tunnel: you see every step." },
  steps_sidebar_0: { fr: "Chantier", en: "Project" },
  steps_sidebar_1: { fr: "Construction", en: "Building" },
  steps_sidebar_2: { fr: "Validation", en: "Review" },
  steps_prompt_label: { fr: "Décris ton chantier", en: "Describe your project" },
  steps_build_header: { fr: "Le castor construit…", en: "Castor is building…" },
  steps_done_title: { fr: "Chantier terminé", en: "Project done" },

  /* ProgressTeaser */
  prog_badge: { fr: "🔨 Avancement du projet", en: "🔨 Project progress" },
  prog_heading: { fr: "Le chantier avance, patte après patte", en: "The project moves forward, paw after paw" },
  prog_sub: { fr: "Ce qui est livré, ce qu'on construit et ce qui arrive — sans fausse promesse ni date artificielle.", en: "What's shipped, what we're building and what's coming — no false promise, no fake date." },
  prog_cta: { fr: "Voir l'avancement du projet →", en: "See project progress →" },

  /* Testimonials */
  tests_heading: { fr: "Ils ont donné un chantier.", en: "They gave a project." },
  tests_sub: { fr: "Retours de vrais utilisateurs — pas de fake, pas de script.", en: "Real user feedback — no fake, no script." },
  tests_recommends: { fr: "Recommande ✓", en: "Recommends ✓" },
  tests_prev: { fr: "Précédent", en: "Previous" },
  tests_next: { fr: "Suivant", en: "Next" },
  tests_dot: { fr: "Témoignage", en: "Testimonial" },
  tq1: {
    fr: "J'ai refait tout mon site de portfolio en une soirée au lieu d'une semaine. Le castor comprend les conventions et respecte la structure — j'ai juste validé les diffs.",
    en: "I rebuilt my entire portfolio site in one evening instead of a week. Castor understands conventions and respects the structure — I just approved the diffs.",
  },
  tr1: { fr: "Étudiant en info", en: "CS student" },
  tq2: {
    fr: "Le mode local est ce qui m'a convaincue. Aucune donnée qui part, les clés restent chez moi, et ça tourne même sans connexion. Enfin un outil IA sans compromis.",
    en: "Local mode is what convinced me. No data leaves, keys stay on my machine, and it works offline. Finally an AI tool without compromise.",
  },
  tr2: { fr: "Développeuse indie", en: "Indie developer" },
  tq3: {
    fr: "Je bascule entre Groq pour le rapide et un modèle local pour le sensible. Le fait de choisir le cerveau à la minute, c'est la vraie liberté — pas un abonnement qui décide pour moi.",
    en: "I switch between Groq for speed and a local model for sensitive work. Picking the brain on the fly is real freedom — not a subscription deciding for me.",
  },
  tr3: { fr: "Freelance full-stack", en: "Full-stack freelancer" },
  tq4: {
    fr: "J'ai recommandé Castor à toute mon équipe. Zéro formation, zéro abonnement, et on a retrouvé notre façon de travailler — juste plus vite. Les clients ont rien changé de leur côté.",
    en: "I recommended Castor to my whole team. Zero training, zero subscription, and we got our way of working back — just faster. Clients didn't change a thing.",
  },
  tr4: { fr: "Cheffe de projet web", en: "Web project lead" },

  /* DownloadSection */
  dl_eyebrow: { fr: "Téléchargement", en: "Download" },
  dl_heading_a: { fr: "Installe Castor.", en: "Install Castor." },
  dl_heading_b: { fr: "Commence à builder.", en: "Start building." },
  dl_desc: { fr: "Un installateur par plateforme. Pas de compte, pas d'abonnement, pas de limite. Le castor s'installe en quelques secondes.", en: "One installer per platform. No account, no subscription, no limit. Castor installs in seconds." },
  dl_win_installer: { fr: "x64 · installateur", en: "x64 · installer" },
  dl_cta: { fr: "Télécharger Castor Desktop", en: "Download Castor Desktop" },
  dl_learn_more: { fr: "En savoir plus →", en: "Learn more →" },
  dl_feat_start: { fr: "Démarrage < 1s", en: "Startup < 1s" },
  dl_feat_multi: { fr: "Multi-providers", en: "Multi-providers" },
  win_sub: { fr: "x64 · installateur", en: "x64 · installer" },
  mac_sub: { fr: "Apple Silicon · .dmg", en: "Apple Silicon · .dmg" },
  linux_sub: { fr: "Deb · AppImage", en: "Deb · AppImage" },
  dl_feat_keys: { fr: "Clés chiffrées", en: "Encrypted keys" },
  dl_feat_agents: { fr: "Agents parallèles", en: "Parallel agents" },
  dl_feat_sched: { fr: "Agents planifiés", en: "Scheduled agents" },
  dl_feat_split: { fr: "Diff côte à côte", en: "Side-by-side diff" },
  dl_win_title: { fr: "Castor Desktop — Installateur", en: "Castor Desktop — Installer" },
  dl_step_req: { fr: "Prérequis", en: "Prerequisites" },
  dl_step_install: { fr: "Installation", en: "Installation" },
  dl_step_config: { fr: "Configuration", en: "Configuration" },
  dl_step_ready: { fr: "Prêt", en: "Ready" },
  dl_install: { fr: "Installer", en: "Install" },
  dl_installing: { fr: "Installation en cours…", en: "Installing…" },
  dl_copy_files: { fr: "Copie des fichiers…", en: "Copying files…" },
  dl_shortcut: { fr: "Raccourci bureau créé ✓", en: "Desktop shortcut created ✓" },
  dl_installed: { fr: "Castor est installé !", en: "Castor is installed!" },
  dl_ready_build: { fr: "Prêt à construire tes projets.", en: "Ready to build your projects." },
  dl_launch: { fr: "Lancer Castor", en: "Launch Castor" },
  dl_close: { fr: "Fermer", en: "Close" },

  /* Footer */
  footer_created: { fr: "Créé par", en: "Made by" },
  footer_ose: { fr: "Open source MIT", en: "Open source MIT" },

  /* FAQ */
  faq_heading: { fr: "Des questions ? Le castor répond.", en: "Questions? Castor answers." },
  faq_sub: {
    fr: "Tout est gratuit, open source et local. Voici ce qu'on nous demande le plus.",
    en: "Everything is free, open source and local. Here's what we get asked the most.",
  },
  faq_q1: { fr: "Comment peut-il être gratuit ?", en: "How can it be free?" },
  faq_a1: {
    fr: "Le projet est open source (licence MIT) et tourne sur ta machine ou ton navigateur. Côté IA, les studios passent par le tier gratuit d'OpenRouter avec ta propre clé : aucun serveur à financer, donc aucun abonnement. Pas de publicité, pas de revente de données.",
    en: "The project is open source (MIT) and runs on your machine or in your browser. On the AI side, the studios use OpenRouter's free tier with your own key: no server to fund, so no subscription. No ads, no data resale.",
  },
  faq_q2: { fr: "Quels modèles puis-je utiliser ?", en: "Which models can I use?" },
  faq_a2: {
    fr: "Ceux que tu branches : Ox Alpha, Nemotron, Laguna et les autres gratuits via OpenRouter, Groq pour l'inférence ultra-rapide, OpenCode Zen pour le code, ou tes propres modèles locaux via Ollama et LM Studio.",
    en: "Whichever you plug in: Ox Alpha, Nemotron, Laguna and the other free ones via OpenRouter, Groq for ultra-fast inference, OpenCode Zen for code, or your own local models via Ollama and LM Studio.",
  },
  faq_q3: { fr: "Mes données sont-elles collectées ?", en: "Is my data collected?" },
  faq_a3: {
    fr: "Non. Tes conversations et tes projets sont stockés uniquement dans ton navigateur (localStorage). Ta clé API aussi. Rien ne transite vers nos serveurs — il n'y en a pas : tes requêtes vont directement du navigateur au provider que tu as choisi.",
    en: "No. Your conversations and projects live only in your browser (localStorage). Your API key too. Nothing goes through our servers — there are none: your requests go straight from your browser to the provider you picked.",
  },
  faq_q4: { fr: "Dans quels pays est-ce disponible ?", en: "Which countries is it available in?" },
  faq_a4: {
    fr: "Partout où il y a internet : tout tourne chez toi, il n'y a rien à débloquer. Seule dépendance : la disponibilité des providers de modèles depuis ton pays (OpenRouter, Groq…).",
    en: "Anywhere with internet: everything runs on your side, nothing to unlock. Only dependency: model provider availability from your country (OpenRouter, Groq…).",
  },
  faq_q5: { fr: "Pourquoi créer une clé OpenRouter ?", en: "Why create an OpenRouter key?" },
  faq_a5: {
    fr: "Elle donne accès aux modèles gratuits du Castor Bot (mode IA). Elle se crée en 30 secondes sur openrouter.ai, se colle une seule fois dans l'app et reste dans ton navigateur. Sans clé, le Castor Bot reste utilisable en mode local.",
    en: "It unlocks the Castor Bot's free models (AI mode). It takes 30 seconds on openrouter.ai, you paste it once in the app and it stays in your browser. Without a key, the Castor Bot still works in local mode.",
  },

  /* DemoSection */
  demo_heading: { fr: "Essaie Castor Desktop", en: "Try Castor Desktop" },
  demo_sub: { fr: "Explore les fonctionnalités — clique pour voir chaque feature en action.", en: "Explore the features — click to see each one in action." },
  demo_agents_title: { fr: "Agents parallèles", en: "Parallel agents" },
  demo_agents_desc: { fr: "Trois refactors en même temps ? Chaque agent vit dans son panneau, sans se marcher dessus.", en: "Three refactors at once? Each agent lives in its own panel, never stepping on each other." },
  demo_providers_title: { fr: "Multi-providers", en: "Multi-providers" },
  demo_providers_desc: { fr: "Branche OpenRouter, Groq, OpenCode Zen ou un modèle local. Change de cerveau à chaud.", en: "Plug in OpenRouter, Groq, OpenCode Zen or a local model. Swap brains on the fly." },
  demo_keys_title: { fr: "Clés chiffrées", en: "Encrypted keys" },
  demo_keys_desc: { fr: "Tes clés API sont stockées avec le coffre du système. Jamais en clair.", en: "Your API keys are stored in the system vault. Never in plain text." },
  demo_speed_title: { fr: "Optimisé", en: "Optimized" },
  demo_speed_desc: { fr: "Démarrage instantané, streaming token par token, stats de latence en direct.", en: "Instant startup, token-by-token streaming, live latency stats." },
  demo_prov_cloud: { fr: "Cloud", en: "Cloud" },
  demo_prov_fast: { fr: "Rapide", en: "Fast" },
  demo_prov_local: { fr: "Local", en: "Local" },
  demo_active_brain: { fr: "Cerveau actif", en: "Active brain" },
  demo_hot_swap: { fr: "Change à chaud · aucun restart", en: "Hot swap · no restart" },
  demo_vault: { fr: "Coffre du système", en: "System vault" },
  demo_hide: { fr: "Masquer", en: "Hide" },
  demo_reveal: { fr: "Révéler", en: "Reveal" },
  demo_locked: { fr: "Verrouillé", en: "Locked" },
  demo_key_note: { fr: "Jamais en clair · Jamais envoyé · Toujours chez toi", en: "Never in plain text · Never sent · Always on your machine" },
  demo_tokens: { fr: "Tokens", en: "Tokens" },
  demo_latency: { fr: "Latence", en: "Latency" },
  demo_throughput: { fr: "Débit", en: "Throughput" },
  demo_generated: { fr: "générés", en: "generated" },
  demo_secure_bar: { fr: "Sécurité", en: "Security" },
  demo_provider_bar: { fr: "Provider", en: "Provider" },
  demo_perf_bar: { fr: "Performance", en: "Performance" },

  /* NotFound */
  nf_title_pre: { fr: "Cette page est encore ", en: "This page is still " },
  nf_title_hl: { fr: "en chantier", en: "under construction" },
  nf_sub: { fr: "Le castor n'a rien trouvé ici. La planche a peut-être été déplacée, ou la route n'existe pas (encore).", en: "Castor found nothing here. The plank may have moved, or the route doesn't exist (yet)." },
  nf_home: { fr: "Retour à l'accueil", en: "Back to home" },
  nf_demo: { fr: "Voir la démo", en: "See the demo" },
  nf_hint: { fr: "Astuce : demande au 🦫 en bas à droite, il connaît toutes les routes du site.", en: "Tip: ask the 🦫 bottom-right, it knows every route on the site." },
  nf_badge: { fr: "Erreur 404", en: "Error 404" },
  nf_title_doc: { fr: "Page introuvable — Castor", en: "Page not found — Castor" },

  /* Templates */
  tpl_badge: { fr: "🏗️ Templates", en: "🏗️ Templates" },
  tpl_heading: { fr: "Points de départ générés par Castor", en: "Starting points generated by Castor" },
  tpl_sub: { fr: "Choisis un template, décris ton projet, et Castor construit la base en quelques secondes.", en: "Pick a template, describe your project, and Castor builds the base in seconds." },
  tpl_example: { fr: "Exemple :", en: "Example:" },
  tpl_cta_q: { fr: "Comment ça marche ?", en: "How does it work?" },
  tpl_step1: { fr: "Choisis un template", en: "Pick a template" },
  tpl_step2: { fr: "Décris ton projet en une phrase", en: "Describe your project in one sentence" },
  tpl_step3: { fr: "Castor génère la base", en: "Castor generates the base" },
  tpl_step4: { fr: "Personnalise et déploie", en: "Customize and deploy" },

  /* templates data */
  tpl_blog_name: { fr: "Blog", en: "Blog" },
  tpl_blog_tag: { fr: "Populaire", en: "Popular" },
  tpl_blog_desc: { fr: "Un blog minimaliste avec articles, catégories et recherche.", en: "A minimalist blog with posts, categories and search." },
  tpl_blog_f1: { fr: "Articles MD/HTML", en: "MD/HTML posts" },
  tpl_blog_f2: { fr: "Catégories & tags", en: "Categories & tags" },
  tpl_blog_f3: { fr: "Page à propos", en: "About page" },
  tpl_blog_f4: { fr: "RSS intégré", en: "Built-in RSS" },
  tpl_blog_prompt: { fr: "un blog de recettes végé avec recherche par ingrédients", en: "a vegan recipes blog with ingredient search" },
  tpl_portfolio_name: { fr: "Portfolio", en: "Portfolio" },
  tpl_portfolio_tag: { fr: "Recommandé", en: "Recommended" },
  tpl_portfolio_desc: { fr: "Mets en valeur tes projets avec une galerie interactive.", en: "Showcase your projects with an interactive gallery." },
  tpl_portfolio_f1: { fr: "Galerie responsive", en: "Responsive gallery" },
  tpl_portfolio_f2: { fr: "Filtres par catégorie", en: "Category filters" },
  tpl_portfolio_f3: { fr: "Page projet détaillée", en: "Detailed project page" },
  tpl_portfolio_f4: { fr: "Formulaire contact", en: "Contact form" },
  tpl_portfolio_prompt: { fr: "le portfolio d'un illustrateur freelance avec galerie et contact", en: "a freelance illustrator portfolio with gallery and contact" },
  tpl_dashboard_name: { fr: "Dashboard", en: "Dashboard" },
  tpl_dashboard_tag: { fr: "Pro", en: "Pro" },
  tpl_dashboard_desc: { fr: "Un tableau de bord avec graphiques et statistiques.", en: "A dashboard with charts and statistics." },
  tpl_dashboard_f1: { fr: "Charts interactifs", en: "Interactive charts" },
  tpl_dashboard_f2: { fr: "KPIs en temps réel", en: "Real-time KPIs" },
  tpl_dashboard_f3: { fr: "Thème sombre", en: "Dark theme" },
  tpl_dashboard_f4: { fr: "Export données", en: "Data export" },
  tpl_dashboard_prompt: { fr: "un dashboard analytics avec graphiques et KPIs", en: "an analytics dashboard with charts and KPIs" },
  tpl_landing_name: { fr: "Landing Page", en: "Landing Page" },
  tpl_landing_tag: { fr: "Rapide", en: "Quick" },
  tpl_landing_desc: { fr: "Une page de vente efficace avec CTA et témoignages.", en: "An effective sales page with CTA and testimonials." },
  tpl_landing_f1: { fr: "Hero accrocheur", en: "Catchy hero" },
  tpl_landing_f2: { fr: "Section fonctionnalités", en: "Features section" },
  tpl_landing_f3: { fr: "Témoignages", en: "Testimonials" },
  tpl_landing_f4: { fr: "Pricing & FAQ", en: "Pricing & FAQ" },
  tpl_landing_prompt: { fr: "une landing page pour une app de productivité avec pricing", en: "a landing page for a productivity app with pricing" },
  tpl_ecommerce_name: { fr: "E-commerce", en: "E-commerce" },
  tpl_ecommerce_tag: { fr: "Avancé", en: "Advanced" },
  tpl_ecommerce_desc: { fr: "Une boutique en ligne avec panier et paiement.", en: "An online store with cart and checkout." },
  tpl_ecommerce_f1: { fr: "Catalogue produits", en: "Product catalog" },
  tpl_ecommerce_f2: { fr: "Panier & checkout", en: "Cart & checkout" },
  tpl_ecommerce_f3: { fr: "Compte client", en: "Customer account" },
  tpl_ecommerce_f4: { fr: "Gestion stock", en: "Stock management" },
  tpl_ecommerce_prompt: { fr: "une boutique en ligne de vêtements vintage avec panier", en: "an online vintage clothing store with cart" },
  tpl_saas_name: { fr: "SaaS", en: "SaaS" },
  tpl_saas_tag: { fr: "Business", en: "Business" },
  tpl_saas_desc: { fr: "Un site pour ton produit SaaS avec auth et dashboard.", en: "A site for your SaaS product with auth and dashboard." },
  tpl_saas_f1: { fr: "Page marketing", en: "Marketing page" },
  tpl_saas_f2: { fr: "Inscription/Login", en: "Sign up/Login" },
  tpl_saas_f3: { fr: "Dashboard user", en: "User dashboard" },
  tpl_saas_f4: { fr: "Settings & profil", en: "Settings & profile" },
  tpl_saas_prompt: { fr: "un site SaaS pour un outil de gestion de projets avec auth", en: "a SaaS site for a project management tool with auth" },

  /* CLI page */
  cli_badge: { fr: "⌨️ CLI en ligne", en: "⌨️ Online CLI" },
  cli_heading: { fr: "Essaie la CLI sans rien installer", en: "Try the CLI without installing anything" },
  cli_sub: { fr: "Un terminal interactif — tape tes commandes et vois le castor répondre.", en: "An interactive terminal — type your commands and watch castor answer." },
  cli_placeholder: { fr: "tape /help pour commencer…", en: "type /help to start…" },
  cli_aria: { fr: "Commande CLI", en: "CLI command" },
  cli_hints_title: { fr: "Commandes rapides :", en: "Quick commands:" },
  cli_welcome: {
    fr: `◆ Castor CLI — l'agent de code en ligne de commande

Tape /help pour voir la liste des commandes.
Essaie /demo pour une démonstration rapide.
Ou décris un chantier en langage naturel.

  Exemples :
    /provider          → voir les providers
    /model             → voir les modèles
    /demo              → lancer une démo
    un blog de recettes végé → créer un site
`,
    en: `◆ Castor CLI — the command-line coding agent

Type /help to see the list of commands.
Try /demo for a quick demonstration.
Or describe a project in plain language.

  Examples:
    /provider          → view providers
    /model             → view models
    /demo              → run a demo
    a vegan recipes blog → build a site
`,
  },
  cli_help: {
    fr: `Commandes disponibles :

  /help          Affiche cette aide
  /provider      Liste les providers disponibles
  /provider <n>  Change de provider
  /model         Liste les modèles du provider actif
  /model <id>    Change de modèle
  /key <clé>     Enregistre une clé API
  /tools         Liste les tools disponibles
  /tools on|off  Active/désactive les tools
  /skills        Liste les compétences
  /skill <nom>   Active une compétence
  /memory        Affiche la mémoire
  /remember <f>  Ajoute un fait en mémoire
  /todo          Affiche le plan en cours
  /usage         Statistiques d'utilisation
  /save [nom]    Sauvegarde la session
  /load <nom>    Restaure une session
  /history       Liste les sessions sauvegardées
  /clear         Efface la conversation
  /demo          Lance une démo rapide
  /exit          Quitte le REPL
`,
    en: `Available commands:

  /help          Show this help
  /provider      List available providers
  /provider <n>  Switch provider
  /model         List models of the active provider
  /model <id>    Switch model
  /key <key>     Store an API key
  /tools         List available tools
  /tools on|off  Enable/disable tools
  /skills        List skills
  /skill <name>  Enable a skill
  /memory        Show memory
  /remember <f>  Add a fact to memory
  /todo          Show the current plan
  /usage         Usage statistics
  /save [name]   Save the session
  /load <name>   Restore a session
  /history       List saved sessions
  /clear         Clear the conversation
  /demo          Run a quick demo
  /exit          Quit the REPL
`,
  },
  cli_provider: {
    fr: `Providers disponibles :
  1. OpenRouter       Multi-modèles cloud · clé requise
  2. Groq             Ultra-rapide · clé requise
  3. OpenCode Zen     Spécialisé code · clé requise
  4. Ollama           100% local · aucun service tiers
  5. LM Studio        100% local · interface graphique

  /provider <nom|numéro> pour changer`,
    en: `Available providers:
  1. OpenRouter       Multi-model cloud · key required
  2. Groq             Ultra-fast · key required
  3. OpenCode Zen     Code-specialized · key required
  4. Ollama           100% local · no third-party service
  5. LM Studio        100% local · GUI

  /provider <name|number> to switch`,
  },
  cli_model: {
    fr: `Modèles OpenRouter :
  1. openrouter/auto          · 200k
  2. google/gemma-3-27b-it    · 128k
  3. meta-llama/llama-4-scout · 128k
  4. mistralai/devstral-small · 64k
  5. qwen/qwen3-30b-a3b       · 128k

  /model <id|numéro> pour changer`,
    en: `OpenRouter models:
  1. openrouter/auto          · 200k
  2. google/gemma-3-27b-it    · 128k
  3. meta-llama/llama-4-scout · 128k
  4. mistralai/devstral-small · 64k
  5. qwen/qwen3-30b-a3b       · 128k

  /model <id|number> to switch`,
  },
  cli_tools: {
    fr: `Tools disponibles :
  read_file        Lit un fichier du projet
  edit_file        Édite un fichier existant
  create_file      Crée un nouveau fichier
  list_dir         Liste le contenu d'un répertoire
  search           Recherche dans le code
  terminal         Exécute une commande shell
  web_search       Recherche sur le web

  /tools on — activer · /tools off — désactiver`,
    en: `Available tools:
  read_file        Read a project file
  edit_file        Edit an existing file
  create_file      Create a new file
  list_dir         List a directory's contents
  search           Search the code
  terminal         Run a shell command
  web_search       Search the web

  /tools on — enable · /tools off — disable`,
  },
  cli_skills: {
    fr: `Compétences :
  /refactor       Refactorisation intelligente
  /test           Génère des tests
  /review         Revue de code
  /doc            Génère de la documentation

  /skill <nom> active pour la prochaine demande`,
    en: `Skills:
  /refactor       Smart refactoring
  /test           Generate tests
  /review         Code review
  /doc            Generate documentation

  /skill <name> enables for the next request`,
  },
  cli_memory: { fr: `Mémoire (0) :
  vide — /remember <fait>`, en: `Memory (0):
  empty — /remember <fact>` },
  cli_todo_empty: { fr: "Aucun plan en cours — pose une tâche multi-étapes.", en: "No plan in progress — give a multi-step task." },
  cli_usage: { fr: "requêtes : 0  tokens cumulés : ~0  coût : 0 €", en: "requests: 0  total tokens: ~0  cost: 0 €" },
  cli_history: { fr: "Aucune session sauvegardée — /save <nom> pour créer une session", en: "No saved session — /save <name> to create one" },
  cli_cleared: { fr: "✓ conversation effacée", en: "✓ conversation cleared" },
  cli_demo: {
    fr: `◆ castor · Qwenn Max · ~/api

› ajoute du rate limiting sur /checkout

✔ Lit 34 fichiers · mappe les routes API
✔ Écrit src/middleware/rateLimit.ts
✔ Tests : 18 passés, 0 échoué

Fait · 3 fichiers · 0 €`,
    en: `◆ castor · Qwenn Max · ~/api

› add rate limiting on /checkout

✔ Reads 34 files · maps the API routes
✔ Writes src/middleware/rateLimit.ts
✔ Tests: 18 passed, 0 failed

Done · 3 files · 0 €`,
  },
  cli_exit: { fr: `À bientôt ! 🦫`, en: `See you soon! 🦫` },
  cli_unknown: { fr: `Commande inconnue : /{cmd} — /help pour la liste`, en: `Unknown command: /{cmd} — /help for the list` },

  /* CliPage — refonte */
  cli_nl_done: {
    fr: `◆ Mode local — décris un chantier et le castor le construit bloc par bloc.\n\n✔ Chantier enregistré : "{prompt}"\n✔ Structure générée · styles appliqués · tests passés\n\nFait · 0 € — lance /demo pour voir un rendu complet.`,
    en: `◆ Local mode — describe a project and the castor builds it block by block.\n\n✔ Project logged: "{prompt}"\n✔ Structure generated · styles applied · tests passed\n\nDone · 0 € — run /demo to see a full render.`,
  },
  cli_stats_uptime: { fr: "Durée de session", en: "Session uptime" },
  cli_stats_cmds: { fr: "Commandes tapées", en: "Commands entered" },
  cli_install_title: { fr: "Installer la vraie CLI", en: "Install the real CLI" },
  cli_install_note: {
    fr: "Ce terminal est une simulation. La CLI complète — streaming, mémoire, providers — tient dans un paquet zéro dépendance.",
    en: "This terminal is a simulation. The full CLI — streaming, memory, providers — ships as a zero-dependency package.",
  },
  cli_palette_title: { fr: "Mémo des commandes", en: "Command cheat sheet" },
  cli_d_help: { fr: "Liste des commandes", en: "List all commands" },
  cli_d_demo: { fr: "Démo hors-ligne complète", en: "Full offline demo" },
  cli_d_provider: { fr: "Voir / changer de provider", en: "View / switch provider" },
  cli_d_model: { fr: "Voir / changer de modèle", en: "View / switch model" },
  cli_d_tools: { fr: "Tools lecture/écriture/terminal", en: "Read/write/terminal tools" },
  cli_d_skills: { fr: "Prompts réutilisables", en: "Reusable prompts" },
  cli_d_memory: { fr: "Faits persistants", en: "Persistent facts" },
  cli_d_todo: { fr: "Plan multi-étapes en cours", en: "Current multi-step plan" },
  cli_d_usage: { fr: "Tokens et requêtes cumulés", en: "Cumulative tokens and requests" },
  cli_d_clear: { fr: "Effacer la conversation", en: "Clear the conversation" },
  cli_d_exit: { fr: "Quitter le REPL", en: "Quit the REPL" },
  cli_side_hint: {
    fr: "Ou décris un chantier en langage naturel — sans slash.",
    en: "Or describe a project in plain language — no slash needed.",
  },
  cli_side_tip_title: { fr: "Le saviez-vous ?", en: "Did you know?" },
  cli_side_tip: {
    fr: "↑ / ↓ rappellent vos commandes précédentes, et Tab complète les noms de commandes. La mémoire /remember est injectée dans chaque requête — le castor se souvient de vos conventions.",
    en: "↑ / ↓ recall previous commands, and Tab completes command names. /remember facts are injected into every request — the castor remembers your conventions.",
  },

  /* produits (ProductPage) */
  pp_all_products: { fr: "← Tous les produits", en: "← All products" },
  pp_all_products2: { fr: "Tous les produits →", en: "All products →" },
  pp_copied: { fr: "copié ✓", en: "copied ✓" },
  pp_copy: { fr: "copier", en: "copy" },
  pp_zoom: { fr: "Agrandir", en: "Enlarge" },
  pp_zoom_label: { fr: "Agrandir l'aperçu de {name}", en: "Enlarge the preview of {name}" },
  pp_close_preview: { fr: "Fermer l'aperçu", en: "Close preview" },
  pp_caption: { fr: "{name} — aperçu agrandi", en: "{name} — enlarged preview" },

  pp_desktop_tag: { fr: "Nouveau", en: "New" },
  pp_desktop_tagline: { fr: "Tous tes agents. Une seule fenêtre.", en: "All your agents. One window." },
  pp_desktop_desc: {
    fr: "Lance plusieurs agents en parallèle sur ta machine, chacun dans son espace de travail isolé. Connecte OpenRouter, Groq, OpenCode Zen ou tes modèles locaux.",
    en: "Run several agents in parallel on your machine, each in its own isolated workspace. Connect OpenRouter, Groq, OpenCode Zen or your local models.",
  },
  pp_desktop_cta: { fr: "Télécharger Castor Desktop", en: "Download Castor Desktop" },
  pp_desktop_f0_t: { fr: "Agents parallèles", en: "Parallel agents" },
  pp_desktop_f0_d: { fr: "Trois refactors en même temps ? Chaque agent vit dans son panneau, sans se marcher dessus.", en: "Three refactors at once? Each agent lives in its own panel, never stepping on each other." },
  pp_desktop_f1_t: { fr: "Multi-providers", en: "Multi-providers" },
  pp_desktop_f1_d: { fr: "Branche OpenRouter, Groq, OpenCode Zen ou un modèle local Ollama / LM Studio. Change de cerveau à chaud.", en: "Plug in OpenRouter, Groq, OpenCode Zen or a local Ollama / LM Studio model. Swap brains on the fly." },
  pp_desktop_f2_t: { fr: "Clés chiffrées", en: "Encrypted keys" },
  pp_desktop_f2_d: { fr: "Tes clés API sont stockées avec le coffre du système via safeStorage. Jamais en clair.", en: "Your API keys are stored in the system vault via safeStorage. Never in plain text." },
  pp_desktop_f3_t: { fr: "Optimisé", en: "Optimized" },
  pp_desktop_f3_d: { fr: "Démarrage instantané, streaming token par token, stats de latence et de débit en direct.", en: "Instant startup, token-by-token streaming, live latency and throughput stats." },

  pp_cloud_tag: { fr: "Bientôt", en: "Soon" },
  pp_cloud_tagline: { fr: "Un sandbox complet pour chaque repo.", en: "A full sandbox for every repo." },
  pp_cloud_desc: {
    fr: "En développement : éditeur, terminal et agent dans un vrai IDE cloud, branché sur n'importe quel dépôt GitHub public ou privé. Rien à installer.",
    en: "In development: editor, terminal and agent in a real cloud IDE, wired to any public or private GitHub repo. Nothing to install.",
  },
  pp_cloud_cta: { fr: "Découvrir la vision", en: "Discover the vision" },
  pp_cloud_f0_t: { fr: "Branché sur GitHub", en: "Wired to GitHub" },
  pp_cloud_f0_d: { fr: "Ouvre un repo, Castor créera sa branche et travaillera dessus.", en: "Open a repo, Castor will create its branch and work on it." },
  pp_cloud_f1_t: { fr: "Sandbox réel", en: "Real sandbox" },
  pp_cloud_f1_d: { fr: "Dépendances, dev server, tests : tout tournera dans un environnement isolé.", en: "Dependencies, dev server, tests: everything will run in an isolated environment." },
  pp_cloud_f2_t: { fr: "Preview intégrée", en: "Built-in preview" },
  pp_cloud_f2_d: { fr: "Visualise le résultat pendant que l'agent code.", en: "See the result while the agent codes." },
  pp_cloud_f3_t: { fr: "Zéro lock-in", en: "Zero lock-in" },
  pp_cloud_f3_d: { fr: "Tout restera poussable sur GitHub. Tu pars quand tu veux, avec tout.", en: "Everything stays pushable to GitHub. Leave anytime, with everything." },

  /* DesktopHowItWorks */
  how_badge: { fr: "Simple et rapide", en: "Simple and fast" },
  how_heading: { fr: "En trois étapes.", en: "In three steps." },
  how_s1_t: { fr: "Ouvre Castor Desktop", en: "Open Castor Desktop" },
  how_s1_d: { fr: "Un seul clic. Pas de terminal, pas de config. L'app démarre en une seconde.", en: "One click. No terminal, no config. The app starts in a second." },
  how_s2_t: { fr: "Crée un agent, choisis ton modèle", en: "Create an agent, pick your model" },
  how_s2_d: { fr: "OpenRouter, Groq, Ollama… branche le cerveau que tu veux. Chaque agent a son propre espace.", en: "OpenRouter, Groq, Ollama… plug in the brain you want. Each agent has its own space." },
  how_s3_t: { fr: "L'agent construit, tu valides", en: "The agent builds, you approve" },
  how_s3_d: { fr: "Structure, styles, tests : tout est monté devant toi. Chaque fichier est lisible et modifiable.", en: "Structure, styles, tests: everything is built in front of you. Every file is readable and editable." },

  /* DesktopComparison */
  dcomp_heading: { fr: "Pourquoi Desktop ?", en: "Why Desktop?" },
  dcomp_sub: { fr: "Trois produits, un seul cas d'usage : coder plus vite.", en: "Three products, one use case: coding faster." },
  dcomp_recommended: { fr: "Recommandé", en: "Recommended" },
  dcomp_soon: { fr: "Bientôt", en: "Soon" },
  dcomp_desc_d: { fr: "App complète, agents parallèles, multi-providers, clés chiffrées.", en: "Full app, parallel agents, multi-providers, encrypted keys." },
  dcomp_desc_c: { fr: "IDE cloud complet. Branché sur tes repos GitHub.", en: "Full cloud IDE. Wired to your GitHub repos." },
  dcomp_p1: { fr: "100% local", en: "100% local" },
  dcomp_p2: { fr: "Agents parallèles", en: "Parallel agents" },
  dcomp_p3: { fr: "Clés chiffrées", en: "Encrypted keys" },
  dcomp_p4: { fr: "Zéro installation", en: "Zero install" },
  dcomp_p5: { fr: "GitHub sync", en: "GitHub sync" },
  dcomp_p6: { fr: "Sandbox réel", en: "Real sandbox" },
  dcomp_discover: { fr: "Découvrir →", en: "Discover →" },
  dcomp_follow: { fr: "Suivre le projet →", en: "Follow the project →" },

  /* DesktopCta */
  dcta_heading: { fr: "Prêt à construire ?", en: "Ready to build?" },
  dcta_sub: { fr: "Castor Desktop est gratuit. Pas d'abonnement, pas de limite.", en: "Castor Desktop is free. No subscription, no limit." },
  dcta_note: { fr: "Gratuit · Open source · Multi-providers", en: "Free · Open source · Multi-providers" },

  /* CloudWorkflow */
  cwf_badge: { fr: "Workflow automatisé", en: "Automated workflow" },
  cwf_heading: { fr: "De GitHub à la production.", en: "From GitHub to production." },
  cwf_sub: { fr: "Ouvre un repo, Castor fait le reste.", en: "Open a repo, Castor does the rest." },
  cwf_s1: { fr: "Ouvre un repo GitHub", en: "Open a GitHub repo" },
  cwf_s2: { fr: "Castor crée une branche", en: "Castor creates a branch" },
  cwf_s3: { fr: "L'agent code en sandbox", en: "The agent codes in a sandbox" },
  cwf_s4: { fr: "Preview live + push", en: "Live preview + push" },
  cwf_d1: { fr: "Choisis le repo à brancher", en: "Pick the repo to wire up" },
  cwf_d2: { fr: "Une branche propre, pas de conflit", en: "A clean branch, no conflicts" },
  cwf_d3: { fr: "Dépendances + tests dans un bac à sable", en: "Dependencies + tests in a sandbox" },
  cwf_d4: { fr: "Aperçu en direct, push en un clic", en: "Live preview, one-click push" },
  cwf_ago: { fr: "il y a 2 s", en: "2 s ago" },
  cwf_tab_preview: { fr: "Preview", en: "Preview" },
  cwf_tab_code: { fr: "Code", en: "Code" },
  cwf_tab_diff: { fr: "Diff", en: "Diff" },
  cwf_tab_terminal: { fr: "Terminal", en: "Terminal" },

  /* CloudWaitlist */
  cwl_badge: { fr: "Bientôt disponible", en: "Coming soon" },
  cwl_heading: { fr: "Rejoins la liste d'attente.", en: "Join the waitlist." },
  cwl_sub: { fr: "Soyez les premiers à tester Castor Cloud dès sa sortie.", en: "Be the first to try Castor Cloud when it ships." },
  cwl_count: { fr: "castors déjà inscrits", en: "castors already signed up" },
  cwl_goal: { fr: "Objectif : 750 pour l'alpha", en: "Goal: 750 for the alpha" },
  cwl_done: { fr: "Tu es sur la liste !", en: "You're on the list!" },
  cwl_done_sub: { fr: "On te prévient dès que Cloud est prêt.", en: "We'll ping you as soon as Cloud is ready." },
  cwl_email_aria: { fr: "Adresse email", en: "Email address" },
  cwl_notify: { fr: "Notifier-moi", en: "Notify me" },

  /* CloudRoadmap */
  cr_heading: { fr: "Roadmap.", en: "Roadmap." },
  cr_sub: { fr: "Un produit qui avance, pas un vaporware.", en: "A product that moves, not vaporware." },
  cr_status_done: { fr: "livré", en: "shipped" },
  cr_status_wip: { fr: "en cours", en: "in progress" },
  cr_status_soon: { fr: "bientôt", en: "soon" },
  cr_status_explore: { fr: "exploration", en: "exploring" },
  cr_m1_t: { fr: "Alpha privée", en: "Private alpha" },
  cr_m1_d: { fr: "Sandbox basique, éditeur, terminal.", en: "Basic sandbox, editor, terminal." },
  cr_m2_t: { fr: "Beta publique", en: "Public beta" },
  cr_m2_d: { fr: "Preview live, GitHub sync, multi-branche.", en: "Live preview, GitHub sync, multi-branch." },
  cr_m3_t: { fr: "Agent intégré", en: "Built-in agent" },
  cr_m3_d: { fr: "L'agent code directement dans le sandbox cloud.", en: "The agent codes directly in the cloud sandbox." },
  cr_m4_t: { fr: "Launch", en: "Launch" },
  cr_m4_d: { fr: "Multi-collaborateur, CI/CD intégré, monitoring.", en: "Multi-collaborator, built-in CI/CD, monitoring." },

  /* CloudArchitecture */
  ca_heading: { fr: "Comment ça marche.", en: "How it works." },
  ca_sub: { fr: "De ton GitHub à ton navigateur, en 3 couches.", en: "From your GitHub to your browser, in 3 layers." },
  ca_l1_d: { fr: "Ton repo, tes branches", en: "Your repo, your branches" },
  ca_l1_t1: { fr: "Repo public", en: "Public repo" },
  ca_l1_t2: { fr: "Repo privé", en: "Private repo" },
  ca_l1_t3: { fr: "PRs", en: "PRs" },
  ca_l2_d: { fr: "Sandbox isolé · Agent IA · Dev server", en: "Isolated sandbox · AI agent · Dev server" },
  ca_l2_t1: { fr: "Docker", en: "Docker" },
  ca_l2_t2: { fr: "Dev server :3000", en: "Dev server :3000" },
  ca_l2_t3: { fr: "Agent parallèle", en: "Parallel agent" },
  ca_l3_d: { fr: "Résultat instantané", en: "Instant result" },
  ca_l3_t1: { fr: "URL dédiée", en: "Dedicated URL" },
  ca_l3_t2: { fr: "Hot reload", en: "Hot reload" },
  ca_l3_t3: { fr: "Multi-appareils", en: "Multi-device" },
  ca_core: { fr: "LE CŒUR", en: "THE CORE" },

  /* CloudComparison */
  cc_heading: { fr: "Desktop vs Cloud.", en: "Desktop vs Cloud." },
  cc_sub: { fr: "Deux façons de coder, même philosophie : gratuit et open source.", en: "Two ways to code, same philosophy: free and open source." },
  cc_feature: { fr: "Fonctionnalité", en: "Feature" },
  cc_f1: { fr: "Installation", en: "Installation" },
  cc_f2: { fr: "Espace de travail", en: "Workspace" },
  cc_f3: { fr: "GitHub sync", en: "GitHub sync" },
  cc_f4: { fr: "Multi-collaborateur", en: "Multi-collaborator" },
  cc_f5: { fr: "Offline", en: "Offline" },
  cc_f6: { fr: "Gratuit", en: "Free" },
  cc_v_required: { fr: "Requise", en: "Required" },
  cc_v_none: { fr: "Aucune", en: "None" },
  cc_v_local: { fr: "Local", en: "Local" },
  cc_v_iso: { fr: "Cloud isolé", en: "Isolated cloud" },
  cc_v_manual: { fr: "Manuel", en: "Manual" },
  cc_v_auto: { fr: "Automatique", en: "Automatic" },
  cc_v_no: { fr: "Non", en: "No" },
  cc_v_yes_soon: { fr: "Oui (bientôt)", en: "Yes (soon)" },
  cc_v_yes: { fr: "Oui", en: "Yes" },

  /* Avancement (ProjectProgress) */
  aev_badge: { fr: "🧱 Avancement du projet", en: "🧱 Project progress" },
  aev_heading: { fr: "Le chantier avance, patte après patte", en: "The project moves forward, paw after paw" },
  aev_sub: { fr: "Ce qui est livré, ce qu'on construit et ce qui arrive — sans fausse promesse ni date artificielle.", en: "What's shipped, what we're building and what's coming — no false promise, no fake date." },
  aev_global: { fr: "avancement global", en: "overall progress" },
  aev_projects: { fr: "chantiers", en: "projects" },
  aev_cat_app: { fr: "App Desktop", en: "Desktop App" },
  aev_cat_app_sub: { fr: "L'app et ses agents", en: "The app and its agents" },
  aev_cat_site: { fr: "Site", en: "Site" },
  aev_cat_site_sub: { fr: "Le site web Castor", en: "The Castor website" },
  aev_cat_models: { fr: "Modèles", en: "Models" },
  aev_cat_models_sub: { fr: "Cerveaux IA & outils", en: "AI brains & tools" },
  aev_st_done: { fr: "livré", en: "shipped" },
  aev_st_wip: { fr: "en cours", en: "in progress" },
  aev_st_soon: { fr: "bientôt", en: "soon" },
  aev_st_explore: { fr: "exploration", en: "exploring" },
  aev_st_done_plural: { fr: "livrés", en: "shipped" },
  aev_st_explore_plural: { fr: "explorations", en: "explorations" },
  aev_st_done_cap: { fr: "Livré", en: "Shipped" },
  aev_st_wip_cap: { fr: "En cours", en: "In progress" },
  aev_st_soon_cap: { fr: "Bientôt", en: "Soon" },
  aev_st_explore_cap: { fr: "Exploration", en: "Exploring" },
  aev_question: { fr: "Une question sur un chantier ?", en: "A question about a project?" },
  aev_ask_bot: { fr: "🦫 Demander au Castor Bot", en: "🦫 Ask the Castor Bot" },
  aev_follow: { fr: "⭐ Suivre sur GitHub", en: "⭐ Follow on GitHub" },
  aev_aria: { fr: "Avancement du projet", en: "Project progress" },

  rm_app_0_t: { fr: "Agents planifiés", en: "Scheduled agents" },
  rm_app_0_d: { fr: "Lance un refactor chaque nuit à 2h — le castor travaille pendant que tu dors.", en: "Run a refactor every night at 2am — castor works while you sleep." },
  rm_app_1_t: { fr: "Diff côte à côte", en: "Side-by-side diff" },
  rm_app_1_d: { fr: "Compare avant/après en split view, valide hunk par hunk.", en: "Compare before/after in split view, approve hunk by hunk." },
  rm_app_2_t: { fr: "Assistant IA embarqué", en: "Built-in AI assistant" },
  rm_app_2_d: { fr: "Le chatbot 24/7 directement dans l'app Desktop : roadmap, aide et astuces sans quitter ton chantier.", en: "The 24/7 chatbot right in the Desktop app: roadmap, help and tips without leaving your project." },
  rm_app_3_t: { fr: "Synchronisation multi-postes", en: "Multi-machine sync" },
  rm_app_3_d: { fr: "Export/import JSON de tes conversations, clés et projets entre machines.", en: "JSON export/import of your conversations, keys and projects across machines." },
  rm_app_4_t: { fr: "Serveurs MCP", en: "MCP servers" },
  rm_app_4_d: { fr: "Branche des outils externes (base de données, Figma, docs) à tes agents via le protocole MCP.", en: "Wire external tools (database, Figma, docs) to your agents via the MCP protocol." },
  rm_app_5_t: { fr: "Thèmes personnalisables", en: "Customizable themes" },
  rm_app_5_d: { fr: "Choisis ta couleur d'accent parmi les presets ou une couleur libre.", en: "Pick your accent color from presets or a free color." },
  rm_app_6_t: { fr: "Git intégré", en: "Built-in Git" },
  rm_app_6_d: { fr: "Commit, push et branches directement depuis l'app — plus besoin de terminal.", en: "Commit, push and branches right from the app — no terminal needed." },
  rm_app_7_t: { fr: "Mise à jour automatique", en: "Automatic updates" },
  rm_app_7_d: { fr: "Castor se met à jour tout seul en arrière-plan, sans rien casser.", en: "Castor updates itself in the background, without breaking anything." },
  rm_app_8_t: { fr: "Recherche globale", en: "Global search" },
  rm_app_8_d: { fr: "Retrouve n'importe quelle conversation, note ou fichier en un raccourci.", en: "Find any conversation, note or file with one shortcut." },
  rm_app_9_t: { fr: "Mode sandbox", en: "Sandbox mode" },
  rm_app_9_d: { fr: "Lance tes projets dans un bac à sable isolé avant de les appliquer.", en: "Run your projects in an isolated sandbox before applying them." },
  rm_app_10_t: { fr: "Version anglaise de l'app", en: "English version of the app" },
  rm_app_10_d: { fr: "L'interface Desktop traduite pour les castors internationaux.", en: "The Desktop interface translated for international castors." },
  rm_site_0_t: { fr: "Page CLI dédiée", en: "Dedicated CLI page" },
  rm_site_0_d: { fr: "Terminal interactif en ligne pour essayer la CLI sans rien installer.", en: "Interactive online terminal to try the CLI without installing anything." },
  rm_site_1_t: { fr: "Templates de projets", en: "Project templates" },
  rm_site_1_d: { fr: "Blog, portfolio, dashboard : des points de départ générés par Castor.", en: "Blog, portfolio, dashboard: starting points generated by Castor." },
  rm_site_2_t: { fr: "Version anglaise", en: "English version" },
  rm_site_2_d: { fr: "i18n complet du site et des studios.", en: "Full i18n of the site and studios." },
  rm_site_3_t: { fr: "Éditeur visuel du Studio Web", en: "Visual editor for Web Studio" },
  rm_site_3_d: { fr: "Glisser-déposer, réordonner les sections et affiner chaque bloc sans repasser par le prompt.", en: "Drag & drop, reorder sections and fine-tune every block without going back to the prompt." },
  rm_site_4_t: { fr: "Galerie de créations", en: "Creations gallery" },
  rm_site_4_d: { fr: "Les sites générés par la communauté, triés par style et par stack — source d'inspiration.", en: "Community-generated sites, sorted by style and stack — a source of inspiration." },
  rm_site_5_t: { fr: "PWA & installation mobile", en: "PWA & mobile install" },
  rm_site_5_d: { fr: "Installe Castor comme une vraie app sur ton téléphone, avec lancement hors ligne.", en: "Install Castor as a real app on your phone, with offline launch." },
  rm_site_6_t: { fr: "Blog Castor", en: "Castor blog" },
  rm_site_6_d: { fr: "Annonces, astuces et coulisses du chantier — un fil direct avec la communauté.", en: "Announcements, tips and behind-the-scenes of the build — a direct line with the community." },
  rm_models_0_t: { fr: "Benchmarks hebdo", en: "Weekly benchmarks" },
  rm_models_0_d: { fr: "Classement des modèles gratuits sur des tâches de code réelles, chaque semaine.", en: "Ranking of free models on real coding tasks, every week." },
  rm_models_1_t: { fr: "Sélection auto du modèle", en: "Automatic model selection" },
  rm_models_1_d: { fr: "Castor choisit le cerveau optimal selon la tâche : rapide pour le fix, réfléchi pour l'archi.", en: "Castor picks the best brain for the task: fast for the fix, thoughtful for the arch." },
  rm_models_2_t: { fr: "Vision dans Desktop", en: "Vision in Desktop" },
  rm_models_2_d: { fr: "Envoie une maquette ou un screenshot à ton agent pour qu'il code le design.", en: "Send a mockup or screenshot to your agent so it codes the design." },
  rm_models_3_t: { fr: "Profils de contexte long", en: "Long-context profiles" },
  rm_models_3_d: { fr: "Dépôts entiers indexés pour les grosses refactors multi-fichiers.", en: "Whole repos indexed for large multi-file refactors." },

  /* CloudSpace */
  cs_home: { fr: "← Accueil", en: "← Home" },
  cs_espace_badge: { fr: "Espace Cloud · bêta", en: "Cloud Space · beta" },
  cs_h1_a: { fr: "Connecte un repo.", en: "Connect a repo." },
  cs_h1_b: { fr: "Construis.", en: "Build." },
  cs_sub: {
    fr: "Connecte n'importe quel repo GitHub, obtient un sandbox cloud avec preview live, et construis avec des modèles gratuits.",
    en: "Connect any GitHub repo, get a cloud sandbox with live preview, and build with free models.",
  },
  cs_card1_t: { fr: "Connecte ton premier repo", en: "Connect your first repo" },
  cs_card1_d: { fr: "Clone un projet GitHub existant dans le Cloud.", en: "Clone an existing GitHub project into the Cloud." },
  cs_card1_cta: { fr: "Connecter un repo →", en: "Connect a repo →" },
  cs_card2_t: { fr: "Planifie un projet sur mesure", en: "Plan a custom project" },
  cs_card2_d: { fr: "Décris ton idée, Castor planifie la stack avant d'écrire le code.", en: "Describe your idea, Castor plans the stack before writing code." },
  cs_card2_cta: { fr: "Planifier →", en: "Plan →" },
  cs_vision: { fr: "Découvrir la vision Castor Cloud →", en: "Discover the Castor Cloud vision →" },
  cs_recent: { fr: "Projets récents", en: "Recent projects" },
  cs_feedback_h: { fr: "Façonne l'avenir de Castor Cloud", en: "Shape the future of Castor Cloud" },
  cs_feedback_p: { fr: "On lit chaque retour. Ça prend moins d'une minute.", en: "We read every piece of feedback. It takes less than a minute." },
  cs_discussions: { fr: "Discussions", en: "Discussions" },
  cs_share_feedback: { fr: "Partager un retour", en: "Share feedback" },

  cs_connect_badge: { fr: "Connecter un repo", en: "Connect a repo" },
  cs_h1_repo_a: { fr: "Quel repo", en: "Which repo" },
  cs_h1_repo_b: { fr: "ouvre-t-on ?", en: "are we opening?" },
  cs_repo_sub: { fr: "Un repo tapé à la main est vérifié en réel sur GitHub. Castor cartographie les fichiers et branche la preview.", en: "A repo typed by hand is really verified on GitHub. Castor maps the files and wires up the preview." },
  cs_repo_placeholder: { fr: "owner/repo — ex : dmzgamingyt/castor", en: "owner/repo — e.g. dmzgamingyt/castor" },
  cs_repo_aria: { fr: "Nom du repo GitHub (owner/repo)", en: "GitHub repo name (owner/repo)" },
  cs_checking: { fr: "Vérification…", en: "Checking…" },
  cs_connect: { fr: "Connecter", en: "Connect" },
  cs_checking_repo: { fr: "Vérification de {repo} sur GitHub…", en: "Checking {repo} on GitHub…" },
  cs_demo_hint: { fr: "Les démos restent simulées — un repo tapé à la main est vérifié en réel via l'API publique GitHub.", en: "Demos stay simulated — a repo typed by hand is really verified via the public GitHub API." },
  cs_err_empty: { fr: "Entre un repo au format owner/repo, ou choisis une démo.", en: "Enter a repo as owner/repo, or pick a demo." },
  cs_err_format: { fr: "Format attendu : owner/repo (ex : acme/storefront).", en: "Expected format: owner/repo (e.g. acme/storefront)." },
  cs_err_notfound: { fr: "Repo introuvable sur GitHub. Vérifie l'orthographe (owner/repo) ou choisis une démo.", en: "Repo not found on GitHub. Check the spelling (owner/repo) or pick a demo." },
  cs_err_rate: { fr: "Limite de l'API GitHub atteinte (60 req/h sans clé). Reviens dans un moment ou choisis une démo.", en: "GitHub API rate limit reached (60 req/h without a key). Come back later or pick a demo." },
  cs_err_gh: { fr: "GitHub indisponible ({msg}) — choisis une démo.", en: "GitHub unavailable ({msg}) — pick a demo." },

  cs_plan_badge: { fr: "Planifier un projet · BETA", en: "Plan a project · BETA" },
  cs_h1_idea_a: { fr: "Décris ton", en: "Describe your" },
  cs_h1_idea_b: { fr: "idée.", en: "idea." },
  cs_plan_sub: { fr: "Castor planifie la stack et les étapes avant d'écrire la moindre ligne.", en: "Castor plans the stack and the steps before writing a single line." },
  cs_prompt_placeholder: { fr: "ex : un tracker d'habitudes avec streak", en: "e.g. a habit tracker with streaks" },
  cs_idea_aria: { fr: "Décris ton idée de projet", en: "Describe your project idea" },
  cs_empty_models: { fr: "Gratuits OpenRouter indisponibles — gabarits locaux.", en: "OpenRouter free models unavailable — local templates." },
  cs_loading: { fr: "Chargement…", en: "Loading…" },
  cs_key_title: { fr: "Clé OpenRouter — requise même pour les modèles gratuits", en: "OpenRouter key — required even for free models" },
  cs_key_ok: { fr: "clé ✓", en: "key ✓" },
  cs_key_ask: { fr: "clé ?", en: "key ?" },
  cs_key_placeholder: { fr: "sk-or-v1-… (reste dans ton navigateur)", en: "sk-or-v1-… (stays in your browser)" },
  cs_key_aria: { fr: "Clé API OpenRouter", en: "OpenRouter API key" },
  cs_save: { fr: "Enregistrer", en: "Save" },
  cs_clear: { fr: "Effacer", en: "Clear" },
  cs_plan_btn: { fr: "Planifier →", en: "Plan →" },
  cs_hint_ai: { fr: "IA prête — {model} générera le code.", en: "AI ready — {model} will generate the code." },
  cs_hint_nokey: { fr: "Sans clé : gabarits locaux instantanés. Avec une clé OpenRouter gratuite : génération sur mesure.", en: "Without a key: instant local templates. With a free OpenRouter key: custom generation." },
  cs_plan_head: { fr: "Plan du chantier —", en: "Project plan —" },
  cs_stack: { fr: "Stack", en: "Stack" },
  cs_files: { fr: "Fichiers", en: "Files" },
  cs_steps: { fr: "Étapes", en: "Steps" },
  cs_edit: { fr: "Modifier", en: "Edit" },
  cs_thinking: { fr: "L'agent réfléchit…", en: "The agent is thinking…" },
  cs_launch: { fr: "Lancer la construction →", en: "Start building →" },
  cs_launch_model: { fr: "Lancer la construction ({model}) →", en: "Start building with {model} →" },

  cs_back: { fr: "← Espace Cloud", en: "← Cloud Space" },
  cs_sandbox_badge: { fr: "Sandbox · {repo}", en: "Sandbox · {repo}" },
  cs_new_aria: { fr: "Nouveau chantier", en: "New project" },
  cs_tree_aria: { fr: "Arborescence du chantier", en: "Project tree" },
  cs_close: { fr: "Fermer", en: "Close" },
  cs_tabs_aria: { fr: "Vues du sandbox", en: "Sandbox views" },
  cs_wait_map: { fr: "Le castor cartographie…", en: "Castor is mapping…" },
  cs_wait_build: { fr: "Le castor construit…", en: "Castor is building…" },
  cs_retry_msg: { fr: "La génération a échoué — veuillez réessayer.", en: "Generation failed — please try again." },
  cs_retry: { fr: "Réessayer ↻", en: "Retry ↻" },
  cs_steps_explorer: { fr: "Explorateur", en: "Explorer" },
  cs_steps_agent: { fr: "Agent", en: "Agent" },
  cs_steps_aria: { fr: "Avancement", en: "Progress" },
  cs_done: { fr: "Fait · prêt à exporter · 0 € facturés", en: "Done · ready to export · 0 € billed" },
  cs_price: { fr: "0 € facturés", en: "0 € billed" },
  cs_price_model: { fr: "0 € facturés · {model}", en: "0 € billed · {model}" },
  cs_copied: { fr: "copié ✓", en: "copied ✓" },
  cs_copy_code: { fr: "Copier le code", en: "Copy code" },
  cs_share: { fr: "Partager 🔗", en: "Share 🔗" },
  cs_share_title: { fr: "Copier le lien de preview", en: "Copy the preview link" },
  cs_deploy: { fr: "Deploy 🚀", en: "Deploy 🚀" },
  cs_deploy_title: { fr: "Déployer sur Netlify (gratuit)", en: "Deploy on Netlify (free)" },
  cs_download: { fr: "Télécharger .html ⬇", en: "Download .html ⬇" },
  cs_hint_github: { fr: "Repo réel vérifié via l'API GitHub — preview du README (ou de index.html).", en: "Real repo verified via the GitHub API — README (or index.html) preview." },
  cs_hint_gen: { fr: "Généré par {model} — repli gabarits locaux si l'IA échoue.", en: "Generated by {model} — falls back to local templates if the AI fails." },
  cs_hint_demo: { fr: "Démo simulée — tape un vrai repo owner/repo pour le vérifier sur GitHub.", en: "Simulated demo — type a real owner/repo to verify it on GitHub." },
  cs_hint_local: { fr: "Projet généré par le gabarit local — aucune clé, aucun coût.", en: "Project generated by the local template — no key, no cost." },
  cs_log_connect: { fr: "$ castor cloud connect {repo}", en: "$ castor cloud connect {repo}" },
  cs_log_repo_ok: { fr: "✓ repo réel vérifié — {stars} ⭐ · branche {branch}", en: "✓ real repo verified — {stars} ⭐ · branch {branch}" },
  cs_log_files: { fr: "✓ {count} fichiers cartographiés", en: "✓ {count} files mapped" },
  cs_log_readme: { fr: "✓ README analysé", en: "✓ README analyzed" },
  cs_log_struct: { fr: "✓ structure lue", en: "✓ structure read" },
  cs_log_preview: { fr: "✓ preview branchée", en: "✓ preview wired" },
  cs_log_clone: { fr: "✓ clone ok — 14 fichiers · branche castor/feat-{slug}", en: "✓ clone ok — 14 files · branch castor/feat-{slug}" },
  cs_log_or: { fr: "✓ appel OpenRouter · {model}", en: "✓ OpenRouter call · {model}" },
  cs_log_npm_install: { fr: "$ npm install", en: "$ npm install" },
  cs_log_pkgs: { fr: "✓ 186 paquets en 2.1 s", en: "✓ 186 packages in 2.1 s" },
  cs_log_dev: { fr: "$ npm run dev", en: "$ npm run dev" },
  cs_log_server: { fr: "✓ dev server prêt — preview live sur :5173", en: "✓ dev server ready — live preview on :5173" },
  cs_log_done: { fr: "✓ chantier terminé — 0 € facturés", en: "✓ project done — 0 € billed" },

  cs_step_0: { fr: "carte du chantier lue", en: "project card read" },
  cs_step_1: { fr: "structure générée", en: "structure generated" },
  cs_step_2: { fr: "styles appliqués", en: "styles applied" },
  cs_step_3: { fr: "contenu monté", en: "content assembled" },
  cs_step_4: { fr: "tests passés", en: "tests passed" },
  cs_gstep_0: { fr: "repo vérifié", en: "repo verified" },
  cs_gstep_1: { fr: "fichiers cartographiés", en: "files mapped" },
  cs_gstep_2: { fr: "README analysé", en: "README analyzed" },
  cs_gstep_3: { fr: "preview branchée", en: "preview wired" },
  cs_gstep_4: { fr: "chantier prêt", en: "project ready" },
  cs_gh_no_readme: { fr: "structure lue", en: "structure read" },
  cs_local_template: { fr: "Gabarit Castor local", en: "Local Castor template" },
  cs_ia_model: { fr: "IA · {model}", en: "AI · {model}" },
  cs_plan_prompt: { fr: "le site du projet {name}", en: "the website of the {name} project" },

  cs_demo_p0: { fr: "une landing page moderne pour une boutique", en: "a modern landing page for a store" },
  cs_demo_p1: { fr: "un blog de recettes végé de saison", en: "a seasonal vegan recipes blog" },
  cs_demo_p2: { fr: "une app de notes minimaliste", en: "a minimalist notes app" },
  cs_demo_p3: { fr: "le portfolio d'un illustrateur", en: "an illustrator's portfolio" },
  cs_demo_p4: { fr: "un tableau de bord météo minimaliste", en: "a minimalist weather dashboard" },
  cs_demo_p5: { fr: "un quiz de révision sur les planètes", en: "a planet revision quiz" },
  cs_chip_0: { fr: "un tracker d'habitudes avec streak", en: "a habit tracker with streaks" },
  cs_chip_1: { fr: "le portfolio d'un photographe animalier", en: "a wildlife photographer's portfolio" },
  cs_chip_2: { fr: "un quiz de révision sur les planètes", en: "a planet revision quiz" },
  cs_chip_3: { fr: "un blog de recettes végé de saison", en: "a seasonal vegan recipes blog" },
  steps_typed_prompt: { fr: "un blog de recettes végé", en: "a vegan recipes blog" },
  steps_done_sub: { fr: "Le blog de recettes végé est prêt à exporter.", en: "The vegan recipes blog is ready to export." },

  /* DownloadCompare / DownloadModal */
  dlc_badge: { fr: "Téléchargement gratuit", en: "Free download" },
  dlc_heading: { fr: "Disponible sur toutes tes machines", en: "Available on all your machines" },
  dlc_sub: { fr: "Un seul castor, trois habitats. Choisis le tien.", en: "One castor, three habitats. Pick yours." },
  dlc_your_os: { fr: "Ton OS ✓", en: "Your OS ✓" },
  dlc_now: { fr: "Télécharger maintenant", en: "Download now" },
  dlc_note: { fr: "Gratuit · Open source · Multi-providers", en: "Free · Open source · Multi-providers" },
  dlc_new_badge: { fr: "Nouveautés v0.3.0", en: "What's new in v0.3.0" },
  dlc_nf0_t: { fr: "Agents planifiés", en: "Scheduled agents" },
  dlc_nf0_d: { fr: "Programme des agents pour qu'ils travaillent la nuit.", en: "Schedule agents to work through the night." },
  dlc_nf1_t: { fr: "Diff côte à côte", en: "Side-by-side diff" },
  dlc_nf1_d: { fr: "Compare avant/après, valide hunk par hunk.", en: "Compare before/after, approve hunk by hunk." },
  dlc_nf2_t: { fr: "Assistant IA embarqué", en: "Built-in AI assistant" },
  dlc_nf2_d: { fr: "Castor Bot 24/7 dans l'app.", en: "Castor Bot 24/7 in the app." },
  dlc_nf3_t: { fr: "Sync multi-postes", en: "Multi-machine sync" },
  dlc_nf3_d: { fr: "Export/import entre machines.", en: "Export/import between machines." },
  dlc_nf4_t: { fr: "Serveurs MCP", en: "MCP servers" },
  dlc_nf4_d: { fr: "Branche des outils externes à tes agents.", en: "Wire external tools to your agents." },
  dlc_nf5_t: { fr: "Thèmes personnalisables", en: "Customizable themes" },
  dlc_nf5_d: { fr: "Couleur d'accent libre.", en: "Free accent color." },

  dlm_aria: { fr: "Télécharger Castor", en: "Download Castor" },
  dlm_close: { fr: "Fermer", en: "Close" },
  dlm_title: { fr: "Télécharger Castor Desktop", en: "Download Castor Desktop" },
  dlm_detected: { fr: "Ton OS est détecté — un clic et c'est parti.", en: "Your OS was detected — one click and you're in." },
  dlm_ios: { fr: "Castor Desktop n'existe pas sur iOS — ouvre-le depuis Safari sur Mac.", en: "Castor Desktop doesn't exist on iOS — open it from Safari on a Mac." },
  dlm_choose: { fr: "Choisis ton habitat :", en: "Pick your habitat:" },
  dlm_started: { fr: "Téléchargement lancé", en: "Download started" },
  dlm_uninstall: { fr: "Pour désinstaller plus tard :", en: "To uninstall later:" },
  dlm_un_mac: { fr: "scripts/uninstall-macos.sh du dépôt", en: "scripts/uninstall-macos.sh from the repo" },
  dlm_un_win: { fr: "Paramètres → Applications → « Castor Desktop » → Désinstaller", en: "Settings → Apps → “Castor Desktop” → Uninstall" },
  dlm_un_linux: { fr: "sudo apt remove castor-desktop (deb) — ou supprime l'AppImage + ~/.config/castor-desktop", en: "sudo apt remove castor-desktop (deb) — or delete the AppImage + ~/.config/castor-desktop" },

  /* plateformes (features + install) */
  pf_mac_f0: { fr: "Glisser-déposer dans Applications", en: "Drag-and-drop into Applications" },
  pf_mac_f1: { fr: "Clés API chiffrées via Keychain", en: "API keys encrypted via Keychain" },
  pf_mac_f2: { fr: "Notifications natives", en: "Native notifications" },
  pf_mac_f3: { fr: "Menubar intégrée", en: "Built-in menubar" },
  pf_mac_install: { fr: "Ouvre le .dmg → glisse Castor.app", en: "Open the .dmg → drag Castor.app" },
  pf_win_f0: { fr: "Installateur avec raccourci bureau", en: "Installer with desktop shortcut" },
  pf_win_f1: { fr: "Clés API chiffrées via DPAPI", en: "API keys encrypted via DPAPI" },
  pf_win_f2: { fr: "Menu démarrer intégré", en: "Built-in Start menu" },
  pf_win_f3: { fr: "Mise à jour auto", en: "Automatic updates" },
  pf_win_install: { fr: "Lance l'installateur → terminé", en: "Run the installer → done" },
  pf_linux_f0: { fr: "Paquet .deb ou AppImage", en: ".deb package or AppImage" },
  pf_linux_f1: { fr: "Clés API chiffrées via libsecret", en: "API keys encrypted via libsecret" },
  pf_linux_f2: { fr: "Zéro dépendance système", en: "Zero system dependencies" },
  pf_linux_f3: { fr: "Léger et rapide", en: "Light and fast" },
  pf_linux_install: { fr: "sudo apt install ./Castor.deb", en: "sudo apt install ./Castor.deb" },

  /* CastorBot widget */
  bot_aria: { fr: "Castor Bot — assistant 24/7", en: "Castor Bot — 24/7 assistant" },
  bot_name: { fr: "Castor Bot", en: "Castor Bot" },
  bot_online: { fr: "En ligne · 24/7", en: "Online · 24/7" },
  bot_switch_title: { fr: "Basculer entre mode local et mode IA (OpenRouter)", en: "Switch between local mode and AI mode (OpenRouter)" },
  bot_switch_nokey: { fr: "Ajoute ta clé OpenRouter dans le Castor Bot pour activer l'IA", en: "Add your OpenRouter key in the Castor Bot to enable AI" },
  bot_close: { fr: "Fermer l'assistant", en: "Close the assistant" },
  bot_hint: { fr: "💡 Colle ta clé OpenRouter gratuite ici pour débloquer le mode IA.", en: "💡 Paste your free OpenRouter key here to unlock AI mode." },
  bot_typing: { fr: "Castor Bot écrit", en: "Castor Bot is typing" },
  bot_placeholder: { fr: "Pose ta question…", en: "Ask your question…" },
  bot_msg_aria: { fr: "Message pour Castor Bot", en: "Message for Castor Bot" },
  bot_send: { fr: "Envoyer", en: "Send" },
  bot_bubble: { fr: "Ouvrir Castor Bot — assistant 24/7", en: "Open Castor Bot — 24/7 assistant" },

  /* DamScene (démo hero) */
  dam_s0: { fr: "un blog de recettes végé", en: "a vegan recipes blog" },
  dam_s1: { fr: "une app de notes minimaliste", en: "a minimalist notes app" },
  dam_s2: { fr: "le portfolio d'un illustrateur", en: "an illustrator's portfolio" },
  dam_l0: { fr: "✔ carte du chantier lue", en: "✔ project card read" },
  dam_l1: { fr: "✔ structure générée", en: "✔ structure generated" },
  dam_l2: { fr: "✔ styles appliqués", en: "✔ styles applied" },
  dam_l3: { fr: "✔ tests passés", en: "✔ tests passed" },
  dam_placeholder: { fr: "Décris ton chantier…", en: "Describe your project…" },
  dam_aria: { fr: "Décris ton chantier", en: "Describe your project" },
  dam_new: { fr: "Nouveau chantier ↺", en: "New project ↺" },
  dam_working: { fr: "Chantier en cours…", en: "Project in progress…" },
  dam_build: { fr: "Construire ⚒️", en: "Build ⚒️" },
  dam_under_construction: { fr: "en construction…", en: "under construction…" },
  dam_done: { fr: "Fait · prêt à exporter · ", en: "Done · ready to export · " },
  dam_billed: { fr: "0 € facturés", en: "0 € billed" },

  /* StepsMockup build log */
  sm_log1: { fr: "> Structure index.html...", en: "> Structure index.html..." },
  sm_log2: { fr: "> Styles.css appliqués...", en: "> styles.css applied..." },
  sm_log3: { fr: "> Composants montés...", en: "> Components mounted..." },
  sm_log4: { fr: "> Tests passés ✔", en: "> Tests passed ✔" },

  /* CastorBot KB */
  kb_delivered_empty: { fr: "Aucun chantier livré pour l'instant.", en: "No project delivered yet." },
  kb_delivered_intro: { fr: "Voici ce qui est **déjà livré** chez Castor ✅", en: "Here's what's **already shipped** at Castor ✅" },
  kb_roadmap_intro: { fr: "Voici les chantiers en cours chez Castor 🔨", en: "Here are the projects in progress at Castor 🔨" },
  kb_roadmap_hint: { fr: "Demande-moi **app**, **site** ou **modèles** pour le détail — ou explore la section « Avancement » du site !", en: "Ask me **app**, **site** or **models** for details — or explore the **Progress** section on the site!" },
  kb_download: { fr: "📥 **C'est par ici :**", en: "📥 **Right here:**" },
  kb_download_hint: { fr: "Sur la page **Desktop** tu trouveras les 3 installateurs avec la détection de ton OS.", en: "On the **Desktop** page you'll find the 3 installers with OS detection." },
  kb_price: { fr: "💰 **0 €, pour toujours.**", en: "💰 **0 €, forever.**" },
  kb_price_desc: { fr: "Open source (MIT), sans compte, sans limite. Les studios passent par le tier gratuit d'OpenRouter avec ta propre clé — aucun serveur à financer, donc aucun abonnement.", en: "Open source (MIT), no account, no limit. The studios use OpenRouter's free tier with your own key — no server to fund, so no subscription." },
  kb_providers: { fr: "🔌 **Branche le cerveau que tu veux :**", en: "🔌 **Plug in the brain you want:**" },
  kb_providers_desc: { fr: "• **OpenRouter** — des dizaines de modèles gratuits\n• **Groq** — inférence ultra-rapide\n• **Ollama / LM Studio** — 100% local, même hors ligne\n• **OpenCode Zen** — spécialisé code\n\nTa clé se crée en 30 s sur openrouter.ai et reste dans ton navigateur.", en: "• **OpenRouter** — dozens of free models\n• **Groq** — ultra-fast inference\n• **Ollama / LM Studio** — 100% local, even offline\n• **OpenCode Zen** — code-specialized\n\nYour key takes 30s on openrouter.ai and stays in your browser." },
  kb_privacy: { fr: "🔒 **Zéro collecte.**", en: "🔒 **Zero collection.**" },
  kb_privacy_desc: { fr: "Conversations et projets : localStorage uniquement. Pas de serveur, pas de pub, pas de revente.", en: "Conversations and projects: localStorage only. No server, no ads, no resale." },
  kb_chat: { fr: "Pose ta question ici même — je suis le chat intégré du site !", en: "Ask your question right here — I'm the site's built-in chat!" },
  kb_cloud: { fr: "Tu peux suivre l'avancement sur GitHub — lien en bas de page !", en: "You can follow the progress on GitHub — link at the bottom!" },
  kb_greeting: { fr: "🦫 Salut ! Je suis **Castor Bot** — en ligne 24/7.\n\nJe connais les **choses à venir** de Castor sur le bout des pattes. Que veux-tu savoir ?", en: "🦫 Hey! I'm **Castor Bot** — online 24/7.\n\nI know Castor's **upcoming features** inside out. What would you like to know?" },
  kb_thanks: { fr: "🦫 Avec plaisir ! Je reste ici 24/7 — bon chantier ! ⚒️", en: "🦫 Happy to help! I'm here 24/7 — happy building! ⚒️" },
  kb_who: { fr: "🦫 Je suis **Castor Bot** — un script local (et un LLM si tu branches ta clé OpenRouter). Je connais la roadmap par cœur et je ne quitte jamais le chantier : **24/7, même hors ligne**.", en: "🦫 I'm **Castor Bot** — a local script (and an LLM if you plug in your OpenRouter key). I know the roadmap by heart and never leave the project: **24/7, even offline**." },
  kb_fallback: { fr: "🦫 Celle-là n'est pas dans ma tête de castor.\n\nEssaie une suggestion — ou active le **mode IA** pour une vraie conversation !", en: "🦫 That one's not in my beaver brain.\n\nTry a suggestion — or enable **AI mode** for a real conversation!" },
  kb_welcome: { fr: "🦫 Salut ! **Castor Bot** à ton service.\n\nJe te garde au courant des **choses à venir** : app, site, modèles. Clique sur une suggestion 👇", en: "🦫 Hey! **Castor Bot** at your service.\n\nI'll keep you updated on **upcoming features**: app, site, models. Click a suggestion 👇" },
  kb_ai_error: { fr: "⚠️ Modèle indisponible — je repasse en mode local.\n\n", en: "⚠️ Model unavailable — switching back to local mode.\n\n" },
  kb_status_done: { fr: "livré", en: "shipped" },
  kb_status_wip: { fr: "en cours", en: "in progress" },
  kb_status_soon: { fr: "bientôt", en: "soon" },
  kb_status_explore: { fr: "exploration", en: "exploring" },

  /* useHistoryRoute page titles */
  title_home: { fr: "Castor — le castor qui code pour toi", en: "Castor — the beaver that codes for you" },
  title_cli: { fr: "CLI en ligne — Castor", en: "Online CLI — Castor" },
  title_templates: { fr: "Templates de projets — Castor", en: "Project templates — Castor" },
  title_desktop: { fr: "Castor Desktop — l'agent de code — Castor", en: "Castor Desktop — the coding agent — Castor" },
  title_espace: { fr: "Espace Cloud — le sandbox cloud — Castor", en: "Cloud Space — the cloud sandbox — Castor" },
  title_cloud: { fr: "Castor Cloud — l'IDE cloud — Castor", en: "Castor Cloud — the cloud IDE — Castor" },
  title_avancement: { fr: "Avancement du projet — Castor", en: "Project progress — Castor" },

  /* ModelSelect */
  ms_empty: { fr: "Modèles indisponibles.", en: "Models unavailable." },
  ms_loading: { fr: "Chargement…", en: "Loading…" },
  ms_choose: { fr: "Choisir un modèle…", en: "Pick a model…" },
  ms_aria_choose: { fr: "Choisir un modèle", en: "Pick a model" },
  ms_aria_list: { fr: "Modèles gratuits", en: "Free models" },

  /* WebStudio aria-labels */
  ws_aria_describe: { fr: "Décris l'app à construire", en: "Describe the app to build" },
  ws_aria_key: { fr: "Clé API OpenRouter", en: "OpenRouter API key" },
  ws_title_theme: { fr: "Thème du site généré", en: "Generated site theme" },
  ws_title_key: { fr: "Clé OpenRouter — requise même pour les modèles gratuits", en: "OpenRouter key — required even for free models" },
  ws_flash_duplicate: { fr: "Un projet au même nom existait — il a été remplacé", en: "A project with the same name existed — it was replaced" },
  ws_aria_build: { fr: "Construire", en: "Build" },

  /* Header */
  nav_aria: { fr: "Navigation principale", en: "Main navigation" },
  discord_title: { fr: "Rejoindre le Discord Castor", en: "Join the Castor Discord" },
  lang_aria: { fr: "Changer de langue", en: "Switch language" },
  lang_switch_to_en: { fr: "Passer en anglais", en: "Switch to English" },
  lang_switch_to_fr: { fr: "Passer en français", en: "Switch to French" },
  github_title: { fr: "Voir le code source sur GitHub", en: "View source code on GitHub" },
  menu_open: { fr: "Ouvrir le menu", en: "Open menu" },
  menu_close: { fr: "Fermer le menu", en: "Close menu" },

  /* App loading */
  loading_page: { fr: "Chargement de la page", en: "Loading page" },

  /* Mockups decorative */
  mk_cli_cmd: { fr: "ajoute du rate limiting sur /checkout", en: "add rate limiting on /checkout" },
  mk_cli_l1: { fr: "Lit 34 fichiers · mappe les routes API", en: "Reads 34 files · maps the API routes" },
  mk_cli_l2: { fr: "Écrit src/middleware/rateLimit.ts", en: "Writes src/middleware/rateLimit.ts" },
  mk_cli_l3: { fr: "Tests : 18 passés, 0 échoué", en: "Tests: 18 passed, 0 failed" },
  mk_cli_done: { fr: "Fait · 3 fichiers ·", en: "Done · 3 files ·" },
  mk_web_prompt: { fr: "un site de recettes végé avec recherche", en: "a vegan recipes site with search" },
  mk_web_btn: { fr: "Construire", en: "Build" },
  mk_cloud_status: { fr: "sandbox · dev server sur :3000", en: "sandbox · dev server on :3000" },
  mk_chat_q: { fr: "Pourquoi mon useEffect tourne deux fois ?", en: "Why does my useEffect run twice?" },
  mk_chat_a: { fr: "En mode strict, React monte volontairement tes composants deux fois en dev…", en: "In strict mode, React intentionally mounts your components twice in dev…" },

  /* CastorBot — product notes & site hints (used in KB replies) */
  bot_note_desktop: { fr: "Castor Desktop — agents parallèles sur ta machine, multi-providers (OpenRouter, Groq, OpenCode Zen, Ollama, LM Studio), clés chiffrées via safeStorage. Gratuit, open source.", en: "Castor Desktop — parallel agents on your machine, multi-providers (OpenRouter, Groq, OpenCode Zen, Ollama, LM Studio), encrypted keys via safeStorage. Free, open source." },
  bot_note_web: { fr: "Castor Web — studio de génération de sites dans le navigateur : prompt → aperçu instantané → export HTML autonome.", en: "Castor Web — browser-based site generator: prompt → instant preview → standalone HTML export." },
  bot_note_cloud: { fr: "Castor Cloud — en développement : IDE cloud complet branché sur GitHub, sandbox réel, preview intégrée.", en: "Castor Cloud — in development: full cloud IDE wired to GitHub, real sandbox, built-in preview." },
  bot_note_chat: { fr: "Castor Bot — le chat IA gratuit intégré au site : recherche web, mode réflexion et fichiers joints.", en: "Castor Bot — the free AI chat built into the site: web search, thinking mode and file attachments." },
  bot_note_cli: { fr: "Castor CLI — l'agent en ligne de commande, conscient du repo, avec diffs lisibles.", en: "Castor CLI — the command-line coding agent, repo-aware, with readable diffs." },
  bot_hint_models: { fr: "Les modèles gratuits du moment (OpenRouter, Groq, OpenCode Zen…) se choisissent directement dans Castor Desktop ou via le Castor Bot.", en: "Free models today (OpenRouter, Groq, OpenCode Zen…) are picked directly in Castor Desktop or via the Castor Bot." },
  bot_hint_install: { fr: "Téléchargement sur la page Desktop ou via la bulle 📥 de l'accueil. Installateurs macOS (Apple Silicon/Intel), Windows (x64/ARM) et Linux (.deb/AppImage).", en: "Download from the Desktop page or via the 📥 bubble on the home page. Installers for macOS (Apple Silicon/Intel), Windows (x64/ARM) and Linux (.deb/AppImage)." },
  bot_hint_privacy: { fr: "Aucune donnée collectée : tout tourne dans ton navigateur ou ta machine. Ta clé API ne quitte jamais ton appareil.", en: "No data collected: everything runs in your browser or on your machine. Your API key never leaves your device." },
  bot_system_fr: { fr: "Tu es Castor Bot, l'assistant discret du site de Castor (agent de code gratuit, open source MIT, par DmzGamingYT). Réponds en français, amical et concis (max 120 mots). Tu connais la roadmap officielle — présente-la comme les chantiers à venir, sans jamais promettre de dates précises. Téléchargement : page Desktop du site, gratuit pour toujours, sans compte.", en: "You are Castor Bot, the helpful assistant on the Castor website (free coding agent, open source MIT, by DmzGamingYT). Respond in English, friendly and concise (max 120 words). You know the official roadmap — present it as upcoming projects, never promise exact dates. Download: Desktop page on the site, free forever, no account needed." },
};

/* lookup direct : t(key, lang) — sans store global, utilisé par le contexte */
export function t(key, lang) {
  const entry = dict[key];
  if (!entry) return key;
  return entry[lang] || entry.fr;
}
