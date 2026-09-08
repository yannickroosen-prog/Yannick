"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function NotificationBell({ userId, initialCount }: { userId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => setCount(initialCount), [initialCount]);

  useEffect(() => {
    const supabase = createClient();
    const refresh = async () => {
      const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null);
      setCount(count ?? 0);
    };
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, refresh)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <Link href="/meldingen" className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-brand-ink-soft hover:bg-brand-beige" aria-label={count > 0 ? `Meldingen, ${count} ongelezen` : "Meldingen"}>
      <Bell className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute right-1 top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-[11px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
