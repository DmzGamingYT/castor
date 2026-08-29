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
};

/* lookup direct : t(key, lang) — sans store global, utilisé par le contexte */
export function t(key, lang) {
  const entry = dict[key];
  if (!entry) return key;
  return entry[lang] || entry.fr;
}
