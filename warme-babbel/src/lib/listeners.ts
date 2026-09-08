import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Filters } from "@/components/FilterBar";
import type { ProfileRow } from "@/lib/database.types";

export const PAGE_SIZE = 12;

/**
 * Zoekt gelijste Warme Babbelaars. De database (RLS) bepaalt wat zichtbaar is; deze query voegt enkel
 * gebruikersfilters toe. Deterministische sortering: beschikbaar eerst, dan op naam.
 */
export async function searchListeners(filters: Filters, page: number): Promise<{ rows: ProfileRow[]; total: number }> {
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "listener")
    .eq("listing_status", "approved")
    .eq("is_hidden", false)
    .eq("account_status", "active");

  if (filters.regio) query = query.contains("regions", [filters.regio]);
  if (filters.thema) query = query.contains("themes", [filters.thema]);
  if (filters.band) query = query.contains("relations", [filters.band]);
  if (filters.contact) query = query.contains("contact_methods", [filters.contact]);
  if (filters.leeftijd) query = query.eq("age_group", filters.leeftijd);
  if (filters.geslacht) query = query.eq("gender", filters.geslacht);
  if (filters.zonderAfspraak === "1") query = query.eq("walk_in", true);
  if (filters.q && filters.q.trim()) {
    // PostgREST-filterwaarde: komma's en haakjes vermijden in de zoekterm
    const term = filters.q.trim().replace(/[,()"\\%]/g, " ").slice(0, 60);
    query = query.or(`display_name.ilike.%${term}%,story.ilike.%${term}%`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query
    .order("is_available", { ascending: false })
    .order("display_name", { ascending: true })
    .order("id", { ascending: true })
    .range(from, from + PAGE_SIZE - 1);
  return { rows: data ?? [], total: count ?? 0 };
}
