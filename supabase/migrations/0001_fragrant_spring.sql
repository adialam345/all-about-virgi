/*
  # Initial Schema Setup for Astrella Archive

  1. New Tables
    - `profiles`
      - Basic information about Astrella
    - `likes`
      - Things Astrella likes or dislikes
    - `tags`
      - Categories and tags for organization
    - `item_tags`
      - Junction table for likes and tags

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated users to contribute
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  nicknames text[] DEFAULT '{}',
  bio text,
  birth_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  description text,
  is_like boolean NOT NULL,
  source text,
  added_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create junction table for likes and tags
CREATE TABLE IF NOT EXISTS item_tags (
  like_id uuid REFERENCES likes(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (like_id, tag_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on profiles"
  ON profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on likes"
  ON likes FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert likes" ON likes;

CREATE POLICY "Allow public to insert likes"
  ON likes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow users to update their own likes"
  ON likes FOR UPDATE
  TO authenticated
  USING (auth.uid() = added_by);

CREATE POLICY "Allow public read access on tags"
  ON tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public read access on item_tags"
  ON item_tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert item_tags"
  ON item_tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert initial profile data
INSERT INTO profiles (full_name, nicknames, bio)
VALUES (
  'Astrella Virgi',
  ARRAY['Astrella', 'Virgi'],
  'Indonesian idol and content creator'
);