/* chat.js — Appels provider (streaming + tool_calls) et boucle ask. */

const ctx = require("./context");
const { TOOL_DEFS, execTool } = require("./tools");
const { parseTodos } = require("./todos");
const {
  accent, ok, dim, warn,
  startSpinner, sseEvents, estTok, fmtTok,
} = require("./ui");

const FIRST_TOKEN_TIMEOUT = 30000;
const MAX_TOOL_ROUNDS = 10;

/* ---------- prompt système ---------- */
function buildSystemMessage() {
  let s =
    "Tu es Castor 🦫, un agent de code expert qui travaille sur le projet de l'utilisateur, " +
    "dans son terminal. Réponds en français, concis et actionnable, formaté markdown léger.\n" +
    'Si la tâche a plusieurs étapes, commence par une liste "- [ ] étape" puis coche "- [x]" ' +
    "les étapes faites dans une reprise de la même liste plus bas.";

  if (ctx.stickySkill()) s += `\n\n# Compétence activée : ${ctx.stickySkill().name}\n${ctx.stickySkill().body}`;
  if (ctx.memory().length)
    s += "\n\n# Mémoire persistante (faits donnés par l'utilisateur)\n" +
      ctx.memory().map((m) => `- ${m.text}`).join("\n");

  s += `\n\n# Contexte\nDate : ${new Date().toLocaleDateString("fr-FR")} · ` +
    `Provider : ${ctx.provider().label} · Modèle : ${ctx.currentModel()}`;
  return { role: "system", content: s };
}

