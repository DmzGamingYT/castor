/* Génère renderer/preview-demo.html : la vraie UI Desktop (index.html + styles.css
   + app.js) avec le simulateur preview-shim.js, ouvrable dans un simple navigateur.
   Usage : node scripts/preview-demo.cjs  (à relancer après chaque modif du renderer) */
const fs = require("node:fs");
const path = require("node:path");

const dir = path.join(__dirname, "..", "renderer");
let html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
const css = fs.readFileSync(path.join(dir, "styles.css"), "utf8");
const app = fs.readFileSync(path.join(dir, "app.js"), "utf8");
const shim = fs.readFileSync(path.join(__dirname, "preview-shim.js"), "utf8");

// 1 · la CSP bloque les scripts inline : on la retire pour la démo
html = html.replace(/<meta[^>]*Content-Security-Policy[^>]*>\s*/i, "<!-- CSP retirée pour la démo hors-Electron -->\n");

// 2 · CSS inliné
html = html.replace('<link rel="stylesheet" href="styles.css" />', "<style>\n" + css + "\n</style>");

// 3 · shim AVANT app.js (définit window.castor), puis app.js inliné
html = html.replace(
  '<script src="app.js"></script>',
  "<script>\n" + shim + "\n</script>\n<script>\n" + app + "\n</script>"
);

// 4 · titre distinct
html = html.replace("<title>Castor</title>", "<title>Castor — démo ergonomie (simulateur)</title>");

const out = path.join(dir, "preview-demo.html");
fs.writeFileSync(out, html);
console.log("généré :", out, "(" + Math.round(html.length / 1024) + " Ko)");
