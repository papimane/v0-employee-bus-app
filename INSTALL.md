# Guide d'Installation - Bus Pickup

Ce guide vous accompagne dans l'installation et la configuration de l'application Bus Pickup.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** v18 ou supérieur ([télécharger](https://nodejs.org/))
- **PostgreSQL** v14 ou supérieur ([télécharger](https://www.postgresql.org/download/))
- **pnpm** (gestionnaire de paquets) : `npm install -g pnpm`

## 1. Cloner le projet

\`\`\`bash
git clone https://github.com/votre-repo/bus-pickup.git
cd bus-pickup
\`\`\`

## 2. Installer les dépendances

\`\`\`bash
pnpm install
\`\`\`

## 3. Configurer la base de données PostgreSQL

### 3.1. Créer la base de données

Connectez-vous à PostgreSQL et créez la base de données :

\`\`\`bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE buspickup;

# Quitter
\q
\`\`\`

### 3.2. Exécuter les scripts de migration

\`\`\`bash
# Créer les tables
psql -U postgres -d buspickup -f database/schema.sql

# Insérer les données de test (optionnel)
psql -U postgres -d buspickup -f database/seed.sql
\`\`\`

## 4. Configurer les variables d'environnement

Copiez le fichier d'exemple et renseignez vos valeurs :

\`\`\`bash
cp .env.example .env.local
\`\`\`

Éditez le fichier `.env.local` :

\`\`\`env
# URL de connexion à PostgreSQL
DATABASE_URL=postgresql://postgres:votre_mot_de_passe@localhost:5432/buspickup

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clé secrète (générez-en une avec: openssl rand -base64 32)
JWT_SECRET=votre_cle_secrete_generee
\`\`\`

## 5. Lancer l'application

### Mode développement

\`\`\`bash
pnpm dev
\`\`\`

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Mode production

\`\`\`bash
# Construire l'application
pnpm build

# Démarrer en production
pnpm start
\`\`\`

## 6. Comptes de test

Si vous avez exécuté le script `seed.sql`, les comptes suivants sont disponibles :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@buspickup.com | Admin2024!Dakar |
| Chauffeur | chauffeur.test@buspickup.com | Chauffeur2024! |
| Passager | passager.test@buspickup.com | Passager2024! |

## Structure du projet

\`\`\`
bus-pickup/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # Routes API REST
│   │   └── v1/           # Version 1 de l'API
│   ├── auth/             # Pages d'authentification
│   ├── admin/            # Interface d'administration
│   └── api-docs/         # Documentation API
├── components/            # Composants React réutilisables
├── database/              # Scripts SQL
│   ├── schema.sql        # Schéma de la base de données
│   ├── seed.sql          # Données de test
│   └── migrations/       # Scripts de migration
├── lib/                   # Utilitaires et configuration
│   ├── db.ts             # Client PostgreSQL et repositories
│   └── auth.ts           # Fonctions d'authentification
├── public/               # Fichiers statiques
└── styles/               # Styles CSS
\`\`\`

## Commandes utiles

\`\`\`bash
# Développement
pnpm dev              # Lancer en mode développement
pnpm build            # Construire pour la production
pnpm start            # Lancer en mode production
pnpm lint             # Vérifier le code

# Base de données
psql -U postgres -d buspickup    # Se connecter à la base
\dt                               # Lister les tables
\d+ nom_table                     # Voir la structure d'une table
\`\`\`

## Déploiement

### Vercel (recommandé)

1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement dans Vercel Dashboard
3. Déployez automatiquement à chaque push

### Docker (alternative)

\`\`\`bash
# Construire l'image
docker build -t bus-pickup .

# Lancer le conteneur
docker run -p 3000:3000 --env-file .env.local bus-pickup
\`\`\`

## Dépannage

### Erreur de connexion à PostgreSQL

Vérifiez que :
- PostgreSQL est en cours d'exécution
- L'URL de connexion est correcte dans `.env.local`
- L'utilisateur a les droits sur la base de données

\`\`\`bash
# Tester la connexion
psql -U postgres -d buspickup -c "SELECT 1"
\`\`\`

### Port 3000 déjà utilisé

\`\`\`bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou lancer sur un autre port
PORT=3001 pnpm dev
\`\`\`

## Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

Bonne utilisation de Bus Pickup !
