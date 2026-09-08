"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl">Er ging iets mis</h1>
      <p className="mt-2 text-brand-ink-soft">Sorry, dat was niet de bedoeling. Probeer het opnieuw. Blijft het misgaan? Mail naar info@similes.be.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={reset}>Opnieuw proberen</Button>
        <ButtonLink href="/" variant="outline">Startpagina</ButtonLink>
      </div>
    </div>
  );
}
