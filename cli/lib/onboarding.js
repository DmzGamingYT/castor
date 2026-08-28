/* onboarding.js — Bannière, aide, et premier lancement. */

const ctx = require("./context");
const store = require("./store");
const { PROVIDERS } = require("./providers");
const { accent, ok, dim, boldc } = require("./ui");

function printBanner() {
  console.log(`\n${accent("◆ castor")} ${dim(`v${ctx.VERSION}`)} ${dim("— le castor qui code pour toi")}\n${dim(`  provider : ${ctx.provider().label} · modèle : ${ctx.currentModel()} · tools : ${ctx.toolsEnabled() ? "on" : "off"} · 0 € facturés`)}\n${dim("  /help commandes · /demo voir le rendu sans clé · Ctrl+C quitter")}\n`);
}

function printHelp() {
  console.log(`\n${boldc("castor")} ${dim(ctx.VERSION)} — agent de code gratuit

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
  /tools           lister/activer/désactiver les tools
  /save [nom]      sauvegarder la conversation (auto: date+heure)
  /load <nom>      restaurer une session sauvegardée
  /history         lister les sessions sauvegardées
  /delete <nom>    supprimer une session
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

async function onboardIfNeeded(rl) {
  if (store.loadConfig && ctx.cfg().keys && Object.keys(ctx.cfg().keys).length) return;
  if (!process.stdout.isTTY) return;
  if (ctx.cfg().onboarded) return;

  console.log(accent("\nPremier lancement ? Deux minutes de config.\n"));
  console.log(boldc("\nProviders disponibles :"));
  PROVIDERS.forEach((p, i) => {
    const keyState = p.needsKey ? dim("clé manquante") : ok("local");
    console.log(`  ${i + 1}. ${p.label.padEnd(18)} ${dim(p.hint)} · ${keyState}`);
  });
  console.log(dim("  /provider <nom|numéro> pour changer\n"));

  const answer = await new Promise((res) =>
    rl.question(accent("Numéro du provider (entrée = OpenRouter) : "), res)
  );
  const n = parseInt(answer, 10);
  if (n >= 1 && n <= PROVIDERS.length) {
    ctx.setProvider(PROVIDERS[n - 1].id);
  }
  const p = ctx.provider();
  if (p.needsKey) {
    const key = await new Promise((res) =>
      rl.question(accent(`Clé ${p.label} (${p.keyUrl}) — entrée pour plus tard : `), res)
    );
    if (key.trim()) ctx.setKey(key.trim());
  }
  ctx.cfg().onboarded = true;
  ctx.saveConfig();
  console.log(ok("\n✓ C'est parti — tout est stocké dans ~/.castor/\n"));
}

module.exports = { printBanner, printHelp, onboardIfNeeded };
