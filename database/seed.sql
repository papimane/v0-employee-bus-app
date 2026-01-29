-- =====================================================
-- BUS PICKUP - DONNEES DE TEST
-- =====================================================
-- Ce script insère des données de test dans la base de données
-- Exécuter avec: psql -U postgres -d buspickup -f seed.sql

-- =====================================================
-- UTILISATEUR ADMIN
-- Mot de passe: Admin2024!Dakar (hashé avec bcrypt)
-- =====================================================
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, email_verified)
VALUES (
    uuid_generate_v4(),
    'admin@buspickup.com',
    '$2b$10$rOzJqZvZcEGNQTfM8Kz5d.QVX8vKj5xEJlqLK1OZa5TBNJGPsZRGy', -- Admin2024!Dakar
    'Admin',
    'BusPickup',
    '+221770000000',
    'admin',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- UTILISATEUR CHAUFFEUR TEST
-- Mot de passe: Chauffeur2024! (hashé avec bcrypt)
-- =====================================================
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, email_verified)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    'chauffeur.test@buspickup.com',
    '$2b$10$XzLvVQrPYsKL5NqMtBHMXeVrqW8JN3QfL1PvKsO5DZhL7rOeM3Kmy', -- Chauffeur2024!
    'Moussa',
    'Diallo',
    '+221771234567',
    'driver',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Créer le chauffeur associé
INSERT INTO drivers (id, user_id, first_name, last_name, email, phone, license_number, is_active, is_account_activated)
VALUES (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    'Moussa',
    'Diallo',
    'chauffeur.test@buspickup.com',
    '+221771234567',
    'SN-2024-12345',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- UTILISATEUR PASSAGER TEST
-- Mot de passe: Passager2024! (hashé avec bcrypt)
-- =====================================================
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, email_verified)
VALUES (
    'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
    'passager.test@buspickup.com',
    '$2b$10$HvLdVQrPYsKL5NqMtBHMXeVrqW8JN3QfL1PvKsO5DZhL7rOeM3Xyz', -- Passager2024!
    'Fatou',
    'Ndiaye',
    '+221779876543',
    'passenger',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- BUS DE TEST
-- =====================================================
INSERT INTO buses (id, brand, model, plate_number, capacity, driver_id, is_active)
VALUES (
    uuid_generate_v4(),
    'Mercedes-Benz',
    'Sprinter 516',
    'DK-1234-AA',
    20,
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    true
) ON CONFLICT (plate_number) DO NOTHING;

INSERT INTO buses (id, brand, model, plate_number, capacity, is_active)
VALUES (
    uuid_generate_v4(),
    'Toyota',
    'Coaster',
    'DK-5678-BB',
    25,
    true
) ON CONFLICT (plate_number) DO NOTHING;

-- =====================================================
-- ZONE DE GEOFENCING - PORT DE DAKAR
-- =====================================================
INSERT INTO geofence_zones (id, name, description, polygon_coordinates, is_active)
VALUES (
    uuid_generate_v4(),
    'Port de Dakar',
    'Zone de ramassage autorisée - Port Autonome de Dakar',
    '[
        [14.6850, -17.4380],
        [14.6850, -17.4250],
        [14.6920, -17.4200],
        [14.6980, -17.4180],
        [14.7050, -17.4200],
        [14.7100, -17.4280],
        [14.7080, -17.4380],
        [14.7000, -17.4420],
        [14.6920, -17.4420],
        [14.6850, -17.4380]
    ]'::jsonb,
    true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- MESSAGE DE FIN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Données de test insérées avec succès!';
    RAISE NOTICE '';
    RAISE NOTICE 'Comptes de test créés:';
    RAISE NOTICE '  Admin: admin@buspickup.com / Admin2024!Dakar';
    RAISE NOTICE '  Chauffeur: chauffeur.test@buspickup.com / Chauffeur2024!';
    RAISE NOTICE '  Passager: passager.test@buspickup.com / Passager2024!';
END $$;
