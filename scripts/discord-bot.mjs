#!/usr/bin/env node
// discord-bot.mjs — Castor Discord Bot (unified: welcome + slash commands)
// Usage:
//   export DISCORD_TOKEN=your_token_here
//   node scripts/discord-bot.mjs

import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { execSync } from "child_process";

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

const SERVER_NAME = "Castor (Projet)";
const WELCOME_CHANNEL = "bienvenue";
const GITHUB_URL = "https://github.com/DmzGamingYT/castor";
const SITE_URL = "https://dmzgamingyt.github.io/castor/";
const DISCORD_INVITE = "https://discord.gg/9J5xmp8fz";

/* ------------------------------------------------------------------ */
/*  Slash Commands Definition                                          */
/* ------------------------------------------------------------------ */

const commands = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Affiche la liste des commandes disponibles")
    .setDescriptionLocalization("en", "Show all available commands"),

  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Affiche le statut du projet Castor")
    .setDescriptionLocalization("en", "Show the Castor project status"),

  new SlashCommandBuilder()
    .setName("changelog")
    .setDescription("Affiche les dernières mises à jour du projet")
    .setDescriptionLocalization("en", "Show recent project updates")
    .addIntegerOption((opt) =>
      opt
        .setName("count")
        .setDescription("Nombre de commits à afficher (défaut: 5)")
        .setDescriptionLocalization("en", "Number of commits to show (default: 5)")
        .setMinValue(1)
        .setMaxValue(20)
    ),
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getGitLog(count = 5) {
  try {
    const log = execSync(`git log --oneline -${count} --no-decorate`, {
      encoding: "utf-8",
      cwd: process.cwd(),
    }).trim();
    return log.split("\n").filter(Boolean);
  } catch {
    return ["(git non disponible)"];
  }
}

function getGitBranch() {
  try {
    return execSync("git branch --show-current", {
      encoding: "utf-8",
      cwd: process.cwd(),
    }).trim();
  } catch {
    return "unknown";
  }
}

function getGitStats() {
  try {
    const total = execSync("git rev-list --count HEAD", {
      encoding: "utf-8",
      cwd: process.cwd(),
    }).trim();
    const contributors = execSync(
      "git shortlog -sn --no-merges | head -5",
      { encoding: "utf-8", cwd: process.cwd() }
    ).trim();
    return { total, contributors };
  } catch {
    return { total: "?", contributors: "(indisponible)" };
  }
}

function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/* ------------------------------------------------------------------ */
/*  Embed Builders                                                     */
/* ------------------------------------------------------------------ */

function buildHelpEmbed() {
  return new EmbedBuilder()
    .setColor(0xD97706)
    .setTitle("🦫 Commandes Castor Bot")
    .setDescription("Voici toutes les commandes disponibles :")
    .addFields(
      {
        name: "/help",
        value: "Affiche cette liste de commandes",
        inline: false,
      },
      {
        name: "/status",
        value: "Statut du projet : branche, commits, contributeurs",
        inline: false,
      },
      {
        name: "/changelog",
        value: "Les derniers commits et mises à jour du projet",
        inline: false,
      }
    )
    .setFooter({ text: `${SERVER_NAME} — Le castor qui code pour toi 🦫` })
    .setTimestamp();
}

function buildStatusEmbed() {
  const branch = getGitBranch();
  const { total, contributors } = getGitStats();

  return new EmbedBuilder()
    .setColor(0x10B981) // green
    .setTitle("📊 Statut du projet Castor")
    .addFields(
      {
        name: "🌿 Branche",
        value: `\`${branch}\``,
        inline: true,
      },
      {
        name: "📦 Total commits",
        value: `\`${total}\``,
        inline: true,
      },
      {
        name: "🔗 Liens",
        value: [
          `🌐 [Site web](${SITE_URL})`,
          `💻 [GitHub](${GITHUB_URL})`,
          `💬 [Discord](${DISCORD_INVITE})`,
        ].join("\n"),
        inline: false,
      },
      {
        name: "👥 Top contributeurs",
        value: "```\n" + contributors + "\n```",
        inline: false,
      }
    )
    .setFooter({ text: `${SERVER_NAME} — Le castor qui code pour toi 🦫` })
    .setTimestamp();
}

function buildChangelogEmbed(count = 5) {
  const commits = getGitLog(count);

  const formatted = commits.map((line, i) => {
    const [hash, ...rest] = line.split(" ");
    const msg = rest.join(" ");
    return `**${i + 1}.** \`${hash}\` ${msg}`;
  });

  return new EmbedBuilder()
    .setColor(0x3B82F6) // blue
    .setTitle(`📋 Changelog — ${count} derniers commits`)
    .setDescription(formatted.join("\n\n"))
    .setFooter({ text: `${SERVER_NAME} — Le castor qui code pour toi 🦫` })
    .setTimestamp();
}

