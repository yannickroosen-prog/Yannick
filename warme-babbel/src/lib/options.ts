import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { OptionMap } from "@/lib/constants";

export * from "@/lib/constants";

/** Alle actieve keuzelijsten (regio, thema, …), gegroepeerd per soort. */
export const getOptions = cache(async (): Promise<OptionMap> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profile_options")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  const map: OptionMap = { region: [], theme: [], relation: [], contact_method: [], age_group: [], gender: [] };
  for (const row of data ?? []) map[row.kind].push(row);
  return map;
});
