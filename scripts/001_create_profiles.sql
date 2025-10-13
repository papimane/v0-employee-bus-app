-- Création de la table profiles pour stocker les informations des utilisateurs
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  address text,
  avatar_url text,
  role text default 'passenger' check (role in ('passenger', 'driver', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activer Row Level Security
alter table public.profiles enable row level security;

-- Policies pour permettre aux utilisateurs de gérer leur propre profil
create policy "Les utilisateurs peuvent voir leur propre profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Les utilisateurs peuvent insérer leur propre profil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Les utilisateurs peuvent mettre à jour leur propre profil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Les utilisateurs peuvent supprimer leur propre profil"
  on public.profiles for delete
  using (auth.uid() = id);

-- Policy pour permettre aux chauffeurs de voir les profils des passagers (pour l'app)
create policy "Les chauffeurs peuvent voir les profils des passagers"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'driver'
    )
  );

-- Fonction pour mettre à jour automatiquement updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger pour mettre à jour updated_at
create trigger on_profile_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();
