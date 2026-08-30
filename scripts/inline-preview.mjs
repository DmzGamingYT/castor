/* Inline les assets CSS/JS de .preview-build dans un unique HTML autonome,
   pour un aperçu sans serveur (register_preview htmlPath). */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { resolve } from "path";

const outDir = resolve(".preview-build");
const index = readFileSync(resolve(outDir, "index.html"), "utf8");
const assets = readdirSync(resolve(outDir, "assets"));

const css = assets.find((f) => f.endsWith(".css"));
const js = assets.find((f) => f.endsWith(".js"));
if (!css || !js) {
  console.error("assets css/js introuvables");
  process.exit(1);
}

const style = `<style>${readFileSync(resolve(outDir, "assets", css), "utf8")}</style>`;
const script = `<script type="module">${readFileSync(
  resolve(outDir, "assets", js),
  "utf8"
)}</script>`;

/* remplace les références externes (link css + module script) */
let out = index
  .replace(/<link rel="stylesheet"[^>]*assets\/[^"]*"[^>]*>/, style)
  .replace(/<script type="module"[^>]*assets\/[^"]*"[^>]*>\s*<\/script>/, script);

writeFileSync(resolve(outDir, "index-single.html"), out);
console.log("✓ index-single.html créé (CSS + JS inlinés)");