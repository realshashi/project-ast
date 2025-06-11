import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false, // Disable source maps in production
    rollupOptions: {
      output: {
        sourcemapExcludeSources: true,
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          solana: [
            "@solana/web3.js",
            "@solana/wallet-adapter-react",
            "@solana/wallet-adapter-react-ui",
            "@solana/wallet-adapter-base",
            "@solana/wallet-adapter-wallets",
          ],
          anchor: ["@project-serum/anchor"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["buffer", "process", "global"],
    exclude: ["@solana/web3.js", "@solana/wallet-adapter-base"],
  },
});
