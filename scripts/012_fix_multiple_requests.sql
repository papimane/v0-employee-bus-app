-- Supprimer les demandes en double (garder seulement la plus récente pour chaque passager)
DELETE FROM ride_requests
WHERE id NOT IN (
  SELECT DISTINCT ON (passenger_id) id
  FROM ride_requests
  WHERE status IN ('pending', 'accepted')
  ORDER BY passenger_id, created_at DESC
);

-- Ajouter une contrainte unique pour empêcher plusieurs demandes en cours par passager
-- D'abord, créer un index unique partiel
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_request_per_passenger
ON ride_requests (passenger_id)
WHERE status IN ('pending', 'accepted');

-- Commentaire : Cette contrainte empêche un passager d'avoir plus d'une demande 
-- avec le statut 'pending' ou 'accepted' en même temps
