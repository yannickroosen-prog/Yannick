-- =====================================================================
-- Warme Babbel – 0001: basisschema
-- Tabellen, enums, indexes, constraints, hulpfuncties.
-- RLS-policies staan in 0002_rls.sql, storage/realtime in 0003.
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
create extension if not exists "citext";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type public.user_role as enum ('seeker', 'listener', 'admin');
create type public.account_status as enum ('active', 'suspended', 'blocked');
create type public.listing_status as enum ('pending', 'approved', 'rejected');
create type public.report_category as enum (
  'ongewenst_gedrag', 'spam', 'ongepaste_inhoud', 'intimidatie', 'andere'
);
create type public.report_status as enum ('open', 'in_behandeling', 'afgehandeld', 'afgewezen');
create type public.notification_type as enum (
  'new_message', 'report_update', 'listing_approved', 'account_status', 'system'
);
create type public.moderation_action as enum (
  'set_role', 'set_account_status', 'set_listing_status', 'report_status',
  'note', 'delete_message', 'account_deleted'
);

-- ---------------------------------------------------------------------
-- Keuzelijsten voor profielvelden (overgenomen uit de bestaande site)
-- ---------------------------------------------------------------------
create table public.profile_options (
  kind        text not null check (kind in ('region','theme','relation','contact_method','age_group','gender')),
  slug        text not null,
  label       text not null,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  primary key (kind, slug)
);

insert into public.profile_options (kind, slug, label, sort_order) values
  ('region','antwerpen-kempen','Antwerpen: Kempen',10),
  ('region','antwerpen-regio-antwerpen','Antwerpen: regio Antwerpen',20),
  ('region','antwerpen-rivierenland','Antwerpen: Rivierenland',30),
  ('region','brussel','Brussel',40),
  ('region','limburg','Limburg',50),
  ('region','oost-vlaanderen-denderregio','Oost-Vlaanderen: Denderregio',60),
  ('region','oost-vlaanderen-gent','Oost-Vlaanderen: regio Gent',70),
  ('region','oost-vlaanderen-vlaamse-ardennen','Oost-Vlaanderen: Vlaamse Ardennen',80),
  ('region','oost-vlaanderen-waasland','Oost-Vlaanderen: Waasland',90),
  ('region','vlaams-brabant-halle-vilvoorde','Vlaams-Brabant: Halle-Vilvoorde',100),
  ('region','vlaams-brabant-oost-brabant','Vlaams-Brabant: Oost-Brabant',110),
  ('region','west-vlaanderen-midwest','West-Vlaanderen: Midwest',120),
  ('region','west-vlaanderen-brugge','West-Vlaanderen: regio Brugge',130),
  ('region','west-vlaanderen-oostende','West-Vlaanderen: regio Oostende',140),
  ('region','west-vlaanderen-westhoek','West-Vlaanderen: Westhoek',150),
  ('region','west-vlaanderen-zuid','West-Vlaanderen: Zuid-West-Vlaanderen',160),
  ('region','niet-regio-specifiek','Niet regio-specifiek',170),
  ('theme','allerlei','Allerlei thema''s',10),
  ('theme','autisme','Autisme',20),
  ('theme','borderline','Borderline',30),
  ('theme','depressie','Depressie',40),
  ('theme','eetstoornissen','Eetstoornissen',50),
  ('theme','euthanasie','Euthanasie',60),
  ('theme','internering','Internering',70),
  ('theme','narcisme','Narcisme',80),
  ('theme','psychose','Psychose',90),
  ('theme','suicide','Suïcide',100),
  ('theme','verslaving','Verslaving',110),
  ('theme','ander','Ander thema',120),
  ('relation','partner','(ex)Partner van',10),
  ('relation','ouder','Ouder van',20),
  ('relation','kind','Kind van',30),
  ('relation','broer-zus','Broer/zus van',40),
  ('relation','grootouder','Grootouder van',50),
  ('relation','vriend','Vriend van',60),
  ('relation','andere','Andere band',70),
  ('contact_method','ontmoeting','Ontmoeting',10),
  ('contact_method','telefoon','Telefoon',20),
  ('contact_method','videocall','Videocall',30),
  ('contact_method','email','E-mail',40),
  ('contact_method','similes-activiteit','Samen naar een Similes-activiteit',50),
  ('age_group','20','20-er',10),
  ('age_group','30','30-er',20),
  ('age_group','40','40-er',30),
  ('age_group','50','50-er',40),
  ('age_group','60','60-er',50),
  ('age_group','70','70-er',60),
  ('age_group','80','80-er',70),
  ('gender','man','Man',10),
  ('gender','vrouw','Vrouw',20),
  ('gender','x','X',30);

