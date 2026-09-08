import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ACCOUNT_STATUS_LABELS, LISTING_STATUS_LABELS, ROLE_LABELS } from "@/lib/options";
import { Badge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { Pagination } from "@/components/Pagination";

export const metadata: Metadata = { title: "Gebruikers · Beheer" };
export const dynamic = "force-dynamic";
const PAGE = 25;

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const role = sp.rol ?? "";
  const status = sp.status ?? "";
  const listing = sp.lijst ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const supabase = await createClient();
  let query = supabase.from("profiles").select("*", { count: "exact" });
  if (q) query = query.ilike("display_name", `%${q.replace(/[%,()]/g, " ")}%`);
  if (role) query = query.eq("role", role as "seeker");
  if (status) query = query.eq("account_status", status as "active");
  if (listing) query = query.eq("listing_status", listing as "pending");
  const { data, count } = await query.order("created_at", { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE));
  const makeHref = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (role) u.set("rol", role);
    if (status) u.set("status", status);
    if (listing) u.set("lijst", listing);
    if (p > 1) u.set("page", String(p));
    return `/admin/gebruikers?${u.toString()}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Gebruikers</h1>
      <form method="get" className="grid gap-3 rounded-3xl bg-white p-4 shadow-card sm:grid-cols-5">
        <label className="sm:col-span-2 text-sm font-semibold">
          Zoek op naam
          <Input name="q" defaultValue={q} className="mt-1" />
        </label>
        <label className="text-sm font-semibold">
          Rol
          <Select name="rol" defaultValue={role} className="mt-1">
            <option value="">Alle</option>
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </label>
        <label className="text-sm font-semibold">
          Status
          <Select name="status" defaultValue={status} className="mt-1">
            <option value="">Alle</option>
            {Object.entries(ACCOUNT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </label>
        <div className="flex items-end gap-2">
          <Select name="lijst" defaultValue={listing} aria-label="Lijststatus">
            <option value="">Lijst: alle</option>
            {Object.entries(LISTING_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Button type="submit">Zoek</Button>
        </div>
      </form>
      <p className="text-sm text-brand-ink-muted">{count ?? 0} gebruikers</p>
      <div className="overflow-x-auto rounded-3xl bg-white shadow-card">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-brand-beige text-left text-xs uppercase tracking-wide text-brand-ink-muted">
            <tr><th className="px-4 py-3">Naam</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Lijst</th><th className="px-4 py-3">Sinds</th></tr>
          </thead>
          <tbody className="divide-y divide-brand-sand">
            {(data ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-brand-cream">
                <td className="px-4 py-3"><Link href={`/admin/gebruikers/${p.id}`} className="font-semibold text-brand-red underline">{p.display_name}</Link></td>
                <td className="px-4 py-3">{ROLE_LABELS[p.role]}</td>
                <td className="px-4 py-3"><Badge tone={p.account_status === "active" ? "green" : "red"}>{ACCOUNT_STATUS_LABELS[p.account_status]}</Badge></td>
                <td className="px-4 py-3">{p.role === "listener" ? <Badge tone={p.listing_status === "approved" ? "green" : p.listing_status === "pending" ? "orange" : "neutral"}>{LISTING_STATUS_LABELS[p.listing_status]}{p.is_hidden ? " · verborgen" : ""}</Badge> : "—"}</td>
                <td className="px-4 py-3 text-brand-ink-muted">{formatDate(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
    </div>
  );
}
