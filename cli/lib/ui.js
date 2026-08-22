/* Helpers terminal : couleurs ANSI, spinner, parsing SSE. */

const C = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  amber: "\x1b[38;5;214m",
  gray: "\x1b[90m",
};

const color = (code, s) => (process.stdout.isTTY ? code + s + C.reset : s);
const accent = (s) => color(C.amber, s);
const ok = (s) => color(C.green, s);
const dim = (s) => color(C.gray, s);
const warn = (s) => color(C.red, s);
const boldc = (s) => color(C.bold, s);

/* Spinner minimal pendant l'attente du premier token */
function startSpinner(label) {
  if (!process.stdout.isTTY) return { stop() {} };
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const t = setInterval(() => {
    process.stdout.write(`\r${accent(frames[i++ % frames.length])} ${dim(label)}  `);
  }, 90);
  return {
    stop() {
      clearInterval(t);
      process.stdout.write("\r\x1b[K");
    },
  };
}

/* Découpe un chunk SSE brut en événements data: */
function sseEvents(buffer) {
  return buffer
    .split(/\n\n/)
    .flatMap((evt) =>
      evt
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trim())
    )
    .filter(Boolean);
}

/* Estimation tokens (~4 caractères/token) */
const estTok = (chars) => Math.ceil(chars / 4);
const fmtTok = (n) => (n >= 10000 ? (n / 1000).toFixed(1) + "k" : String(n));

module.exports = { C, accent, ok, dim, warn, boldc, startSpinner, sseEvents, estTok, fmtTok };
