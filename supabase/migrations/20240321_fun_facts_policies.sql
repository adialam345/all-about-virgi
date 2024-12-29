-- Add update and delete policies for fun_facts table
CREATE POLICY "Allow authenticated users to update fun_facts"
  ON fun_facts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete fun_facts"
  ON fun_facts FOR DELETE
  TO authenticated
  USING (true); 