-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'fun_facts';

-- Enable RLS if not enabled
ALTER TABLE fun_facts ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for everyone" ON fun_facts;
DROP POLICY IF EXISTS "Enable insert for everyone" ON fun_facts;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON fun_facts;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON fun_facts;
DROP POLICY IF EXISTS "Allow public read access on fun_facts" ON fun_facts;
DROP POLICY IF EXISTS "Allow public to insert fun_facts" ON fun_facts;
DROP POLICY IF EXISTS "Allow authenticated users to update fun_facts" ON fun_facts;
DROP POLICY IF EXISTS "Allow authenticated users to delete fun_facts" ON fun_facts;

-- Create simple, permissive policies
CREATE POLICY "public_select" 
    ON fun_facts FOR SELECT 
    TO public 
    USING (true);

CREATE POLICY "public_insert" 
    ON fun_facts FOR INSERT 
    TO public 
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON fun_facts TO authenticated;
GRANT ALL ON fun_facts TO anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated; 