/* ---------- streamChat ---------- */
async function streamChat(onDelta) {
  const p = ctx.provider();
  const key = process.env.CASTOR_KEY || ctx.cfg().keys[p.id] || "";
  if (p.needsKey && !key) {
    throw Object.assign(new Error(`clé ${p.label} manquante — /key pour la définir`), { code: "no-key" });
  }

  const headers = { "content-type": "application/json" };
  if (key) headers.authorization = `Bearer ${key}`;
  if (p.id === "openrouter") {
    headers["http-referer"] = "https://github.com/DmzGamingYT/castor";
    headers["x-title"] = "Castor CLI";
  }

  const abortCtrl = new AbortController();
  ctx.setAbortCtrl(abortCtrl);
  const firstTokenTimer = setTimeout(() => {
    abortCtrl.abort(new Error(`aucune réponse de ${p.label} en ${FIRST_TOKEN_TIMEOUT / 1000} s`));
  }, FIRST_TOKEN_TIMEOUT);

  let reader = null;
  try {
    const t0 = Date.now();
    const body = {
      model: ctx.currentModel(),
      messages: [buildSystemMessage(), ...ctx.messages()],
      stream: true,
    };
    if (ctx.toolsEnabled() && p.id !== "ollama" && p.id !== "lmstudio") {
      body.tools = TOOL_DEFS;
    }

    const res = await fetch(`${p.baseURL.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers,
      signal: abortCtrl.signal,
      body: JSON.stringify(body),
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
    const toolCallsMap = new Map();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const events = buf.split(/\n\n/);
      buf = events.pop() || "";
      for (const data of sseEvents(events.join("\n\n"))) {
        if (data === "[DONE]") {
          clearTimeout(firstTokenTimer);
          return buildResult(full, toolCallsMap, Date.now() - t0);
        }
        let parsed;
        try { parsed = JSON.parse(data); } catch { continue; }
        if (parsed.error) {
          throw new Error(parsed.error.message || "erreur du provider en cours de stream");
        }
        const delta = parsed.choices?.[0]?.delta;
        if (!delta) continue;

        const content = delta.content ?? "";
        if (content) {
          if (!gotFirst) { gotFirst = true; clearTimeout(firstTokenTimer); }
          full += content;
          onDelta(content);
        }
        if (delta.tool_calls) {
          if (!gotFirst) { gotFirst = true; clearTimeout(firstTokenTimer); }
          for (const tc of delta.tool_calls) {
            const idx = tc.index ?? 0;
            if (!toolCallsMap.has(idx)) {
              toolCallsMap.set(idx, { id: tc.id || "", name: "", arguments: "" });
            }
            const cur = toolCallsMap.get(idx);
            if (tc.id) cur.id = tc.id;
            if (tc.function?.name) cur.name += tc.function.name;
            if (tc.function?.arguments) cur.arguments += tc.function.arguments;
          }
        }
      }
    }
    return buildResult(full, toolCallsMap, Date.now() - t0);
  } finally {
    clearTimeout(firstTokenTimer);
    ctx.setAbortCtrl(null);
    try { await reader?.cancel(); reader?.releaseLock(); } catch { /* noop */ }
  }
}

function buildResult(full, toolCallsMap, ms) {
  const toolCalls = [];
  for (const [, tc] of toolCallsMap) {
    if (tc.name) toolCalls.push(tc);
  }
  return { content: full, tool_calls: toolCalls, ms };
}

/* ---------- helpers ---------- */
function renderTodos(todos) {
  if (!todos.length) return;
  console.log(dim("  ── plan ──"));
  for (const t of todos) {
    console.log(`  ${t.done ? ok("☑") : accent("☐")} ${t.done ? dim(t.label) : t.label}`);
  }
}

function truncate(s, max) {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

/* ---------- ask (boucle tool-calling) ---------- */
async function ask(text) {
  ctx.pushMessage({ role: "user", content: text });
  ctx.trimMessages();

  let totalMs = 0;
  let round = 0;

  while (round < MAX_TOOL_ROUNDS) {
    round++;
    const spinner = startSpinner(`${ctx.provider().label} réfléchit…`);
    let first = true;
    let result;

    try {
      result = await streamChat((delta) => {
        if (first) { first = false; spinner.stop(); process.stdout.write("\n"); }
        process.stdout.write(delta);
      });
    } catch (err) {
      spinner.stop();
      if (err.name === "AbortError") {
        console.log(warn("\n⚠ interrompu"));
      } else {
        console.log(warn(`\n⚠ ${err.message}`));
        if (err.code === "no-key")
          console.log(dim(`  → obtiens-en une sur ${ctx.provider().keyUrl || "le site du provider"} puis tape /key`));
      }
      ctx.popMessage();
      return false;
    }
    totalMs += result.ms;

    if (!result.tool_calls.length) {
      const inTok = estTok(JSON.stringify(ctx.messages()).length);
      const outTok = estTok(result.content.length);
      ctx.usageInc(inTok + outTok);
      ctx.setLastTodos(parseTodos(result.content));
      console.log("\n" + dim(`  ── ${totalMs / 1000}s · ~${fmtTok(inTok)}↑ ${fmtTok(outTok)}↓ tok · total ${fmtTok(ctx.cfg().usage.totalTokens)} tok · ${round} appel(s) tool ──`));
      renderTodos(ctx.lastTodos());
      console.log();
      ctx.pushMessage({ role: "assistant", content: result.content });
      return true;
    }

    spinner.stop();
    process.stdout.write("\n");

    const assistantMsg = { role: "assistant" };
    if (result.content) assistantMsg.content = result.content;
    assistantMsg.tool_calls = result.tool_calls.map((tc) => ({
      id: tc.id,
      type: "function",
      function: { name: tc.name, arguments: tc.arguments },
    }));
    ctx.pushMessage(assistantMsg);

    for (const tc of result.tool_calls) {
      let args;
      try { args = JSON.parse(tc.arguments); } catch { args = {}; }
      const label = `${tc.name}(${Object.entries(args).map(([k, v]) => `${k}=${typeof v === "string" ? truncate(v, 40) : v}`).join(", ")})`;
      process.stdout.write(dim(`  ⚙ ${label}…\n`));
      const out = await execTool(tc.name, args);
      const preview = typeof out === "string" ? truncate(out, 300) : truncate(JSON.stringify(out), 300);
      process.stdout.write(dim(`  ↳ ${preview}\n`));
      ctx.pushMessage({
        role: "tool",
        tool_call_id: tc.id,
        content: typeof out === "string" ? out : JSON.stringify(out, null, 2),
      });
    }
    ctx.trimMessages();
  }

  console.log(warn(`\n⚠ ${MAX_TOOL_ROUNDS} rounds tools atteints — modèle forcé à répondre`));
  return true;
}

/* ---------- /demo ---------- */
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
  ctx.setLastTodos(parseTodos(full));
  console.log(dim("\n  ── démo locale · 0 réseau · 0 € ──"));
  renderTodos(ctx.lastTodos());
  console.log(dim("\n  (démo hors-ligne — branche un provider avec /key ou /provider pour du réel)\n"));
}

module.exports = { buildSystemMessage, streamChat, ask, renderTodos, demo };
