-- Apaga a estrutura antiga para garantir um recomeço limpo
DROP VIEW IF EXISTS public.v_campaigns;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.donor_applications;
DROP TABLE IF EXISTS public.campaigns;
DROP TABLE IF EXISTS public.stock_levels;
DROP TABLE IF EXISTS public.professional_profiles;
DROP TABLE IF EXISTS public.donor_profiles;
DROP TABLE IF EXISTS public.user_profiles;
DROP TABLE IF EXISTS public.hemocenters;
DROP TYPE IF EXISTS public.application_status_enum;
DROP TYPE IF EXISTS public.stock_status_enum;
DROP TYPE IF EXISTS public.user_role_enum;
DROP TYPE IF EXISTS public.blood_type_enum;

-- 1. CRIAÇÃO DOS TIPOS (ENUMS)
CREATE TYPE public.blood_type_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE public.user_role_enum AS ENUM ('donor', 'professional', 'admin');
CREATE TYPE public.stock_status_enum AS ENUM ('critical', 'low', 'stable', 'high', 'unknown');
CREATE TYPE public.application_status_enum AS ENUM ('pending', 'accepted', 'rejected', 'completed');

-- 2. CRIAÇÃO DAS TABELAS (ORDEM CORRETA)

-- Tabela de Hemocentros
CREATE TABLE public.hemocenters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    operating_hours VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Perfis de Usuário (base)
CREATE TABLE public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    role public.user_role_enum NOT NULL,
    phone VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Perfis de Doadores (extensão)
CREATE TABLE public.donor_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    blood_type public.blood_type_enum,
    postal_code VARCHAR(20),
    last_donation_date DATE
);

-- Tabela de Perfis Profissionais (extensão)
CREATE TABLE public.professional_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    hemocenter_id UUID REFERENCES public.hemocenters(id) ON DELETE SET NULL,
    position VARCHAR(100)
);

-- Tabela de Níveis de Estoque
CREATE TABLE public.stock_levels (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    blood_type public.blood_type_enum NOT NULL,
    level_percentage INT NOT NULL CHECK (level_percentage >= 0 AND level_percentage <= 100),
    status public.stock_status_enum NOT NULL,
    last_updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(hemocenter_id, blood_type)
);

-- Tabela de Campanhas
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_blood_type VARCHAR(10) DEFAULT 'ALL',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Candidaturas de Doadores
CREATE TABLE public.donor_applications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    donor_user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    application_date TIMESTAMPTZ DEFAULT now(),
    status public.application_status_enum DEFAULT 'pending',
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMPTZ
);

-- 3. CRIAÇÃO DA VIEW PARA CAMPANHAS
CREATE OR REPLACE VIEW public.v_campaigns AS
SELECT
    *,
    (now()::date >= start_date AND now()::date <= end_date) AS is_active
FROM
    public.campaigns;

-- 4. FUNÇÃO E TRIGGER PARA CRIAR PERFIS AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Cria o perfil base
    INSERT INTO public.user_profiles (user_id, name, role, phone)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'name',
        (new.raw_user_meta_data->>'role')::public.user_role_enum,
        new.raw_user_meta_data->>'phone'
    );

    -- Se for doador, cria o perfil de doador
    IF (new.raw_user_meta_data->>'role') = 'donor' THEN
        INSERT INTO public.donor_profiles (user_id, blood_type, postal_code)
        VALUES (
            new.id,
            (new.raw_user_meta_data->>'blood_type')::public.blood_type_enum,
            new.raw_user_meta_data->>'postal_code'
        );
    END IF;

    -- Se for profissional, cria o perfil profissional (ainda sem hemocentro)
    IF (new.raw_user_meta_data->>'role') = 'professional' THEN
        INSERT INTO public.professional_profiles (user_id)
        VALUES (new.id);
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cria o trigger que chama a função
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE public.hemocenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_applications ENABLE ROW LEVEL SECURITY;

-- Políticas: Todos podem ver hemocentros e estoques ativos
CREATE POLICY "Allow public read access to active hemocenters and stocks" ON public.hemocenters FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to stock levels" ON public.stock_levels FOR SELECT USING (true);
CREATE POLICY "Allow public read access to active campaigns" ON public.v_campaigns FOR SELECT USING (is_active = true);

-- Políticas: Usuários podem ver e gerenciar seus próprios perfis
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Donors can manage their own donor profile" ON public.donor_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Professionals can manage their own professional profile" ON public.professional_profiles FOR ALL USING (auth.uid() = user_id);

-- Políticas: Profissionais podem gerenciar dados do seu hemocentro
CREATE POLICY "Professionals can manage their hemocenter's campaigns" ON public.campaigns FOR ALL
    USING (hemocenter_id IN (SELECT hemocenter_id FROM public.professional_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Professionals can manage their hemocenter's stock" ON public.stock_levels FOR ALL
    USING (hemocenter_id IN (SELECT hemocenter_id FROM public.professional_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Professionals can manage their hemocenter's applications" ON public.donor_applications FOR ALL
    USING (hemocenter_id IN (SELECT hemocenter_id FROM public.professional_profiles WHERE user_id = auth.uid()));

-- Políticas: Doadores podem criar e ver suas próprias candidaturas
CREATE POLICY "Donors can create applications" ON public.donor_applications FOR INSERT WITH CHECK (auth.uid() = donor_user_id);
CREATE POLICY "Donors can view their own applications" ON public.donor_applications FOR SELECT USING (auth.uid() = donor_user_id);

-- 6. INSERÇÃO DE DADOS DE EXEMPLO
-- Insere um hemocentro de exemplo
INSERT INTO public.hemocenters (name, address, is_active)
VALUES ('Hemocentro Central', 'Rua Principal, 123', true)
ON CONFLICT DO NOTHING;

-- Insere níveis de estoque iniciais para o hemocentro de exemplo
DO $$
DECLARE
    hemocenter_id_var UUID;
    blood_types public.blood_type_enum[] := ARRAY['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    bt public.blood_type_enum;
BEGIN
    SELECT id INTO hemocenter_id_var FROM public.hemocenters WHERE name = 'Hemocentro Central';
    
    FOREACH bt IN ARRAY blood_types
    LOOP
        INSERT INTO public.stock_levels (hemocenter_id, blood_type, level_percentage, status)
        VALUES (hemocenter_id_var, bt, floor(random() * 100 + 1)::int, 'stable')
        ON CONFLICT (hemocenter_id, blood_type) DO NOTHING;
    END LOOP;
END $$;
