# Employee Bus App - BusPickup

Application de ramassage par bus d'entreprise avec gestion des demandes de transport, suivi en temps réel et interface d'administration complète.

## Fonctionnalités principales

- **Interface Passager**: Demande de ramassage avec géolocalisation
- **Interface Chauffeur**: Gestion des demandes et navigation
- **Interface Admin**: Gestion des chauffeurs, bus et passagers
- **API REST**: Endpoints documentés avec OpenAPI
- **Authentification**: Système sécurisé avec JWT et sessions
- **Carte interactive**: Affichage des itinéraires avec OpenStreetMap

## Technologies

- **Framework**: Next.js 15 avec App Router
- **Base de données**: PostgreSQL
- **Authentification**: Custom Auth avec JWT et cookies sécurisés
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **Cartes**: Leaflet, OpenStreetMap
- **API**: REST avec documentation OpenAPI
- **Conteneurisation**: Docker & Docker Compose

## Installation

### Option 1: Docker (recommandé)

```bash
# Cloner le projet
git clone <repo-url>
cd buspickup

# Configurer l'environnement
cp .env.example .env

# Lancer avec Docker
docker-compose up -d --build
```

L'application sera accessible sur http://localhost:3000

Voir [DOCKER.md](./DOCKER.md) pour plus de détails.

### Option 2: Installation manuelle

```bash
# Installer les dépendances
pnpm install

# Configurer la base de données PostgreSQL
psql -U postgres -f scripts/setup-database.sql

# Lancer en développement
pnpm dev
```

Voir [INSTALL.md](./INSTALL.md) pour les instructions détaillées.

## Documentation API

Une API REST complète est disponible avec documentation interactive:

- **Documentation interactive**: [/api-docs](/api-docs)
- **Spécification OpenAPI**: [/openapi.json](/openapi.json)
- **Guide détaillé**: Voir [API_README.md](./API_README.md)

### Endpoints principaux

- `GET /api/v1/rides` - Liste des demandes de ramassage
- `POST /api/v1/rides` - Créer une demande
- `GET /api/v1/drivers` - Liste des chauffeurs
- `GET /api/v1/passengers` - Liste des passagers

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `POSTGRES_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@localhost:5432/buspickup` |
| `JWT_SECRET` | Clé secrète pour les tokens JWT | `votre_cle_secrete_32_caracteres` |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'application | `http://localhost:3000` |

## Comptes de test

| Role | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@buspickup.com | Admin2024!Dakar |
| Chauffeur | chauffeur.test@buspickup.com | Chauffeur2024! |
| Passager | passager.test@buspickup.com | Passager2024! |

## Structure du projet

```
├── app/
│   ├── api/v1/          # API REST endpoints
│   ├── api-docs/        # Documentation API
│   ├── auth/            # Pages d'authentification
│   ├── admin/           # Interface d'administration
│   └── actions/         # Server Actions
├── components/          # Composants React
├── lib/                 # Utilitaires et configuration
│   ├── db.ts            # Pool de connexion PostgreSQL
│   └── auth.ts          # Gestion des sessions et authentification
├── scripts/             # Scripts SQL de migration
├── database/            # Schema et seed SQL
└── public/              # Fichiers statiques
```

## Support

Pour toute question ou problème, consultez la documentation API ou contactez l'équipe de développement.
