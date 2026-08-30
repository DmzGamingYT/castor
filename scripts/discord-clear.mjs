#!/usr/bin/env node
// discord-clear.mjs — Clear all messages from Castor Discord channels
// Usage:
//   export DISCORD_TOKEN=your_token_here
//   node scripts/discord-clear.mjs

import {
  Client,
  GatewayIntentBits,
  Events,
} from "discord.js";

const CHANNELS_TO_CLEAR = [
  "bienvenue", "annonces", "changelog", "général", "présentations",
  "off-topic", "bugs", "features", "avancement", "screenshots",
  "dev-talk", "pull-requests", "builds", "aide", "faq",
];

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

  console.log(`📌  Server: ${guild.name}\n`);

  for (const name of CHANNELS_TO_CLEAR) {
    const channel = guild.channels.cache.find(
      (ch) => ch.name === name && ch.isTextBased()
    );

    if (!channel) {
      console.log(`   ⏭  #${name} — not found`);
      continue;
    }

    try {
      let deleted = 0;
      let messages = await channel.messages.fetch({ limit: 100 });

      while (messages.size > 0) {
        // Bulk delete (works for messages <14 days old)
        const deletedBatch = await channel.bulkDelete(messages, true);
        deleted += deletedBatch.size;

        // Fetch more if needed
        messages = await channel.messages.fetch({ limit: 100 });
      }

      console.log(`   🧹  #${name} — cleared ${deleted} messages`);
    } catch (err) {
      console.error(`   ❌  #${name} — error:`, err.message);
    }
  }

  console.log("\n✅  All channels cleared! Run discord-seed.mjs to re-populate.");

  client.destroy();
  process.exit(0);
});

client.login(token);
