"use client";

import { useActionState, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { uploadAvatarAction, removeAvatarAction, type ProfileState } from "@/actions/profile";
import { Avatar } from "@/components/ui/Avatar";
import { SubmitButton } from "@/components/SubmitButton";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function AvatarForm({ avatarUrl, name }: { avatarUrl: string | null; name: string }) {
  const [state, action] = useActionState<ProfileState, FormData>(uploadAvatarAction, {});
  const [preview, setPreview] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeMsg, setRemoveMsg] = useState<string | null>(null);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-card" aria-labelledby="foto-titel">
      <h2 id="foto-titel" className="text-xl">Profielfoto</h2>
      <p className="mt-1 text-sm text-brand-ink-soft">Een foto maakt het menselijker, maar is niet verplicht. JPG, PNG of WebP, max. 5 MB.</p>
      <form action={action} className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar src={preview ?? avatarUrl} name={name} size="lg" />
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="avatar" className="text-sm font-semibold">Kies een foto</label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand-beige file:px-4 file:py-2 file:font-semibold file:text-brand-ink hover:file:bg-brand-sand"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setPreview(f ? URL.createObjectURL(f) : null);
            }}
          />
          {state.errors?.avatar && <p role="alert" className="text-sm font-medium text-brand-red">{state.errors.avatar}</p>}
          {state.ok && <Alert tone="success">{state.message}</Alert>}
          {removeMsg && <Alert tone="info">{removeMsg}</Alert>}
          <div className="flex flex-wrap gap-2">
            <SubmitButton size="sm" pendingText="Uploaden…">
              <Camera className="h-4 w-4" aria-hidden="true" /> Foto opslaan
            </SubmitButton>
            {avatarUrl && (
              <Button
                variant="danger"
                size="sm"
                disabled={removing}
                onClick={async () => {
                  if (!confirm("Profielfoto verwijderen?")) return;
                  setRemoving(true);
                  const r = await removeAvatarAction();
                  setRemoveMsg(r.message ?? r.errors?.form ?? null);
                  setPreview(null);
                  setRemoving(false);
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Verwijderen
              </Button>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}
