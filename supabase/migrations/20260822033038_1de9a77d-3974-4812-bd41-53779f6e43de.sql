drop policy "Admins can insert rackets" on public.rackets;
drop policy "Admins can update rackets" on public.rackets;
drop policy "Admins can delete rackets" on public.rackets;
drop function if exists public.has_role(uuid, public.app_role);

create policy "Admins can insert rackets" on public.rackets for insert to authenticated
  with check (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));
create policy "Admins can update rackets" on public.rackets for update to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'))
  with check (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));
create policy "Admins can delete rackets" on public.rackets for delete to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));