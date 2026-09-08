import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Archive } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { signAvatarUrl } from "@/lib/avatars";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ReportDialog } from "@/components/ReportDialog";
import { BlockButton } from "@/components/BlockButton";
import { setArchivedAction, markConversationReadAction } from "@/actions/chat";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert } from "@/components/ui/Alert";

export const metadata: Metadata = { title: "Gesprek" };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAGE = 50;

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const me = await requireUser(`/chat/${id}`);
  const supabase = await createClient();

  // RLS: enkel leden krijgen het gesprek terug; anders 404.
  const { data: conv } = await supabase.from("my_conversations").select("*").eq("id", id).maybeSingle();
  if (!conv) notFound();

  const [{ data: messages }, avatarUrl, { data: blockRow }] = await Promise.all([
    supabase.from("messages").select("*").eq("conversation_id", id).order("id", { ascending: false }).limit(PAGE),
    signAvatarUrl(conv.other_avatar_path),
    conv.other_user_id ? supabase.from("blocks").select("blocked_id").eq("blocker_id", me.id).eq("blocked_id", conv.other_user_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  await markConversationReadAction(id);

  const otherName = conv.other_display_name ?? "Verwijderde gebruiker";
  const otherGone = !conv.other_user_id || conv.other_account_status !== "active";
  const iBlocked = !!blockRow;
  const canWrite = !otherGone && !conv.is_blocked;

  return (
    <div className="page-shell mx-auto flex w-full max-w-3xl flex-col px-0 sm:px-6 sm:py-6">
      <div className="flex flex-col overflow-hidden bg-white shadow-card sm:rounded-3xl" style={{ height: "calc(100dvh - 4rem)", maxHeight: "56rem" }}>
        <header className="flex items-center gap-3 border-b border-brand-sand px-3 py-2 sm:px-5 sm:py-3">
          <Link href="/chat" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brand-ink-soft hover:bg-brand-beige" aria-label="Terug naar gesprekken">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          {conv.other_user_id ? (
            <Link href={`/profiel/${conv.other_user_id}`} className="flex min-w-0 items-center gap-3 rounded-full pr-2 hover:bg-brand-beige">
              <Avatar src={avatarUrl} name={otherName} size="sm" />
              <span className="min-w-0">
                <span className="block truncate font-heading text-lg font-bold leading-tight">{otherName}</span>
                <span className="block text-xs text-brand-ink-muted">{conv.other_role === "listener" ? "Warme Babbelaar" : conv.other_role === "admin" ? "Similes" : "Babbelzoeker"}</span>
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar name="?" size="sm" />
              <span className="font-heading text-lg font-bold">{otherName}</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1">
            {conv.other_user_id && (
              <>
                <ReportDialog targetConversationId={id} targetUserId={conv.other_user_id} label="Melden" compact />
                <BlockButton userId={conv.other_user_id} name={otherName} blocked={iBlocked} returnTo={`/chat/${id}`} compact />
              </>
            )}
            <form action={setArchivedAction}>
              <input type="hidden" name="conversationId" value={id} />
              <input type="hidden" name="archived" value={conv.is_archived ? "0" : "1"} />
              <SubmitButton variant="ghost" size="sm" aria-label={conv.is_archived ? "Uit archief halen" : "Archiveren"} title={conv.is_archived ? "Uit archief halen" : "Archiveren"}>
                <Archive className="h-4 w-4" aria-hidden="true" />
              </SubmitButton>
            </form>
          </div>
        </header>

        {conv.is_blocked && (
          <div className="px-3 pt-3 sm:px-5">
            <Alert tone="warning">{iBlocked ? `Je hebt ${otherName} geblokkeerd. Deblokkeer om opnieuw berichten te sturen.` : "Je kan in dit gesprek geen berichten meer sturen."}</Alert>
          </div>
        )}
        {otherGone && !conv.is_blocked && (
          <div className="px-3 pt-3 sm:px-5">
            <Alert tone="info">Deze gebruiker is niet meer actief op Warme Babbel.</Alert>
          </div>
        )}
        {conv.other_role === "listener" && (messages?.length ?? 0) === 0 && (
          <div className="px-3 pt-3 sm:px-5">
            <Alert tone="info" title="Tip voor je eerste bericht">
              Vertel kort wie je bent en wat je situatie is, waarom dit profiel je aansprak, en hoe je het liefst contact hebt (bellen, afspreken, videocall, e-mail).
            </Alert>
          </div>
        )}

        <ChatWindow
          conversationId={id}
          meId={me.id}
          otherName={otherName}
          initialMessages={(messages ?? []).slice().reverse()}
          canWrite={canWrite}
          pageSize={PAGE}
        />
        {!canWrite && (
          <div className="border-t border-brand-sand px-4 py-3 text-center text-sm text-brand-ink-muted">
            <Badge tone="neutral">Gesprek is gesloten</Badge>
          </div>
        )}
      </div>
    </div>
  );
}
