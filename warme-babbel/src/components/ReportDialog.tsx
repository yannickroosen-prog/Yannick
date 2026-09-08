"use client";

import { useActionState, useEffect, useRef } from "react";
import { Flag } from "lucide-react";
import { reportAction, type SafetyState } from "@/actions/safety";
import { REPORT_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert } from "@/components/ui/Alert";

type Props = {
  targetUserId?: string;
  targetConversationId?: string;
  targetMessageId?: number;
  label?: string;
  compact?: boolean;
};

/** Toegankelijke rapporteer-dialoog (native <dialog>, focus trap door de browser). */
export function ReportDialog({ targetUserId, targetConversationId, targetMessageId, label = "Rapporteren", compact }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action] = useActionState<SafetyState, FormData>(reportAction, {});

  useEffect(() => {
    if (state.ok) {
      const t = setTimeout(() => ref.current?.close(), 2500);
      return () => clearTimeout(t);
    }
  }, [state.ok]);

  const what = targetMessageId ? "dit bericht" : targetConversationId ? "dit gesprek" : "dit profiel";

  return (
    <>
      <Button variant="ghost" size={compact ? "sm" : "md"} onClick={() => ref.current?.showModal()} aria-haspopup="dialog">
        <Flag className="h-4 w-4" aria-hidden="true" /> {label}
      </Button>
      <dialog ref={ref} className="w-[min(92vw,32rem)] rounded-3xl p-0 shadow-card backdrop:bg-brand-ink/40" aria-labelledby="report-title">
        <form action={action} className="space-y-4 p-6" method="dialog">
          <h2 id="report-title" className="text-xl">Meld {what}</h2>
          <p className="text-sm text-brand-ink-soft">Je melding gaat naar de beheerders van Similes. De andere persoon ziet niet dat je een melding deed.</p>
          {targetUserId && <input type="hidden" name="targetUserId" value={targetUserId} />}
          {targetConversationId && <input type="hidden" name="targetConversationId" value={targetConversationId} />}
          {targetMessageId && <input type="hidden" name="targetMessageId" value={targetMessageId} />}
          {state.ok ? (
            <Alert tone="success">{state.message}</Alert>
          ) : (
            <>
              {state.error && <Alert tone="error">{state.error}</Alert>}
              <Field label="Wat is er aan de hand?" name="category" required>
                <Select id="category" name="category" required defaultValue="">
                  <option value="" disabled>Kies een categorie</option>
                  {REPORT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Toelichting (optioneel)" name="description">
                <Textarea id="description" name="description" maxLength={2000} rows={4} placeholder="Wat gebeurde er? Hoe meer context, hoe beter we kunnen helpen." />
              </Field>
              <p className="text-xs text-brand-ink-muted">Bij acute dreiging: bel 112. Praten over zelfdoding? Bel 1813.</p>
            </>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" formMethod="dialog" onClick={() => ref.current?.close()}>
              Sluiten
            </Button>
            {!state.ok && <SubmitButton pendingText="Versturen…">Melding versturen</SubmitButton>}
          </div>
        </form>
      </dialog>
    </>
  );
}
