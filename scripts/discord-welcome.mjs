#!/usr/bin/env node
// discord-welcome.mjs — Castor Welcome Bot
// Sends a beautiful embed when a new member joins the server.
// Usage:
//   export DISCORD_TOKEN=your_token_here
//   node scripts/discord-welcome.mjs

import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
} from "discord.js";

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

const SERVER_NAME = "Castor (Projet)";
const WELCOME_CHANNEL = "bienvenue"; // channel name where welcome messages go
const GITHUB_URL = "https://github.com/DmzGamingYT/castor";
const SITE_URL = "https://dmzgamingyt.github.io/castor/";
const DISCORD_INVITE = "https://discord.gg/9J5xmp8fz";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function createWelcomeEmbed(member) {
  const memberCount = member.guild.memberCount;

  return new EmbedBuilder()
    .setColor(0xD97706) // amber — Castor brand
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
          `> <#${member.guild.channels.cache.find(c => c.name === "bienvenue")?.id || "?"}> — Lis les règles\n` +
          `> <#${member.guild.channels.cache.find(c => c.name === "présentations")?.id || "?"}> — Présente-toi !\n` +
          `> <#${member.guild.channels.cache.find(c => c.name === "général")?.id || "?"}> — Discussion libre`,
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
    .setFooter({
      text: `${SERVER_NAME} — Le castor qui code pour toi 🦫`,
      icon_url: member.guild.iconURL(),
    })
    .setTimestamp();
}

function createButtons() {
  const row = new ActionRowBuilder().addComponents(
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
  return row;
}

function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function createDMEmbed(member) {
  return new EmbedBuilder()
    .setColor(0xD97706)
    .setTitle("🦫 Hey ! Bienvenue sur Castor !")
    .setDescription(
      `Merci de nous avoir rejoint, **${member.user.username}** !\n\n` +
      `Voici comment démarrer :\n\n` +
      `1️⃣  Va dans <#${member.guild.channels.cache.find(c => c.name === "bienvenue")?.id || "?"}> et lis les règles\n` +
      `2️⃣  Présente-toi dans <#${member.guild.channels.cache.find(c => c.name === "présentations")?.id || "?"}>\n` +
      `3️⃣  Discute avec nous dans <#${member.guild.channels.cache.find(c => c.name === "général")?.id || "?"}>\n\n` +
      `Si tu as des questions, passe dans <#${member.guild.channels.cache.find(c => c.name === "aide")?.id || "?"}> ! 🤝`
    )
    .setFooter({ text: "Castor — Le castor qui code pour toi 🦫" })
    .setTimestamp();
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

client.once(Events.ClientReady, (c) => {
  console.log(`✅  Welcome bot connected as ${c.user.tag}`);
  console.log(`📌  Watching: ${c.guilds.cache.map((g) => g.name).join(", ")}`);
  console.log(`🔍  Listening for new members...\n`);
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    // Find the welcome channel
    const channel = member.guild.channels.cache.find(
      (c) => c.name === WELCOME_CHANNEL && c.isTextBased()
    );

    if (!channel) {
      console.warn(`⚠️  Channel #${WELCOME_CHANNEL} not found!`);
      return;
    }

    // Send embed + buttons in the welcome channel
    const embed = createWelcomeEmbed(member);
    const buttons = createButtons();
    await channel.send({ embeds: [embed], components: [buttons] });
    console.log(`📨  Welcome message sent for ${member.user.tag} in #${WELCOME_CHANNEL}`);

    // Send a DM to the new member
    try {
      const dmEmbed = createDMEmbed(member);
      await member.send({ embeds: [dmEmbed] });
      console.log(`📩  DM sent to ${member.user.tag}`);
    } catch {
      console.log(`⚠️  Could not DM ${member.user.tag} (DMs may be disabled)`);
    }
  } catch (err) {
    console.error("❌  Error handling new member:", err);
  }
});

client.login(token);
