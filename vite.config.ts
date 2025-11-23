// vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081, // 🚨 Port ajusté. Utilisez 8080 si vous le souhaitez.
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // 🚨 AJOUT CRUCIAL : Exclut qrcode.react de l'optimisation de dépendance de Vite.
  // Ceci résout l'erreur "does not provide an export named 'QRCode'".
  optimizeDeps: {
    exclude: ['qrcode.react'],
  },
}));