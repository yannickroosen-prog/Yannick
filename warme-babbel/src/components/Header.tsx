import Link from "next/link";
import Image from "next/image";
import { MessageCircleHeart, ShieldCheck } from "lucide-react";
import type { CurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signAvatarUrl } from "@/lib/avatars";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationBell } from "@/components/NotificationBell";
import { MobileNav } from "@/components/MobileNav";
import { buttonClasses } from "@/components/ui/Button";
import { UnreadBadge } from "@/components/UnreadBadge";

export async function Header({ me }: { me: CurrentUser | null }) {
  let unread = 0;
  let unreadNotifications = 0;
  let avatarUrl: string | null = null;
  if (me) {
    const supabase = await createClient();
    const [{ data: total }, { count }, url] = await Promise.all([
      supabase.rpc("total_unread"),
      supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null),
      signAvatarUrl(me.profile.avatar_path),
    ]);
    unread = total ?? 0;
    unreadNotifications = count ?? 0;
    avatarUrl = url;
  }

  const links = [
    { href: "/profielen", label: "Warme Babbelaars" },
    ...(me ? [{ href: "/chat", label: "Gesprekken", badge: unread }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-brand-sand/70 bg-brand-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 rounded-full" aria-label="Warme Babbel – home">
          <Image src="/brand/logo-warme-babbel.png" alt="Warme Babbel" width={118} height={60} priority className="h-10 w-auto" />
        </Link>

        <nav aria-label="Hoofdnavigatie" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="relative rounded-full px-4 py-2 font-semibold text-brand-ink-soft hover:bg-brand-beige hover:text-brand-ink">
              {l.label}
              {"badge" in l && <UnreadBadge initial={l.badge ?? 0} userId={me?.id} />}
            </Link>
          ))}
          {me?.profile.role === "admin" && (
            <Link href="/admin" className="flex items-center gap-1 rounded-full px-4 py-2 font-semibold text-brand-red hover:bg-brand-beige">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Beheer
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {me ? (
            <>
              <NotificationBell userId={me.id} initialCount={unreadNotifications} />
              <Link href="/mijn-profiel" className="hidden items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-brand-beige md:flex" aria-label="Mijn profiel">
                <Avatar src={avatarUrl} name={me.profile.display_name} size="xs" />
                <span className="max-w-32 truncate text-sm font-semibold">{me.profile.display_name}</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/inloggen" className={buttonClasses("ghost", "sm", "hidden sm:inline-flex")}>
                Inloggen
              </Link>
              <Link href="/registreren" className={buttonClasses("primary", "sm")}>
                <MessageCircleHeart className="h-4 w-4" aria-hidden="true" />
                Registreren
              </Link>
            </>
          )}
          <MobileNav me={me ? { name: me.profile.display_name, isAdmin: me.profile.role === "admin" } : null} unread={unread} />
        </div>
      </div>
    </header>
  );
}
