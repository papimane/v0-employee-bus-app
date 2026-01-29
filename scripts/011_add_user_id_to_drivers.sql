-- Ajouter une colonne user_id à la table drivers pour lier avec auth.users
ALTER TABLE public.drivers
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON public.drivers(user_id);

-- Commentaire
COMMENT ON COLUMN public.drivers.user_id IS 'Référence vers le compte utilisateur Supabase Auth';
