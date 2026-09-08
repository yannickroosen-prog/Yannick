"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MyConversationRow } from "@/lib/database.types";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelative, truncate, cn } from "@/lib/utils";

/** Gesprekkenlijst; vernieuwt zichzelf realtime bij nieuwe berichten/notificaties. */
export function ConversationList({ userId, initial, avatars }: { userId: string; initial: MyConversationRow[]; avatars: Record<string, string> }) {
  const [rows, setRows] = useState(initial);

  useEffect(() => setRows(initial), [initial]);

  useEffect(() => {
    const supabase = createClient();
    const refresh = async () => {
      const { data } = await supabase
        .from("my_conversations")
        .select("*")
        .eq("is_archived", initial[0]?.is_archived ?? false)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      if (data) setRows(data);
    };
    const channel = supabase
      .channel(`conversations:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, refresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversation_members", filter: `user_id=eq.${userId}` }, refresh)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, initial]);

  return (
    <ul className="divide-y divide-brand-sand overflow-hidden rounded-3xl bg-white shadow-card">
      {rows.map((c) => {
        const name = c.other_display_name ?? "Verwijderde gebruiker";
        const mine = c.last_message_sender === userId;
        const unread = c.unread_count > 0;
        return (
          <li key={c.id}>
            <Link href={`/chat/${c.id}`} className={cn("flex items-center gap-4 px-4 py-4 transition hover:bg-brand-cream sm:px-5", unread && "bg-brand-orange-soft/40")}>
              <Avatar src={c.other_avatar_path ? avatars[c.other_avatar_path] : null} name={name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("truncate font-heading text-lg", unread ? "font-extrabold" : "font-bold")}>{name}</p>
                  <time className="shrink-0 text-xs text-brand-ink-muted" dateTime={c.last_message_at ?? undefined}>{formatRelative(c.last_message_at)}</time>
                </div>
                <p className={cn("truncate text-sm", unread ? "font-semibold text-brand-ink" : "text-brand-ink-soft")}>
                  {c.last_message_preview ? `${mine ? "Jij: " : ""}${truncate(c.last_message_preview, 90)}` : "Nog geen berichten"}
                </p>
              </div>
              {unread && (
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-brand-red px-2 py-0.5 text-xs font-bold text-white" aria-label={`${c.unread_count} ongelezen`}>
                  {c.unread_count}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
