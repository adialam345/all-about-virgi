-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on tags"
  ON tags FOR SELECT
  TO public
  USING (true);

-- Allow public insert
CREATE POLICY "Allow public to insert tags"
  ON tags FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users to update their own tags
CREATE POLICY "Allow users to update their own tags"
  ON tags FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Allow authenticated users to delete their own tags
CREATE POLICY "Allow users to delete their own tags"
  ON tags FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by); 