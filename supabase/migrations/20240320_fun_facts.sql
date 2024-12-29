-- Create fun_facts table
CREATE TABLE IF NOT EXISTS fun_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE fun_facts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on fun_facts"
  ON fun_facts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public to insert fun_facts"
  ON fun_facts FOR INSERT
  TO public
  WITH CHECK (true); 