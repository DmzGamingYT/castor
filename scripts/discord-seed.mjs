#!/usr/bin/env node
// discord-seed.mjs — Populate all Castor Discord channels with initial content
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
/*  Channel Content Map                                                */
/*  key = channel name (lowercase), value = array of messages/embeds   */
/* ------------------------------------------------------------------ */

function rulesEmbed() {
  return new EmbedBuilder()
    .setColor(0xD97706)
    .setTitle("🦫 Règles du serveur Castor")
    .setDescription("Bienvenue sur le serveur officiel de **Castor** ! Merci de respecter ces règles :")
    .addFields(
      {
        name: "1️⃣ Respect mutuel",
        value: "Sois respectueux envers tous les membres. Pas de harcèlement, discriminations ou toxicité.",
      },
      {
        name: "2️⃣ Utilise les bons channels",
        value: "Place tes messages dans le channel approprié (bugs, features, aide…).",
      },
      {
        name: "3️⃣ Pas de spam",
        value: "Pas de messages en double, de flooding ou de publicités non autorisées.",
      },
      {
        name: "4️⃣ Contenu approprié",
        value: "Pas de contenu NSFW, gore ou illégal.",
      },
      {
        name: "5️⃣ Confidentialité",
        value: "Ne partage pas de tokens, mots de passe ou informations sensibles dans les channels publics.",
      },
      {
        name: "6️⃣ En cas de doute",
        value: "Demande dans <#aide> ou contacte un membre de l'équipe.",
      }
    )
    .setFooter({ text: "En rejoignant le serveur, tu acceptes ces règles. 🦫" })
    .setTimestamp();
}

function announcementsContent() {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0x3B82F6)
        .setTitle("📢 Comment recevoir les annonces")
        .setDescription(
          "Ce channel est réservé aux **annonces officielles** du projet Castor.\n\n" +
          "🔔 **Active les notifications** pour ne rien rater :\n" +
          "• Clique sur l'icône 🔔 en haut du channel\n" +
          "• Sélectionne « Toutes les notifications » ou « Nouveaux messages »\n\n" +
          "Les annonces incluent :\n" +
          "• 🚀 Nouvelles versions de Castor\n" +
          "• 🎨 Features majeures\n" +
          "• 🔧 Maintenance planifiée\n" +
          "• 📋 Résultats de votes communautaires"
        )
        .setFooter({ text: SERVER_NAME })
        .setTimestamp(),
    ],
  };
}

function changelogContent() {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0x10B981)
        .setTitle("📋 Changelog — Castor")
        .setDescription(
          "Ce channel affiche automatiquement les **mises à jour** du projet.\n\n" +
          "Les messages sont générés par le bot à chaque nouveau commit pushed sur `main`."
        )
        .addFields(
          {
            name: "🟢 v0.3.0 — Dernière release",
            value: "• Refonte CLI page (two-column layout)\n• Redesign Avancement page\n• Système i18n EN/FR complet\n• Castor Bot avec KB bilingue\n• Bot Discord avec tickets + slash commands",
          },
          {
            name: "📊 Stats du projet",
            value: "• **72** workflows GitHub Actions réussis\n• **40** tests passants\n• **30+** clés de traduction",
          }
        )
        .setFooter({ text: "Dernière mise à jour" })
        .setTimestamp(),
    ],
  };
}

function generalContent() {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0xD97706)
        .setTitle("💬 Bienvenue dans #général !")
        .setDescription(
          "C'est le salon de discussion principal du serveur Castor.\n\n" +
          "🦫 **De quoi parler ici ?**\n" +
          "• Discussion libre sur Castor et le coding\n" +
          "• Partage de projets et d'astuces\n" +
          "• Questions diverses\n" +
          "• Off-topic (mais reste respectueux !)\n\n" +
          "📌 **Channels utiles :**\n" +
          "• <#bugs> — Signaler un bug\n" +
          "• <#features> — Suggérer une feature\n" +
          "• <#aide> — Demander de l'aide\n" +
          "• <#dev-talk> — Discussion technique"
        )
        .setFooter({ text: SERVER_NAME })
        .setTimestamp(),
    ],
  };
}

function presentationsContent() {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0xA855F7)
        .setTitle("👋 Présente-toi !")
        .setDescription(
          "Nouveau sur le serveur ? **Présente-toi** ici !\n\n" +
          "💡 **Modèle de présentation :**\n" +
          "```\n" +
          "👋 Nom / Pseudo :\n" +
          "💻 Stack / Technologies :\n" +
          "🦫 Pourquoi Castor t'intéresse :\n" +
          "🔗 GitHub / Portfolio (optionnel) :\n" +
          "```\n\n" +
          "On est ravis de te rencontrer ! 🎉"
        )
        .setFooter({ text: SERVER_NAME })
        .setTimestamp(),
    ],
  };
}

