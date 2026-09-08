import { renderEmail } from "./layout";
import { siteUrl } from "@/lib/site";

const base = () => ({ siteUrl: siteUrl() });

export function confirmSignupEmail(p: { name: string; url: string }) {
  return {
    subject: "Bevestig je e-mailadres voor Warme Babbel",
    ...renderEmail(
      {
        preheader: "Nog één stap: bevestig je e-mailadres.",
        title: `Welkom${p.name ? `, ${p.name}` : ""}!`,
        paragraphs: [
          "Fijn dat je er bent. Om je account te activeren, hoef je alleen nog je e-mailadres te bevestigen.",
          "Daarna kan je Warme Babbelaars ontdekken en een gesprek starten.",
        ],
        cta: { label: "Bevestig mijn e-mailadres", url: p.url },
        footnote: "Heb je geen account aangemaakt? Dan mag je deze e-mail gewoon negeren.",
      },
      base(),
    ),
  };
}

export function resetPasswordEmail(p: { name: string; url: string }) {
  return {
    subject: "Nieuw wachtwoord instellen",
    ...renderEmail(
      {
        preheader: "Stel een nieuw wachtwoord in voor Warme Babbel.",
        title: "Nieuw wachtwoord instellen",
        paragraphs: [
          `Dag${p.name ? ` ${p.name}` : ""}, je vroeg een nieuw wachtwoord aan. Klik op de knop om een nieuw wachtwoord te kiezen.`,
        ],
        cta: { label: "Kies een nieuw wachtwoord", url: p.url },
        footnote: "Deze link is 1 uur geldig. Vroeg je dit niet aan? Negeer deze e-mail, je wachtwoord blijft ongewijzigd.",
      },
      base(),
    ),
  };
}

export function emailChangeEmail(p: { name: string; url: string; newEmail: string }) {
  return {
    subject: "Bevestig je nieuwe e-mailadres",
    ...renderEmail(
      {
        preheader: "Bevestig de wijziging van je e-mailadres.",
        title: "Nieuw e-mailadres bevestigen",
        paragraphs: [`Je wil je e-mailadres wijzigen naar ${p.newEmail}. Bevestig dit met de knop hieronder.`],
        cta: { label: "Bevestig nieuw e-mailadres", url: p.url },
        footnote: "Vroeg je dit niet aan? Neem dan contact op met info@similes.be.",
      },
      base(),
    ),
  };
}

export function magicLinkEmail(p: { name: string; url: string }) {
  return {
    subject: "Je inloglink voor Warme Babbel",
    ...renderEmail(
      {
        preheader: "Log in met één klik.",
        title: "Inloggen bij Warme Babbel",
        paragraphs: ["Klik op de knop om in te loggen. De link werkt één keer."],
        cta: { label: "Inloggen", url: p.url },
        footnote: "Deze link is 1 uur geldig.",
      },
      base(),
    ),
  };
}

export function reauthenticationEmail(p: { code: string }) {
  return {
    subject: "Je bevestigingscode",
    ...renderEmail(
      {
        preheader: "Bevestigingscode voor een gevoelige wijziging.",
        title: "Bevestigingscode",
        paragraphs: ["Gebruik deze code om je wijziging te bevestigen:", p.code],
        footnote: "De code is 5 minuten geldig.",
      },
      base(),
    ),
  };
}

export function newMessageEmail(p: { recipientName: string; senderName: string; preview: string; conversationId: string }) {
  return {
    subject: `Nieuw bericht van ${p.senderName} op Warme Babbel`,
    ...renderEmail(
      {
        preheader: `${p.senderName} stuurde je een bericht.`,
        title: `${p.senderName} stuurde je een bericht`,
        paragraphs: [`Dag ${p.recipientName},`, `"${p.preview}"`, "Open het gesprek om te antwoorden."],
        cta: { label: "Bekijk het gesprek", url: siteUrl(`/chat/${p.conversationId}`) },
        footnote: "Je krijgt maximaal één e-mail per gesprek per kwartier. Uitschakelen kan in je instellingen.",
      },
      base(),
    ),
  };
}

export function listingApprovedEmail(p: { name: string }) {
  return {
    subject: "Je profiel als Warme Babbelaar staat online",
    ...renderEmail(
      {
        preheader: "Je profiel is goedgekeurd.",
        title: `Bedankt, ${p.name}!`,
        paragraphs: [
          "Je profiel als Warme Babbelaar is goedgekeurd en staat nu in de lijst. Mensen kunnen je vanaf nu een bericht sturen.",
          "Even niet beschikbaar? Dat stel je in op je profiel.",
        ],
        cta: { label: "Bekijk mijn profiel", url: siteUrl("/mijn-profiel") },
      },
      base(),
    ),
  };
}

export function accountStatusEmail(p: { name: string; status: "active" | "suspended" | "blocked"; note?: string | null }) {
  const title =
    p.status === "active" ? "Je account is opnieuw actief" : p.status === "suspended" ? "Je account is tijdelijk geschorst" : "Je account is geblokkeerd";
  return {
    subject: title,
    ...renderEmail(
      {
        preheader: title,
        title,
        paragraphs: [
          `Dag ${p.name},`,
          p.status === "active"
            ? "Je kan Warme Babbel opnieuw gebruiken."
            : "Een beheerder heeft je account geschorst. Je kan voorlopig geen berichten sturen.",
          ...(p.note ? [`Toelichting: ${p.note}`] : []),
          "Vragen? Mail naar info@similes.be.",
        ],
      },
      base(),
    ),
  };
}

export function reportReceivedAdminEmail(p: { category: string; reportId: string }) {
  return {
    subject: `Nieuwe melding op Warme Babbel (${p.category})`,
    ...renderEmail(
      {
        preheader: "Er is een nieuwe melding om te behandelen.",
        title: "Nieuwe melding",
        paragraphs: [`Een gebruiker heeft een melding gedaan in de categorie "${p.category}".`],
        cta: { label: "Bekijk de melding", url: siteUrl(`/admin/rapporteringen/${p.reportId}`) },
      },
      base(),
    ),
  };
}
