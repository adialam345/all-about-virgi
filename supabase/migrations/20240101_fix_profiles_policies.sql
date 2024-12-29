-- Drop existing policies if any
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable delete for users based on id"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- Ensure admin user exists and has correct permissions
DO $$ 
BEGIN
  -- Update admin user if exists, otherwise insert
  INSERT INTO profiles (id, email, role)
  VALUES (
    'ad0ed6e2-2c44-4c8f-a515-a413c0b9d0de',
    'admin@astrella.com',
    'admin'
  )
  ON CONFLICT (id) 
  DO UPDATE SET role = 'admin';
END $$; 