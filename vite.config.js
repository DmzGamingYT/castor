import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { writeFileSync, copyFileSync } from "fs";
import { resolve } from "path";

/**
 * Plugin Vite : copie index.html → 404.html à la fin du build.
 * GitHub Pages sert 404.html pour toute route inconnue,
 * ce qui permet au SPA de gérer le routing côté client.
 */
function spa404Plugin() {
  return {
    name: "spa-404",
    closeBundle() {
      const src = resolve(__dirname, "dist", "index.html");
      const dst = resolve(__dirname, "dist", "404.html");
      try {
        copyFileSync(src, dst);
        console.log("  ✓ 404.html créé pour GitHub Pages SPA routing");
      } catch (e) {
        console.warn("  ⚠ Impossible de copier 404.html:", e.message);
      }
    },
  };
}

// base "/castor/" : déploiement GitHub Pages (dmzgamingyt.github.io/castor).
// Routing History API : chaque sous-route (/castor/desktop, /castor/cli…)
// est résolue par le SPA via 404.html servie par GitHub Pages.
export default defineConfig({
  plugins: [react(), spa404Plugin()],
  base: "/castor/",
  appType: "spa",
  server: { port: 5173 },
  /* vitest : uniquement les tests du front — cli/tests utilise node:test */
  test: {
    include: ["src/**/*.{test,spec}.{js,jsx}"],
  },
});
