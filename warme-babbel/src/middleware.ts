import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export const EMBED_COOKIE = "wb_embed";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Embed-modus (iframe in warmebabbel.be): ?embed=1 zet een cookie, ?embed=0 wist ze.
  const embedParam = request.nextUrl.searchParams.get("embed");
  const fetchDest = request.headers.get("sec-fetch-dest");
  if (embedParam === "1" || (embedParam === null && fetchDest === "iframe" && !request.cookies.has(EMBED_COOKIE))) {
    response.cookies.set(EMBED_COOKIE, "1", { path: "/", sameSite: "none", secure: true, httpOnly: false, maxAge: 60 * 60 * 24 });
  } else if (embedParam === "0") {
    response.cookies.set(EMBED_COOKIE, "", { path: "/", maxAge: 0 });
  }
  return response;
}

export const config = {
  matcher: [
    // Alles behalve statische bestanden en Next-internals
    "/((?!_next/static|_next/image|favicon.ico|brand/|embed.js|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
