/* repl.js — Boucle REPL, file d'attente, signaux, auto-save. */

const readline = require("node:readline");
const ctx = require("./context");
const { handleCommand } = require("./commands");
const { ask } = require("./chat");
const { printBanner, onboardIfNeeded } = require("./onboarding");
const { accent, dim, warn } = require("./ui");

function startRepl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: accent("❯ "),
  });

  printBanner();
  onboardIfNeeded(rl);

  const queue = [];
  let busy = false;
  let wantExit = false;

  function autoSave() {
    if (!ctx.messages().length) return;
    const name = ctx.currentSessionName() || ctx.autoSessionName();
    ctx.saveSession(name);
    console.log(dim(`  (session auto-sauvegardée : ${name})`));
  }

  function maybeExit() {
    if (wantExit && !busy && !queue.length) {
      autoSave();
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
    if (ctx.abortCtrl() && busy) {
      ctx.abortCtrl().abort();
    } else {
      autoSave();
      console.log(dim("à bientôt 🦫"));
      process.exit(0);
    }
  });

  rl.on("close", () => {
    wantExit = true;
    maybeExit();
  });
}

async function oneShotRun(text) {
  if (!text) {
    console.error(warn('Usage : castor -p "ta question"'));
    process.exit(1);
  }
  const { ask: doAsk } = require("./chat");
  const okDone = await doAsk(text);
  process.exit(okDone ? 0 : 1);
}

module.exports = { startRepl, oneShotRun };
