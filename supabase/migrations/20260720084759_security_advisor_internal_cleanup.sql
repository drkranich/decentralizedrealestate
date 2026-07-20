-- Internal cleanup from Supabase security advisors. This avoids permissive
-- public policies without involving payment, email, SMS, push, or outbound APIs.

drop policy if exists "admin_bypass_all" on public.leads;
create policy "leads admin all"
on public.leads
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "allow_insert_leads" on public.leads;
drop policy if exists "leads public contact insert" on public.leads;
create policy "leads public contact insert"
on public.leads
for insert
to anon, authenticated
with check (
  length(trim(coalesce(name, ''))) between 2 and 160
  and (nullif(trim(coalesce(email, '')), '') is not null or nullif(trim(coalesce(phone, '')), '') is not null)
  and coalesce(status, 'new') = 'new'
);

drop policy if exists "branding_admin_write" on storage.objects;
drop policy if exists "branding_admin_update" on storage.objects;
drop policy if exists "branding_admin_delete" on storage.objects;
drop policy if exists "branding_admin_read" on storage.objects;

create policy "branding_admin_read"
on storage.objects
for select
to authenticated
using (bucket_id = 'branding' and (select private.is_admin()));

create policy "branding_admin_write"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'branding' and (select private.is_admin()));

create policy "branding_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'branding' and (select private.is_admin()))
with check (bucket_id = 'branding' and (select private.is_admin()));

create policy "branding_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'branding' and (select private.is_admin()));

-- Public buckets remain public for direct object URLs, but broad object-listing
-- policies are removed. Owners/admins keep read access where uploads need it.
drop policy if exists "avatars_public_read" on storage.objects;
drop policy if exists "avatars_owner_read" on storage.objects;
create policy "avatars_owner_read"
on storage.objects
for select
to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "branding_public_read" on storage.objects;

drop policy if exists "property_media_storage_public_read" on storage.objects;
drop policy if exists "property_media_storage_owner_read" on storage.objects;
drop policy if exists "property_media_storage_owner_update" on storage.objects;
create policy "property_media_storage_owner_read"
on storage.objects
for select
to authenticated
using (bucket_id = 'property-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "property_media_storage_owner_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'property-media' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'property-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'is_admin'
      and pg_get_function_identity_arguments(p.oid) = ''
  ) then
    revoke execute on function public.is_admin() from public;
    revoke execute on function public.is_admin() from anon;
    revoke execute on function public.is_admin() from authenticated;
  end if;
end $$;
