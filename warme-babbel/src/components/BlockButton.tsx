"use client";

import { Ban, Undo2 } from "lucide-react";
import { blockUserAction, unblockUserAction } from "@/actions/safety";
import { SubmitButton } from "@/components/SubmitButton";

export function BlockButton({ userId, name, blocked, returnTo, compact }: { userId: string; name: string; blocked: boolean; returnTo: string; compact?: boolean }) {
  if (blocked) {
    return (
      <form action={unblockUserAction}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <SubmitButton variant="ghost" size={compact ? "sm" : "md"} pendingText="Even geduld…">
          <Undo2 className="h-4 w-4" aria-hidden="true" /> Deblokkeren
        </SubmitButton>
      </form>
    );
  }
  return (
    <form
      action={blockUserAction}
      onSubmit={(e) => {
        if (!confirm(`${name} blokkeren? Jullie kunnen elkaar dan geen berichten meer sturen. Je kan dit later ongedaan maken in je instellingen.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <SubmitButton variant="ghost" size={compact ? "sm" : "md"} pendingText="Even geduld…">
        <Ban className="h-4 w-4" aria-hidden="true" /> Blokkeren
      </SubmitButton>
    </form>
  );
}
