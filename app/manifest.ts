import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/shared/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Entrenamiento ATHX`,
    short_name: SITE_NAME,
    description:
      "Programación y entrenamiento ATHX. Plan semanal y seguimiento.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "es",
    categories: ["fitness", "health", "sports"],
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
