-- =====================================================================
-- Warme Babbel – 0002: Row Level Security
-- Principe: alles is dicht, tenzij een policy het expliciet toelaat.
-- =====================================================================

alter table public.profile_options     enable row level security;
alter table public.profiles            enable row level security;
alter table public.profile_preferences enable row level security;
alter table public.blocks              enable row level security;
alter table public.conversations       enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages            enable row level security;
alter table public.message_attachments enable row level security;
alter table public.reports             enable row level security;
alter table public.moderation_events   enable row level security;
alter table public.notifications       enable row level security;
alter table public.places              enable row level security;
alter table public.rate_limits         enable row level security;

-- Ook de tabeleigenaar (postgres) moet RLS respecteren bij tests? Nee: service_role/postgres
-- omzeilen RLS bewust (server-side, nooit in de browser). Geen FORCE.

-- ---------------------------------------------------------------------
-- profile_options: leesbaar voor iedereen, beheer door admin
-- ---------------------------------------------------------------------
create policy "options: iedereen leest" on public.profile_options
  for select using (true);
create policy "options: admin beheert" on public.profile_options
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
-- Lezen:
--  * iedereen (ook anoniem): gelijste Warme Babbelaars
--  * ingelogd: eigen profiel
--  * ingelogd: profiel van iemand met wie je een gesprek deelt (nodig voor chat-header)
--  * listener: profielen van babbelzoekers die hem/haar contacteerden (= gedeeld gesprek, zie hierboven)
--  * admin: alles
--  Geblokkeerde gebruikers zien elkaar niet in de lijst (wel in bestaand gesprek, als "geblokkeerd").
create policy "profiles: gelijste babbelaars publiek" on public.profiles
  for select using (
    public.is_listed_listener(profiles)
    and (auth.uid() is null or not public.is_blocked_between(auth.uid(), id))
  );

create policy "profiles: eigen profiel" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: gesprekspartner" on public.profiles
  for select using (auth.uid() is not null and public.shares_conversation_with(id));

create policy "profiles: admin leest alles" on public.profiles
  for select using (public.is_admin());

-- Wijzigen: enkel eigen profiel; rol/status beschermd door trigger.
create policy "profiles: eigen profiel bewerken" on public.profiles
  for update using (auth.uid() = id and public.is_active_user())
  with check (auth.uid() = id);

-- Geen insert (trigger op auth.users maakt profiel) en geen delete (cascade via auth.users) voor gebruikers.
create policy "profiles: admin bewerkt" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- profile_preferences: enkel eigenaar (+ admin lezen)
-- ---------------------------------------------------------------------
create policy "prefs: eigenaar" on public.profile_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "prefs: admin leest" on public.profile_preferences
  for select using (public.is_admin());

-- ---------------------------------------------------------------------
-- blocks: enkel de blokkeerder ziet/beheert zijn blokkades; de geblokkeerde ziet niets
-- ---------------------------------------------------------------------
create policy "blocks: eigen blokkades lezen" on public.blocks
  for select using (auth.uid() = blocker_id or public.is_admin());
create policy "blocks: blokkeren" on public.blocks
  for insert with check (auth.uid() = blocker_id and public.is_active_user() and blocked_id <> auth.uid());
create policy "blocks: deblokkeren" on public.blocks
  for delete using (auth.uid() = blocker_id);

-- ---------------------------------------------------------------------
-- conversations: enkel leden (en admin, voor moderatie van gemelde gesprekken)
-- Aanmaken uitsluitend via start_conversation() (security definer).
-- ---------------------------------------------------------------------
create policy "conversations: leden lezen" on public.conversations
  for select using (public.is_conversation_member(id));
create policy "conversations: admin leest gemelde gesprekken" on public.conversations
  for select using (
    public.is_admin() and exists (
      select 1 from public.reports r
      where r.target_conversation_id = conversations.id
         or exists (select 1 from public.messages m where m.id = r.target_message_id and m.conversation_id = conversations.id)
    )
  );

-- ---------------------------------------------------------------------
-- conversation_members
-- ---------------------------------------------------------------------
create policy "members: leden zien lidmaatschappen van hun gesprekken" on public.conversation_members
  for select using (public.is_conversation_member(conversation_id));
create policy "members: eigen lidmaatschap bijwerken" on public.conversation_members
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "members: admin leest" on public.conversation_members
  for select using (public.is_admin());

-- ---------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------
create policy "messages: leden lezen" on public.messages
  for select using (public.is_conversation_member(conversation_id));

create policy "messages: leden versturen" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and public.is_active_user()
    and public.is_conversation_member(conversation_id)
    and not exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = messages.conversation_id
        and cm.user_id <> auth.uid()
        and (
          public.is_blocked_between(auth.uid(), cm.user_id)
          or exists (select 1 from public.profiles p where p.id = cm.user_id and p.account_status <> 'active')
        )
    )
  );

-- Eigen bericht mag enkel "verwijderd" worden (soft delete); inhoud wordt niet herschreven.
create policy "messages: eigen bericht verwijderen" on public.messages
  for update using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id and deleted_at is not null);

create policy "messages: admin leest gemelde berichten" on public.messages
  for select using (
    public.is_admin() and exists (
      select 1 from public.reports r
      where r.target_message_id = messages.id
         or r.target_conversation_id = messages.conversation_id
    )
  );

-- ---------------------------------------------------------------------
-- message_attachments
-- ---------------------------------------------------------------------
create policy "attachments: leden lezen" on public.message_attachments
  for select using (
    exists (select 1 from public.messages m
            where m.id = message_id and public.is_conversation_member(m.conversation_id))
  );
create policy "attachments: afzender voegt toe" on public.message_attachments
  for insert with check (
    exists (select 1 from public.messages m where m.id = message_id and m.sender_id = auth.uid())
  );

-- ---------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------
create policy "reports: eigen meldingen lezen" on public.reports
  for select using (auth.uid() = reporter_id);
create policy "reports: melden" on public.reports
  for insert with check (
    auth.uid() = reporter_id
    and public.is_active_user()
    and (target_user_id is null or target_user_id <> auth.uid())
    and (target_conversation_id is null or public.is_conversation_member(target_conversation_id))
    and (target_message_id is null or exists (
          select 1 from public.messages m
          where m.id = target_message_id and public.is_conversation_member(m.conversation_id)))
  );
create policy "reports: admin leest alles" on public.reports
  for select using (public.is_admin());
-- Bijwerken door admin gebeurt via admin_update_report() (security definer).

-- ---------------------------------------------------------------------
-- moderation_events: enkel admin leest; schrijven enkel via RPC's
-- ---------------------------------------------------------------------
create policy "moderation: admin leest" on public.moderation_events
  for select using (public.is_admin());

-- ---------------------------------------------------------------------
-- notifications: enkel eigenaar
-- ---------------------------------------------------------------------
create policy "notifications: eigenaar leest" on public.notifications
  for select using (auth.uid() = user_id);
create policy "notifications: eigenaar markeert gelezen" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications: eigenaar verwijdert" on public.notifications
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- places: gepubliceerde plekken publiek; admin beheert
-- ---------------------------------------------------------------------
create policy "places: gepubliceerd publiek" on public.places
  for select using (is_published or public.is_admin());
create policy "places: admin beheert" on public.places
  for all using (public.is_admin()) with check (public.is_admin());

-- rate_limits: geen enkele policy → enkel via security definer functies bereikbaar.
