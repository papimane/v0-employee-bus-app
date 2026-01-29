-- Création de la table drivers pour stocker les informations des chauffeurs
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text not null,
  license_number text not null unique,
  photo_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activer Row Level Security
alter table public.drivers enable row level security;

-- Policies pour les admins
create policy "Les admins peuvent tout faire sur drivers"
  on public.drivers for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Policy pour que les chauffeurs puissent voir leur propre profil
create policy "Les chauffeurs peuvent voir leur propre profil"
  on public.drivers for select
  using (user_id = auth.uid());

-- Trigger pour mettre à jour updated_at
create trigger on_driver_updated
  before update on public.drivers
  for each row
  execute function public.handle_updated_at();

-- Index pour améliorer les performances
create index if not exists drivers_user_id_idx on public.drivers(user_id);
create index if not exists drivers_email_idx on public.drivers(email);
