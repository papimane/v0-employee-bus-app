-- Mettre à jour le rôle de l'utilisateur smane@iokub.com en admin
-- Ce script trouve l'utilisateur par email et met à jour son rôle dans la table profiles

UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'smane@iokub.com'
);

-- Vérifier que la mise à jour a fonctionné
SELECT 
  u.email,
  p.role,
  p.first_name,
  p.last_name
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'smane@iokub.com';
