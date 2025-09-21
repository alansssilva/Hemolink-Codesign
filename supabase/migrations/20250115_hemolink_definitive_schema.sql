/*
# Hemolink SaaS - Schema Definitivo
Este script cria a estrutura completa e corrigida do banco de dados, resolvendo erros de migração anteriores.
- Corrige a ordem de criação das tabelas e funções.
- Corrige a aplicação de RLS na tabela 'campaigns' em vez da 'v_campaigns'.
- Garante que o banco de dados seja criado corretamente do zero.
*/

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TYPES
CREATE TYPE public.user_role AS ENUM ('donor', 'professional', 'admin');
CREATE TYPE public.blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE public.stock_status AS ENUM ('critical', 'low', 'stable', 'high', 'unknown');
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'canceled');

-- 3. TABLES
CREATE TABLE public.hemocenters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    operating_hours TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role user_role NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.donor_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    blood_type blood_type,
    postal_code TEXT,
    last_donation_date DATE
);

CREATE TABLE public.professional_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    hemocenter_id UUID REFERENCES public.hemocenters(id) ON DELETE SET NULL,
    position TEXT
);

CREATE TABLE public.stock_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    blood_type blood_type NOT NULL,
    level_percentage INT NOT NULL CHECK (level_percentage >= 0 AND level_percentage <= 100),
    status stock_status NOT NULL,
    last_updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(hemocenter_id, blood_type)
);

CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_blood_type TEXT DEFAULT 'ALL',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.donor_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_user_id UUID NOT NULL REFERENCES public.donor_profiles(user_id) ON DELETE CASCADE,
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    application_date TIMESTAMPTZ DEFAULT now(),
    status application_status DEFAULT 'pending',
    processed_by UUID REFERENCES public.professional_profiles(user_id),
    processed_at TIMESTAMPTZ
);

-- 4. VIEWS
CREATE OR REPLACE VIEW public.v_campaigns AS
SELECT
    *,
    (now()::date >= start_date AND now()::date <= end_date) AS is_active
FROM
    public.campaigns;

-- 5. FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a user_profile
    INSERT INTO public.user_profiles (user_id, name, role, phone)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'name',
        (new.raw_user_meta_data->>'role')::public.user_role,
        new.raw_user_meta_data->>'phone'
    );

    -- Create a role-specific profile
    IF (new.raw_user_meta_data->>'role')::public.user_role = 'donor' THEN
        INSERT INTO public.donor_profiles (user_id, blood_type, postal_code)
        VALUES (
            new.id,
            (new.raw_user_meta_data->>'blood_type')::public.blood_type,
            new.raw_user_meta_data->>'postal_code'
        );
    ELSIF (new.raw_user_meta_data->>'role')::public.user_role = 'professional' THEN
        INSERT INTO public.professional_profiles (user_id)
        VALUES (new.id);
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hemocenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY; -- Corrected: Applied to the base table
ALTER TABLE public.donor_applications ENABLE ROW LEVEL SECURITY;

-- 7. POLICIES
-- user_profiles
CREATE POLICY "Allow users to see their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- donor_profiles
CREATE POLICY "Allow donors to see their own profile" ON public.donor_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow donors to update their own profile" ON public.donor_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow professionals to see donor profiles of applicants" ON public.donor_profiles FOR SELECT USING (
    (get_user_role(auth.uid()) = 'professional') AND
    EXISTS (
        SELECT 1 FROM donor_applications da
        JOIN professional_profiles pp ON da.hemocenter_id = pp.hemocenter_id
        WHERE pp.user_id = auth.uid() AND da.donor_user_id = public.donor_profiles.user_id
    )
);

-- professional_profiles
CREATE POLICY "Allow professionals to see their own profile" ON public.professional_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow professionals to update their own profile" ON public.professional_profiles FOR UPDATE USING (auth.uid() = user_id);

-- hemocenters, stock_levels, campaigns
CREATE POLICY "Allow public read access" ON public.hemocenters FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.stock_levels FOR SELECT USING (true);
CREATE POLICY "Allow public read access on campaigns" ON public.campaigns FOR SELECT USING (true); -- Corrected: Applied to the base table

-- Allow professionals to manage their own hemocenter's data
CREATE POLICY "Allow professionals to update their hemocenter stock" ON public.stock_levels FOR ALL USING (
    (get_user_role(auth.uid()) = 'professional') AND
    hemocenter_id = (SELECT hemocenter_id FROM professional_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Allow professionals to manage their hemocenter campaigns" ON public.campaigns FOR ALL USING (
    (get_user_role(auth.uid()) = 'professional') AND
    hemocenter_id = (SELECT hemocenter_id FROM professional_profiles WHERE user_id = auth.uid())
); -- Corrected: Applied to the base table

-- donor_applications
CREATE POLICY "Allow donors to manage their own applications" ON public.donor_applications FOR ALL USING (auth.uid() = donor_user_id);
CREATE POLICY "Allow professionals to see applications for their hemocenter" ON public.donor_applications FOR SELECT USING (
    (get_user_role(auth.uid()) = 'professional') AND
    hemocenter_id = (SELECT hemocenter_id FROM professional_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Allow professionals to update applications for their hemocenter" ON public.donor_applications FOR UPDATE USING (
    (get_user_role(auth.uid()) = 'professional') AND
    hemocenter_id = (SELECT hemocenter_id FROM professional_profiles WHERE user_id = auth.uid())
);

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id_input UUID)
RETURNS user_role AS $$
DECLARE
    role_val user_role;
BEGIN
    SELECT role INTO role_val FROM public.user_profiles WHERE user_id = user_id_input;
    RETURN role_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. SAMPLE DATA
-- Insert a sample hemocenter
INSERT INTO public.hemocenters (id, name, address, is_active)
VALUES ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Hemocentro Vida', 'Rua da Esperança, 123', true)
ON CONFLICT (id) DO NOTHING;

-- Insert stock levels for the sample hemocenter
INSERT INTO public.stock_levels (hemocenter_id, blood_type, level_percentage, status)
VALUES
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'A+', 75, 'stable'),
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'A-', 40, 'low'),
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'B+', 85, 'high'),
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'B-', 20, 'critical'),
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'AB+', 60, 'stable'),
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'AB-', 15, 'critical'),
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'O+', 50, 'stable'),
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'O-', 30, 'low')
ON CONFLICT (hemocenter_id, blood_type) DO UPDATE SET
level_percentage = EXCLUDED.level_percentage,
status = EXCLUDED.status;
