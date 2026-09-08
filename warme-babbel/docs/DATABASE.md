# Database – Warme Babbel (Supabase / PostgreSQL)

Bron van waarheid: `supabase/migrations/` (versioned). Deze pagina documenteert het model, de indexes,
constraints, RLS-policies en het securitymodel. Alle RLS-regels worden getest in `supabase/tests/rls.test.ts`
(35 tests, draaien tegen een echte PostgreSQL).

## Overzicht

```
auth.users (Supabase)
   │ 1:1 (trigger handle_new_user)
   ▼
profiles ──1:1── profile_preferences
   │
   ├──< blocks (blocker_id, blocked_id)
   ├──< conversation_members >── conversations ──< messages ──< message_attachments
   ├──< reports (reporter / target_user / target_conversation / target_message)
   ├──< moderation_events (actor / target / report)
   ├──< notifications
   └──< rate_limits (intern)
profile_options   (keuzelijsten: regio, thema, band, contactwijze, leeftijd, geslacht)
places            (inloophuizen, babbelplekken, luisterlijn)
my_conversations  (view, security_invoker)
```

## Enums

| Enum | Waarden |
|---|---|
| `user_role` | `seeker`, `listener`, `admin` |
| `account_status` | `active`, `suspended`, `blocked` |
| `listing_status` | `pending`, `approved`, `rejected` |
| `report_category` | `ongewenst_gedrag`, `spam`, `ongepaste_inhoud`, `intimidatie`, `andere` |
| `report_status` | `open`, `in_behandeling`, `afgehandeld`, `afgewezen` |
| `notification_type` | `new_message`, `report_update`, `listing_approved`, `account_status`, `system` |
| `moderation_action` | `set_role`, `set_account_status`, `set_listing_status`, `report_status`, `note`, `delete_message`, `account_deleted` |

## Tabellen

### `profiles`
Eén rij per account (aangemaakt door trigger op `auth.users`). **Bevat geen e-mail of echte naam** (die staan
enkel in `auth.users`, bereikbaar via de service role).

| Kolom | Type | Constraint | Omschrijving |
|---|---|---|---|
| `id` | uuid PK | FK `auth.users(id)` ON DELETE CASCADE | |
| `role` | user_role | default `seeker` | Enkel wijzigbaar via `admin_set_role()` (trigger) |
| `account_status` | account_status | default `active` | Enkel via `admin_set_account_status()` |
| `listing_status` | listing_status | default `pending` | Enkel via `admin_set_listing_status()`; relevant voor listeners |
| `display_name` | text | 2–40 tekens | Voornaam of schuilnaam |
| `avatar_path` | text | | Pad in bucket `avatars` (`<id>/<uuid>.<ext>`) |
| `story` | text | ≤ 3000 | "Mijn verhaal" (platte tekst) |
| `regions`, `themes`, `relations`, `contact_methods` | text[] | `valid_options()` check | Slugs uit `profile_options` |
| `age_group`, `gender` | text | `valid_options()` check | |
| `walk_in` | bool | | "Zonder afspraak" |
| `is_available` | bool | default true | "Even niet beschikbaar" = false |
| `is_hidden` | bool | default false | Verberg uit lijst |
| `show_photo_public` | bool | default true | Foto ook voor anonieme bezoekers |
| `created_at`, `updated_at`, `last_seen_at` | timestamptz | | |

Indexes: `(role, listing_status, is_hidden)`, GIN op de vier arrays, GIN-trigram op `display_name` en `story`.

### `profile_preferences`
| Kolom | Type | Omschrijving |
|---|---|---|
| `user_id` | uuid PK FK profiles | |
| `email_on_message` | bool default true | E-mail bij nieuw bericht |
| `email_on_system` | bool default true | E-mail bij systeemmeldingen |
| `accepted_privacy_at` | timestamptz | Moment van privacy-akkoord (registratie) |

