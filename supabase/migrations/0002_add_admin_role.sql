-- Create role enum type
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Add role column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Create admin user in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'ad0ed6e2-2c44-4c8f-a515-a413c0b9d0de',
  'authenticated',
  'authenticated',
  'admin@astrella.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Add admin user to profiles with admin role
INSERT INTO profiles (
  id,
  full_name,
  role
) VALUES (
  'ad0ed6e2-2c44-4c8f-a515-a413c0b9d0de',
  'Admin',
  'admin'
);

-- Create admin policies
CREATE POLICY "Allow admin full access on likes"
ON likes FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
