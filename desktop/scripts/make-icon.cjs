/* Génère l'icône Castor : tuile ambrée arrondie + castor de chantier 🦫
   depuis la source SVG src/icon.svg. Rendu hors-écran dans Chromium
   (même moteur que l'app), export iconset macOS -> icns + PNG 512 + ICO.
   Usage : npx electron scripts/make-icon.cjs */
const { app, BrowserWindow } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const SIZE = 1024;
const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "build");
const ICONSET = path.join(BUILD, "icon.iconset");
const ICON_SRC = path.join(ROOT, "src", "icon.svg");

const SIZES = [16, 32, 64, 128, 256, 512, 1024];

function pngIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // type icône
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = [];
  const datas = [];
  for (const { w, png } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(w % 256, 0);
    e.writeUInt8(w % 256, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // réservé
    e.writeUInt16LE(1, 4); // plans
    e.writeUInt16LE(32, 6); // bits/pixel
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    datas.push(png);
    offset += png.length;
  }
  return Buffer.concat([header, ...entries, ...datas]);
}

app.whenReady().then(async () => {
  if (!fs.existsSync(ICON_SRC)) {
    console.error(`icône source introuvable : ${ICON_SRC}`);
    app.exit(1);
  }
  const svg = fs.readFileSync(ICON_SRC, "utf8");

  // on extrait le viewBox pour un rendu net à la taille cible
  const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1] || "0 0 1024 1024";
  const [, , vbW, vbH] = vb.split(/\s+/).map(Number);

  const HTML = `<!doctype html><html><body style="margin:0;background:transparent">
<div style="width:${vbW}px;height:${vbH}px;display:flex;align-items:center;justify-content:center">
  ${svg}
</div>
</body></html>`;

  fs.mkdirSync(ICONSET, { recursive: true });

  const win = new BrowserWindow({
    width: vbW,
    height: vbH,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: { offscreen: true },
  });
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(HTML)}`);
  await new Promise((r) => setTimeout(r, 400)); // laisse le rendu se faire

  const shot = await win.webContents.capturePage({ x: 0, y: 0, width: vbW, height: vbH });
  if (!shot || shot.isEmpty()) {
    console.error("capture vide");
    app.exit(1);
  }
  const master = shot.getSize().width === SIZE ? shot : shot.resize({ width: SIZE });

  for (const s of SIZES) {
    const png = master.resize({ width: s, quality: "best" }).toPNG();
    fs.writeFileSync(path.join(ICONSET, `icon_${s}x${s}.png`), png);
    if (s <= 512) {
      fs.writeFileSync(path.join(ICONSET, `icon_${s}x${s}@2x.png`), png);
    }
  }

  // PNG standalone pour Windows/Linux
  fs.writeFileSync(
    path.join(BUILD, "icon.png"),
    master.resize({ width: 512, quality: "best" }).toPNG()
  );

  // ICO (PNG embarqués) pour Windows
  const icoPngs = [16, 32, 48, 256].map((s) => ({
    w: s,
    png: master.resize({ width: s, quality: "best" }).toPNG(),
  }));
  fs.writeFileSync(path.join(BUILD, "icon.ico"), pngIco(icoPngs));

  // copie de la source SVG
  fs.writeFileSync(path.join(BUILD, "icon.svg"), svg);

  win.destroy();

  try {
    execSync(`iconutil -c icns "${ICONSET}" -o "${path.join(BUILD, "icon.icns")}"`);
    console.log("✓ build/icon.icns + build/icon.png + build/icon.ico générés");
  } catch {
    console.log("ℹ iconutil absent — icon.icns sautée (macOS requis)");
    console.log("✓ build/icon.png + build/icon.ico générés");
  }
  app.exit(0);
});
