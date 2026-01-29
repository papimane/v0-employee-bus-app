-- Fonction pour créer automatiquement un profil lors de l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, address, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', null),
    coalesce(new.raw_user_meta_data ->> 'last_name', null),
    coalesce(new.raw_user_meta_data ->> 'phone', null),
    coalesce(new.raw_user_meta_data ->> 'address', null),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Supprimer le trigger s'il existe déjà
drop trigger if exists on_auth_user_created on auth.users;

-- Créer le trigger pour créer automatiquement un profil
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
