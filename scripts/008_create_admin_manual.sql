-- Script pour mettre à jour un utilisateur existant en admin
-- Remplacez 'smane@iokub.com' par l'email de l'utilisateur à promouvoir

update public.profiles
set role = 'admin'
where email = 'smane@iokub.com';
