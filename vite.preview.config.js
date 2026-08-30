import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* Config temporaire pour le preview : un seul fichier HTML autonome
   (tous les chunks inlinés) afin de l'afficher sans serveur. */
export default defineConfig({
  plugins: [react()],
  base: "./",
  appType: "spa",
  build: {
    outDir: ".preview-build",
    emptyOutDir: true,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
