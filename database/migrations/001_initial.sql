-- =====================================================
-- MIGRATION 001: Schema Initial
-- =====================================================
-- Date: 2024
-- Description: Création du schema initial de la base de données

BEGIN;

-- Vérifier si la migration a déjà été appliquée
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vérifier si cette migration existe déjà
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM migrations WHERE name = '001_initial') THEN
        RAISE NOTICE 'Migration 001_initial déjà appliquée, ignorée.';
    ELSE
        -- Appliquer la migration
        RAISE NOTICE 'Application de la migration 001_initial...';
        
        -- Extension pour UUID
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        
        -- Enregistrer la migration
        INSERT INTO migrations (name) VALUES ('001_initial');
        
        RAISE NOTICE 'Migration 001_initial appliquée avec succès.';
    END IF;
END $$;

COMMIT;
