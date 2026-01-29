-- Correction des politiques RLS pour permettre au service role d'insérer dans profiles
-- Le service role doit pouvoir créer des profils pour les nouveaux utilisateurs

-- Ajouter une politique qui permet au service role d'insérer dans profiles
CREATE POLICY "Service role can insert profiles"
ON profiles
FOR INSERT
TO service_role
WITH CHECK (true);

-- Ajouter une politique qui permet au service role de mettre à jour profiles
CREATE POLICY "Service role can update profiles"
ON profiles
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Ajouter une politique qui permet au service role de lire profiles
CREATE POLICY "Service role can read profiles"
ON profiles
FOR SELECT
TO service_role
USING (true);
