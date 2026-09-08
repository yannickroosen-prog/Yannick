import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/profielen"], disallow: ["/profiel/", "/chat", "/mijn-profiel", "/instellingen", "/meldingen", "/admin", "/api/", "/auth/"] },
    ],
    host: siteUrl(),
  };
}
