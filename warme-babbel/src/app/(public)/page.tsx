import type { Metadata } from "next";
import Link from "next/link";
import { Building2, HeartHandshake, MessageCircleHeart, Phone, Search, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { legacyUrl, ORG } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";
import { getOptions, labelsFor } from "@/lib/options";

export const metadata: Metadata = {
  title: "Warme Babbel – Voor en door families van mensen met psychische problemen",
  description: "Nood aan een warme babbel? Onze Warme Babbelaars luisteren naar jouw verhaal, zonder oordeel. Ze maakten zelf mee wat jij meemaakt.",
  robots: { index: true, follow: true },
};

export const revalidate = 300;

const QUOTES = [
  "Alleen iemand die hetzelfde meemaakte weet hoe het echt is.",
  "Ik kon vrij praten, zonder angst voor een oordeel.",
  "Amai, dat luchtte op. Ik kan weer verder.",
  "Zij voelde me aan. Er waren weinig woorden nodig.",
  "Zoveel gelijkenissen … Ik voel me minder alleen in mijn verhaal.",
  "Ik durfde niet goed. Nu ben ik blij dat ik het gedaan heb.",
];

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: places }, options, { count }] = await Promise.all([
    supabase.from("places").select("*").eq("is_published", true).order("sort_order").order("name"),
    getOptions(),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "listener").eq("listing_status", "approved").eq("is_hidden", false),
  ]);
  const volunteer = legacyUrl("/vrijwilliger-worden/");
  const tips = legacyUrl("/tips/");
  const helplines = (places ?? []).filter((p) => p.kind === "luisterlijn");
  const spots = (places ?? []).filter((p) => p.kind !== "luisterlijn");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_#fde9dd_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_#f1f0ea_0%,_transparent_50%)]" aria-hidden="true" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-20 lg:px-8">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-brand-red shadow-bubble">
              <HeartHandshake className="h-4 w-4" aria-hidden="true" /> Een initiatief van {ORG.name}
            </p>
            <h1 className="text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
              Nood aan een <span className="text-brand-orange">warme babbel</span>?
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-brand-ink-soft sm:text-xl">
              Er zijn voor iemand met psychische problemen is niet gemakkelijk. Onze Warme Babbelaars maakten het zelf mee. Ze luisteren naar jouw verhaal en begrijpen je zonder veel woorden.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/profielen" size="lg">
                <Search className="h-5 w-5" aria-hidden="true" /> Zoek een Warme Babbelaar
              </ButtonLink>
              <ButtonLink href="#luisterlijn" variant="outline" size="lg">
                <Phone className="h-5 w-5" aria-hidden="true" /> Luisterlijn
              </ButtonLink>
            </div>
            {typeof count === "number" && count > 0 && (
              <p className="text-sm text-brand-ink-muted">{count} Warme Babbelaars staan voor je klaar, in heel Vlaanderen en Brussel.</p>
            )}
          </div>
          <div className="relative hidden md:block" aria-hidden="true">
            <div className="absolute right-6 top-4 max-w-xs rounded-bubble rounded-tr-md bg-white p-5 shadow-card">
              <p className="text-brand-ink-soft">“Ik ben Ann, mama van een tiener met autisme. Ik zit met veel vragen en zou graag eens praten.”</p>
            </div>
            <div className="absolute left-2 top-40 max-w-xs rounded-bubble rounded-tl-md bg-brand-orange p-5 text-white shadow-card">
              <p>“Dag Ann, fijn dat je schrijft. Ik herken veel in je verhaal. Zullen we eens bellen of afspreken voor een koffie?”</p>
            </div>
            <div className="absolute bottom-0 right-10 max-w-[14rem] rounded-bubble rounded-tr-md bg-white p-5 shadow-card">
              <p className="text-brand-ink-soft">“Graag. Dank je wel.”</p>
            </div>
          </div>
        </div>
      </section>

      {/* Wat is het */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-card">
            <h2 className="text-2xl">Wat is een Warme Babbel?</h2>
            <p className="mt-3 text-brand-ink-soft leading-relaxed">
              Soms wil je gewoon je verhaal kunnen doen aan iemand die echt luistert. Een Warme Babbel is een veilig, eenmalig gesprek van mens tot mens: live, per telefoon, via videocall, per e-mail of samen naar een activiteit van Similes. Het is gratis. Het is geen therapie, wel herkenning en erkenning.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-card">
            <h2 className="text-2xl">Wie zijn de Warme Babbelaars?</h2>
            <p className="mt-3 text-brand-ink-soft leading-relaxed">
              Vrijwilligers van Similes die zelf ervaring hebben als ouder, partner, kind, broer, zus of vriend van iemand met psychische problemen. Ze volgden een vorming en worden begeleid door een coach. Je kiest zelf met wie je een gesprek wil.
            </p>
          </div>
        </div>
      </section>

      {/* Hoe werkt het */}
      <section className="bg-brand-beige py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl">Zo werkt het</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { Icon: Search, title: "Kies een Warme Babbelaar", text: "Filter op regio, thema, band of contactwijze en lees de verhalen. Kies iemand bij wie jij je goed voelt." },
              { Icon: UserRound, title: "Maak een gratis account", text: "Dat lukt in een-twee-drie. Je profiel is enkel zichtbaar voor de Warme Babbelaars die je contacteert en voor Similes." },
              { Icon: MessageCircleHeart, title: "Stuur een privébericht", text: "Stel jezelf kort voor en zeg hoe je contact wil. De Warme Babbelaar antwoordt en jullie spreken samen af." },
            ].map(({ Icon, title, text }, i) => (
              <li key={title} className="relative rounded-3xl bg-white p-6 shadow-card">
                <span className="absolute -top-3 left-6 rounded-full bg-brand-red px-3 py-0.5 text-sm font-bold text-white">{i + 1}</span>
                <Icon className="h-8 w-8 text-brand-orange" aria-hidden="true" />
                <h3 className="mt-3 text-lg">{title}</h3>
                <p className="mt-2 text-brand-ink-soft">{text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/profielen" size="lg">Bekijk de Warme Babbelaars</ButtonLink>
            {tips && <ButtonLink href={tips} variant="ghost" size="lg">Tips voor je eerste bericht</ButtonLink>}
          </div>
        </div>
      </section>

      {/* Ervaringen */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="ervaringen">
        <h2 id="ervaringen" className="text-3xl">Ervaringen</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUOTES.map((q) => (
            <li key={q} className="rounded-bubble rounded-tl-md bg-white p-6 shadow-card">
              <blockquote className="font-heading text-lg font-semibold leading-snug text-brand-ink">“{q}”</blockquote>
            </li>
          ))}
        </ul>
      </section>

      {/* Plekken */}
      {spots.length > 0 && (
        <section id="plekken" className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8" aria-labelledby="plekken-titel">
          <h2 id="plekken-titel" className="flex items-center gap-2 text-3xl"><Building2 className="h-7 w-7 text-brand-orange" aria-hidden="true" /> Inloophuis &amp; Warme Babbelplek</h2>
          <p className="mt-2 max-w-2xl text-brand-ink-soft">Op deze plekken kan je op vaste momenten gewoon binnenwandelen om een Warme Babbelaar te treffen, zonder afspraak.</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {spots.map((p) => (
              <li key={p.id} className="rounded-3xl bg-white p-6 shadow-card">
                <h3 className="text-lg">{p.name}</h3>
                {p.regions.length > 0 && <p className="text-sm text-brand-orange-dark">{labelsFor(options, "region", p.regions).join(", ")}</p>}
                {p.address && <p className="mt-2 text-sm text-brand-ink-soft whitespace-pre-line">{p.address}</p>}
                {p.opening_hours && <p className="mt-2 text-sm text-brand-ink-soft whitespace-pre-line">{p.opening_hours}</p>}
                {p.description && <p className="mt-2 text-sm text-brand-ink-soft">{p.description}</p>}
                <p className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
                  {p.phone && <a className="text-brand-red underline" href={`tel:${p.phone.replace(/\s/g, "")}`}>{p.phone}</a>}
                  {p.email && <a className="text-brand-red underline" href={`mailto:${p.email}`}>{p.email}</a>}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Luisterlijn */}
      <section id="luisterlijn" className="bg-brand-ink py-14 text-white" aria-labelledby="luisterlijn-titel">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <h2 id="luisterlijn-titel" className="flex items-center gap-2 text-3xl text-white"><Phone className="h-7 w-7 text-brand-orange" aria-hidden="true" /> Luisterlijn</h2>
            <p className="mt-3 text-white/80 leading-relaxed">
              Liever meteen iemand aan de lijn? Onze Warme Babbelaars zijn op vaste momenten telefonisch bereikbaar. Een gesprek met een ervaringsdeskundige kan deugd doen.
            </p>
            <a href={`tel:${ORG.helplinePhone.replace(/\s/g, "")}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-xl font-bold text-white hover:bg-brand-orange-dark">
              <Phone className="h-5 w-5" aria-hidden="true" /> {ORG.helplinePhone}
            </a>
          </div>
          <div className="rounded-3xl bg-white/10 p-6">
            <h3 className="text-lg font-bold text-white">Beschikbaarheid</h3>
            {helplines.length > 0 ? (
              <ul className="mt-2 space-y-3 text-white/85">
                {helplines.map((h) => (
                  <li key={h.id}>
                    <p className="font-semibold text-white">{h.name}</p>
                    {h.opening_hours && <p className="whitespace-pre-line text-sm">{h.opening_hours}</p>}
                    {h.phone && <a className="text-sm underline" href={`tel:${h.phone.replace(/\s/g, "")}`}>{h.phone}</a>}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="mt-2 space-y-1 text-white/85">
                <li>Maandag tot vrijdag van 10.00 tot 12.00 uur</li>
                <li>Woensdag (even weken) ook van 19.00 tot 21.00 uur</li>
              </ul>
            )}
            <p className="mt-4 text-xs text-white/60">Bij acute nood: bel 112. Praten over zelfdoding? Bel gratis 1813.</p>
          </div>
        </div>
      </section>

      {/* Vrijwilliger worden */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-brand-sand bg-white p-8 shadow-card md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl">Zelf Warme Babbelaar worden?</h2>
            <p className="mt-2 max-w-xl text-brand-ink-soft">Heb jij ervaring als naaste van iemand met psychische problemen en een luisterend oor? Similes zorgt voor vorming en begeleiding.</p>
          </div>
          {volunteer ? (
            <ButtonLink href={volunteer} variant="secondary" size="lg">Meer over vrijwilliger worden</ButtonLink>
          ) : (
            <Link href={`mailto:${ORG.email}?subject=Warme%20Babbelaar%20worden`} className="font-semibold text-brand-red underline">Mail {ORG.email}</Link>
          )}
        </div>
      </section>
    </div>
  );
}
