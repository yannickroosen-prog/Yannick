# Warme Babbel – nieuwe applicatie

Zelfstandige webapplicatie voor [Warme Babbel](https://warmebabbel.be) (Similes vzw): familieleden van mensen
met psychische problemen vinden hier een **Warme Babbelaar** (ervaringsdeskundige vrijwilliger) en starten
een **privégesprek**. Gebouwd met Next.js 15, TypeScript, Tailwind CSS en Supabase (PostgreSQL + RLS, Auth,
Storage, Realtime); e-mail via Resend; hosting op Netlify. Volledig losstaand van de bestaande WordPress-site.

## Documentatie
| Document | Inhoud |
|---|---|
| [docs/ANALYSIS.md](docs/ANALYSIS.md) | Read-only audit van de bestaande WordPress/Ultimate Member-site |
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | Functionele specificatie (MoSCoW) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architectuur, routing, integratie, security |
| [docs/DATABASE.md](docs/DATABASE.md) | Datamodel, functies, RLS-policies |
| [docs/SECURITY.md](docs/SECURITY.md) | Security audit en restrisico's |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Supabase, Resend, Netlify, domein, iframe-integratie |
| [docs/MIGRATION.md](docs/MIGRATION.md) | Migratie van bestaande gebruikers (niet uitgevoerd) |
| [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) | Status: klaar / gedeeltelijk / open / productiechecklist |

## Snel starten
```bash
cd warme-babbel
cp .env.example .env.local        # Supabase- en Resend-gegevens invullen
npm install
npm run dev                       # http://localhost:3000
```

## Scripts
| Script | Doel |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` / `lint` | TypeScript, ESLint |
| `npm run test:unit` | Vitest unit-tests |
| `npm run db:local:start` + `npm run test:rls` | Lokale PostgreSQL + 35 RLS-/beveiligingstests |
| `npm run test:e2e` | Playwright end-to-end (tegen een echt Supabase-project) |
| `npm run migration:export -- <export.csv>` | WordPress-export analyseren (dry run) |

## Structuur
```
src/app          routes (App Router): (public) landing/profielen, (auth), (app) chat/profiel/instellingen, admin, api
src/actions      server actions (chat, profiel, veiligheid, admin, instellingen)
src/components   UI, chat, header/footer, embed-bridge
src/lib          Supabase-clients, auth, validatie, e-mail, opties
src/emails       e-mailtemplates
supabase/        migrations, tests (RLS), templates
scripts/         lokale Postgres, migraties, WP-export
tests/           unit + e2e
public/          brand-assets, embed.js
```
