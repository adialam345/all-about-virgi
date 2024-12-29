-- Reset everything first (BE CAREFUL WITH THIS IN PRODUCTION)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user_role type
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read-only access" ON public.profiles
    FOR SELECT USING (true);

-- Create admin user
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
)
SELECT
    'ad0ed6e2-2c44-4c8f-a515-a413c0b9d0de',
    'admin@astrella.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@astrella.com'
);

-- Create admin profile
INSERT INTO public.profiles (id, email, role)
SELECT
    'ad0ed6e2-2c44-4c8f-a515-a413c0b9d0de',
    'admin@astrella.com',
    'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE email = 'admin@astrella.com'
);

-- Create likes table
CREATE TABLE public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name TEXT NOT NULL,
    description TEXT,
    is_like BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tags table
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create junction table for likes and tags
CREATE TABLE public.item_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    like_id UUID REFERENCES public.likes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(like_id, tag_id)
);

-- Enable RLS on all tables
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for likes table
CREATE POLICY "Enable read access for all users" ON public.likes
    FOR SELECT USING (true);

CREATE POLICY "Enable write access for admin" ON public.likes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create policies for tags table
CREATE POLICY "Enable read access for all users" ON public.tags
    FOR SELECT USING (true);

CREATE POLICY "Enable write access for admin" ON public.tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create policies for item_tags table
CREATE POLICY "Enable read access for all users" ON public.item_tags
    FOR SELECT USING (true);

CREATE POLICY "Enable write access for admin" ON public.item_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers for all tables
CREATE TRIGGER handle_likes_updated_at
    BEFORE UPDATE ON public.likes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_tags_updated_at
    BEFORE UPDATE ON public.tags
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX likes_item_name_idx ON public.likes (item_name);
CREATE INDEX tags_name_idx ON public.tags (name);
CREATE INDEX item_tags_like_id_idx ON public.item_tags (like_id);
CREATE INDEX item_tags_tag_id_idx ON public.item_tags (tag_id); 