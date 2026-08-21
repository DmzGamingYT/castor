/* Génère l'icône Castor : tuile ambrée arrondie + castor 🦫
   Rendu hors-écran dans Chromium (même moteur que l'app), export
   iconset macOS -> icns + PNG 512 pour Windows/Linux.
   Usage : npx electron scripts/make-icon.cjs */
const { app, BrowserWindow } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const SIZE = 1024;
const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "build");
const ICONSET = path.join(BUILD, "icon.iconset");

const HTML = `<!doctype html><html><body style="margin:0;background:transparent">
<div style="
  width:${SIZE}px;height:${SIZE}px;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#f7c666,#e2952a);
">
  <div style="
    width:${SIZE}px;height:${SIZE}px;border-radius:230px;
    display:flex;align-items:center;justify-content:center;
    box-shadow:inset 0 -40px 90px rgba(120,70,10,.25);
    overflow:hidden;
  ">
    <span style="font-size:600px;line-height:1;transform:translateY(14px)">🦫</span>
  </div>
</div>
</body></html>`;

const SIZES = [16, 32, 64, 128, 256, 512, 1024];

app.whenReady().then(async () => {
  fs.mkdirSync(ICONSET, { recursive: true });

  const win = new BrowserWindow({
    width: SIZE,
    height: SIZE,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: { offscreen: true },
  });
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(HTML)}`);
  await new Promise((r) => setTimeout(r, 700)); // laisse le rendu emoji se faire

  const shot = await win.webContents.capturePage({ x: 0, y: 0, width: SIZE, height: SIZE });
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

  win.destroy();

  execSync(`iconutil -c icns "${ICONSET}" -o "${path.join(BUILD, "icon.icns")}"`);
  console.log("✓ build/icon.icns + build/icon.png générés");
  app.exit(0);
});
