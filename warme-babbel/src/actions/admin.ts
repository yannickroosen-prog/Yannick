"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { emailUser } from "@/lib/email/notify";
import { accountStatusEmail, listingApprovedEmail } from "@/emails/templates";
import type { AccountStatus, ListingStatus, ReportStatus, UserRole } from "@/lib/database.types";
import { z } from "zod";

const roleSchema = z.enum(["seeker", "listener", "admin"]);
const accountSchema = z.enum(["active", "suspended", "blocked"]);
const listingSchema = z.enum(["pending", "approved", "rejected"]);
const reportStatusSchema = z.enum(["open", "in_behandeling", "afgehandeld", "afgewezen"]);
const uuid = z.string().uuid();

export async function adminSetRoleAction(formData: FormData) {
  await requireAdmin();
  const userId = uuid.parse(formData.get("userId"));
  const role = roleSchema.parse(formData.get("role")) as UserRole;
  const note = String(formData.get("note") ?? "").slice(0, 500) || null;
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_role", { p_user: userId, p_role: role, p_note: note });
  revalidatePath(`/admin/gebruikers/${userId}`);
  redirect(`/admin/gebruikers/${userId}${error ? `?fout=${encodeURIComponent(error.message)}` : "?ok=rol"}`);
}

export async function adminSetAccountStatusAction(formData: FormData) {
  await requireAdmin();
  const userId = uuid.parse(formData.get("userId"));
  const status = accountSchema.parse(formData.get("status")) as AccountStatus;
  const note = String(formData.get("note") ?? "").slice(0, 500) || null;
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_account_status", { p_user: userId, p_status: status, p_note: note });
  if (!error) {
    try {
      await emailUser(userId, (name) => accountStatusEmail({ name, status, note }));
    } catch (e) {
      console.error(e);
    }
  }
  revalidatePath(`/admin/gebruikers/${userId}`);
  redirect(`/admin/gebruikers/${userId}${error ? `?fout=${encodeURIComponent(error.message)}` : "?ok=status"}`);
}

export async function adminSetListingStatusAction(formData: FormData) {
  await requireAdmin();
  const userId = uuid.parse(formData.get("userId"));
  const status = listingSchema.parse(formData.get("status")) as ListingStatus;
  const note = String(formData.get("note") ?? "").slice(0, 500) || null;
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_listing_status", { p_user: userId, p_status: status, p_note: note });
  if (!error && status === "approved") {
    try {
      await emailUser(userId, (name) => listingApprovedEmail({ name }));
    } catch (e) {
      console.error(e);
    }
  }
  revalidatePath(`/admin/gebruikers/${userId}`);
  revalidatePath("/profielen");
  redirect(`/admin/gebruikers/${userId}${error ? `?fout=${encodeURIComponent(error.message)}` : "?ok=lijst"}`);
}

export async function adminAddNoteAction(formData: FormData) {
  await requireAdmin();
  const userId = uuid.parse(formData.get("userId"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 2000);
  if (note) {
    const supabase = await createClient();
    await supabase.rpc("admin_add_note", { p_user: userId, p_note: note });
  }
  revalidatePath(`/admin/gebruikers/${userId}`);
  redirect(`/admin/gebruikers/${userId}?ok=notitie`);
}

export async function adminUpdateReportAction(formData: FormData) {
  await requireAdmin();
  const reportId = uuid.parse(formData.get("reportId"));
  const status = reportStatusSchema.parse(formData.get("status")) as ReportStatus;
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 4000) || null;
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_report", { p_report: reportId, p_status: status, p_notes: notes });
  revalidatePath("/admin/rapporteringen");
  revalidatePath(`/admin/rapporteringen/${reportId}`);
  redirect(`/admin/rapporteringen/${reportId}${error ? `?fout=${encodeURIComponent(error.message)}` : "?ok=1"}`);
}

const placeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  kind: z.enum(["inloophuis", "babbelplek", "luisterlijn", "andere"]),
  description: z.string().trim().max(3000).optional().default(""),
  address: z.string().trim().max(300).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  email: z.string().trim().max(120).optional().default(""),
  opening_hours: z.string().trim().max(1000).optional().default(""),
  regions: z.array(z.string()).default([]),
  is_published: z.boolean().default(false),
  sort_order: z.coerce.number().int().default(0),
});

export async function adminSavePlaceAction(formData: FormData) {
  await requireAdmin();
  const parsed = placeSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    kind: formData.get("kind"),
    description: formData.get("description") ?? "",
    address: formData.get("address") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    opening_hours: formData.get("opening_hours") ?? "",
    regions: formData.getAll("regions").map(String),
    is_published: formData.get("is_published") === "on",
    sort_order: formData.get("sort_order") ?? 0,
  });
  if (!parsed.success) redirect("/admin/plekken?fout=Controleer+de+velden");
  const d = parsed.data;
  const supabase = await createClient();
  const row = {
    name: d.name,
    kind: d.kind,
    description: d.description || null,
    address: d.address || null,
    phone: d.phone || null,
    email: d.email || null,
    opening_hours: d.opening_hours || null,
    regions: d.regions,
    is_published: d.is_published,
    sort_order: d.sort_order,
  };
  const { error } = d.id ? await supabase.from("places").update(row).eq("id", d.id) : await supabase.from("places").insert(row);
  revalidatePath("/admin/plekken");
  revalidatePath("/");
  redirect(`/admin/plekken${error ? `?fout=${encodeURIComponent(error.message)}` : "?ok=1"}`);
}

export async function adminDeletePlaceAction(formData: FormData) {
  await requireAdmin();
  const id = uuid.parse(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("places").delete().eq("id", id);
  revalidatePath("/admin/plekken");
  revalidatePath("/");
  redirect("/admin/plekken?ok=1");
}
