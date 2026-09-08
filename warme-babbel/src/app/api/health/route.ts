import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    email: !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM,
    time: new Date().toISOString(),
  });
}
