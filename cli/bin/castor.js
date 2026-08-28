#!/usr/bin/env node
/* Castor CLI — l'agent de code gratuit dans ton terminal.

   Usage :
     castor                       session interactive
     castor -p "question"         une requête, réponse, sortie
     castor --provider groq       choisir le provider au lancement
     castor --model <id>          choisir le modèle au lancement */

const ctx = require("../lib/context");
const { printHelp } = require("../lib/onboarding");
const { startRepl, oneShotRun } = require("../lib/repl");
const { warn } = require("../lib/ui");

/* ---------- args ---------- */
const args = process.argv.slice(2);
function argOf(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
}

if (args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
}

if (argOf("--provider")) {
  const id = argOf("--provider");
  const found = ctx.PROVIDERS.find((x) => x.id === id);
  if (found) ctx.setProvider(found.id);
  else console.error(warn(`⚠ provider « ${id} » inconnu — options : ${ctx.PROVIDERS.map((x) => x.id).join(", ")}`));
}

if (argOf("--model")) ctx.setModel(argOf("--model"));

const oneShot = args.includes("-p") || args.includes("--prompt");
const oneShotText = oneShot ? argOf("-p") || argOf("--prompt") : null;

/* ---------- main ---------- */
(async () => {
  if (oneShot) return oneShotRun(oneShotText);
  startRepl();
})();
