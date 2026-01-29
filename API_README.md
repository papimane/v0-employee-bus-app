# Documentation API REST - Bus Pickup

API REST complète pour l'application de ramassage par bus d'entreprise.

## Base URL

- **Production**: `https://buspickup.vercel.app`
- **Development**: `http://localhost:3000`

## Authentification

L'API utilise Supabase Auth pour l'authentification. Les requêtes nécessitant une authentification doivent inclure un token JWT valide dans l'en-tête `Authorization`.

\`\`\`bash
Authorization: Bearer <votre_token_jwt>
\`\`\`

## Endpoints

### Demandes de ramassage (Rides)

#### GET /api/v1/rides

Récupère toutes les demandes de ramassage.

**Paramètres de requête:**
- `status` (optionnel): Filtrer par statut (`pending`, `accepted`, `completed`, `cancelled`)
- `passenger_id` (optionnel): Filtrer par ID passager
- `driver_id` (optionnel): Filtrer par ID chauffeur

**Exemple:**
\`\`\`bash
curl -X GET "https://buspickup.vercel.app/api/v1/rides?status=pending" \
  -H "Authorization: Bearer <token>"
\`\`\`

**Réponse:**
\`\`\`json
{
  "data": [
    {
      "id": "uuid",
      "passenger_id": "uuid",
      "driver_id": "uuid",
      "pickup_lat": 48.8566,
      "pickup_lng": 2.3522,
      "pickup_address": "123 Rue de la Paix, Paris",
      "status": "pending",
      "created_at": "2024-01-01T10:00:00Z",
      "accepted_at": null,
      "completed_at": null,
      "passenger": {
        "id": "uuid",
        "first_name": "Jean",
        "last_name": "Dupont",
        "phone": "+33612345678"
      }
    }
  ],
  "count": 1
}
\`\`\`

#### POST /api/v1/rides

Crée une nouvelle demande de ramassage.

**Corps de la requête:**
\`\`\`json
{
  "pickup_lat": 48.8566,
  "pickup_lng": 2.3522,
  "pickup_address": "123 Rue de la Paix, Paris"
}
\`\`\`

**Exemple:**
\`\`\`bash
curl -X POST "https://buspickup.vercel.app/api/v1/rides" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_lat": 48.8566,
    "pickup_lng": 2.3522,
    "pickup_address": "123 Rue de la Paix, Paris"
  }'
\`\`\`

**Réponse (201 Created):**
\`\`\`json
{
  "data": {
    "id": "uuid",
    "passenger_id": "uuid",
    "pickup_lat": 48.8566,
    "pickup_lng": 2.3522,
    "pickup_address": "123 Rue de la Paix, Paris",
    "status": "pending",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
\`\`\`

#### GET /api/v1/rides/:id

Récupère une demande spécifique.

**Exemple:**
\`\`\`bash
curl -X GET "https://buspickup.vercel.app/api/v1/rides/uuid" \
  -H "Authorization: Bearer <token>"
\`\`\`

#### PATCH /api/v1/rides/:id

Met à jour une demande de ramassage.

**Corps de la requête:**
\`\`\`json
{
  "status": "accepted",
  "driver_id": "uuid"
}
\`\`\`

**Exemple:**
\`\`\`bash
curl -X PATCH "https://buspickup.vercel.app/api/v1/rides/uuid" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted",
    "driver_id": "uuid"
  }'
\`\`\`

#### DELETE /api/v1/rides/:id

Annule une demande de ramassage.

**Exemple:**
\`\`\`bash
curl -X DELETE "https://buspickup.vercel.app/api/v1/rides/uuid" \
  -H "Authorization: Bearer <token>"
\`\`\`

### Chauffeurs (Drivers)

#### GET /api/v1/drivers

Récupère tous les chauffeurs.

**Paramètres de requête:**
- `active` (optionnel): Filtrer par statut actif (`true` ou `false`)

**Exemple:**
\`\`\`bash
curl -X GET "https://buspickup.vercel.app/api/v1/drivers?active=true" \
  -H "Authorization: Bearer <token>"
\`\`\`

**Réponse:**
\`\`\`json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "license_number": "ABC123",
      "is_active": true,
      "created_at": "2024-01-01T10:00:00Z",
      "profile": {
        "id": "uuid",
        "first_name": "Pierre",
        "last_name": "Martin",
        "phone": "+33612345678",
        "avatar_url": "https://..."
      }
    }
  ],
  "count": 1
}
\`\`\`

### Passagers (Passengers)

#### GET /api/v1/passengers

Récupère tous les passagers.

**Exemple:**
\`\`\`bash
curl -X GET "https://buspickup.vercel.app/api/v1/passengers" \
  -H "Authorization: Bearer <token>"
\`\`\`

**Réponse:**
\`\`\`json
{
  "data": [
    {
      "id": "uuid",
      "first_name": "Marie",
      "last_name": "Dubois",
      "phone": "+33612345678",
      "role": "passenger",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ],
  "count": 1
}
\`\`\`

## Codes de statut HTTP

- `200 OK`: Requête réussie
- `201 Created`: Ressource créée avec succès
- `400 Bad Request`: Requête invalide
- `401 Unauthorized`: Authentification requise
- `404 Not Found`: Ressource non trouvée
- `500 Internal Server Error`: Erreur serveur

## Statuts des demandes

- `pending`: En attente d'un chauffeur
- `accepted`: Acceptée par un chauffeur
- `completed`: Terminée
- `cancelled`: Annulée

## Documentation interactive

Une documentation interactive Swagger UI est disponible à l'adresse:
- **Production**: https://buspickup.vercel.app/api-docs
- **Development**: http://localhost:3000/api-docs

## Spécification OpenAPI

La spécification OpenAPI complète est disponible à:
- **Production**: https://buspickup.vercel.app/openapi.json
- **Development**: http://localhost:3000/openapi.json

## Exemples d'utilisation

### JavaScript/TypeScript

\`\`\`typescript
// Récupérer toutes les demandes en attente
const response = await fetch('https://buspickup.vercel.app/api/v1/rides?status=pending', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const { data } = await response.json()

// Créer une nouvelle demande
const response = await fetch('https://buspickup.vercel.app/api/v1/rides', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    pickup_lat: 48.8566,
    pickup_lng: 2.3522,
    pickup_address: '123 Rue de la Paix, Paris'
  })
})
const { data } = await response.json()
\`\`\`

### Python

\`\`\`python
import requests

# Récupérer toutes les demandes en attente
response = requests.get(
    'https://buspickup.vercel.app/api/v1/rides',
    params={'status': 'pending'},
    headers={'Authorization': f'Bearer {token}'}
)
data = response.json()

# Créer une nouvelle demande
response = requests.post(
    'https://buspickup.vercel.app/api/v1/rides',
    headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    },
    json={
        'pickup_lat': 48.8566,
        'pickup_lng': 2.3522,
        'pickup_address': '123 Rue de la Paix, Paris'
    }
)
data = response.json()
\`\`\`

## Support

Pour toute question ou problème, contactez support@buspickup.com
