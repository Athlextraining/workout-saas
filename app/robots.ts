import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/seo/site";

const PRIVATE_PATHS = [
  "/api/",
  "/auth/",
  "/admin/",
  "/onboarding",
  "/entrenamiento",
  "/perfil",
  "/bienvenida",
];

const PRIVATE_PATHS_EN = [
  "/en/admin/",
  "/en/onboarding",
  "/en/training",
  "/en/profile",
  "/en/welcome",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_PATHS, ...PRIVATE_PATHS_EN],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
