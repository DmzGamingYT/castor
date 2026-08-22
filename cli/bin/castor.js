#!/usr/bin/env node
/* Castor CLI — l'agent de code gratuit dans ton terminal.
   Multi-providers · streaming · compétences / · mémoire · plan de tâches.

   Usage :
     castor                       session interactive
     castor -p "question"         une requête, réponse, sortie
     castor --provider groq       choisir le provider au lancement
     castor --model <id>          choisir le modèle au lancement */

const readline = require("node:readline");
const { PROVIDERS, isChatModel } = require("../lib/providers");
const store = require("../lib/store");
const { parseTodos } = require("../lib/todos");
const {
  accent, ok, dim, warn, boldc,
  startSpinner, sseEvents, estTok, fmtTok,
} = require("../lib/ui");

const VERSION = "0.1.0";

/* ---------- état ---------- */
const cfg = store.loadConfig();
let memory = store.loadMemory();
let skills = store.loadSkills();
let stickySkill = null;
let messages = []; // historique de la conversation courante
let lastTodos = [];
let abortCtrl = null;

/* ---------- args ---------- */
const args = process.argv.slice(2);
function argOf(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
}
const oneShot = args.includes("-p") || args.includes("--prompt");
const oneShotText = oneShot ? argOf("-p") || argOf("--prompt") : null;

if (args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
}

if (argOf("--provider")) {
  const p = PROVIDERS.find((x) => x.id === argOf("--provider"));
  if (p) cfg.provider = p.id;
  else
    console.error(
      warn(`⚠ provider « ${argOf("--provider")} » inconnu — options : ${PROVIDERS.map((x) => x.id).join(", ")}`)
    );
}
if (argOf("--model")) cfg.model = argOf("--model");

const provider = () => PROVIDERS.find((p) => p.id === cfg.provider) || PROVIDERS[0];
const currentModel = () => cfg.model || provider().defaultModel;

/* ---------- prompt système ---------- */
function buildSystemMessage() {
  let s =
    "Tu es Castor 🦫, un agent de code expert qui travaille sur le projet de l'utilisateur, " +
    "dans son terminal. Réponds en français, concis et actionnable, formaté markdown léger.\n" +
    'Si la tâche a plusieurs étapes, commence par une liste "- [ ] étape" puis coche "- [x]" ' +
    "les étapes faites dans une reprise de la même liste plus bas.";

  if (stickySkill) s += `\n\n# Compétence activée : ${stickySkill.name}\n${stickySkill.body}`;
  if (memory.length)
    s += "\n\n# Mémoire persistante (faits donnés par l'utilisateur)\n" +
      memory.map((m) => `- ${m.text}`).join("\n");

  s += `\n\n# Contexte\nDate : ${new Date().toLocaleDateString("fr-FR")} · ` +
    `Provider : ${provider().label} · Modèle : ${currentModel()}`;
  return { role: "system", content: s };
}

/* ---------- appel provider (streaming) ---------- */
const FIRST_TOKEN_TIMEOUT = 30000; // ms — rien ne justifie d'attendre plus le 1er token

async function streamChat(onDelta) {
  const p = provider();
  const key = process.env.CASTOR_KEY || cfg.keys[p.id] || "";
  if (p.needsKey && !key) {
    throw Object.assign(new Error(`clé ${p.label} manquante — /key pour la définir`), { code: "no-key" });
  }

  const headers = { "content-type": "application/json" };
  if (key) headers.authorization = `Bearer ${key}`;
  if (p.id === "openrouter") {
    headers["http-referer"] = "https://github.com/DmzGamingYT/castor";
    headers["x-title"] = "Castor CLI";
  }

  abortCtrl = new AbortController();
  // si aucun token n'arrive dans le délai, on abandonne la connexion
  const firstTokenTimer = setTimeout(() => {
    abortCtrl?.abort(new Error(`aucune réponse de ${p.label} en ${FIRST_TOKEN_TIMEOUT / 1000} s`));
  }, FIRST_TOKEN_TIMEOUT);

  let reader = null;
  try {
    const t0 = Date.now();
    const res = await fetch(`${p.baseURL.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers,
      signal: abortCtrl.signal,
      body: JSON.stringify({
        model: currentModel(),
        messages: [buildSystemMessage(), ...messages],
        stream: true,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} — ${txt.slice(0, 160)}`);
    }

    reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let full = "";
    let gotFirst = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const events = buf.split(/\n\n/);
      buf = events.pop() || "";
      for (const data of sseEvents(events.join("\n\n"))) {
        if (data === "[DONE]") {
          clearTimeout(firstTokenTimer);
          return { full, ms: Date.now() - t0 };
        }
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch { continue; /* fragment incomplet */ }
        /* certains providers renvoient l'erreur DANS le flux SSE */
        if (parsed.error) {
          throw new Error(parsed.error.message || "erreur du provider en cours de stream");
        }
        const delta = parsed.choices?.[0]?.delta?.content ?? "";
        if (delta) {
          if (!gotFirst) {
            gotFirst = true;
            clearTimeout(firstTokenTimer);
          }
          full += delta;
          onDelta(delta);
        }
      }
    }
    return { full, ms: Date.now() - t0 };
  } finally {
    clearTimeout(firstTokenTimer);
    abortCtrl = null;
    try {
      await reader?.cancel();
      reader?.releaseLock();
    } catch { /* stream déjà terminé */ }
  }
}