function offTopicContent() {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0x6B7280)
        .setTitle("🎉 Off-topic")
        .setDescription(
          "Salon pour parler de tout et de rien !\n\n" +
          "🤖 Memes, jeux,actualité, musique… tout est permis tant que ça reste respectueux."
        )
        .setFooter({ text: SERVER_NAME })
        .setTimestamp(),
    ],
  };
}

function bugsContent() {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0xEF4444)
        .setTitle("🐛 Signaler un bug")
        .setDescription(
          "Tu as trouvé un bug ? **Signale-le ici** avec le format suivant :\n\n" +
          "📋 **Modèle de rapport :**\n" +
          "```\n" +
          "🐛 Titre du bug :\n" +
          "📝 Description :\n" +
          "🔄 Étapes pour reproduire :\n" +
          "📸 Capture d'écran (si possible) :\n" +
          "💻 OS / Version de Castor :\n" +
          "```\n\n" +
          "🔗 Tu peux aussi ouvrir une [issue GitHub](${GITHUB_URL}/issues/new) pour un suivi plus complet."
        )
        .setFooter({ text: SERVER_NAME })
        .setTimestamp(),
    ],
  };
}

function featuresContent() {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0x3B82F6)
        .setTitle("💡 Suggérer une feature")
        .setDescription(
          "Une idée pour améliorer Castor ? **Partage-la ici !**\n\n" +
          "📋 **Modèle de suggestion :**\n" +
          "```\n" +
          "💡 Nom de la feature :\n" +
          "📝 Description :\n" +
          "🎯 Pourquoi c'est utile :\n" +
          "📸 Mockup / Schéma (si possible) :\n" +
          "```\n\n" +
          "Les meilleures suggestions seront implémentées ! 🚀"
        )
        .setFooter({ text: SERVER_NAME })
        .setTimestamp(),
    ],
  };
}

function avancementContent() {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0xF59E0B)
        .setTitle("🔨 Avancement du projet")
        .setDescription(
          "Ce channel suit l'**avancement du projet** Castor.\n\n" +
          "📊 **Status actuel :** v0.3.0\n\n" +
          "🟢 **Terminé :**\n" +
          "• ✅ Application Desktop\n" +
          "• ✅ Site web (Vite + React)\n" +
          "• ✅ CLI page\n" +
          "• ✅ Système i18n EN/FR\n" +
          "• ✅ Castor Bot IA\n" +
          "• ✅ Bot Discord\n\n" +
          "🟡 **En cours :**\n" +
          "• 🔧 Déploiement 24/7 du bot Discord\n" +
          "• 🔧 Système de tickets amélioré\n\n" +
          "🔴 **À faire :**\n" +
          "• 📌 Synchronisation cloud\n" +
          "• 📌 Mode collaboratif\n" +
          "• 📌 Plugins / Extensions"
        )
        .setFooter({ text: "Dernière mise à jour" })
        .setTimestamp(),
    ],
  };
}

function screenshotsContent() {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0xEC4899)
        .setTitle("📸 Screenshots")
        .setDescription(
          "Partage tes **captures d'écran** de Castor ici !\n\n" +
          "• 🖥️ Interface desktop\n" +
          "• 🌐 Site web\n" +
          "• 💻 Terminal / CLI\n" +
          "• 🤖 Castor Bot en action\n\n" +
          "Les meilleurs screenshots seront peut-être repris dans la galerie du site ! 🎨"
        )
        .setFooter({ text: SERVER_NAME })
        .setTimestamp(),
    ],
  };
}

function devTalkContent() {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0x8B5CF6)
        .setTitle("🛠 Dev Talk")
        .setDescription(
          "Salon de **discussion technique** pour les développeurs.\n\n" +
          "💻 **Sujets autorisés :**\n" +
          "• Architecture et design patterns\n" +
          "• Code review et bonnes pratiques\n" +
          "• Performance et optimisation\n" +
          "• Outils et setup de dev\n" +
          "• Questions React / Vite / Node / Discord.js\n\n" +
          "🔗 **Resources utiles :**\n" +
          `• [Repository Castor](${GITHUB_URL})\n` +
          `• [Documentation Vite](https://vitejs.dev)\n` +
          `• [Discord.js Guide](https://discordjs.guide)\n` +
          `• [React Docs](https://react.dev)`
        )
        .setFooter({ text: SERVER_NAME })
        .setTimestamp(),
    ],
  };
}

function pullRequestsContent() {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0x10B981)
        .setTitle("🔀 Pull Requests")
        .setDescription(
          "Ce channel suit les **PRs en cours** sur le repository Castor.\n\n" +
          "📋 **Processus :**\n" +
          "1. Fork le repo et crée une branche\n" +
          "2. Développe ta feature / fix\n" +
          "3. Ouvre une PR avec une description claire\n" +
          "4. Le bot notify automatiquement ici\n" +
          "5. Review par l'équipe\n\n" +
          `🔗 [Voir les PRs ouvertes](${GITHUB_URL}/pulls)\n` +
          `🔗 [Contribuer](${GITHUB_URL}/blob/main/CONTRIBUTING.md)`
        )
        .setFooter({ text: SERVER_NAME })
        .setTimestamp(),
    ],
  };
}

