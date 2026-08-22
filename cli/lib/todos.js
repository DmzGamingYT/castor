/* Plan de tâches : extraction des cases "- [ ] / - [x]" du markdown
   et rendu terminal. */

function parseTodos(text) {
  const out = [];
  const seen = new Set();
  for (const m of String(text || "").matchAll(/^[-*]\s+\[([ xX])\]\s+(.+)$/gm)) {
    const label = m[2].trim();
    if (!seen.has(label)) {
      seen.add(label);
      out.push({ label, done: m[1].toLowerCase() === "x" });
    } else {
      const t = out.find((t) => t.label === label);
      if (t && m[1].toLowerCase() === "x") t.done = true;
    }
  }
  return out;
}

module.exports = { parseTodos };