### `profile_options`
Keuzelijsten (PK `(kind, slug)`), geseed met de waarden van de huidige site. `is_active=false` verbergt een
optie zonder bestaande profielen te breken.

### `blocks`
PK `(blocker_id, blocked_id)`, check `blocker_id <> blocked_id`, index op `blocked_id`. Blokkade is symmetrisch
in effect (geen van beiden kan nog schrijven), maar enkel de blokkeerder ziet de rij.

### `conversations`
| Kolom | Type | Omschrijving |
|---|---|---|
| `id` | uuid PK | |
| `created_by` | uuid FK (set null) | |
| `user_low`, `user_high` | uuid | Gesorteerd paar; `unique (user_low, user_high)` en check `user_low < user_high` → **exact één gesprek per twee gebruikers** |
| `last_message_at`, `last_message_preview` (≤140), `last_message_sender` | | Bijgewerkt door trigger |

Aanmaken uitsluitend via `start_conversation()`.

### `conversation_members`
PK `(conversation_id, user_id)`. `last_read_at` (ongelezen-berekening), `is_archived` (per gebruiker),
`last_email_at` (cooldown e-mailmeldingen). Index `(user_id, is_archived)`.

### `messages`
| Kolom | Type | Omschrijving |
|---|---|---|
| `id` | bigint identity PK | |
| `conversation_id` | uuid FK cascade | |
| `sender_id` | uuid FK **set null** | Bij accountverwijdering blijft het bericht bestaan als "verwijderde gebruiker" |
| `body` | text 1–4000 | |
| `created_at`, `edited_at`, `deleted_at` | | Soft delete |

Index `(conversation_id, created_at desc, id desc)` voor paginering; `replica identity full` voor Realtime.

### `message_attachments`
Voorzien (bucket `attachments`, mime jpeg/png/webp, ≤ 5 MB). UI is should-have.

### `reports`
Minstens één doelwit (`target_user_id`, `target_conversation_id`, `target_message_id`), `category`,
`description` (≤ 2000), `status`, `admin_notes`, `handled_by`, `handled_at`. Indexes op status/datum, reporter,
target user. Statuswijzigingen uitsluitend via `admin_update_report()`.

### `moderation_events`
Onveranderlijk logboek (`actor_id`, `target_user_id`, `report_id`, `action`, `details jsonb`). Enkel te lezen
door admins; schrijven enkel via security-definer functies.

### `notifications`
In-app meldingen per gebruiker (`type`, `title`, `body`, `link`, `conversation_id`, `read_at`). Bij nieuwe
berichten wordt een bestaande ongelezen melding voor hetzelfde gesprek **bijgewerkt** i.p.v. gestapeld.

### `places`
Warme Babbelplekken/luisterlijn (`kind`, `address`, `phone`, `email`, `opening_hours`, `regions`,
`is_published`, `sort_order`). Vervangt de "locatie-gebruikers" van de oude site.

### `rate_limits`
Interne tellers `(user_id, bucket, window_start)`; geen policies (enkel bereikbaar via `check_rate_limit()`).

## View `my_conversations` (security_invoker)
Gesprekken van `auth.uid()` met gegevens van de andere deelnemer, `unread_count`, `is_blocked`, `is_archived`.
Omdat de view als aanroeper draait, gelden de RLS-policies van de onderliggende tabellen.

## Functies

