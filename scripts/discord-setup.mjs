#!/usr/bin/env node
// discord-setup.mjs — Setup script for the Castor Discord server
// Usage:
//   1. Create a bot at https://discord.com/developers/applications
//   2. Enable "Server Members Intent" under Bot > Privileged Gateway Intents
//   3. Invite the bot with Administrator permission:
//      https://discord.com/oauth2/authorize?client_id=YOUR_BOT_ID&scope=bot&permissions=8
//   4. Copy your bot token into DISCORD_TOKEN env var (or .env file)
//   5. Run:  node scripts/discord-setup.mjs

import { Client, GatewayIntentBits, PermissionsBitField, ChannelType } from "discord.js";

/* ------------------------------------------------------------------ */
/*  Configuration — edit categories / channels here                    */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  {
    name: "📋 INFORMATIONS",
    channels: [
      { name: "bienvenue",           type: ChannelType.GuildText, topic: "Règles et bienvenue sur le serveur Castor" },
      { name: "annonces",            type: ChannelType.GuildText, topic: "Annonces officielles du projet Castor" },
      { name: "changelog",           type: ChannelType.GuildText, topic: "Nouvelles mises à jour et features" },
    ],
  },
  {
    name: "💬 DISCUSSION",
    channels: [
      { name: "général",             type: ChannelType.GuildText, topic: "Discussion libre sur Castor et le coding" },
      { name: "présentations",       type: ChannelType.GuildText, topic: "Présentez-vous ! Qui êtes-vous ?" },
      { name: "off-topic",           type: ChannelType.GuildText, topic: "Hors-sujet, memes, fun" },
    ],
  },
  {
    name: "🦫 CASTOR APP",
    channels: [
      { name: "bugs",                type: ChannelType.GuildText, topic: "Signaler un bug ou problème" },
      { name: "features",            type: ChannelType.GuildText, topic: "Suggérer de nouvelles fonctionnalités" },
      { name: "avancement",          type: ChannelType.GuildText, topic: "Suivi de l'avancement du projet" },
      { name: "screenshots",         type: ChannelType.GuildText, topic: "Partagez vos captures d'écran de Castor" },
    ],
  },
  {
    name: "🛠 DEV",
    channels: [
      { name: "dev-talk",            type: ChannelType.GuildText, topic: "Discussion technique et développement" },
      { name: "pull-requests",       type: ChannelType.GuildText, topic: "PRs en cours, revues de code" },
      { name: "builds",              type: ChannelType.GuildText, topic: "Status des builds CI/CD et déploiements" },
    ],
  },
  {
    name: "🤝 SUPPORT",
    channels: [
      { name: "aide",                type: ChannelType.GuildText, topic: "Besoin d'aide ? Posez vos questions ici" },
      { name: "faq",                 type: ChannelType.GuildText, topic: "Questions fréquentes et réponses" },
    ],
  },
  {
    name: "🔊 VOIX",
    channels: [
      { name: "Studio Castor",       type: ChannelType.GuildVoice, topic: "" },
      { name: "Pair Programming",    type: ChannelType.GuildVoice, topic: "" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Role setup                                                        */
/* ------------------------------------------------------------------ */

const ROLES = [
  { name: "🦫 Castor Dev",    color: 0xD97706, permissions: [PermissionsBitField.Flags.Administrator] },
  { name: "⚡ Beta Tester",   color: 0x3B82F6, permissions: [] },
  { name: "🎨 Designer",      color: 0xA855F7, permissions: [] },
  { name: "💬 Community",     color: 0x10B981, permissions: [] },
];

/* ------------------------------------------------------------------ */
/*  Main                                                              */
/* ------------------------------------------------------------------ */

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("❌  Missing DISCORD_TOKEN env var.");
  console.error("   Set it with:  export DISCORD_TOKEN=your_token_here");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", async () => {
  console.log(`✅  Connected as ${client.user.tag}`);
  console.log(`📌  Servers: ${client.guilds.cache.map(g => g.name).join(", ")}`);

  const guild = client.guilds.cache.first();
  if (!guild) {
    console.error("❌  Bot is not in any server. Invite it first!");
    client.destroy();
    process.exit(1);
  }

  console.log(`\n🏗  Setting up server: ${guild.name}\n`);

  /* --- Roles --- */
  console.log("🎭 Creating roles...");
  for (const roleDef of ROLES) {
    const existing = guild.roles.cache.find(r => r.name === roleDef.name);
    if (existing) {
      console.log(`   ⏭  Role already exists: ${roleDef.name}`);
      continue;
    }
    await guild.roles.create({
      name: roleDef.name,
      color: roleDef.color,
      permissions: roleDef.permissions,
      reason: "Castor server setup",
    });
    console.log(`   ✅  Created role: ${roleDef.name}`);
  }

  /* --- Categories & Channels --- */
  console.log("\n📂 Creating categories and channels...");
  for (const cat of CATEGORIES) {
    let category = guild.channels.cache.find(c => c.name === cat.name && c.type === ChannelType.GuildCategory);
    if (!category) {
      category = await guild.channels.create({
        name: cat.name,
        type: ChannelType.GuildCategory,
        reason: "Castor server setup",
      });
      console.log(`\n   📁 Created category: ${cat.name}`);
    } else {
      console.log(`\n   ⏭  Category exists: ${cat.name}`);
    }

    for (const ch of cat.channels) {
      const existing = guild.channels.cache.find(c => c.name === ch.name && c.parentId === category.id);
      if (existing) {
        console.log(`      ⏭  Channel exists: #${ch.name}`);
        continue;
      }
      await guild.channels.create({
        name: ch.name,
        type: ch.type,
        topic: ch.topic || undefined,
        parent: category.id,
        reason: "Castor server setup",
      });
      console.log(`      ✅  Created: ${ch.type === ChannelType.GuildVoice ? "🔊" : "#"}${ch.name}`);
    }
  }

  /* --- Default channel permissions (optional lockdown) --- */
  const everyone = guild.roles.everyone;
  const announcements = guild.channels.cache.find(c => c.name === "annonces");
  if (announcements) {
    await announcements.permissionOverwrites.edit(everyone, {
      SendMessages: false,
    });
    console.log("\n🔒  #annonces is now read-only for everyone");
  }

  const changelog = guild.channels.cache.find(c => c.name === "changelog");
  if (changelog) {
    await changelog.permissionOverwrites.edit(everyone, {
      SendMessages: false,
    });
    console.log("🔒  #changelog is now read-only for everyone");
  }

  console.log("\n🎉  Server setup complete!");
  console.log(`🌐  Invite link: https://discord.gg/9J5xmp8fz`);

  client.destroy();
  process.exit(0);
});

client.login(token);