create or replace function public.valid_options(p_kind text, p_values text[])
returns boolean
language sql
stable
as $$
  select p_values is null
      or not exists (
        select 1 from unnest(p_values) v
        where not exists (
          select 1 from public.profile_options o
          where o.kind = p_kind and o.slug = v and o.is_active
        )
      );
$$;

-- ---------------------------------------------------------------------
-- Profielen
-- ---------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  role            public.user_role not null default 'seeker',
  account_status  public.account_status not null default 'active',
  listing_status  public.listing_status not null default 'pending',
  display_name    text not null check (char_length(btrim(display_name)) between 2 and 40),
  avatar_path     text,
  story           text check (story is null or char_length(story) <= 3000),
  regions         text[] not null default '{}' check (public.valid_options('region', regions)),
  themes          text[] not null default '{}' check (public.valid_options('theme', themes)),
  relations       text[] not null default '{}' check (public.valid_options('relation', relations)),
  contact_methods text[] not null default '{}' check (public.valid_options('contact_method', contact_methods)),
  age_group       text check (age_group is null or public.valid_options('age_group', array[age_group])),
  gender          text check (gender is null or public.valid_options('gender', array[gender])),
  walk_in         boolean not null default false,
  is_available    boolean not null default true,
  is_hidden       boolean not null default false,
  show_photo_public boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  last_seen_at    timestamptz
);

comment on table public.profiles is 'Publiek/gedeeld profiel. Geen e-mail of echte naam: die staan enkel in auth.users.';
comment on column public.profiles.listing_status is 'Enkel relevant voor role = listener: pas bij approved zichtbaar in de lijst.';
comment on column public.profiles.is_hidden is 'Warme Babbelaar verbergt zichzelf tijdelijk uit de lijst.';
comment on column public.profiles.show_photo_public is 'Mag de profielfoto getoond worden aan niet-ingelogde bezoekers?';

create index profiles_role_listing_idx on public.profiles (role, listing_status, is_hidden);
create index profiles_regions_gin on public.profiles using gin (regions);
create index profiles_themes_gin on public.profiles using gin (themes);
create index profiles_relations_gin on public.profiles using gin (relations);
create index profiles_contact_methods_gin on public.profiles using gin (contact_methods);
create index profiles_display_name_trgm on public.profiles using gin (display_name gin_trgm_ops);
create index profiles_story_trgm on public.profiles using gin (story gin_trgm_ops);

