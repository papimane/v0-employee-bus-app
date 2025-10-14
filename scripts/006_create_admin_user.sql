-- Créer un utilisateur admin avec l'email smane@iokub.com
-- Mot de passe: Admin2024!Dakar

-- Insérer l'utilisateur dans auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'smane@iokub.com',
  crypt('Admin2024!Dakar', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated'
);

-- Créer le profil admin correspondant
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  phone,
  role,
  created_at,
  updated_at
)
SELECT 
  id,
  'smane@iokub.com',
  'Admin',
  'Système',
  '+221 00 000 00 00',
  'admin',
  now(),
  now()
FROM auth.users
WHERE email = 'smane@iokub.com';
