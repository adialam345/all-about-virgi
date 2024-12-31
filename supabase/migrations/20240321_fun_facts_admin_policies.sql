-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to update fun_facts" ON fun_facts;
DROP POLICY IF EXISTS "Allow authenticated users to delete fun_facts" ON fun_facts;

-- Add admin-only update policy
CREATE POLICY "Allow admin to update fun_facts"
  ON fun_facts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Add admin-only delete policy
CREATE POLICY "Allow admin to delete fun_facts"
  ON fun_facts FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  ); 