function buildsContent() {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0x06B6D4)
        .setTitle("🔨 Builds CI/CD")
        .setDescription(
          "Ce channel affiche le **statut des builds** GitHub Actions.\n\n" +
          "📊 **Workflows :**\n" +
          "• `CI` — Tests + Lint (à chaque push)\n" +
          "• `Deploy` — Build + Deploy GitHub Pages (à chaque push sur `main`)\n" +
          "• `Release Desktop` — Build + Release app desktop (tag)\n\n" +
          "✅ **72** workflows réussis au total !\n\n" +
          `🔗 [Voir les Actions](${GITHUB_URL}/actions)`
        )
        .setFooter({ text: "Dernière vérification" })
        .setTimestamp(),
    ],
  };
}

function aideContent() {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0x10B981)
        .setTitle("🤝 Besoin d'aide ?")
        .setDescription(
          "Pose ta question ici et la communauté ou l'équipe te répondra !\n\n" +
          "📋 **Avant de poser ta question :**\n" +
          "1. Consulte la <#faq>\n" +
          "2. Cherche dans les messages précédents\n" +
          "3. Utilise le format clair ci-dessous\n\n" +
          "💡 **Modèle de question :**\n" +
          "```\n" +
          "❓ Ta question :\n" +
          "💻 Ce que tu as déjà essayé :\n" +
          "📸 Capture d'écran (si applicable) :\n" +
          "🔧 OS / Version :\n" +
          "```\n\n" +
          "⏰ Un membre de l'équipe ou de la communauté te répondra dès que possible."
        )
        .setFooter({ text: SERVER_NAME })
        .setTimestamp(),
    ],
  };
}

function faqContent() {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0xF59E0B)
        .setTitle("❓ FAQ — Questions Fréquentes")
        .setDescription("Les réponses aux questions les plus courantes sur Castor.")
        .addFields(
          {
            name: "🦫 C'est quoi Castor ?",
            value: "Castor est une application desktop qui t'aide à coder. Elle intègre un terminal, un éditeur, un castor bot IA, et bien plus.",
          },
          {
            name: "📥 Comment télécharger Castor ?",
            value: `Va sur [${SITE_URL}](${SITE_URL}) et clique sur « Télécharger ».`,
          },
          {
            name: "💻 Sur quel OS ça fonctionne ?",
            value: "Windows, macOS et Linux. Les binaires sont disponibles sur la page de téléchargement.",
          },
          {
            name: "🌐 Le site est en français, y a-t-il une version anglaise ?",
            value: "Oui ! Clique sur le bouton **EN/FR** en haut à droite du site pour basculer.",
          },
          {
            name: "🤖 Le Castor Bot, c'est quoi ?",
            value: "Un assistant IA intégré à l'app qui t'aide à coder. Il a accès à une base de connaissances locale et peut répondre à tes questions.",
          },
          {
            name: "💬 Comment contacter l'équipe ?",
            value: "Utilise le canal <#aide> ou ouvre un ticket avec `/ticket` (si tu es admin).",
          },
          {
            name: "🤝 Comment contribuer au projet ?",
            value: `Fork le [repository](${GITHUB_URL}), crée une branche, et ouvre une PR. Consulte la <#dev-talk> pour les questions techniques.`,
          }
        )
        .setFooter({ text: "Dernière mise à jour" })
        .setTimestamp(),
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Content map                                                        */
/* ------------------------------------------------------------------ */

const CHANNEL_CONTENT = {
  "bienvenue": () => [rulesEmbed()],
  "annonces": announcementsContent,
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
      // Check if channel already has messages (avoid duplicates)
      const existing = await channel.messages.fetch({ limit: 1 });
      if (existing.size > 0) {
        console.log(`   ⏭  #${name} already has messages — skipping`);
        skipped++;
        continue;
      }

      const payload = contentFn();
      // Add channel-specific buttons
      const components = [];
      if (name === "aide") {
        components.push(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("ticket_open")
              .setLabel("🎫 Ouvrir un ticket")
              .setStyle(ButtonStyle.Primary)
          )
        );
      }
      if (name === "bugs") {
        components.push(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("🐛 Ouvrir une issue GitHub")
              .setURL(`${GITHUB_URL}/issues/new`)
              .setStyle(ButtonStyle.Link)
          )
        );
      }
      if (name === "features") {
        components.push(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("💡 Ouvrir une issue GitHub")
              .setURL(`${GITHUB_URL}/issues/new`)
              .setStyle(ButtonStyle.Link)
          )
        );
      }

      await channel.send({ ...payload, components });
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
