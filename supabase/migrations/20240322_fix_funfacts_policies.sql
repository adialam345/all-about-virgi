-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for everyone" ON fun_facts;
DROP POLICY IF EXISTS "Enable insert for everyone" ON fun_facts;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON fun_facts;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON fun_facts;

-- Create new policies
CREATE POLICY "Enable read access for everyone"
  ON fun_facts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for everyone"
  ON fun_facts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON fun_facts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users"
  ON fun_facts FOR DELETE
  TO authenticated
  USING (true);

-- Make sure RLS is enabled
ALTER TABLE fun_facts ENABLE ROW LEVEL SECURITY; 