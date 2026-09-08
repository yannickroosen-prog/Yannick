import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/chat", "/mijn-profiel", "/instellingen", "/meldingen", "/admin"];
const AUTH_ONLY_FOR_GUESTS = ["/inloggen", "/registreren"];

/**
 * Vernieuwt de Supabase-sessie (tokens in cookies) en bewaakt beschermde routes.
 * Autorisatie op data gebeurt altijd in de database (RLS); dit is enkel UX-routing.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Belangrijk: getUser() valideert het token bij Supabase (niet enkel de cookie lezen).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/inloggen";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (user && AUTH_ONLY_FOR_GUESTS.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/profielen";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
