-- Créer la table des demandes de ramassage
create table if not exists public.ride_requests (
  id uuid default gen_random_uuid() primary key,
  passenger_id uuid references public.profiles(id) on delete cascade not null,
  driver_id uuid references public.profiles(id) on delete set null,
  pickup_latitude decimal(10, 8) not null,
  pickup_longitude decimal(11, 8) not null,
  pickup_address text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  accepted_at timestamp with time zone,
  completed_at timestamp with time zone
);

-- Index pour améliorer les performances
create index if not exists ride_requests_passenger_id_idx on public.ride_requests(passenger_id);
create index if not exists ride_requests_driver_id_idx on public.ride_requests(driver_id);
create index if not exists ride_requests_status_idx on public.ride_requests(status);
create index if not exists ride_requests_created_at_idx on public.ride_requests(created_at desc);

-- Activer RLS
alter table public.ride_requests enable row level security;

-- Policies RLS
-- Les passagers peuvent voir leurs propres demandes
create policy "Les passagers peuvent voir leurs propres demandes"
  on public.ride_requests for select
  using (passenger_id = auth.uid());

-- Les passagers peuvent créer leurs propres demandes
create policy "Les passagers peuvent créer des demandes"
  on public.ride_requests for insert
  with check (passenger_id = auth.uid());

-- Les passagers peuvent annuler leurs propres demandes en attente
create policy "Les passagers peuvent annuler leurs demandes"
  on public.ride_requests for update
  using (passenger_id = auth.uid() and status = 'pending')
  with check (status = 'cancelled');

-- Les chauffeurs peuvent voir toutes les demandes en attente
create policy "Les chauffeurs peuvent voir les demandes en attente"
  on public.ride_requests for select
  using (
    status = 'pending' and 
    get_user_role() in ('driver', 'admin')
  );

-- Les chauffeurs peuvent accepter des demandes
create policy "Les chauffeurs peuvent accepter des demandes"
  on public.ride_requests for update
  using (
    status = 'pending' and 
    get_user_role() in ('driver', 'admin')
  )
  with check (
    status = 'accepted' and 
    driver_id = auth.uid()
  );

-- Les chauffeurs peuvent mettre à jour leurs demandes acceptées
create policy "Les chauffeurs peuvent mettre à jour leurs demandes"
  on public.ride_requests for update
  using (
    driver_id = auth.uid() and 
    status in ('accepted', 'in_progress')
  );

-- Les admins ont accès complet
create policy "Les admins ont accès complet aux demandes"
  on public.ride_requests for all
  using (get_user_role() = 'admin');

-- Trigger pour mettre à jour updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.ride_requests
  for each row
  execute procedure public.handle_updated_at();
