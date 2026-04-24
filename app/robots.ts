import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/admin/",
          "/onboarding",
          "/entrenamiento",
          "/perfil",
          "/bienvenida",
          "/preguntanos",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
