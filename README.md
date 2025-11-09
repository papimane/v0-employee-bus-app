# Employee Bus App

Application de gestion des employés et des arrêts de bus utilisant Next.js 16 et PostgreSQL.

## ⚠️ Important : Limitation de l'environnement v0

**Ce projet utilise le driver PostgreSQL natif (`pg`) qui ne fonctionne PAS dans l'environnement de prévisualisation v0.**

L'erreur `module "/build/addon.node" not found` indique que les binaires natifs Node.js requis par le driver `pg` ne sont pas disponibles dans le navigateur.

### Solutions possibles :

1. **Développer en local** (recommandé pour PostgreSQL local)
   - Clonez le repo et suivez les instructions ci-dessous
   - Lancez le projet sur votre machine avec `npm run dev`
   
2. **Utiliser l'intégration Supabase dans v0**
   - Supabase fonctionne parfaitement dans v0
   - Allez dans Connect > Supabase dans la barre latérale
   - Je peux adapter le code pour utiliser Supabase si vous préférez

## Prérequis

- Node.js 18+ installé
- PostgreSQL installé et en cours d'exécution localement
- Une base de données PostgreSQL créée

## Installation

**Note :** Ces instructions sont pour lancer le projet **en local sur votre machine**. Le projet ne peut pas s'exécuter dans l'environnement de prévisualisation v0.

1. Clonez le repository :
\`\`\`bash
git clone <votre-repo-url>
cd employee-bus-app
\`\`\`

2. Installez les dépendances :
\`\`\`bash
npm install
\`\`\`

3. Configurez les variables d'environnement :

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

\`\`\`env
# PostgreSQL Configuration
POSTGRES_URL="postgresql://username:password@localhost:5432/database_name"
POSTGRES_HOST="localhost"
POSTGRES_USER="username"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="database_name"

# Optional: For connection pooling
POSTGRES_URL_NON_POOLING="postgresql://username:password@localhost:5432/database_name"
POSTGRES_PRISMA_URL="postgresql://username:password@localhost:5432/database_name"
\`\`\`

**Important :** Remplacez `username`, `password`, et `database_name` par vos propres valeurs PostgreSQL.

### Exemple de configuration locale

Si vous avez créé une base de données appelée `employee_bus` avec l'utilisateur `postgres` et le mot de passe `postgres`, votre `.env.local` ressemblera à :

\`\`\`env
POSTGRES_URL="postgresql://postgres:postgres@localhost:5432/employee_bus"
POSTGRES_HOST="localhost"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DATABASE="employee_bus"
\`\`\`

## Initialisation de la base de données

Le projet inclut des scripts SQL dans le dossier `/scripts` pour créer et remplir la base de données.

Exécutez les scripts dans l'ordre :

\`\`\`bash
# Connectez-vous à votre base PostgreSQL
psql -U postgres -d employee_bus

# Puis exécutez les scripts
\i scripts/001_create_employees_table.sql
\i scripts/002_seed_initial_data.sql
\`\`\`

Ou en une seule commande :

\`\`\`bash
psql -U postgres -d employee_bus -f scripts/001_create_employees_table.sql
psql -U postgres -d employee_bus -f scripts/002_seed_initial_data.sql
\`\`\`

## Lancement du projet

**Important :** Ces commandes doivent être exécutées sur votre machine locale, pas dans v0.

### Mode développement

\`\`\`bash
npm run dev
\`\`\`

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Mode production

\`\`\`bash
npm run build
npm run start
\`\`\`

## Structure du projet

\`\`\`
employee-bus-app/
├── app/              # Pages et routes Next.js (App Router)
├── components/       # Composants React réutilisables
├── lib/             # Utilitaires et configuration (db.ts pour PostgreSQL)
├── scripts/         # Scripts SQL pour la base de données
└── hooks/           # React hooks personnalisés
\`\`\`

## Technologies utilisées

- **Next.js 16** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **PostgreSQL** - Base de données
- **pg** - Driver PostgreSQL pour Node.js
- **Tailwind CSS 4** - Framework CSS
- **shadcn/ui** - Composants UI
- **TypeScript** - Typage statique

## Dépannage

### Erreur de connexion PostgreSQL

Si vous obtenez une erreur de connexion, vérifiez que :
- PostgreSQL est bien démarré : `pg_ctl status` ou `sudo service postgresql status`
- Les credentials dans `.env.local` sont corrects
- La base de données existe : `psql -U postgres -l`

### Erreur "module /build/addon.node not found" dans v0

Cette erreur est normale dans l'environnement v0. Pour utiliser ce projet :
- Clonez le repo sur votre machine locale
- Suivez les instructions d'installation ci-dessus
- Lancez `npm run dev` en local

Alternativement, utilisez l'intégration Supabase disponible dans v0.

### Créer une nouvelle base de données

\`\`\`bash
psql -U postgres
CREATE DATABASE employee_bus;
\q
\`\`\`

## Support

Pour toute question ou problème, ouvrez une issue sur le repository.
