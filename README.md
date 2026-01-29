# Employee Bus App

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/souleymanes-projects-77fd2120/v0-employee-bus-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/mXxLJ1DBMiB)

## Overview

Application de ramassage par bus d'entreprise avec gestion des demandes de transport, suivi en temps réel et interface d'administration complète.

### Fonctionnalités principales

- **Interface Passager**: Demande de ramassage avec géolocalisation
- **Interface Chauffeur**: Gestion des demandes et navigation
- **Interface Admin**: Gestion des chauffeurs, bus et passagers
- **API REST**: Endpoints documentés avec OpenAPI/Swagger
- **Authentification**: Système sécurisé avec Supabase Auth
- **Carte interactive**: Affichage des itinéraires avec OpenStreetMap

## Documentation API

Une API REST complète est disponible avec documentation interactive:

- **Documentation interactive**: [/api-docs](https://buspickup.vercel.app/api-docs)
- **Spécification OpenAPI**: [/openapi.json](https://buspickup.vercel.app/openapi.json)
- **Guide détaillé**: Voir [API_README.md](./API_README.md)

### Endpoints principaux

- `GET /api/v1/rides` - Liste des demandes de ramassage
- `POST /api/v1/rides` - Créer une demande
- `GET /api/v1/drivers` - Liste des chauffeurs
- `GET /api/v1/passengers` - Liste des passagers

## Technologies

- **Framework**: Next.js 15 avec App Router
- **Base de données**: PostgreSQL
- **Authentification**: Custom Auth avec JWT
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

# Configurer la base de données
psql -U postgres -f database/schema.sql
psql -U postgres -f database/seed.sql

# Lancer en développement
pnpm dev
```

Voir [INSTALL.md](./INSTALL.md) pour les instructions détaillées.

## Deployment

Your project is live at:

**[https://vercel.com/souleymanes-projects-77fd2120/v0-employee-bus-app](https://vercel.com/souleymanes-projects-77fd2120/v0-employee-bus-app)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/mXxLJ1DBMiB](https://v0.app/chat/projects/mXxLJ1DBMiB)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Structure du projet

\`\`\`
├── app/
│   ├── api/v1/          # API REST endpoints
│   ├── api-docs/        # Documentation Swagger UI
│   ├── auth/            # Pages d'authentification
│   ├── admin/           # Interface d'administration
│   └── actions/         # Server Actions
├── components/          # Composants React
├── lib/                 # Utilitaires et configuration
├── scripts/             # Scripts SQL de migration
└── public/              # Fichiers statiques
\`\`\`

## Variables d'environnement

Les variables suivantes sont configurées automatiquement via l'intégration Supabase:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Support

Pour toute question ou problème, consultez la documentation API ou contactez l'équipe de développement.
