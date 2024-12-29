-- Make sure profiles table has role column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Update existing admin users if needed
-- Replace 'your-admin-email@example.com' with actual admin email
UPDATE profiles 
SET role = 'admin' 
WHERE id IN (
    SELECT id 
    FROM auth.users 
    WHERE email = 'your-admin-email@example.com'
); 