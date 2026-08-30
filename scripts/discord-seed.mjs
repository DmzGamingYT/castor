#!/usr/bin/env node
// discord-seed.mjs — Populate all Castor Discord channels with rich visual content
// Usage:
//   export DISCORD_TOKEN=your_token_here
//   node scripts/discord-seed.mjs

import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

const SERVER_NAME = "Castor (Projet)";
const GITHUB_URL = "https://github.com/DmzGamingYT/castor";
const SITE_URL = "https://dmzgamingyt.github.io/castor/";
const DISCORD_INVITE = "https://discord.gg/9J5xmp8fz";

/* ------------------------------------------------------------------ */
/*  Visual Helpers                                                     */
/* ------------------------------------------------------------------ */

function progressBar(ratio, size = 10) {
  const filled = Math.round(ratio * size);
  const empty = size - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

function statusDot(status) {
  return status === "done" ? "🟢" : status === "wip" ? "🟡" : "🔴";
}

function tag(text, color) {
  const colors = {
    green: "`✅`", yellow: "`⏳`", red: "`❌`", blue: "`🔵`", gray: "`⚪`",
    new: "`🆕`", hot: "`🔥`", star: "`⭐`", lock: "`🔒`", clock: "`🕐`",
  };
  return `${colors[color] || ""} ${text}`;
}

/* ------------------------------------------------------------------ */
/*  Channel Content                                                    */
/* ------------------------------------------------------------------ */

function bienvenueContent() {
  return [
    {
      embeds: [
        new EmbedBuilder()
          .setColor(0xD97706)
          .setTitle("🦫 ━━━ Règles du serveur ━━━ 🦫")
          .setDescription(
            "Bienvenue sur **Castor (Projet)** — le castor qui code pour toi !\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          )
          .addFields(
            {
              name: "━━━━━━ 📜 Règles ━━━━━━",
              value:
                "```diff\n" +
                "+ 1. Respect mutuel\n" +
                "+ 2. Utilise les bons channels\n" +
                "+ 3. Pas de spam\n" +
                "+ 4. Contenu approprié\n" +
                "+ 5. Confidentialité\n" +
                "+ 6. En cas de doute → #aide\n" +
                "```",
            },
            {
              name: "🗺️ Navigation",
              value:
                "```" +
                "📋 Règles          ← ICI\n" +
                "💬 Discussion       #général\n" +
                "🐛 Bugs             #bugs\n" +
                "💡 Features         #features\n" +
                "🤝 Aide             #aide\n" +
                "```",
            }
          )
          .setFooter({ text: "En rejoignant le serveur, tu acceptes ces règles 🦫" })
          .setTimestamp(),
      ],
    },
  ];
}

function annoncesContent() {
  return [
    {
      embeds: [
        new EmbedBuilder()
          .setColor(0x3B82F6)
          .setTitle("📢 ━━━ Annonces ━━━ 📢")
          .setDescription(
            "Ici tu trouveras toutes les **annonces officielles** du projet.\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          )
          .addFields(
            {
              name: "🔔 Notification",
              value: [
                "```",
                "  🔔 → Toutes les notifications",
                "  🔕 → Désactivé",
                "  ⏰ → IMPORTANT uniquement",
                "```",
                "*> Clique sur 🔔 en haut du channel pour configurer*",
              ].join("\n"),
            },
            {
              name: "📌 Types d'annonces",
              value:
                "```" +
                "🚀 Nouvelles versions\n" +
                "🎨 Features majeures\n" +
                "🔧 Maintenance planifiée\n" +
                "📋 Votes communautaires\n" +
                "🎉 Événements spéciaux\n" +
                "```",
            }
          )
          .setFooter({ text: "Active les notifications pour ne rien rater 🔔" })
          .setTimestamp(),
      ],
    },
  ];
}

function changelogContent() {
  return [
    {
      embeds: [
        new EmbedBuilder()
          .setColor(0x10B981)
          .setTitle("📋 ━━━ Changelog ━━━ 📋")
          .setDescription(
            "Dernières mises à jour du projet Castor.\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          )
          .addFields(
            {
              name: "🟢 v0.3.0 — Dernière release",
              value:
                "```" +
                "  ✅ CLI page redesign (two-column)\n" +
                "  ✅ Avancement page redesign\n" +
                "  ✅ i18n EN/FR complet\n" +
                "  ✅ Castor Bot IA bilingue\n" +
                "  ✅ Bot Discord (tickets + slash)\n" +
                "```",
            },
            {
              name: "📊 Statistiques",
              value:
                "```" +
                `  📦 Commits    : 72+\n` +
                `  ✅ Tests       : 40/40\n` +
                `  🔧 Workflows   : 72 OK\n` +
                `  🌐 Pages       : 5 routes\n` +
                "```",
            },
            {
              name: "📈 Progression",
              value:
                `  Site web    ${progressBar(1.0, 10)} 100%\n` +
                `  Desktop     ${progressBar(0.85, 10)} 85%\n` +
                `  CLI         ${progressBar(0.9, 10)} 90%\n` +
                `  Bot Discord ${progressBar(0.7, 10)} 70%\n` +
                `  Cloud       ${progressBar(0.3, 10)} 30%`,
            }
          )
          .setFooter({ text: "Dernière mise à jour" })
          .setTimestamp(),
      ],
    },
  ];
}

function generalContent() {
  return [
    {
      embeds: [
        new EmbedBuilder()
          .setColor(0xD97706)
          .setTitle("💬 ━━━ Général ━━━ 💬")
          .setDescription(
            "Le salon de discussion principal.\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          )
          .addFields(
            {
              name: "🦫 De quoi parler ici ?",
              value:
                "```" +
                "  💬 Discussion libre sur Castor\n" +
                "  💻 Partage de projets\n" +
                "  🧠 Astuces coding\n" +
                "  🎉 Off-topic (respectueux)\n" +
                "```",
            },
            {
              name: "📍 Channels utiles",
              value:
                "```" +
                "  #bugs        → Signaler un bug\n" +
                "  #features    → Suggérer une feature\n" +
                "  #aide        → Demander de l'aide\n" +
                "  #dev-talk    → Discussion technique\n" +
                "```",
            }
          )
          .setFooter({ text: SERVER_NAME })
          .setTimestamp(),
      ],
    },
  ];
}

function presentationsContent() {
  return [
    {
      embeds: [
        new EmbedBuilder()
          .setColor(0xA855F7)
          .setTitle("👋 ━━━ Présente-toi ! ━━━ 👋")
          .setDescription(
            "Nouveau sur le serveur ? **Présente-toi** ici !\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          )
          .addFields(
            {
              name: "📝 Modèle de présentation",
              value:
                "```" +
                "👋 Nom / Pseudo :\n" +
                "💻 Stack / Technologies :\n" +
                "🦫 Pourquoi Castor :\n" +
                "🔗 GitHub / Portfolio :\n" +
                "```",
            },
            {
              name: "🌟 Exemple",
              value:
                "```" +
                "👋 Je m'appelle Alex\n" +
                "💻 React, Node.js, TypeScript\n" +
                "🦫 Je veux contribuer au CLI\n" +
                "🔗 github.com/alex-dev\n" +
                "```",
            }
          )
          .setFooter({ text: "On est ravis de te rencontrer ! 🎉" })
          .setTimestamp(),
      ],
    },
  ];
}

function offTopicContent() {
  return [
    {
      embeds: [
        new EmbedBuilder()
          .setColor(0x6B7280)
          .setTitle("🎉 ━━━ Off-topic ━━━ 🎉")
          .setDescription(
            "Parle de tout et de rien !\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          )
          .addFields(
            {
              name: "🎮 Sujets autorisés",
              value:
                "```" +
                "  🤖 Memes & Humour\n" +
                "  🎮 Jeux vidéo\n" +
                "  🎵 Musique\n" +
                "  📰 Actualité tech\n" +
                "  🍕 Life & Food\n" +
                "```",
            },
            {
              name: "⚠️ Rappel",
              value:
                "```" +
                "  ✅ Reste respectueux\n" +
                "  ❌ Pas de NSFW\n" +
                "  ❌ Pas de politique\n" +
                "```",
            }
          )
          .setFooter({ text: "Amuse-toi bien ! 🎉" })
          .setTimestamp(),
      ],
    },
  ];
}

function bugsContent() {
  return [
    {
      embeds: [
        new EmbedBuilder()
          .setColor(0xEF4444)
          .setTitle("🐛 ━━━ Signaler un bug ━━━ 🐛")
          .setDescription(
            "Trouvé un bug ? **Signale-le ici !**\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          )
          .addFields(
            {
              name: "📋 Modèle de rapport",
              value:
                "```" +
                "🐛 Titre du bug :\n" +
                "📝 Description :\n" +
                "🔄 Étapes pour reproduire :\n" +
                "📸 Capture d'écran :\n" +
                "💻 OS / Version :\n" +
                "```",
            },
            {
              name: "💡 Exemple",
              value:
                "```" +
                "🐛 Le bouton Download ne marche pas\n" +
                "📝 Quand je clique sur Download,\n" +
                "   rien ne se passe\n" +
                "🔄 Ouvrir Castor → Clic Download\n" +
                "📸 [capture]\n" +
                "💻 macOS 14.0 / v0.3.0\n" +
                "```",
            },
            {
              name: "🔗 Alternatives",
              value:
                `> 🐛 [Ouvrir une issue GitHub](${GITHUB_URL}/issues/new)\n` +
                "> 📋 Décris le problème en détail avec labels",
            }
          )
          .setFooter({ text: "Merci de signaler les bugs ! 🙏" })
          .setTimestamp(),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("🐛 Ouvrir une issue GitHub")
            .setURL(`${GITHUB_URL}/issues/new`)
            .setStyle(ButtonStyle.Link)
        ),
      ],
    },
  ];
}

function featuresContent() {
  return [
    {
      embeds: [
        new EmbedBuilder()
          .setColor(0x3B82F6)
          .setTitle("💡 ━━━ Suggérer une feature ━━━ 💡")
          .setDescription(
            "Une idée pour améliorer Castor ? **Partage-la !**\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          )
          .addFields(
            {
              name: "📋 Modèle de suggestion",
              value:
                "```" +
                "💡 Nom de la feature :\n" +
                "📝 Description :\n" +
                "🎯 Pourquoi c'est utile :\n" +
                "📸 Mockup / Schéma :\n" +
                "```",
            },
            {
              name: "🌟 Exemple",
              value:
                "```" +
                "💡 Dark Mode pour le terminal\n" +
                "📝 Ajouter un thème sombre au\n" +
                "   terminal intégré\n" +
                "🎯 Moins de fatigue visuelle\n" +
                "📸 [maquette]\n" +
                "```",
            },
            {
              name: "🏆 Impact",
              value:
                "```" +
                "  ⭐⭐⭐⭐⭐ = Feature request\n" +
                "  ⭐⭐⭐⭐   = Amélioration UX\n" +
                "  ⭐⭐⭐     = Nice to have\n" +
                "```",
            }
          )
          .setFooter({ text: "Les meilleures suggestions seront implémentées ! 🚀" })
          .setTimestamp(),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("💡 Ouvrir une issue GitHub")
            .setURL(`${GITHUB_URL}/issues/new`)
            .setStyle(ButtonStyle.Link)
        ),
      ],
    },
  ];
}

function avancementContent() {
  return [
    {
      embeds: [
        new EmbedBuilder()
          .setColor(0xF59E0B)
          .setTitle("🔨 ━━━ Avancement du projet ━━━ 🔨")
          .setDescription(
            "Status actuel : **v0.3.0**\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          )
          .addFields(
            {
              name: "🟢 Terminé",
              value:
                "```" +
                "  🟢 Site web (Vite + React)      100%\n" +
                "  🟢 Application Desktop           85%\n" +
                "  🟢 CLI page                      90%\n" +
                "  🟢 Système i18n EN/FR            100%\n" +
                "  🟢 Castor Bot IA                 95%\n" +
                "  🟢 Bot Discord                    70%\n" +
                "```",
            },
            {
              name: "🟡 En cours",
              value:
                "```" +
                "  🟡 Déploiement 24/7 bot Discord\n" +
                "  🟡 Système de tickets amélioré\n" +
                "```",
            },
            {
              name: "🔴 À faire",
              value:
                "```" +
                "  🔴 Synchronisation cloud\n" +
                "  🔴 Mode collaboratif\n" +
                "  🔴 Plugins / Extensions\n" +
                "```",
            },
            {
              name: "📈 Progression globale",
              value:
                `  ${progressBar(0.72, 15)} **72%**`,
            }
          )
          .setFooter({ text: "Dernière mise à jour" })
          .setTimestamp(),
      ],
    },
  ];
}

function screenshotsContent() {
  return [
    {
      embeds: [
        new EmbedBuilder()
          .setColor(0xEC4899)
          .setTitle("📸 ━━━ Screenshots ━━━ 📸")
          .setDescription(
            "Partage tes **captures d'écran** de Castor !\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          )
          .addFields(
            {
              name: "🖥️ Ce qu'on veut voir",
              value:
                "```" +
                "  🖥️ Interface desktop\n" +
                "  🌐 Site web\n" +
                "  💻 Terminal / CLI\n" +
                "  🤖 Castor Bot en action\n" +
                "  🎨 Design concepts\n" +
                "```",
            },
            {
              name: "🏆 Galerie",
              value:
                "```\n" +
                "  Les meilleurs screenshots seront\n" +
                "  repris dans la galerie du site !\n" +
                "```",
            }
          )
          .setFooter({ text: "Capture, partage, brille ! ✨" })
          .setTimestamp(),
      ],
    },
  ];
}

function devTalkContent() {
  return [
    {
      embeds: [
        new EmbedBuilder()
          .setColor(0x8B5CF6)
          .setTitle("🛠 ━━━ Dev Talk ━━━ 🛠")
          .setDescription(
            "Discussion technique pour les devs.\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          )
          .addFields(
            {
              name: "💻 Sujets",
              value:
                "```" +
                "  🏗️ Architecture & Patterns\n" +
                "  📝 Code Review\n" +
                "  ⚡ Performance\n" +
                "  🧪 Tests\n" +
                "  🔧 Outils de dev\n" +
                "```",
            },
            {
              name: "📚 Resources",
              value:
                "```" +
                "  📗 React     → react.dev\n" +
                "  📘 Vite      → vitejs.dev\n" +
                "  📙 Discord.js → discordjs.guide\n" +
                "  📕 Node.js   → nodejs.org\n" +
                "```",
            }
          )
          .setFooter({ text: "Code hard, ship fast 🚀" })
          .setTimestamp(),
      ],
    },
  ];
}

function pullRequestsContent() {
  return [
    {
      embeds: [
        new EmbedBuilder()
          .setColor(0x10B981)
          .setTitle("🔀 ━━━ Pull Requests ━━━ 🔀")
          .setDescription(
            "Suivi des PRs sur le repository.\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          )
          .addFields(
            {
              name: "📋 Processus",
              value:
                "```" +
                "  1️⃣  Fork le repo\n" +
                "  2️⃣  Crée une branche\n" +
                "  3️⃣  Code + Tests\n" +
                "  4️⃣  Ouvre une PR\n" +
                "  5️⃣  Review par l'équipe\n" +
                "  6️⃣  Merge 🎉\n" +
                "```",
            },
            {
              name: "🏷️ Conventions",
              value:
                "```" +
                "  feat:     Nouvelle feature\n" +
                "  fix:      Correction de bug\n" +
                "  docs:     Documentation\n" +
                "  refactor: Refactorisation\n" +
                "  test:     Ajout de tests\n" +
                "  chore:    Maintenance\n" +
                "```",
            },
            {
              name: "🔗 Liens",
              value:
                `> 🔀 [PRs ouvertes](${GITHUB_URL}/pulls)\n` +
                `> 📖 [Contribuer](${GITHUB_URL}/blob/main/CONTRIBUTING.md)`,
            }
          )
          .setFooter({ text: "Merci pour tes contributions ! 🙏" })
          .setTimestamp(),
      ],
    },
  ];
}

function buildsContent() {
  return [
    {
      embeds: [
        new EmbedBuilder()
          .setColor(0x06B6D4)
          .setTitle("🔨 ━━━ Builds CI/CD ━━━ 🔨")
          .setDescription(
            "Status des builds GitHub Actions.\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          )
          .addFields(
            {
              name: "🤖 Workflows",
              value:
                "```" +
                "  🟢 CI        → Tests + Lint (push)\n" +
                "  🟢 Deploy    → Build + Pages (main)\n" +
                "  🟢 Release   → Desktop build (tag)\n" +
                "```",
            },
            {
              name: "📊 Statistiques",
              value:
                "```" +
                `  ✅ 72  workflows réussis\n` +
                `  ⏱️ ~35s  durée moyenne\n` +
                `  📦 Vite 5.4 + React 18\n` +
                "```",
            },
            {
              name: "📈 Taux de succès",
              value:
                `  ${progressBar(1.0, 15)} **100%** 🎉`,
            }
          )
          .setFooter({ text: "Tout est green ! ✅" })
          .setTimestamp(),
      ],
    },
  ];
}

function aideContent() {
  return [
    {
      embeds: [
        new EmbedBuilder()
          .setColor(0x10B981)
          .setTitle("🤝 ━━━ Besoin d'aide ? ━━━ 🤝")
          .setDescription(
            "Pose ta question, la communauté te répond !\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          )
          .addFields(
            {
              name: "📝 Modèle de question",
              value:
                "```" +
                "❓ Ta question :\n" +
                "💻 Ce que tu as essayé :\n" +
                "📸 Capture d'écran :\n" +
                "🔧 OS / Version :\n" +
                "```",
            },
            {
              name: "💡 Avant de demander",
              value:
                "```" +
                "  1️⃣  Consulte la #faq\n" +
                "  2️⃣  Cherche dans les messages\n" +
                "  3️⃣  Utilise le modèle ci-dessus\n" +
                "```",
            },
            {
              name: "⚡ Réponse rapide",
              value:
                "```" +
                "  🟢 Bug critique    → < 1h\n" +
                "  🟡 Question normale → < 24h\n" +
                "  🔴 Feature request  → < 1 semaine\n" +
                "```",
            }
          )
          .setFooter({ text: "On est là pour t'aider ! 🤝" })
          .setTimestamp(),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_open")
            .setLabel("🎫 Ouvrir un ticket privé")
            .setStyle(ButtonStyle.Primary)
        ),
      ],
    },
  ];
}

function faqContent() {
  return [
    {
      embeds: [
        new EmbedBuilder()
          .setColor(0xF59E0B)
          .setTitle("❓ ━━━ FAQ ━━━ ❓")
          .setDescription(
            "Questions fréquentes sur Castor.\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          )
          .addFields(
            {
              name: "🦫 C'est quoi Castor ?",
              value: "```\nApplication desktop qui t'aide à coder.\nTerminal + Éditeur + Bot IA intégré.\n```",
              inline: false,
            },
            {
              name: "📥 Comment télécharger ?",
              value: "```\n→ " + SITE_URL + "\n→ Clique sur « Télécharger »\n```",
              inline: false,
            },
            {
              name: "💻 Quel OS ?",
              value:
                "```" +
                "  🪟 Windows   ✅\n" +
                "  🍎 macOS     ✅\n" +
                "  🐧 Linux     ✅\n" +
                "```",
              inline: false,
            },
            {
              name: "🌐 FR / EN ?",
              value: "```\nBouton EN/FR en haut à droite du site.\n```",
              inline: false,
            },
            {
              name: "🤖 Le Castor Bot ?",
              value: "```\nAssistant IA intégré à l'app.\nBase de connaissances locale.\n```",
              inline: false,
            },
            {
              name: "🤝 Contribuer ?",
              value:
                "```" +
                "  1️⃣  Fork le repo\n" +
                "  2️⃣  Crée une branche\n" +
                "  3️⃣  Ouvre une PR\n" +
                "```",
              inline: false,
            }
          )
          .setFooter({ text: "Pas de réponse ? Demande dans #aide 🤝" })
          .setTimestamp(),
      ],
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Content map                                                        */
/* ------------------------------------------------------------------ */

const CHANNEL_CONTENT = {
  "bienvenue": bienvenueContent,
  "annonces": annoncesContent,
  "changelog": changelogContent,
  "général": generalContent,
  "présentations": presentationsContent,
  "off-topic": offTopicContent,
  "bugs": bugsContent,
  "features": featuresContent,
  "avancement": avancementContent,
  "screenshots": screenshotsContent,
  "dev-talk": devTalkContent,
  "pull-requests": pullRequestsContent,
  "builds": buildsContent,
  "aide": aideContent,
  "faq": faqContent,
};

/* ------------------------------------------------------------------ */
/*  Bot                                                                */
/* ------------------------------------------------------------------ */

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("❌  Missing DISCORD_TOKEN env var.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async (c) => {
  console.log(`✅  Connected as ${c.user.tag}`);

  const guild = c.guilds.cache.first();
  if (!guild) {
    console.error("❌  Not in any server.");
    client.destroy();
    process.exit(1);
  }

  console.log(`📌  Server: ${guild.name}`);
  console.log(`\n🚀  Seeding channels...\n`);

  let sent = 0;
  let skipped = 0;

  for (const [name, contentFn] of Object.entries(CHANNEL_CONTENT)) {
    const channel = guild.channels.cache.find(
      (ch) => ch.name === name && ch.isTextBased()
    );

    if (!channel) {
      console.log(`   ⏭  Channel #${name} not found — skipping`);
      skipped++;
      continue;
    }

    try {
      const existing = await channel.messages.fetch({ limit: 1 });
      if (existing.size > 0) {
        console.log(`   ⏭  #${name} already has messages — skipping`);
        skipped++;
        continue;
      }

      const payloads = contentFn();
      for (const payload of payloads) {
        await channel.send(payload);
      }
      console.log(`   ✅  #${name} — seeded`);
      sent++;
    } catch (err) {
      console.error(`   ❌  #${name} — error:`, err.message);
    }
  }

  console.log(`\n🎉  Done! ${sent} channels seeded, ${skipped} skipped.`);

  client.destroy();
  process.exit(0);
});

client.login(token);
