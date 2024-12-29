-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name text NOT NULL,
  description text,
  is_like boolean NOT NULL DEFAULT true,
  added_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create junction table for likes and tags
CREATE TABLE IF NOT EXISTS item_tags (
  like_id uuid REFERENCES likes(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (like_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;

-- Create security policies
-- Profiles policies
CREATE POLICY "Allow public read access on profiles"
  ON profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow users to update own profile"
  ON profiles FOR UPDATE
  TO public
  USING (auth.uid() = id);

-- Likes policies
CREATE POLICY "Allow public read access on likes"
  ON likes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on likes"
  ON likes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow users to update own likes"
  ON likes FOR UPDATE
  TO public
  USING (auth.uid() = added_by);

CREATE POLICY "Allow users to delete own likes"
  ON likes FOR DELETE
  TO public
  USING (auth.uid() = added_by);

-- Tags policies
CREATE POLICY "Allow public read access on tags"
  ON tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on tags"
  ON tags FOR INSERT
  TO public
  WITH CHECK (true);

-- Item tags policies
CREATE POLICY "Allow public read access on item_tags"
  ON item_tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on item_tags"
  ON item_tags FOR INSERT
  TO public
  WITH CHECK (true);

-- Create functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_likes_updated_at
  BEFORE UPDATE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS likes_item_name_idx ON likes(item_name);
CREATE INDEX IF NOT EXISTS likes_is_like_idx ON likes(is_like);
CREATE INDEX IF NOT EXISTS tags_name_idx ON tags(name);
CREATE INDEX IF NOT EXISTS item_tags_like_id_idx ON item_tags(like_id);
CREATE INDEX IF NOT EXISTS item_tags_tag_id_idx ON item_tags(tag_id); 