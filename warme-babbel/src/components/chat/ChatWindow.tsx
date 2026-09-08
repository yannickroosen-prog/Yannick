"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MessageRow } from "@/lib/database.types";
import { sendMessageAction, deleteOwnMessageAction, markConversationReadAction } from "@/actions/chat";
import { cn, formatMessageTime } from "@/lib/utils";
import { ReportDialog } from "@/components/ReportDialog";
import { Alert } from "@/components/ui/Alert";

type Props = {
  conversationId: string;
  meId: string;
  otherName: string;
  initialMessages: MessageRow[];
  canWrite: boolean;
  pageSize: number;
};

type Pending = { tempId: string; body: string; created_at: string; failed?: string };

export function ChatWindow({ conversationId, meId, otherName, initialMessages, canWrite, pageSize }: Props) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [pending, setPending] = useState<Pending[]>([]);
  const [hasMore, setHasMore] = useState(initialMessages.length >= pageSize);
  const [loadingMore, setLoadingMore] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);

  const scrollToBottom = useCallback((smooth = false) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Realtime: nieuwe en gewijzigde berichten in dit gesprek (RLS bepaalt of we ze mogen ontvangen)
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const m = payload.new as MessageRow;
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        if (m.sender_id === meId) {
          setPending((prev) => prev.filter((p) => p.body !== m.body));
        } else {
          // Ontvangen terwijl het gesprek open staat → meteen als gelezen markeren
          void markConversationReadAction(conversationId);
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const m = payload.new as MessageRow;
        setMessages((prev) => prev.map((x) => (x.id === m.id ? m : x)));
      })
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, meId]);

  // Bij terugkeer naar het tabblad: gemiste berichten ophalen (netwerkonderbreking)
  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState !== "visible") return;
      const supabase = createClient();
      const lastId = messages.at(-1)?.id ?? 0;
      const { data } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).gt("id", lastId).order("id");
      if (data && data.length) setMessages((prev) => [...prev, ...data.filter((d) => !prev.some((p) => p.id === d.id))]);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [conversationId, messages]);

  useEffect(() => {
    if (stickToBottom.current) scrollToBottom(true);
  }, [messages, pending, scrollToBottom]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const loadMore = async () => {
    if (loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    const supabase = createClient();
    const el = listRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .lt("id", messages[0].id)
      .order("id", { ascending: false })
      .limit(pageSize);
    const older = (data ?? []).slice().reverse();
    setMessages((prev) => [...older, ...prev]);
    setHasMore(older.length >= pageSize);
    setLoadingMore(false);
    requestAnimationFrame(() => {
      if (el) el.scrollTop = el.scrollHeight - prevHeight;
    });
  };

  const submit = async () => {
    const text = body.trim();
    if (!text || !canWrite) return;
    setError(null);
    const tempId = `${Date.now()}-${Math.random()}`;
    setPending((p) => [...p, { tempId, body: text, created_at: new Date().toISOString() }]);
    setBody("");
    stickToBottom.current = true;
    textareaRef.current?.focus();
    const result = await sendMessageAction({ conversationId, body: text });
    if (!result.ok) {
      setPending((p) => p.map((x) => (x.tempId === tempId ? { ...x, failed: result.error } : x)));
      setError(result.error ?? "Versturen mislukt");
    } else {
      // Realtime-event haalt het bericht binnen; als fallback zelf toevoegen na korte tijd
      setTimeout(async () => {
        setPending((p) => p.filter((x) => x.tempId !== tempId));
        setMessages((prev) => {
          if (prev.some((m) => m.id === result.id)) return prev;
          return [...prev, { id: result.id as number, conversation_id: conversationId, sender_id: meId, body: text, created_at: new Date().toISOString(), edited_at: null, deleted_at: null }];
        });
      }, 1500);
    }
  };

  const removeMessage = async (id: number) => {
    if (!confirm("Dit bericht verwijderen? De ander ziet dan 'bericht verwijderd'.")) return;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, deleted_at: new Date().toISOString() } : m)));
    const r = await deleteOwnMessageAction(id);
    if (!r.ok) setError(r.error ?? "Verwijderen mislukt");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  let lastDay = "";

  return (
    <>
      <div ref={listRef} onScroll={onScroll} className="scroll-thin flex-1 overflow-y-auto px-3 py-4 sm:px-5" role="log" aria-live="polite" aria-label={`Berichten met ${otherName}`}>
        {hasMore && (
          <div className="mb-4 text-center">
            <button type="button" onClick={loadMore} disabled={loadingMore} className="rounded-full bg-brand-beige px-4 py-2 text-sm font-semibold text-brand-ink-soft hover:bg-brand-sand disabled:opacity-60">
              {loadingMore ? "Laden…" : "Oudere berichten laden"}
            </button>
          </div>
        )}
        {messages.length === 0 && pending.length === 0 && <p className="py-10 text-center text-brand-ink-muted">Nog geen berichten. Stuur het eerste bericht.</p>}
        <ol className="space-y-1.5">
          {messages.map((m) => {
            const mine = m.sender_id === meId;
            const day = new Date(m.created_at).toDateString();
            const showDay = day !== lastDay;
            lastDay = day;
            return (
              <li key={m.id}>
                {showDay && (
                  <p className="my-4 text-center text-xs font-semibold uppercase tracking-wide text-brand-ink-muted">
                    {new Date(m.created_at).toLocaleDateString("nl-BE", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                )}
                <div className={cn("group flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
                  {mine && !m.deleted_at && (
                    <button type="button" onClick={() => removeMessage(m.id)} className="rounded-full p-2 text-brand-ink-muted opacity-0 transition hover:bg-brand-beige hover:text-brand-red focus:opacity-100 group-hover:opacity-100" aria-label="Bericht verwijderen">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                  <div className={cn("max-w-[85%] rounded-bubble px-4 py-2.5 shadow-bubble sm:max-w-[70%]", mine ? "rounded-br-md bg-brand-orange text-white" : "rounded-bl-md bg-brand-beige text-brand-ink")}>
                    {m.deleted_at ? (
                      <p className={cn("text-sm italic", mine ? "text-white/80" : "text-brand-ink-muted")}>Bericht verwijderd</p>
                    ) : (
                      <p className="whitespace-pre-wrap break-words text-[0.98rem] leading-relaxed">{m.body}</p>
                    )}
                    <p className={cn("mt-1 text-right text-[11px]", mine ? "text-white/75" : "text-brand-ink-muted")}>
                      <time dateTime={m.created_at}>{formatMessageTime(m.created_at)}</time>
                    </p>
                  </div>
                  {!mine && !m.deleted_at && (
                    <span className="opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
                      <ReportDialog targetMessageId={m.id} targetConversationId={conversationId} label="" compact />
                    </span>
                  )}
                </div>
              </li>
            );
          })}
          {pending.map((p) => (
            <li key={p.tempId} className="flex justify-end">
              <div className={cn("max-w-[85%] rounded-bubble rounded-br-md px-4 py-2.5 sm:max-w-[70%]", p.failed ? "bg-red-50 text-brand-red" : "bg-brand-orange/70 text-white")}>
                <p className="whitespace-pre-wrap break-words text-[0.98rem] leading-relaxed">{p.body}</p>
                <p className="mt-1 text-right text-[11px] opacity-80">{p.failed ? `Niet verstuurd: ${p.failed}` : "Versturen…"}</p>
              </div>
            </li>
          ))}
        </ol>
        <div ref={bottomRef} />
      </div>

      {canWrite && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
          className="border-t border-brand-sand bg-white p-3 sm:p-4"
        >
          {error && <Alert tone="error" className="mb-2">{error}</Alert>}
          {!connected && <p className="mb-2 text-xs text-brand-ink-muted">Verbinding maken… berichten worden bijgewerkt zodra de verbinding er is.</p>}
          <div className="flex items-end gap-2">
            <label htmlFor="bericht" className="sr-only">Je bericht</label>
            <textarea
              id="bericht"
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={4000}
              placeholder={`Schrijf een bericht aan ${otherName}…`}
              className="field-input max-h-40 min-h-12 flex-1 resize-none py-3"
              style={{ height: "auto" }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 160) + "px";
              }}
            />
            <button type="submit" disabled={!body.trim()} className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white shadow-sm transition hover:bg-brand-orange-dark disabled:opacity-50" aria-label="Verstuur bericht">
              <Send className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-brand-ink-muted">Enter om te versturen, Shift + Enter voor een nieuwe regel.</p>
        </form>
      )}
    </>
  );
}
