import { cookies } from "next/headers";

/** Draait de app in een iframe (embed-modus)? Cookie wordt door de middleware gezet. */
export async function isEmbedded(): Promise<boolean> {
  const store = await cookies();
  return store.get("wb_embed")?.value === "1";
}
