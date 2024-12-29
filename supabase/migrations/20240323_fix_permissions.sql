-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Allow users to read all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

-- Tags policies
CREATE POLICY "Allow users to read all tags"
    ON tags FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow admin to delete tags"
    ON tags FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow admin to insert tags"
    ON tags FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow admin to update tags"
    ON tags FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    ); 