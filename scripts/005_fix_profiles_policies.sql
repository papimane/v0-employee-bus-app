-- Correction des policies RLS pour éviter la récursion infinie

-- Supprimer les anciennes policies
drop policy if exists "Les utilisateurs peuvent voir leur propre profil" on public.profiles;
drop policy if exists "Les utilisateurs peuvent insérer leur propre profil" on public.profiles;
drop policy if exists "Les utilisateurs peuvent mettre à jour leur propre profil" on public.profiles;
drop policy if exists "Les utilisateurs peuvent supprimer leur propre profil" on public.profiles;
drop policy if exists "Les chauffeurs peuvent voir les profils des passagers" on public.profiles;

-- Créer une fonction pour vérifier le rôle de l'utilisateur sans récursion
create or replace function public.get_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Nouvelles policies sans récursion

-- Policy SELECT : Les utilisateurs peuvent voir leur propre profil
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy SELECT : Les admins peuvent voir tous les profils
create policy "Admins can view all profiles"
  on public.profiles for select
  using (get_user_role() = 'admin');

-- Policy SELECT : Les chauffeurs peuvent voir tous les profils (pour l'app)
create policy "Drivers can view all profiles"
  on public.profiles for select
  using (get_user_role() = 'driver');

-- Policy INSERT : Les utilisateurs peuvent créer leur propre profil
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Policy UPDATE : Les utilisateurs peuvent mettre à jour leur propre profil
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Policy UPDATE : Les admins peuvent mettre à jour tous les profils
create policy "Admins can update all profiles"
  on public.profiles for update
  using (get_user_role() = 'admin');

-- Policy DELETE : Les utilisateurs peuvent supprimer leur propre profil
create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- Policy DELETE : Les admins peuvent supprimer tous les profils
create policy "Admins can delete all profiles"
  on public.profiles for delete
  using (get_user_role() = 'admin');
