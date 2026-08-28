/* commands.js — Toutes les commandes slash du REPL. */

const ctx = require("./context");
const store = require("./store");
const { PROVIDERS, isChatModel } = require("./providers");
const { TOOL_DEFS } = require("./tools");
const { demo, renderTodos } = require("./chat");
const {
  accent, ok, dim, warn, boldc, fmtTok,
} = require("./ui");
const { printHelp } = require("./onboarding");

/* ---------- helpers locaux ---------- */
function listProviders() {
  console.log(boldc("\nProviders disponibles :"));
  PROVIDERS.forEach((p, i) => {
    const cur = p.id === ctx.cfg().provider ? accent(" ← actif") : "";
    const keyState = p.needsKey
      ? ctx.cfg().keys[p.id] ? ok("clé ✓") : dim("clé manquante")
      : ok("local");
    console.log(`  ${i + 1}. ${p.label.padEnd(18)} ${dim(p.hint)} · ${keyState}${cur}`);
  });
  console.log(dim("  /provider <nom|numéro> pour changer\n"));
}

async function listModels() {
  const p = ctx.provider();
  console.log(boldc(`\nModèles ${p.label} :`));
  let models = p.models;
  if (p.id === "openrouter") {
    try {
      const res = await fetch(`${p.baseURL}/models`, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const free = ((json && Array.isArray(json.data)) ? json.data : [])
        .filter((m) => m.pricing?.prompt === "0" && isChatModel(m.id))
        .map((m) => ({ id: m.id, ctx: m.context_length }));
      if (free.length) models = free;
    } catch { /* repli liste locale */ }
  }
  models.slice(0, 12).forEach((m, i) => {
    const id = typeof m === "string" ? m : m.id;
    const c = typeof m === "string" ? "" : ` · ${Math.round((m.ctx || 0) / 1024)}k`;
    const cur = id === ctx.currentModel() ? accent(" ← actif") : "";
    console.log(`  ${i + 1}. ${id}${dim(c)}${cur}`);
  });
  console.log(dim("  /model <id|numéro> pour changer\n"));
}

/* ---------- handleCommand ---------- */
async function handleCommand(line) {
  const [cmd, ...rest] = line.slice(1).split(/\s+/);
  const argStr = rest.join(" ").trim();

  switch (cmd) {
    case "help":
      printHelp();
      return true;

    case "provider": {
      if (!argStr) { listProviders(); return true; }
      const byNum = PROVIDERS[parseInt(argStr, 10) - 1];
      const found = PROVIDERS.find((p) => p.id === argStr.toLowerCase()) || byNum;
      if (!found) { console.log(warn("Provider inconnu")); return true; }
      ctx.setProvider(found.id);
      console.log(ok(`✓ provider : ${found.label} · modèle : ${ctx.currentModel()}`));
      if (found.needsKey && !ctx.cfg().keys[found.id])
        console.log(dim(`  clé manquante — /key (gratuite sur ${found.keyUrl})`));
      return true;
    }

    case "model":
      if (!argStr) { await listModels(); return true; }
      ctx.setModel(argStr);
      console.log(ok(`✓ modèle : ${ctx.cfg().model}`));
      return true;

    case "key": {
      if (!argStr) {
        console.log(dim("Usage : /key sk-or-v1-…  (stockée dans ~/.castor/config.json)"));
        return true;
      }
      ctx.setKey(argStr);
      console.log(ok(`✓ clé ${ctx.provider().label} enregistrée`));
      return true;
    }

    case "skills":
      console.log(boldc("\nCompétences :"));
      ctx.skills().forEach((s) =>
        console.log(`  /${s.name.padEnd(12)} ${dim(s.body.slice(0, 60) + "…")}`)
      );
      console.log(dim("  /skill <nom> active pour la prochaine demande · /skill off désactive\n"));
      return true;

    case "skill": {
      if (argStr === "off") {
        ctx.setStickySkill(null);
        console.log(ok("✓ compétence désactivée"));
        return true;
      }
      if (!argStr) {
        console.log(dim("Usage : /skill <nom> — active une compétence · /skill off désactive · /skills liste"));
        return true;
      }
      const s = ctx.skills().find((x) => x.name === argStr.replace(/^\//, ""));
      if (!s) { console.log(warn(`Compétence « ${argStr} » inconnue — /skills pour la liste`)); return true; }
      ctx.setStickySkill(s);
      console.log(ok(`✓ compétence active pour la prochaine demande : /${s.name}`));
      return true;
    }

    case "memory":
      console.log(boldc(`\nMémoire (${ctx.memory().length}) :`));
      ctx.memory().forEach((m, i) => console.log(`  ${i + 1}. ${m.text}`));
      if (!ctx.memory().length) console.log(dim("  vide — /remember <fait>"));
      console.log();
      return true;

    case "remember": {
      if (!argStr) { console.log(dim("Usage : /remember toujours répondre en français")); return true; }
      ctx.addMemoryEntry(argStr);
      console.log(ok("✓ retenu — injecté dans chaque demande"));
      return true;
    }

    case "forget": {
      if (!argStr) {
        console.log(dim("Usage : /forget <mot-clé> — oublie les entrées contenant ce mot · /forget --all pour tout effacer"));
        return true;
      }
      const before = ctx.memory().length;
      if (argStr.trim() === "--all") {
        ctx.setMemory([]);
        console.log(ok(`✓ mémoire entièrement vidée (${before} entrée(s))`));
        return true;
      }
      const filtered = ctx.memory().filter((m) => !m.text.toLowerCase().includes(argStr.toLowerCase()));
      ctx.setMemory(filtered);
      console.log(ok(`✓ ${before - ctx.memory().length} entrée(s) oubliée(s)`));
      return true;
    }

    case "todo":
      if (!ctx.lastTodos().length) console.log(dim("Aucun plan en cours — pose une tâche multi-étapes."));
      else renderTodos(ctx.lastTodos());
      return true;

    case "usage":
      console.log(
        `${dim("requêtes :")} ${ctx.cfg().usage.requests}  ${dim("tokens cumulés :")} ~${fmtTok(ctx.cfg().usage.totalTokens)}  ${dim("coût :")} ${accent("0 €")}`
      );
      return true;

    case "tools": {
      if (argStr === "on") {
        ctx.setToolsEnabled(true);
        console.log(ok("✓ tools activées"));
        return true;
      }
      if (argStr === "off") {
        ctx.setToolsEnabled(false);
        console.log(ok("✓ tools désactivées"));
        return true;
      }
      console.log(boldc("\nTools disponibles :"));
      TOOL_DEFS.forEach((t) => {
        const n = t.function.name;
        const desc = t.function.description;
        console.log(`  ${accent(n.padEnd(16))} ${dim(desc)}`);
      });
      const state = ctx.toolsEnabled() ? ok("on") : dim("off");
      console.log(dim(`\n  /tools on — activer · /tools off — désactiver · état : ${state}\n`));
      return true;
    }

    case "save": {
      if (!ctx.messages().length) {
        console.log(dim("Rien à sauvegarder — commence une conversation d'abord."));
        return true;
      }
      const name = argStr || ctx.autoSessionName();
      const saved = ctx.saveSession(name);
      console.log(ok(`✓ session « ${saved} » sauvegardée (${ctx.messages().length} messages) → ~/.castor/sessions/${saved}.json`));
      return true;
    }

    case "load": {
      if (!argStr) {
        console.log(dim("Usage : /load <nom> — tape /history pour voir les sessions"));
        return true;
      }
      const session = ctx.loadSession(argStr);
      if (!session) {
        console.log(warn(`Session « ${argStr} » introuvable — /history pour la liste`));
        return true;
      }
      console.log(ok(`✓ session « ${session.name} » chargée (${ctx.messages().length} messages, ${session.provider}/${session.model})`));
      if (ctx.lastTodos().length) renderTodos(ctx.lastTodos());
      console.log();
      return true;
    }

    case "history": {
      const sessions = store.listSessions();
      if (!sessions.length) {
        console.log(dim("\nAucune session sauvegardée — /save <nom> pour créer une session\n"));
        return true;
      }
      console.log(boldc(`\nSessions (${sessions.length}) :`));
      sessions.forEach((s, i) => {
        const cur = s.name === ctx.currentSessionName() ? accent(" ← active") : "";
        const date = s.created ? new Date(s.created).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "?";
        console.log(`  ${accent(String(i + 1).padStart(2))}. ${s.name.padEnd(16)} ${dim(date)} ${dim(`${s.messageCount} msg`)} ${dim(s.provider)}${cur}`);
        console.log(`      ${dim(s.summary)}`);
      });
      console.log(dim("  /load <nom> pour restaurer · /delete <nom> pour supprimer\n"));
      return true;
    }

    case "delete": {
      if (!argStr) {
        console.log(dim("Usage : /delete <nom> — supprime une session sauvegardée"));
        return true;
      }
      const removed = store.deleteSession(argStr);
      if (removed) {
        console.log(ok(`✓ session « ${argStr} » supprimée`));
        if (ctx.currentSessionName() === argStr) ctx.setCurrentSessionName(null);
      } else {
        console.log(warn(`Session « ${argStr} » introuvable`));
      }
      return true;
    }

    case "clear":
      ctx.setMessages([]);
      ctx.setLastTodos([]);
      ctx.setCurrentSessionName(null);
      console.log(ok("✓ conversation effacée"));
      return true;

    case "demo":
      await demo();
      return true;

    case "exit":
    case "quit":
      return false;

    default:
      console.log(warn(`Commande inconnue : /${cmd} — /help pour la liste`));
      return true;
  }
}

module.exports = { handleCommand };
