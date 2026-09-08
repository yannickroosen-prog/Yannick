import Link from "next/link";
import { legacyUrl, ORG } from "@/lib/site";

export function Footer() {
  const privacy = legacyUrl("/privacybeleid/");
  const help = legacyUrl("/help/");
  const volunteer = legacyUrl("/vrijwilliger-worden/");
  return (
    <footer className="mt-16 border-t border-brand-sand bg-brand-beige">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-2">
          <p className="font-heading text-lg font-bold">
            <span className="text-brand-red">Warme</span> <span className="text-brand-orange">Babbel</span>
          </p>
          <p className="text-sm text-brand-ink-soft">Een initiatief van {ORG.name}. Voor en door families van mensen met psychische problemen.</p>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-semibold">Contact</p>
          <ul className="space-y-1 text-brand-ink-soft">
            <li><a className="hover:text-brand-red" href={`mailto:${ORG.email}`}>{ORG.email}</a></li>
            <li><a className="hover:text-brand-red" href={`tel:${ORG.phone.replace(/\s/g, "")}`}>{ORG.phone}</a></li>
            <li>{ORG.address}</li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-semibold">Praktisch</p>
          <ul className="space-y-1 text-brand-ink-soft">
            <li><Link className="hover:text-brand-red" href="/profielen">Zoek een Warme Babbelaar</Link></li>
            <li><Link className="hover:text-brand-red" href="/#luisterlijn">Luisterlijn</Link></li>
            {volunteer && <li><a className="hover:text-brand-red" href={volunteer}>Word Warme Babbelaar</a></li>}
            {help && <li><a className="hover:text-brand-red" href={help}>Help</a></li>}
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-semibold">Privacy</p>
          <ul className="space-y-1 text-brand-ink-soft">
            {privacy && <li><a className="hover:text-brand-red" href={privacy}>Privacybeleid</a></li>}
            <li><Link className="hover:text-brand-red" href="/instellingen">Mijn gegevens</Link></li>
          </ul>
          <p className="mt-4 text-xs text-brand-ink-muted">© {new Date().getFullYear()} {ORG.name}. Bij acute nood: bel 112 of Zelfmoordlijn 1813.</p>
        </div>
      </div>
    </footer>
  );
}
