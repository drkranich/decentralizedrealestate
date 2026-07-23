-- The browser must always be able to read the signed-in user's real role.
-- Do not allow an unreadable/missing role to be interpreted as "tenant".

grant select on public.users to authenticated;
grant update on public.users to authenticated;

drop policy if exists "admin_bypass_all" on public.users;
drop policy if exists "users admin all" on public.users;
create policy "users admin all"
on public.users
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "users_select_own" on public.users;
drop policy if exists "users select own profile" on public.users;
create policy "users select own profile"
on public.users
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "users_update_own" on public.users;
drop policy if exists "users update own profile" on public.users;
create policy "users update own profile"
on public.users
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function private.prevent_non_admin_user_identity_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    new.role is distinct from old.role
    or new.email is distinct from old.email
  ) and not (select private.is_admin()) then
    raise exception 'Only admins can change user roles or emails';
  end if;
  return new;
end;
$$;

revoke all on function private.prevent_non_admin_user_identity_change() from public;

drop trigger if exists prevent_non_admin_role_change on public.users;
create trigger prevent_non_admin_role_change
before update on public.users
for each row
execute function private.prevent_non_admin_user_identity_change();

-- Remove public profile rows that no longer have a matching Supabase Auth user.
-- These rows cannot log in and only distort role counts/admin screens.
delete from public.users u
where not exists (
  select 1
  from auth.users au
  where au.id = u.id
);