| Functie | Type | Doel |
|---|---|---|
| `current_user_role()`, `is_admin()`, `is_listener()`, `is_active_user()` | security definer, stable | Rol/status van de aanroeper zonder RLS-recursie |
| `is_blocked_between(a,b)` | security definer | Blokkade in eender welke richting |
| `is_conversation_member(conv, user)` / `shares_conversation_with(user)` | security definer | Lidmaatschap zonder recursie |
| `is_listed_listener(profiles)` | immutable | Zichtbaar in lijst? |
| `check_rate_limit(bucket, limit, window)` | security definer | Teller per venster; niet uitvoerbaar door clients |
| `handle_new_user()` | trigger op `auth.users` | Maakt `profiles` + `profile_preferences` |
| `protect_profile_columns()` | trigger (invoker) | Weigert wijziging van role/status door gebruikers |
| `before_message_insert()` / `after_message_insert()` | triggers | Rate limit (30/min), trim, gesprek bijwerken, notificatie |
| `before_report_insert()` | trigger | Rate limit (10/dag) |
| `start_conversation(other)` | RPC | Valideert status, blokkade, doelgroep; 20 nieuwe gesprekken/dag |
| `mark_conversation_read(conv)`, `set_conversation_archived(conv, bool)` | RPC | Eigen lidmaatschap |
| `unread_count(conv)`, `total_unread()` | RPC | Tellers |
| `admin_set_role`, `admin_set_account_status`, `admin_set_listing_status`, `admin_update_report`, `admin_add_note`, `admin_stats` | RPC (admin) | Controleren `is_admin()`, loggen in `moderation_events`, maken notificaties |
| `anonymize_own_profile()` | RPC | Eigen berichten → "[bericht verwijderd]" vóór accountverwijdering |

## RLS-policies (samenvatting)

| Tabel | anon | authenticated | admin |
|---|---|---|---|
| `profile_options` | select | select | all |
| `profiles` | select gelijste listeners (niet-geblokkeerd) | + eigen rij, + gesprekspartners; update eigen rij (role/status beschermd) | select alles, update |
| `profile_preferences` | – | all op eigen rij | select |
| `blocks` | – | select/insert/delete eigen (als blokkeerder) | select |
| `conversations` | – | select als lid | select bij gemeld gesprek |
| `conversation_members` | – | select leden van eigen gesprekken; update eigen rij | select |
| `messages` | – (geen grant) | select als lid; insert als lid, actief, niet geblokkeerd, partner actief, `sender_id = uid`; update eigen rij enkel soft-delete | select bij gemelde berichten/gesprekken |
| `message_attachments` | – | select als lid; insert bij eigen bericht | – |
| `reports` | – | select eigen; insert eigen binnen bereik | select alles (update via RPC) |
| `moderation_events` | – | – | select |
| `notifications` | – | select/update/delete eigen | – |
| `places` | select gepubliceerd | select gepubliceerd | all |
| `rate_limits` | – | – | – |
| `storage.objects` (avatars) | – | insert/update/delete eigen map; select | – |
| `storage.objects` (attachments) | – | insert/select als lid van gesprek | – |

Volledige definities: `supabase/migrations/0002_rls.sql` en `0003_storage_realtime.sql`.

## Securitymodel

1. **Alles dicht by default**: RLS aan op elke tabel; `rate_limits` en `moderation_events` hebben geen
   schrijf-policies voor gebruikers.
2. **Privilege-scheiding**: gevoelige overgangen (rol, status, meldingen behandelen, gesprek starten) gebeuren
   uitsluitend in `security definer`-functies met expliciete checks en logging. Een trigger blokkeert
   rechtstreekse updates van `role`/`account_status`/`listing_status`.
3. **Geen recursie/lekken**: helperfuncties zijn `security definer` met vaste `search_path` en geven enkel
   booleans terug.
4. **Symmetrische blokkade** afgedwongen in de insert-policy van `messages` én in `start_conversation()`.
5. **Rate limiting in de database**, onafhankelijk van de client.
6. **Realtime** gebruikt dezelfde RLS: een client kan zich niet abonneren op andermans gesprek.
7. **Service role** enkel server-side (accountverwijdering, e-mail).

## Lokaal testen

```bash
npm run db:local:start        # PostgreSQL 16 in .localdb/ (geen Docker nodig)
npm run test:rls              # 35 RLS-tests (reset + migraties + shim)
npm run db:local:stop
```
De shim (`supabase/tests/local-shim.sql`) bootst `auth.uid()`, `auth.users`, `storage.objects` en de rollen na.