-- Persoonlijke voorkeuren (enkel eigenaar + admin)
create table public.profile_preferences (
  user_id            uuid primary key references public.profiles (id) on delete cascade,
  email_on_message   boolean not null default true,
  email_on_system    boolean not null default true,
  accepted_privacy_at timestamptz,
  updated_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Blokkades
-- ---------------------------------------------------------------------
create table public.blocks (
  blocker_id  uuid not null references public.profiles (id) on delete cascade,
  blocked_id  uuid not null references public.profiles (id) on delete cascade,
  reason      text check (reason is null or char_length(reason) <= 500),
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.blocks (blocked_id);

-- ---------------------------------------------------------------------
-- Gesprekken
-- ---------------------------------------------------------------------
create table public.conversations (
  id                    uuid primary key default gen_random_uuid(),
  created_by            uuid references public.profiles (id) on delete set null,
  -- gesorteerd paar: garandeert 1 gesprek per twee gebruikers
  user_low              uuid not null,
  user_high             uuid not null,
  created_at            timestamptz not null default now(),
  last_message_at       timestamptz,
  last_message_preview  text,
  last_message_sender   uuid,
  check (user_low < user_high),
  unique (user_low, user_high)
);
create index conversations_last_message_idx on public.conversations (last_message_at desc nulls last);

create table public.conversation_members (
  conversation_id  uuid not null references public.conversations (id) on delete cascade,
  user_id          uuid not null references public.profiles (id) on delete cascade,
  joined_at        timestamptz not null default now(),
  last_read_at     timestamptz not null default now(),
  is_archived      boolean not null default false,
  last_email_at    timestamptz,
  primary key (conversation_id, user_id)
);
create index conversation_members_user_idx on public.conversation_members (user_id, is_archived);

create table public.messages (
  id               bigint generated always as identity primary key,
  conversation_id  uuid not null references public.conversations (id) on delete cascade,
  sender_id        uuid references public.profiles (id) on delete set null,
  body             text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at       timestamptz not null default now(),
  edited_at        timestamptz,
  deleted_at       timestamptz
);
create index messages_conversation_created_idx on public.messages (conversation_id, created_at desc, id desc);
create index messages_sender_idx on public.messages (sender_id);

create table public.message_attachments (
  id            uuid primary key default gen_random_uuid(),
  message_id    bigint not null references public.messages (id) on delete cascade,
  storage_path  text not null,
  mime_type     text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  size_bytes    int not null check (size_bytes between 1 and 5242880),
  created_at    timestamptz not null default now()
);
create index message_attachments_message_idx on public.message_attachments (message_id);

-- ---------------------------------------------------------------------
-- Rapporteringen en moderatie
-- ---------------------------------------------------------------------
create table public.reports (
  id                      uuid primary key default gen_random_uuid(),
  reporter_id             uuid references public.profiles (id) on delete set null,
  target_user_id          uuid references public.profiles (id) on delete set null,
  target_conversation_id  uuid references public.conversations (id) on delete set null,
  target_message_id       bigint references public.messages (id) on delete set null,
  category                public.report_category not null,
  description             text check (description is null or char_length(description) <= 2000),
  status                  public.report_status not null default 'open',
  admin_notes             text,
  handled_by              uuid references public.profiles (id) on delete set null,
  handled_at              timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (target_user_id is not null or target_conversation_id is not null or target_message_id is not null)
);
create index reports_status_idx on public.reports (status, created_at desc);
create index reports_reporter_idx on public.reports (reporter_id);
create index reports_target_user_idx on public.reports (target_user_id);

create table public.moderation_events (
  id          bigint generated always as identity primary key,
  actor_id    uuid references public.profiles (id) on delete set null,
  target_user_id uuid references public.profiles (id) on delete set null,
  report_id   uuid references public.reports (id) on delete set null,
  action      public.moderation_action not null,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index moderation_events_target_idx on public.moderation_events (target_user_id, created_at desc);
create index moderation_events_report_idx on public.moderation_events (report_id);

-- ---------------------------------------------------------------------
-- Notificaties (in-app)
-- ---------------------------------------------------------------------
create table public.notifications (
  id               bigint generated always as identity primary key,
  user_id          uuid not null references public.profiles (id) on delete cascade,
  type             public.notification_type not null,
  title            text not null,
  body             text,
  link             text,
  conversation_id  uuid references public.conversations (id) on delete cascade,
  read_at          timestamptz,
  created_at       timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, read_at, created_at desc);

-- ---------------------------------------------------------------------
-- Warme Babbelplekken (inloophuis, praatcafé, luisterlijn) – beheerd door admin
-- ---------------------------------------------------------------------
create table public.places (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 2 and 120),
  kind         text not null check (kind in ('inloophuis','babbelplek','luisterlijn','andere')),
  description  text check (description is null or char_length(description) <= 3000),
  address      text,
  phone        text,
  email        text,
  opening_hours text,
  regions      text[] not null default '{}' check (public.valid_options('region', regions)),
  is_published boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Rate limiting bookkeeping
-- ---------------------------------------------------------------------
create table public.rate_limits (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  bucket     text not null,
  window_start timestamptz not null,
  count      int not null default 0,
  primary key (user_id, bucket, window_start)
);

-- ---------------------------------------------------------------------
-- Hulpfuncties (security definer waar nodig, met vaste search_path)
-- ---------------------------------------------------------------------

-- Rol van de ingelogde gebruiker, zonder RLS-recursie op profiles.
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' and account_status = 'active'
                   from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_listener()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role in ('listener','admin') and account_status = 'active'
                   from public.profiles where id = auth.uid()), false);
$$;

-- Actieve (niet geschorste/geblokkeerde) ingelogde gebruiker?
create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select account_status = 'active' from public.profiles where id = auth.uid()), false);
$$;

