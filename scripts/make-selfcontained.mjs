// Génère un HTML autonome pour le preview (tout inliné).
import { readFileSync, writeFileSync } from "fs";

const dir = new URL(".", import.meta.url).pathname;
let html = readFileSync(`${dir}index.html`, "utf8");

const jsFile = html.match(/src="(\.\/assets\/[^"]+\.js)"/)?.[1];
const cssFile = html.match(/href="(\.\/assets\/[^"]+\.css)"/)?.[1];
if (!jsFile || !cssFile) throw new Error("assets introuvables dans index.html");

const js = readFileSync(`${dir}${jsFile}`, "utf8").replace(/<\/script/gi, "<\\/script");
const css = readFileSync(`${dir}${cssFile}`, "utf8");

html = html.replace(
  /<script[^>]*src="[^"]*\.js"[^>]*><\/script>/,
  `<script type="module">${js}</script>`
);
html = html.replace(
  /<link[^>]*href="\.\/assets\/[^"]*\.css"[^>]*>/,
  `<style>${css}</style>`
);

writeFileSync(`${dir}self-contained.html`, html);
console.log(
  `OK — self-contained.html (${(html.length / 1024).toFixed(0)} KB, js=${jsFile}, css=${cssFile})`
);
