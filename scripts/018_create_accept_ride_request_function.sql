-- Fonction pour accepter une demande de ramassage
-- Utilise SECURITY DEFINER pour bypasser les politiques RLS
CREATE OR REPLACE FUNCTION accept_ride_request(
  request_id UUID,
  driver_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mettre à jour la demande de ramassage
  UPDATE ride_requests
  SET 
    status = 'accepted',
    driver_id = driver_id,
    accepted_at = NOW()
  WHERE id = request_id
    AND status = 'pending';
  
  -- Vérifier que la mise à jour a réussi
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ride request not found or already accepted';
  END IF;
END;
$$;

-- Donner les permissions d'exécution à tous les utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION accept_ride_request(UUID, UUID) TO authenticated;
