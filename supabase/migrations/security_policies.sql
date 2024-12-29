-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Allow public read access for both tables
CREATE POLICY "Allow public read access on tags"
  ON tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on likes"
  ON likes FOR SELECT
  TO public
  USING (true);

-- Allow public insert for both tables
CREATE POLICY "Allow public insert on tags"
  ON tags FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert on likes"
  ON likes FOR INSERT
  TO public
  WITH CHECK (true);

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow users to update their own tags" ON tags;
DROP POLICY IF EXISTS "Allow users to delete their own tags" ON tags;
DROP POLICY IF EXISTS "Allow users to update their own likes" ON likes;
DROP POLICY IF EXISTS "Allow users to delete their own likes" ON likes; 