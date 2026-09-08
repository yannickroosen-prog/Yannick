import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TTL_SECONDS = 60 * 60; // 1 uur

/**
 * Signed URL's voor profielfoto's (private bucket).
 * Voor ingelogde bezoekers via hun eigen sessie (storage-RLS); voor anonieme bezoekers via de
 * service role, uitsluitend voor profielen die de database als publiek zichtbaar heeft teruggegeven
 * én waarvan de eigenaar show_photo_public heeft aangezet (die filter doet de aanroeper).
 */
export const signAvatarUrls = cache(async (paths: (string | null | undefined)[], anonymous = false): Promise<Map<string, string>> => {
  const unique = Array.from(new Set(paths.filter((p): p is string => !!p)));
  const map = new Map<string, string>();
  if (unique.length === 0) return map;
  try {
    const client = anonymous && process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient();
    const { data } = await client.storage.from("avatars").createSignedUrls(unique, TTL_SECONDS);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl && !item.error) map.set(item.path, item.signedUrl);
    }
  } catch {
    // Zonder URL toont de UI de standaardavatar.
  }
  return map;
});

export async function signAvatarUrl(path: string | null | undefined, anonymous = false): Promise<string | null> {
  if (!path) return null;
  const map = await signAvatarUrls([path], anonymous);
  return map.get(path) ?? null;
}
