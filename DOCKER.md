# Guide Docker - BusPickup

Ce guide explique comment exécuter l'application BusPickup avec Docker.

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)

## Démarrage rapide

### 1. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet :

\`\`\`bash
cp .env.example .env
\`\`\`

Modifiez les valeurs selon vos besoins :

\`\`\`env
# Base de données PostgreSQL
POSTGRES_URL=postgresql://buspickup:buspickup123@postgres:5432/buspickup
POSTGRES_USER=buspickup
POSTGRES_PASSWORD=buspickup123
POSTGRES_DB=buspickup

# Application
JWT_SECRET=votre_secret_jwt_super_securise_minimum_32_caracteres
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (optionnel)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=votre_email
SMTP_PASSWORD=votre_mot_de_passe
SMTP_FROM=noreply@buspickup.com

# pgAdmin (optionnel)
PGADMIN_EMAIL=admin@buspickup.com
PGADMIN_PASSWORD=admin
\`\`\`

### 2. Lancer l'application

**Mode Production (complet) :**

\`\`\`bash
# Construire et démarrer tous les services
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
\`\`\`

**Avec pgAdmin (interface d'administration BDD) :**

\`\`\`bash
docker-compose --profile admin up -d --build
\`\`\`

L'application sera accessible sur :
- **Application** : http://localhost:3000
- **pgAdmin** : http://localhost:5050 (si activé)

### 3. Mode Développement

Pour le développement, utilisez uniquement PostgreSQL en Docker, et lancez l'application en local :

\`\`\`bash
# Démarrer PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# Dans un autre terminal, lancer l'application Next.js
pnpm install
pnpm dev
\`\`\`

## Commandes utiles

### Gestion des conteneurs

\`\`\`bash
# Voir l'état des conteneurs
docker-compose ps

# Redémarrer un service spécifique
docker-compose restart app

# Voir les logs d'un service
docker-compose logs -f app
docker-compose logs -f postgres

# Accéder au shell d'un conteneur
docker-compose exec app sh
docker-compose exec postgres psql -U buspickup -d buspickup
\`\`\`

### Base de données

\`\`\`bash
# Sauvegarder la base de données
docker-compose exec postgres pg_dump -U buspickup buspickup > backup.sql

# Restaurer la base de données
docker-compose exec -T postgres psql -U buspickup buspickup < backup.sql

# Réinitialiser la base de données (supprime toutes les données)
docker-compose down -v
docker-compose up -d
\`\`\`

### Nettoyage

\`\`\`bash
# Arrêter et supprimer les conteneurs
docker-compose down

# Supprimer aussi les volumes (données)
docker-compose down -v

# Supprimer les images non utilisées
docker system prune -a
\`\`\`

## Architecture Docker

\`\`\`
+-----------------------------------------------------------+
|                    Docker Network                          |
|                  (buspickup-network)                       |
|                                                            |
|  +-------------+    +-------------+    +-------------+     |
|  |             |    |             |    |             |     |
|  |  Next.js    |--->|  PostgreSQL |<---|  pgAdmin    |     |
|  |  App        |    |  Database   |    |  (optional) |     |
|  |             |    |             |    |             |     |
|  |  Port 3000  |    |  Port 5432  |    |  Port 5050  |     |
|  +-------------+    +-------------+    +-------------+     |
|                                                            |
+-----------------------------------------------------------+
\`\`\`

## Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `POSTGRES_URL` | URL de connexion PostgreSQL | - |
| `POSTGRES_USER` | Utilisateur PostgreSQL | `buspickup` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `buspickup_password` |
| `POSTGRES_DB` | Nom de la base de données | `buspickup` |
| `JWT_SECRET` | Clé secrète pour les tokens JWT | - |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'application | `http://localhost:3000` |
| `SMTP_HOST` | Serveur SMTP pour les emails | - |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_USER` | Utilisateur SMTP | - |
| `SMTP_PASSWORD` | Mot de passe SMTP | - |
| `SMTP_FROM` | Adresse email d'envoi | `noreply@buspickup.com` |
| `PGADMIN_EMAIL` | Email admin pgAdmin | `admin@buspickup.com` |
| `PGADMIN_PASSWORD` | Mot de passe pgAdmin | `admin` |

## Comptes de test

Après le premier démarrage, les comptes suivants sont disponibles :

| Role | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@buspickup.com | Admin2024!Dakar |
| Chauffeur | chauffeur.test@buspickup.com | Chauffeur2024! |
| Passager | passager.test@buspickup.com | Passager2024! |

## Dépannage

### L'application ne démarre pas

1. Vérifiez que PostgreSQL est prêt :
\`\`\`bash
docker-compose logs postgres
\`\`\`

2. Vérifiez les logs de l'application :
\`\`\`bash
docker-compose logs app
\`\`\`

### Erreur de connexion à la base de données

1. Assurez-vous que le conteneur PostgreSQL est en cours d'exécution :
\`\`\`bash
docker-compose ps
\`\`\`

2. Vérifiez la connectivité :
\`\`\`bash
docker-compose exec app ping postgres
\`\`\`

### Réinitialiser complètement

\`\`\`bash
docker-compose down -v --rmi all
docker-compose up -d --build
\`\`\`

## Production

Pour un déploiement en production, pensez à :

1. **Utiliser des secrets Docker** au lieu de variables d'environnement en clair
2. **Configurer un reverse proxy** (nginx, Traefik) pour HTTPS
3. **Mettre en place des sauvegardes automatiques** de la base de données
4. **Monitorer les conteneurs** avec des outils comme Prometheus/Grafana
5. **Limiter les ressources** des conteneurs (CPU, mémoire)
