-- =====================================================================
-- Warme Babbel – 0003: Storage-buckets, storage-policies, Realtime
-- =====================================================================

-- ---------------------------------------------------------------------
-- Storage: private bucket voor profielfoto's
-- Pad: avatars/<user_id>/<bestandsnaam>
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Bijlagen in gesprekken (voorzien; UI is should-have). Pad: attachments/<conversation_id>/<bestandsnaam>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('attachments', 'attachments', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Eigenaar beheert eigen map
create policy "avatars: eigenaar uploadt" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_active_user()
  );

create policy "avatars: eigenaar vervangt" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars: eigenaar verwijdert" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Lezen: enkel wie het bijhorende profiel mag zien (RLS op profiles bepaalt dat).
-- Signed URL's worden server-side aangemaakt; deze policy dekt directe downloads met een user-token.
create policy "avatars: lezen als profiel zichtbaar is" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and exists (
      select 1 from public.profiles p
      where p.id::text = (storage.foldername(name))[1]
    )
  );

-- Bijlagen: enkel leden van het gesprek
create policy "attachments: leden uploaden" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'attachments'
    and public.is_conversation_member(((storage.foldername(name))[1])::uuid)
    and public.is_active_user()
  );

create policy "attachments: leden lezen" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'attachments'
    and public.is_conversation_member(((storage.foldername(name))[1])::uuid)
  );

-- ---------------------------------------------------------------------
-- Realtime: berichten en notificaties (RLS wordt door Realtime afgedwongen)
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.conversation_members;

-- Volledige rij-identiteit zodat updates (bv. deleted_at) correct doorkomen
alter table public.messages replica identity full;
alter table public.notifications replica identity full;
alter table public.conversation_members replica identity full;
