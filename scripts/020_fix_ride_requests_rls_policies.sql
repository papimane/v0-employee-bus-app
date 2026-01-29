-- Supprimer les anciennes politiques RLS si elles existent
DROP POLICY IF EXISTS "Users can view their own ride requests" ON ride_requests;
DROP POLICY IF EXISTS "Users can insert their own ride requests" ON ride_requests;
DROP POLICY IF EXISTS "Users can update their own ride requests" ON ride_requests;
DROP POLICY IF EXISTS "Drivers can view all pending requests" ON ride_requests;
DROP POLICY IF EXISTS "Drivers can update accepted requests" ON ride_requests;

-- Politique pour permettre aux passagers de voir leurs propres demandes
CREATE POLICY "Passengers can view their own requests"
ON ride_requests
FOR SELECT
USING (passenger_id = auth.uid());

-- Politique pour permettre aux passagers de créer leurs propres demandes
CREATE POLICY "Passengers can create their own requests"
ON ride_requests
FOR INSERT
WITH CHECK (passenger_id = auth.uid());

-- Politique pour permettre aux passagers d'annuler leurs propres demandes
CREATE POLICY "Passengers can cancel their own requests"
ON ride_requests
FOR UPDATE
USING (passenger_id = auth.uid())
WITH CHECK (
  passenger_id = auth.uid() 
  AND status IN ('cancelled')
);

-- Politique pour permettre aux chauffeurs de voir toutes les demandes en attente
CREATE POLICY "Drivers can view pending requests"
ON ride_requests
FOR SELECT
USING (
  status IN ('pending', 'accepted')
  OR driver_id = auth.uid()
);

-- Politique pour permettre aux chauffeurs d'accepter les demandes
CREATE POLICY "Drivers can accept requests"
ON ride_requests
FOR UPDATE
USING (status = 'pending')
WITH CHECK (
  status = 'accepted' 
  AND driver_id = auth.uid()
);

-- Politique pour permettre au service role de tout faire (pour les Server Actions)
CREATE POLICY "Service role can do everything"
ON ride_requests
FOR ALL
USING (auth.jwt()->>'role' = 'service_role')
WITH CHECK (auth.jwt()->>'role' = 'service_role');
