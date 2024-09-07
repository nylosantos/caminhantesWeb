import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Bolão Caminhantes",
        short_name: "Caminhantes",
        theme_color: "#e5e7eb",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        display_override: ["window-controls-overlay"],
        icons: [
          { src: "192x192.png", sizes: "192x192", type: "image/png" },
          { src: "256x256.png", sizes: "256x256", type: "image/png" },
          { src: "384x384.png", sizes: "384x384", type: "image/png" },
          { src: "512x512.png", sizes: "512x512", type: "image/png" },
          {
            purpose: "maskable",
            sizes: "512x512",
            src: "maskable.png",
            type: "image/png",
          },
        ],
        description:
          "Aplicativo web criado pelos Caminhantes. Nós torcemos pelo Liverpool FC, e seguimos o futebol como nossa grande paixão. Venha brincar conosco!",
        lang: "pt",
        categories: ["sports", "social", "journalism"],
        screenshots: [
          {
            src: "HomeScreenshot.png",
            type: "image/png",
            sizes: "402x869",
            form_factor: "narrow",
          },
          {
            src: "PoolPage1Screenshot.png",
            type: "image/png",
            sizes: "402x869",
            form_factor: "narrow",
          },
          {
            src: "PoolPage2Screenshot.png",
            type: "image/png",
            sizes: "402x869",
            form_factor: "narrow",
          },
          {
            src: "SettingsScreenshot.png",
            type: "image/png",
            sizes: "402x869",
            form_factor: "narrow",
          },
          {
            src: "SearchScreenshot.png",
            type: "image/png",
            sizes: "402x869",
            form_factor: "narrow",
          },
          {
            src: "PoolPage3Screenshot.png",
            type: "image/png",
            sizes: "402x869",
            form_factor: "narrow",
          },
          {
            src: "HomeWideScreenshot.png",
            type: "image/png",
            sizes: "1920x959",
            form_factor: "wide",
          },
          {
            src: "LoginScreenshot.png",
            type: "image/png",
            sizes: "402x869",
            form_factor: "narrow",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 6000000,
      },
    }),
  ],
});