function renderTodos(todos) {
  if (!todos.length) return;
  console.log(dim("  ── plan ──"));
  for (const t of todos) {
    console.log(
      `  ${t.done ? ok("☑") : accent("☐")} ${t.done ? dim(t.label) : t.label}`
    );
  }
}

/* ---------- rendu d'une réponse ---------- */
async function ask(text) {
  messages.push({ role: "user", content: text });

  // garde-fou contexte : on ne garde que les ~20 derniers échanges
  if (messages.length > 40) messages = messages.slice(-40);

  const spinner = startSpinner(`${provider().label} réfléchit…`);
  let first = true;
  let result;

  try {
    result = await streamChat((delta) => {
      if (first) {
        first = false;
        spinner.stop();
        process.stdout.write("\n");
      }
      process.stdout.write(delta);
    });
  } catch (err) {
    spinner.stop();
    if (err.name === "AbortError") {
      console.log(warn("\n⚠ interrompu"));
    } else {
      console.log(warn(`\n⚠ ${err.message}`));
      if (err.code === "no-key")
        console.log(dim(`  → obtiens-en une sur ${provider().keyUrl || "le site du provider"} puis tape /key`));
    }
    messages.pop(); // on retire la question sans réponse
    return false;
  }

  const secs = result.ms / 1000;
  const inTok = estTok(JSON.stringify(messages).length);
  const outTok = estTok(result.full.length);
  cfg.usage.requests += 1;
  cfg.usage.totalTokens += inTok + outTok;
  store.saveConfig(cfg);

  lastTodos = parseTodos(result.full);
  console.log("\n" + dim(`  ── ${(secs).toFixed(1)} s · ~${fmtTok(inTok)}↑ ${fmtTok(outTok)}↓ tok · total ${fmtTok(cfg.usage.totalTokens)} tok ──`));
  renderTodos(lastTodos);
  console.log();

  messages.push({ role: "assistant", content: result.full });
  return true;
}

/* ---------- /demo : rendu hors-ligne sans clé ---------- */
async function demo() {
  const canned = [
    "Voici comment j'aborderais ton chantier :\n\n",
    "- [ ] lire la structure du projet\n",
    "- [ ] proposer un plan de modifications\n",
    "- [ ] écrire le code + les tests\n\n",
    "**Exemple** — pour ajouter un endpoint `/login` :\n",
    "```js\napp.post(\"/login\", async (req, res) => {\n  const user = await auth(req.body);\n  res.json({ token: sign(user) });\n});\n```\n\n",
    "Chaque étape est validée avant la suivante. Le code t'appartient.",
  ];
  console.log();
  for (const chunk of canned) {
    process.stdout.write(chunk);
    await new Promise((r) => setTimeout(r, 90));
  }
  const full = canned.join("");
  lastTodos = parseTodos(full);
  console.log(dim("\n  ── démo locale · 0 réseau · 0 € ──"));
  renderTodos(lastTodos);
  console.log(dim("\n  (démo hors-ligne — branche un provider avec /key ou /provider pour du réel)\n"));
}

/* ---------- commandes slash ---------- */
function listProviders() {
  console.log(boldc("\nProviders disponibles :"));
  PROVIDERS.forEach((p, i) => {
    const cur = p.id === cfg.provider ? accent(" ← actif") : "";
    const keyState = p.needsKey
      ? cfg.keys[p.id] ? ok("clé ✓") : dim("clé manquante")
      : ok("local");
    console.log(`  ${i + 1}. ${p.label.padEnd(18)} ${dim(p.hint)} · ${keyState}${cur}`);
  });
  console.log(dim("  /provider <nom|numéro> pour changer\n"));
}

