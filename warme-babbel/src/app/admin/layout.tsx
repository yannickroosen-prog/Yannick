import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, Users, Flag, Building2 } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const supabase = await createClient();
  const { count } = await supabase.from("reports").select("id", { count: "exact", head: true }).in("status", ["open", "in_behandeling"]);
  const items = [
    { href: "/admin", label: "Overzicht", Icon: LayoutDashboard },
    { href: "/admin/gebruikers", label: "Gebruikers", Icon: Users },
    { href: "/admin/rapporteringen", label: "Meldingen", Icon: Flag, badge: count ?? 0 },
    { href: "/admin/plekken", label: "Plekken", Icon: Building2 },
  ];
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-ink px-4 py-3 text-white">
        <p className="font-heading font-bold">Beheer · Warme Babbel</p>
        <nav aria-label="Beheernavigatie" className="flex flex-wrap gap-1">
          {items.map(({ href, label, Icon, badge }) => (
            <Link key={href} href={href} className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white">
              <Icon className="h-4 w-4" aria-hidden="true" /> {label}
              {badge ? <span className="rounded-full bg-brand-orange px-2 text-xs">{badge}</span> : null}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
