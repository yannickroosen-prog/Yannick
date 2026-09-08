import { PageShell } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <PageShell className="max-w-xl text-center">
      <p className="text-6xl" aria-hidden="true">💬</p>
      <h1 className="mt-4 text-3xl">Deze pagina bestaat niet (meer)</h1>
      <p className="mt-2 text-brand-ink-soft">Misschien is het profiel of gesprek verwijderd, of klopt de link niet.</p>
      <div className="mt-6 flex justify-center gap-3">
        <ButtonLink href="/">Naar de startpagina</ButtonLink>
        <ButtonLink href="/profielen" variant="outline">Warme Babbelaars</ButtonLink>
      </div>
    </PageShell>
  );
}