async function listModels() {
  const p = provider();
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
    const ctx = typeof m === "string" ? "" : ` · ${Math.round((m.ctx || 0) / 1024)}k`;
    const cur = id === currentModel() ? accent(" ← actif") : "";
    console.log(`  ${i + 1}. ${id}${dim(ctx)}${cur}`);
  });
  console.log(dim("  /model <id|numéro> pour changer\n"));
}

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
      cfg.provider = found.id;
      cfg.model = null;
      store.saveConfig(cfg);
      console.log(ok(`✓ provider : ${found.label} · modèle : ${currentModel()}`));
      if (found.needsKey && !cfg.keys[found.id])
        console.log(dim(`  clé manquante — /key (gratuite sur ${found.keyUrl})`));
      return true;
    }

    case "model":
      if (!argStr) { await listModels(); return true; }
      cfg.model = argStr;
      store.saveConfig(cfg);
      console.log(ok(`✓ modèle : ${cfg.model}`));
      return true;

    case "key": {
      if (!argStr) {
        console.log(dim("Usage : /key sk-or-v1-…  (stockée dans ~/.castor/config.json)"));
        return true;
      }
      cfg.keys[cfg.provider] = argStr;
      store.saveConfig(cfg);
      console.log(ok(`✓ clé ${provider().label} enregistrée`));
      return true;
    }

    case "skills":
      console.log(boldc("\nCompétences :"));
      skills.forEach((s) =>
        console.log(`  /${s.name.padEnd(12)} ${dim(s.body.slice(0, 60) + "…")}`)
      );
      console.log(dim("  /skill <nom> active pour la prochaine demande · /skill off désactive\n"));
      return true;

    case "skill": {
      if (argStr === "off") {
        stickySkill = null;
        console.log(ok("✓ compétence désactivée"));
        return true;
      }
      if (!argStr) {
        console.log(dim("Usage : /skill <nom> — active une compétence · /skill off désactive · /skills liste"));
        return true;
      }
      const s = skills.find((x) => x.name === argStr.replace(/^\//, ""));
      if (!s) { console.log(warn(`Compétence « ${argStr} » inconnue — /skills pour la liste`)); return true; }
      stickySkill = s;
      console.log(ok(`✓ compétence active pour la prochaine demande : /${s.name}`));
      return true;
    }

    case "memory":
      console.log(boldc(`\nMémoire (${memory.length}) :`));
      memory.forEach((m, i) => console.log(`  ${i + 1}. ${m.text}`));
      if (!memory.length) console.log(dim("  vide — /remember <fait>"));
      console.log();
      return true;

    case "remember": {
      if (!argStr) { console.log(dim("Usage : /remember toujours répondre en français")); return true; }
      memory.push({ id: Date.now(), text: argStr });
      store.saveMemory(memory);
      console.log(ok("✓ retenu — injecté dans chaque demande"));
      return true;
    }

    case "forget": {
      if (!argStr) {
        console.log(dim("Usage : /forget <mot-clé> — oublie les entrées contenant ce mot · /forget --all pour tout effacer"));
        return true;
      }
      const before = memory.length;
      if (argStr.trim() === "--all") {
        memory = [];
        store.saveMemory(memory);
        console.log(ok(`✓ mémoire entièrement vidée (${before} entrée(s))`));
        return true;
      }
      memory = memory.filter((m) => !m.text.toLowerCase().includes(argStr.toLowerCase()));
      store.saveMemory(memory);
      console.log(ok(`✓ ${before - memory.length} entrée(s) oubliée(s)`));
      return true;
    }

    case "todo":
      if (!lastTodos.length) console.log(dim("Aucun plan en cours — pose une tâche multi-étapes."));
      else renderTodos(lastTodos);
      return true;

    case "usage":
      console.log(
        `${dim("requêtes :")} ${cfg.usage.requests}  ${dim("tokens cumulés :")} ~${fmtTok(cfg.usage.totalTokens)}  ${dim("coût :")} ${accent("0 €")}`
      );
      return true;

    case "clear":
      messages = [];
      lastTodos = [];
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

/* ---------- bannières ---------- */
function printBanner() {
  console.log(`
${accent("◆ castor")} ${dim(`v${VERSION}`)} ${dim("— le castor qui code pour toi")}
${dim(`  provider : ${provider().label} · modèle : ${currentModel()} · 0 € facturés`)}
${dim("  /help commandes · /demo voir le rendu sans clé · Ctrl+C quitter")}
`);
}

function printHelp() {
  console.log(`
${boldc("castor")} ${dim(VERSION)} — agent de code gratuit

${boldc("Commandes")}
  /provider [id]   lister/changer de provider
  /model [id]      lister/changer de modèle
  /key <clé>       enregistrer la clé du provider courant
  /skills          lister les compétences
  /skill <nom>     activer une compétence (une demande) · /skill off
  /memory          voir la mémoire persistante
  /remember <fait> ajouter un fait injecté à chaque demande
  /forget <motif>  oublier des entrées
  /todo            réafficher le dernier plan
  /usage           tokens cumulés & requêtes
  /demo            rendu hors-ligne, sans clé
  /clear           nouvelle conversation
  /exit            quitter

${boldc("Lancement")}
  castor                    session interactive
  castor -p "question"      une requête puis sortie
  castor --provider groq    provider direct
  castor --model <id>       modèle direct

${dim("Config : ~/.castor/ · Les clés restent sur ta machine.")}
`);
}

/* ---------- onboarding premier lancement ---------- */
async function onboardIfNeeded(rl) {
  if (store.loadConfig && cfg.keys && Object.keys(cfg.keys).length) return;
  if (!process.stdout.isTTY) return; // jamais bloquant en non-interactif
  if (cfg.onboarded) return;

  console.log(accent("\nPremier lancement ? Deux minutes de config.\n"));
  listProviders();
  const answer = await new Promise((res) =>
    rl.question(accent("Numéro du provider (entrée = OpenRouter) : "), res)
  );
  const n = parseInt(answer, 10);
  if (n >= 1 && n <= PROVIDERS.length) {
    cfg.provider = PROVIDERS[n - 1].id;
    cfg.model = null;
  }
  const p = provider();
  if (p.needsKey) {
    const key = await new Promise((res) =>
      rl.question(accent(`Clé ${p.label} (${p.keyUrl}) — entrée pour plus tard : `), res)
    );
    if (key.trim()) cfg.keys[p.id] = key.trim();
  }
  cfg.onboarded = true;
  store.saveConfig(cfg);
  console.log(ok("\n✓ C'est parti — tout est stocké dans ~/.castor/\n"));
}

/* ---------- modes ---------- */
async function oneShotRun() {
  if (!oneShotText) {
    console.error(warn("Usage : castor -p \"ta question\""));
    process.exit(1);
  }
  const okDone = await ask(oneShotText);
  process.exit(okDone ? 0 : 1);
}

async function repl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: accent("❯ "),
  });

  printBanner();
  await onboardIfNeeded(rl);

  // file séquentielle : chaque ligne attend la fin de la précédente
  const queue = [];
  let busy = false;
  let wantExit = false;

  function maybeExit() {
    if (wantExit && !busy && !queue.length) {
      console.log(dim("\nà bientôt 🦫"));
      process.exit(0);
    }
  }

  async function processLine(line) {
    busy = true;
    try {
      const text = line.trim();
      if (!text) { rl.prompt(); return; }

      if (text.startsWith("/")) {
        const keep = await handleCommand(text);
        if (!keep) { rl.close(); return; }
      } else {
        await ask(text);
      }
      rl.prompt();
    } catch (err) {
      // une commande qui plante ne doit jamais tuer le REPL
      console.log(warn(`⚠ ${err?.message || "erreur inattendue"}`));
      rl.prompt();
    } finally {
      busy = false;
      if (queue.length) processLine(queue.shift());
      else maybeExit();
    }
  }

  rl.on("line", (line) => {
    if (busy) { queue.push(line); return; }
    processLine(line);
  });

  rl.on("SIGINT", () => {
    if (abortCtrl && busy) {
      abortCtrl.abort();
    } else {
      console.log(dim("\nà bientôt 🦫"));
      process.exit(0);
    }
  });

  // fin de stdin (pipe) : on attend que la file soit traitée avant de sortir
  rl.on("close", () => {
    wantExit = true;
    maybeExit();
  });
}

/* ---------- main ---------- */
(async () => {
  if (oneShot) return oneShotRun();
  await repl();
})();
