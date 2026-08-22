import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "/castor/" : déploiement GitHub Pages (dmzgamingyt.github.io/castor).
// Le routage par hash (#/) reste compatible avec un sous-chemin.
export default defineConfig({
  plugins: [react()],
  base: "/castor/",
  server: { port: 5173 },
});
