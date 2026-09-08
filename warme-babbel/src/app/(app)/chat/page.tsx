import type { Metadata } from "next";
import { MessageCircleHeart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { signAvatarUrls } from "@/lib/avatars";
import { PageShell, PageTitle } from "@/components/ui/Card";
import { ConversationList } from "@/components/chat/ConversationList";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Gesprekken" };
export const dynamic = "force-dynamic";

export default async function ChatIndexPage({ searchParams }: { searchParams: Promise<{ archief?: string }> }) {
  const me = await requireUser("/chat");
  const { archief } = await searchParams;
  const showArchived = archief === "1";
  const supabase = await createClient();
  const { data } = await supabase
    .from("my_conversations")
    .select("*")
    .eq("is_archived", showArchived)
    .order("last_message_at", { ascending: false, nullsFirst: false });
  const rows = data ?? [];
  const avatars = await signAvatarUrls(rows.map((r) => r.other_avatar_path));

  return (
    <PageShell className="max-w-3xl">
      <PageTitle title={showArchived ? "Gearchiveerde gesprekken" : "Gesprekken"} actions={<ButtonLink href={showArchived ? "/chat" : "/chat?archief=1"} variant="ghost" size="sm">{showArchived ? "Actieve gesprekken" : "Archief"}</ButtonLink>} />
      {rows.length === 0 ? (
        <EmptyState icon={<MessageCircleHeart className="h-6 w-6" aria-hidden="true" />} title={showArchived ? "Geen gearchiveerde gesprekken" : "Nog geen gesprekken"}>
          {me.profile.role === "seeker" ? (
            <>
              <p>Kies een Warme Babbelaar en stuur een eerste bericht. Vertel kort wie je bent en hoe je contact wil.</p>
              <ButtonLink href="/profielen" className="mt-4">Ontdek de Warme Babbelaars</ButtonLink>
            </>
          ) : (
            <p>Zodra iemand je een bericht stuurt, verschijnt het gesprek hier. Je krijgt ook een e-mail.</p>
          )}
        </EmptyState>
      ) : (
        <ConversationList userId={me.id} initial={rows} avatars={Object.fromEntries(avatars)} />
      )}
    </PageShell>
  );
}
