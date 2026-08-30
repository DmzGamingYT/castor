/* Capture les pages clés du site pour le README. */
const { app, BrowserWindow } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const OUT = path.join(__dirname, "..", "docs", "screenshots");
const BASE = "/castor"; // base du routing History API
const SHOTS = [
  ["accueil", "/", 4800],
  ["modeles", "/desktop", 3000],
  ["studio-web", "/espace", 3000],
  ["desktop", "/desktop", 2500],
  ["avancement", "/avancement", 3000],
  ["cli", "/cli", 2500],
];

app.whenReady().then(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const win = new BrowserWindow({
    show: false,
    width: 1440,
    height: 900,
    webPreferences: { offscreen: false },
  });

  for (const [name, route, wait] of SHOTS) {
    await win.loadURL(`http://localhost:5173${BASE}${route}`);
    await new Promise((r) => setTimeout(r, wait));
    const img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(OUT, `${name}.png`), img.toPNG());
    console.log("✓", name);
  }
  app.exit(0);
});

setTimeout(() => { console.error("TIMEOUT"); app.exit(1); }, 60000);
