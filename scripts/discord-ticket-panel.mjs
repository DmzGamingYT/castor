#!/usr/bin/env node
// discord-ticket-panel.mjs — Deploy the ticket support panel in a channel
// Usage:
//   export DISCORD_TOKEN=your_token_here
//   node scripts/discord-ticket-panel.mjs <channel_id>
//
// If no channel_id is provided, it will list all text channels for you to pick.

import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
} from "discord.js";

const SERVER_NAME = "Castor (Projet)";

function buildTicketPanelEmbed() {
  return new EmbedBuilder()
    .setColor(0xD97706)
    .setTitle("🎫 Support Castor")
    .setDescription(
      "Besoin d'aide ? Un problème à signaler ?\n\n" +
      "Clique sur le bouton ci-dessous pour **ouvrir un ticket privé** avec l'équipe Castor.\n\n" +
      "📋 **Types de tickets supportés :**\n" +
      "• 🐛 Bug ou problème technique\n" +
      "• 💡 Suggestion ou feature request\n" +
      "• ❓ Question sur le projet\n" +
      "• 🔒 Signalement confidentiel\n\n" +
      "⏱ Un membre de l'équipe te répondra dès que possible."
    )
    .setFooter({ text: `${SERVER_NAME} — Le castor qui code pour toi 🦫` })
    .setTimestamp();
}

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("❌  Missing DISCORD_TOKEN env var.");
  process.exit(1);
}

const channelId = process.argv[2];

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async (c) => {
  console.log(`✅  Connected as ${c.user.tag}`);

  if (!channelId) {
    // List all text channels
    const guild = c.guilds.cache.first();
    if (!guild) {
      console.error("❌  Not in any server.");
      client.destroy();
      process.exit(1);
    }

    console.log(`\n📌  Available text channels in ${guild.name}:\n`);
    guild.channels.cache
      .filter((ch) => ch.isTextBased() && ch.type !== 0)
      .sort((a, b) => a.position - b.position)
      .forEach((ch) => {
        console.log(`   #${ch.name}  →  ID: ${ch.id}`);
      });

    console.log("\nUsage: node scripts/discord-ticket-panel.mjs <channel_id>");
    client.destroy();
    process.exit(0);
    return;
  }

  try {
    const channel = await c.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      console.error(`❌  Channel ${channelId} not found or not text-based.`);
      client.destroy();
      process.exit(1);
    }

    const embed = buildTicketPanelEmbed();
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_open")
        .setLabel("🎫 Ouvrir un ticket")
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({ embeds: [embed], components: [row] });
    console.log(`✅  Ticket panel deployed in #${channel.name}!`);
  } catch (err) {
    console.error("❌  Error:", err);
  }

  client.destroy();
  process.exit(0);
});

client.login(token);
