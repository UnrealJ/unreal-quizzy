import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // IMPORTANT for GitHub Pages under /unreal-quizzy/
  base: mode === "production" ? "/unreal-quizzy/" : "/",

  server: {
    host: "::",
    port: 8080,
  },

  // Build straight into /docs so Pages can serve it
  build: {
    outDir: "docs",
    emptyOutDir: true,
    assetsDir: "assets",
  },

  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },

  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime", "next-themes", "sonner"],
  },
}));