-- Is er een blokkade in eender welke richting?
create or replace function public.is_blocked_between(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

-- Lid van gesprek? (security definer om recursie via conversation_members te vermijden)
create or replace function public.is_conversation_member(p_conversation uuid, p_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = p_conversation and user_id = p_user
  );
$$;

-- Deelt de ingelogde gebruiker een gesprek met p_user?
create or replace function public.shares_conversation_with(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_members a
    join public.conversation_members b on a.conversation_id = b.conversation_id
    where a.user_id = auth.uid() and b.user_id = p_user
  );
$$;

-- Is dit profiel zichtbaar in de publieke lijst?
create or replace function public.is_listed_listener(p public.profiles)
returns boolean
language sql
immutable
as $$
  select p.role = 'listener'
     and p.listing_status = 'approved'
     and p.account_status = 'active'
     and not p.is_hidden;
$$;

-- Rate limit: verhoogt teller en geeft false als limiet overschreden.
create or replace function public.check_rate_limit(p_bucket text, p_limit int, p_window interval)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz := date_trunc('minute', now()) - (extract(epoch from now())::int % extract(epoch from p_window)::int) * interval '1 second';
  v_count int;
begin
  if auth.uid() is null then
    return false;
  end if;
  insert into public.rate_limits (user_id, bucket, window_start, count)
  values (auth.uid(), p_bucket, v_window, 1)
  on conflict (user_id, bucket, window_start)
  do update set count = public.rate_limits.count + 1
  returning count into v_count;
  -- oude vensters opruimen (goedkoop, beperkt)
  delete from public.rate_limits where user_id = auth.uid() and window_start < now() - interval '2 days';
  return v_count <= p_limit;
end;
$$;

-- updated_at automatisch bijwerken
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger reports_set_updated_at before update on public.reports
  for each row execute function public.set_updated_at();
create trigger preferences_set_updated_at before update on public.profile_preferences
  for each row execute function public.set_updated_at();
create trigger places_set_updated_at before update on public.places
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Profiel aanmaken bij registratie (trigger op auth.users)
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := coalesce(nullif(btrim(new.raw_user_meta_data->>'display_name'), ''), 'Nieuwe gebruiker');
begin
  if char_length(v_name) > 40 then v_name := left(v_name, 40); end if;
  if char_length(v_name) < 2 then v_name := 'Nieuwe gebruiker'; end if;

  insert into public.profiles (id, display_name)
  values (new.id, v_name)
  on conflict (id) do nothing;

  insert into public.profile_preferences (user_id, accepted_privacy_at)
  values (new.id, case when (new.raw_user_meta_data->>'accepted_privacy')::boolean then now() else null end)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Bescherming van gevoelige profielkolommen: enkel admin (via RPC) mag
-- role / account_status / listing_status wijzigen.
-- ---------------------------------------------------------------------
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
-- Bewust GEEN security definer: de check moet in de context van de aanroeper gebeuren.
set search_path = public
as $$
begin
  if (new.role is distinct from old.role
      or new.account_status is distinct from old.account_status
      or new.listing_status is distinct from old.listing_status)
  then
    -- Toegelaten: admin-RPC's (zetten app.admin_rpc), service_role en databasebeheer (geen JWT).
    if coalesce(current_setting('app.admin_rpc', true), '') <> 'on'
       and coalesce(auth.role(), '') not in ('service_role')
       and auth.uid() is not null
    then
      raise exception 'Wijzigen van rol of status is niet toegestaan' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_columns before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- ---------------------------------------------------------------------
-- Berichten: rate limit + validatie + bijwerken gesprek + notificatie
-- ---------------------------------------------------------------------
create or replace function public.before_message_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.check_rate_limit('messages', 30, interval '1 minute') then
    raise exception 'Te veel berichten in korte tijd. Wacht even en probeer opnieuw.' using errcode = 'P0001';
  end if;
  new.body := btrim(new.body);
  return new;
end;
$$;

create trigger messages_before_insert before insert on public.messages
  for each row execute function public.before_message_insert();

create or replace function public.after_message_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient uuid;
  v_sender_name text;
begin
  update public.conversations
     set last_message_at = new.created_at,
         last_message_preview = left(new.body, 140),
         last_message_sender = new.sender_id
   where id = new.conversation_id;

  -- afzender heeft het gesprek uiteraard gelezen
  update public.conversation_members
     set last_read_at = new.created_at, is_archived = false
   where conversation_id = new.conversation_id and user_id = new.sender_id;

  -- ontvanger: de-archiveren en notificatie
  select user_id into v_recipient
    from public.conversation_members
   where conversation_id = new.conversation_id and user_id <> new.sender_id
   limit 1;

  if v_recipient is not null then
    update public.conversation_members set is_archived = false
     where conversation_id = new.conversation_id and user_id = v_recipient;

    select display_name into v_sender_name from public.profiles where id = new.sender_id;

    -- Eén open notificatie per gesprek: bestaande ongelezen notificatie bijwerken i.p.v. stapelen.
    update public.notifications
       set title = 'Nieuw bericht van ' || coalesce(v_sender_name, 'iemand'),
           body = left(new.body, 140),
           created_at = new.created_at
     where user_id = v_recipient and conversation_id = new.conversation_id
       and type = 'new_message' and read_at is null;

    if not found then
      insert into public.notifications (user_id, type, title, body, link, conversation_id)
      values (
        v_recipient, 'new_message',
        'Nieuw bericht van ' || coalesce(v_sender_name, 'iemand'),
        left(new.body, 140),
        '/chat/' || new.conversation_id::text,
        new.conversation_id
      );
    end if;
  end if;

  return new;
end;
$$;

create trigger messages_after_insert after insert on public.messages
  for each row execute function public.after_message_insert();

-- Rapporteringen: rate limit
create or replace function public.before_report_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.check_rate_limit('reports', 10, interval '1 day') then
    raise exception 'Je hebt vandaag al veel meldingen gedaan. Contacteer info@similes.be als het dringend is.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger reports_before_insert before insert on public.reports
  for each row execute function public.before_report_insert();

-- ---------------------------------------------------------------------
-- RPC: gesprek starten (of bestaand gesprek teruggeven)
-- ---------------------------------------------------------------------
create or replace function public.start_conversation(p_other uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_low uuid;
  v_high uuid;
  v_id uuid;
  v_other public.profiles;
begin
  if v_me is null then
    raise exception 'Niet ingelogd' using errcode = '42501';
  end if;
  if p_other is null or p_other = v_me then
    raise exception 'Ongeldige gesprekspartner' using errcode = '22023';
  end if;
  if not public.is_active_user() then
    raise exception 'Je account is niet actief' using errcode = '42501';
  end if;

  select * into v_other from public.profiles where id = p_other;
  if not found or v_other.account_status <> 'active' then
    raise exception 'Deze gebruiker is niet beschikbaar' using errcode = '42501';
  end if;
  if public.is_blocked_between(v_me, p_other) then
    raise exception 'Je kan geen gesprek starten met deze gebruiker' using errcode = '42501';
  end if;

  -- Wie mag met wie starten? Iedereen mag een gesprek starten met een gelijste Warme Babbelaar.
  -- Babbelaars/admins mogen ook terug starten met iemand met wie ze al een gesprek delen.
  if not (
      public.is_listed_listener(v_other)
      or public.is_admin()
      or (public.is_listener() and public.shares_conversation_with(p_other))
      or public.shares_conversation_with(p_other)
  ) then
    raise exception 'Je kan enkel een gesprek starten met een Warme Babbelaar' using errcode = '42501';
  end if;

  v_low := least(v_me, p_other);
  v_high := greatest(v_me, p_other);

  select id into v_id from public.conversations where user_low = v_low and user_high = v_high;
  if v_id is not null then
    update public.conversation_members set is_archived = false
     where conversation_id = v_id and user_id = v_me;
    return v_id;
  end if;

  if not public.check_rate_limit('new_conversations', 20, interval '1 day') then
    raise exception 'Je hebt vandaag al veel nieuwe gesprekken gestart. Probeer morgen opnieuw.' using errcode = 'P0001';
  end if;

  insert into public.conversations (created_by, user_low, user_high)
  values (v_me, v_low, v_high)
  returning id into v_id;

  insert into public.conversation_members (conversation_id, user_id) values (v_id, v_me), (v_id, p_other);
  return v_id;
end;
$$;

-- RPC: gesprek als gelezen markeren
create or replace function public.mark_conversation_read(p_conversation uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversation_members
     set last_read_at = now()
   where conversation_id = p_conversation and user_id = auth.uid();
  update public.notifications
     set read_at = now()
   where user_id = auth.uid() and conversation_id = p_conversation and read_at is null;
end;
$$;

-- RPC: gesprek archiveren / de-archiveren (enkel voor jezelf)
create or replace function public.set_conversation_archived(p_conversation uuid, p_archived boolean)
returns void
language sql
security definer
set search_path = public
as $$
  update public.conversation_members
     set is_archived = p_archived
   where conversation_id = p_conversation and user_id = auth.uid();
$$;

-- Ongelezen berichten in een gesprek voor de ingelogde gebruiker
create or replace function public.unread_count(p_conversation uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.messages m
  join public.conversation_members cm
    on cm.conversation_id = m.conversation_id and cm.user_id = auth.uid()
  where m.conversation_id = p_conversation
    and m.created_at > cm.last_read_at
    and m.sender_id is distinct from auth.uid()
    and m.deleted_at is null;
$$;

-- Totaal ongelezen (voor badge in header)
create or replace function public.total_unread()
returns int
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(public.unread_count(cm.conversation_id)), 0)::int
  from public.conversation_members cm
  where cm.user_id = auth.uid() and not cm.is_archived;
$$;

-- ---------------------------------------------------------------------
-- View: mijn gesprekken (security_invoker → RLS van onderliggende tabellen geldt)
-- ---------------------------------------------------------------------
create or replace view public.my_conversations
with (security_invoker = true)
as
select
  c.id,
  c.created_at,
  c.last_message_at,
  c.last_message_preview,
  c.last_message_sender,
  me.is_archived,
  me.last_read_at,
  other.user_id      as other_user_id,
  op.display_name    as other_display_name,
  op.avatar_path     as other_avatar_path,
  op.role            as other_role,
  op.account_status  as other_account_status,
  public.unread_count(c.id) as unread_count,
  public.is_blocked_between(me.user_id, other.user_id) as is_blocked
from public.conversations c
join public.conversation_members me on me.conversation_id = c.id and me.user_id = auth.uid()
left join public.conversation_members other on other.conversation_id = c.id and other.user_id <> me.user_id
left join public.profiles op on op.id = other.user_id;

-- ---------------------------------------------------------------------
-- Admin RPC's (loggen altijd in moderation_events)
-- ---------------------------------------------------------------------
create or replace function public.admin_set_role(p_user uuid, p_role public.user_role, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_old public.user_role;
begin
  if not public.is_admin() then raise exception 'Enkel voor beheerders' using errcode = '42501'; end if;
  if p_user = auth.uid() and p_role <> 'admin' then
    raise exception 'Je kan je eigen beheerdersrol niet afnemen' using errcode = '42501';
  end if;
  select role into v_old from public.profiles where id = p_user;
  if not found then raise exception 'Gebruiker niet gevonden' using errcode = 'P0002'; end if;
  perform set_config('app.admin_rpc', 'on', true);
  update public.profiles
     set role = p_role,
         listing_status = case when p_role = 'listener' and listing_status = 'rejected' then 'pending' else listing_status end
   where id = p_user;
  perform set_config('app.admin_rpc', 'off', true);
  insert into public.moderation_events (actor_id, target_user_id, action, details)
  values (auth.uid(), p_user, 'set_role', jsonb_build_object('from', v_old, 'to', p_role, 'note', p_note));
end;
$$;

create or replace function public.admin_set_account_status(p_user uuid, p_status public.account_status, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_old public.account_status;
begin
  if not public.is_admin() then raise exception 'Enkel voor beheerders' using errcode = '42501'; end if;
  if p_user = auth.uid() then raise exception 'Je kan je eigen account niet schorsen' using errcode = '42501'; end if;
  select account_status into v_old from public.profiles where id = p_user;
  if not found then raise exception 'Gebruiker niet gevonden' using errcode = 'P0002'; end if;
  perform set_config('app.admin_rpc', 'on', true);
  update public.profiles set account_status = p_status where id = p_user;
  perform set_config('app.admin_rpc', 'off', true);
  insert into public.moderation_events (actor_id, target_user_id, action, details)
  values (auth.uid(), p_user, 'set_account_status', jsonb_build_object('from', v_old, 'to', p_status, 'note', p_note));
  insert into public.notifications (user_id, type, title, body, link)
  values (p_user, 'account_status',
          case p_status when 'active' then 'Je account is opnieuw actief'
                        when 'suspended' then 'Je account is tijdelijk geschorst'
                        else 'Je account is geblokkeerd' end,
          coalesce(p_note, ''), '/instellingen');
end;
$$;

create or replace function public.admin_set_listing_status(p_user uuid, p_status public.listing_status, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_old public.listing_status;
begin
  if not public.is_admin() then raise exception 'Enkel voor beheerders' using errcode = '42501'; end if;
  select listing_status into v_old from public.profiles where id = p_user;
  if not found then raise exception 'Gebruiker niet gevonden' using errcode = 'P0002'; end if;
  perform set_config('app.admin_rpc', 'on', true);
  update public.profiles set listing_status = p_status where id = p_user;
  perform set_config('app.admin_rpc', 'off', true);
  insert into public.moderation_events (actor_id, target_user_id, action, details)
  values (auth.uid(), p_user, 'set_listing_status', jsonb_build_object('from', v_old, 'to', p_status, 'note', p_note));
  if p_status = 'approved' then
    insert into public.notifications (user_id, type, title, body, link)
    values (p_user, 'listing_approved', 'Je profiel als Warme Babbelaar is goedgekeurd',
            'Je staat nu in de lijst. Bedankt om er te zijn voor anderen.', '/mijn-profiel');
  end if;
end;
$$;

create or replace function public.admin_update_report(p_report uuid, p_status public.report_status, p_notes text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_report public.reports;
begin
  if not public.is_admin() then raise exception 'Enkel voor beheerders' using errcode = '42501'; end if;
  select * into v_report from public.reports where id = p_report;
  if not found then raise exception 'Melding niet gevonden' using errcode = 'P0002'; end if;
  update public.reports
     set status = p_status,
         admin_notes = coalesce(p_notes, admin_notes),
         handled_by = auth.uid(),
         handled_at = case when p_status in ('afgehandeld','afgewezen') then now() else handled_at end
   where id = p_report;
  insert into public.moderation_events (actor_id, target_user_id, report_id, action, details)
  values (auth.uid(), v_report.target_user_id, p_report, 'report_status',
          jsonb_build_object('from', v_report.status, 'to', p_status, 'notes', p_notes));
  if v_report.reporter_id is not null and p_status in ('afgehandeld','afgewezen') then
    insert into public.notifications (user_id, type, title, body, link)
    values (v_report.reporter_id, 'report_update', 'Je melding werd behandeld',
            'Bedankt voor je melding. Een beheerder heeft ze bekeken.', null);
  end if;
end;
$$;

create or replace function public.admin_add_note(p_user uuid, p_note text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Enkel voor beheerders' using errcode = '42501'; end if;
  insert into public.moderation_events (actor_id, target_user_id, action, details)
  values (auth.uid(), p_user, 'note', jsonb_build_object('note', p_note));
end;
$$;

create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Enkel voor beheerders' using errcode = '42501'; end if;
  return jsonb_build_object(
    'users_total', (select count(*) from public.profiles),
    'seekers', (select count(*) from public.profiles where role = 'seeker'),
    'listeners', (select count(*) from public.profiles where role = 'listener'),
    'listeners_listed', (select count(*) from public.profiles p where public.is_listed_listener(p)),
    'listeners_pending', (select count(*) from public.profiles where role = 'listener' and listing_status = 'pending'),
    'admins', (select count(*) from public.profiles where role = 'admin'),
    'suspended', (select count(*) from public.profiles where account_status <> 'active'),
    'conversations', (select count(*) from public.conversations),
    'conversations_7d', (select count(*) from public.conversations where created_at > now() - interval '7 days'),
    'messages', (select count(*) from public.messages),
    'messages_7d', (select count(*) from public.messages where created_at > now() - interval '7 days'),
    'reports_open', (select count(*) from public.reports where status in ('open','in_behandeling')),
    'reports_total', (select count(*) from public.reports),
    'new_users_30d', (select count(*) from public.profiles where created_at > now() - interval '30 days')
  );
end;
$$;

-- Eigen account: alle persoonlijke data anonimiseren (de auth-user zelf wordt server-side verwijderd).
create or replace function public.anonymize_own_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_me uuid := auth.uid();
begin
  if v_me is null then raise exception 'Niet ingelogd' using errcode = '42501'; end if;
  update public.messages set body = '[bericht verwijderd]', deleted_at = now() where sender_id = v_me;
  delete from public.notifications where user_id = v_me;
  delete from public.blocks where blocker_id = v_me;
  insert into public.moderation_events (actor_id, target_user_id, action, details)
  values (v_me, v_me, 'account_deleted', jsonb_build_object('at', now()));
end;
$$;

-- ---------------------------------------------------------------------
-- Rechten
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant select on public.profile_options to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;
grant select on public.places to anon, authenticated;
grant all on public.places to authenticated;
grant select, insert, update on public.profile_preferences to authenticated;
grant select, insert, delete on public.blocks to authenticated;
grant select on public.conversations to authenticated;
grant select, update on public.conversation_members to authenticated;
grant select, insert, update on public.messages to authenticated;
grant select, insert on public.message_attachments to authenticated;
grant select, insert on public.reports to authenticated;
grant select on public.moderation_events to authenticated;
grant select, update, delete on public.notifications to authenticated;
grant select on public.my_conversations to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

revoke all on public.rate_limits from anon, authenticated;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated, anon;
grant execute on function public.is_listener() to authenticated, anon;
grant execute on function public.is_active_user() to authenticated, anon;
grant execute on function public.is_blocked_between(uuid, uuid) to authenticated;
grant execute on function public.is_conversation_member(uuid, uuid) to authenticated;
grant execute on function public.shares_conversation_with(uuid) to authenticated;
grant execute on function public.is_listed_listener(public.profiles) to anon, authenticated;
grant execute on function public.start_conversation(uuid) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
grant execute on function public.set_conversation_archived(uuid, boolean) to authenticated;
grant execute on function public.unread_count(uuid) to authenticated;
grant execute on function public.total_unread() to authenticated;
grant execute on function public.admin_set_role(uuid, public.user_role, text) to authenticated;
grant execute on function public.admin_set_account_status(uuid, public.account_status, text) to authenticated;
grant execute on function public.admin_set_listing_status(uuid, public.listing_status, text) to authenticated;
grant execute on function public.admin_update_report(uuid, public.report_status, text) to authenticated;
grant execute on function public.admin_add_note(uuid, text) to authenticated;
grant execute on function public.admin_stats() to authenticated;
grant execute on function public.anonymize_own_profile() to authenticated;
revoke execute on function public.check_rate_limit(text, int, interval) from anon, authenticated;
