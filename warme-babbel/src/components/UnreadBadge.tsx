"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Ongelezen-teller voor gesprekken; realtime bijgewerkt via notificaties van het type new_message. */
export function UnreadBadge({ initial, userId }: { initial: number; userId?: string }) {
  const [count, setCount] = useState(initial);

  useEffect(() => setCount(initial), [initial]);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    const refresh = async () => {
      const { data } = await supabase.rpc("total_unread");
      if (typeof data === "number") setCount(data);
    };
    const channel = supabase
      .channel(`unread:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, refresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversation_members", filter: `user_id=eq.${userId}` }, refresh)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-brand-red px-1.5 text-xs font-bold text-white" aria-label={`${count} ongelezen`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
