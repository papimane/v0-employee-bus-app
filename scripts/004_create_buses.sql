-- Création de la table buses pour stocker les informations des bus
create table if not exists public.buses (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  license_plate text not null unique,
  capacity integer not null check (capacity > 0),
  driver_id uuid references public.drivers(id) on delete set null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activer Row Level Security
alter table public.buses enable row level security;

-- Policies pour les admins
create policy "Les admins peuvent tout faire sur buses"
  on public.buses for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Policy pour que les chauffeurs puissent voir leur bus assigné
create policy "Les chauffeurs peuvent voir leur bus"
  on public.buses for select
  using (
    driver_id in (
      select id from public.drivers where user_id = auth.uid()
    )
  );

-- Policy pour que tout le monde puisse voir les bus actifs (pour l'app)
create policy "Tout le monde peut voir les bus actifs"
  on public.buses for select
  using (is_active = true);

-- Trigger pour mettre à jour updated_at
create trigger on_bus_updated
  before update on public.buses
  for each row
  execute function public.handle_updated_at();

-- Index pour améliorer les performances
create index if not exists buses_driver_id_idx on public.buses(driver_id);
create index if not exists buses_license_plate_idx on public.buses(license_plate);