function buildWelcomeEmbed(member) {
  const memberCount = member.guild.memberCount;

  return new EmbedBuilder()
    .setColor(0xD97706)
    .setTitle(`🦫 Bienvenue ${member.user.username} !`)
    .setDescription(
      `Hey ${member}, bienvenue sur **${SERVER_NAME}** !\n\n` +
      `Tu es le **${memberCount}${getOrdinal(memberCount)}** membre de la communauté.\n\n` +
      `Voici quelques liens utiles pour commencer :`
    )
    .addFields(
      {
        name: "📋 Commencer ici",
        value:
          `> <#${member.guild.channels.cache.find((c) => c.name === "bienvenue")?.id || "?"}> — Lis les règles\n` +
          `> <#${member.guild.channels.cache.find((c) => c.name === "présentations")?.id || "?"}> — Présente-toi !\n` +
          `> <#${member.guild.channels.cache.find((c) => c.name === "général")?.id || "?"}> — Discussion libre`,
      },
      {
        name: "🦫 Le projet Castor",
        value:
          `> 🌐 [Site web](${SITE_URL})\n` +
          `> 💻 [GitHub](${GITHUB_URL})\n` +
          `> 📥 [Télécharger Castor](${SITE_URL})`,
      }
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setFooter({ text: `${SERVER_NAME} — Le castor qui code pour toi 🦫` })
    .setTimestamp();
}

function buildWelcomeButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("🌐 Site web")
      .setURL(SITE_URL)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setLabel("💻 GitHub")
      .setURL(GITHUB_URL)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setLabel("💬 Discord")
      .setURL(DISCORD_INVITE)
      .setStyle(ButtonStyle.Link)
  );
}

function buildDMEmbed(member) {
  return new EmbedBuilder()
    .setColor(0xD97706)
    .setTitle("🦫 Hey ! Bienvenue sur Castor !")
    .setDescription(
      `Merci de nous avoir rejoint, **${member.user.username}** !\n\n` +
      `Voici comment démarrer :\n\n` +
      `1️⃣  Va dans <#${member.guild.channels.cache.find((c) => c.name === "bienvenue")?.id || "?"}> et lis les règles\n` +
      `2️⃣  Présente-toi dans <#${member.guild.channels.cache.find((c) => c.name === "présentations")?.id || "?"}>\n` +
      `3️⃣  Discute avec nous dans <#${member.guild.channels.cache.find((c) => c.name === "général")?.id || "?"}>\n\n` +
      `Utilise /help pour voir toutes les commandes disponibles ! 🦫`
    )
    .setFooter({ text: `${SERVER_NAME} — Le castor qui code pour toi 🦫` })
    .setTimestamp();
}

/* ------------------------------------------------------------------ */
/*  Register Slash Commands                                            */
/* ------------------------------------------------------------------ */

async function registerCommands(clientId, guildId, token) {
  const rest = new REST({ version: "10" }).setToken(token);

  console.log("🔄  Registering slash commands...");

  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands.map((c) => c.toJSON()),
    });
    console.log("✅  Slash commands registered!\n");
  } catch (err) {
    console.error("❌  Failed to register commands:", err);
  }
}

/* ------------------------------------------------------------------ */
/*  Bot                                                                */
/* ------------------------------------------------------------------ */

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("❌  Missing DISCORD_TOKEN env var.");
  console.error("   Set it with:  export DISCORD_TOKEN=your_token_here");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once(Events.ClientReady, async (c) => {
  console.log(`✅  Bot connected as ${c.user.tag}`);
  console.log(`📌  Servers: ${c.guilds.cache.map((g) => g.name).join(", ")}`);

  // Register slash commands for the first guild
  const guild = c.guilds.cache.first();
  if (guild) {
    await registerCommands(c.user.id, guild.id, token);
  }

  console.log("🔍  Listening for commands and new members...\n");
});

/* --- Slash Command Handler --- */
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    if (commandName === "help") {
      const embed = buildHelpEmbed();
      await interaction.reply({ embeds: [embed], ephemeral: false });
    }

    else if (commandName === "status") {
      await interaction.deferReply();
      const embed = buildStatusEmbed();
      await interaction.editReply({ embeds: [embed] });
    }

    else if (commandName === "changelog") {
      await interaction.deferReply();
      const count = interaction.options.getInteger("count") || 5;
      const embed = buildChangelogEmbed(count);
      await interaction.editReply({ embeds: [embed] });
    }
  } catch (err) {
    console.error(`❌  Error handling /${commandName}:`, err);
    const reply = {
      content: "❌ Une erreur est survenue lors de l'exécution de la commande.",
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

/* --- Welcome Handler --- */
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channel = member.guild.channels.cache.find(
      (c) => c.name === WELCOME_CHANNEL && c.isTextBased()
    );

    if (!channel) {
      console.warn(`⚠️  Channel #${WELCOME_CHANNEL} not found!`);
      return;
    }

    // Welcome message in channel
    const embed = buildWelcomeEmbed(member);
    const buttons = buildWelcomeButtons();
    await channel.send({ embeds: [embed], components: [buttons] });
    console.log(`📨  Welcome sent for ${member.user.tag} in #${WELCOME_CHANNEL}`);

    // DM to new member
    try {
      const dmEmbed = buildDMEmbed(member);
      await member.send({ embeds: [dmEmbed] });
      console.log(`📩  DM sent to ${member.user.tag}`);
    } catch {
      console.log(`⚠️  Could not DM ${member.user.tag} (DMs disabled?)`);
    }
  } catch (err) {
    console.error("❌  Error handling new member:", err);
  }
});

client.login(token);
