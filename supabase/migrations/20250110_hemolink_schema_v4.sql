-- #############################################################################
-- # Hemolink SaaS - Schema V4
-- # Corrige o erro "v_campaigns is not a table" aplicando RLS na tabela base.
-- #############################################################################

-- 1. Limpeza do Schema (se necessário, para um ambiente de desenvolvimento limpo)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- 2. Enum para tipos de usuário e status
CREATE TYPE user_role AS ENUM ('donor', 'professional', 'admin');
CREATE TYPE stock_status AS ENUM ('critical', 'low', 'stable', 'high');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');

-- 3. Tabela de Perfis de Usuário (Central)
CREATE TABLE public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role user_role NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.user_profiles IS 'Tabela central de perfis, ligada à autenticação do Supabase.';

-- 4. Tabela de Hemocentros
CREATE TABLE public.hemocenters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    latitude FLOAT,
    longitude FLOAT,
    operating_hours TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.hemocenters IS 'Armazena informações sobre os hemocentros parceiros.';

-- 5. Tabelas de Perfis Específicos (Doador e Profissional)
CREATE TABLE public.donor_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    blood_type TEXT,
    postal_code TEXT,
    last_donation_date DATE
);
COMMENT ON TABLE public.donor_profiles IS 'Dados específicos para usuários doadores.';

CREATE TABLE public.professional_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    hemocenter_id UUID REFERENCES public.hemocenters(id) ON DELETE SET NULL,
    position TEXT
);
COMMENT ON TABLE public.professional_profiles IS 'Dados específicos para profissionais de hemocentros.';

-- 6. Tabela de Níveis de Estoque
CREATE TABLE public.stock_levels (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    blood_type TEXT NOT NULL,
    level_percentage INT NOT NULL CHECK (level_percentage >= 0 AND level_percentage <= 100),
    status stock_status NOT NULL,
    last_updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(hemocenter_id, blood_type)
);
COMMENT ON TABLE public.stock_levels IS 'Gerencia os níveis de estoque de sangue para cada hemocentro.';

-- 7. Tabela de Campanhas
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    target_blood_type TEXT DEFAULT 'ALL',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.campaigns IS 'Campanhas de doação criadas pelos hemocentros.';

-- 8. Tabela de Candidaturas de Doadores
CREATE TABLE public.donor_applications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    donor_user_id UUID NOT NULL REFERENCES public.donor_profiles(user_id) ON DELETE CASCADE,
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    application_date TIMESTAMPTZ DEFAULT now(),
    status application_status DEFAULT 'pending',
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMPTZ
);
COMMENT ON TABLE public.donor_applications IS 'Registra as candidaturas de doadores.';

-- 9. VIEW para Campanhas (calcula is_active dinamicamente)
CREATE OR REPLACE VIEW public.v_campaigns AS
SELECT
    *,
    (now()::date BETWEEN start_date AND end_date) AS is_active
FROM
    public.campaigns;
COMMENT ON VIEW public.v_campaigns IS 'Visão que calcula dinamicamente se uma campanha está ativa.';

-- 10. Funções de Suporte
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS user_role AS $$
DECLARE
    v_role user_role;
BEGIN
    SELECT role INTO v_role FROM public.user_profiles WHERE user_id = p_user_id;
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Função Trigger para criar perfis automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role user_role;
    v_name TEXT;
    v_blood_type TEXT;
    v_postal_code TEXT;
BEGIN
    v_role := (new.raw_user_meta_data->>'role')::user_role;
    v_name := new.raw_user_meta_data->>'name';
    v_blood_type := new.raw_user_meta_data->>'blood_type';
    v_postal_code := new.raw_user_meta_data->>'postal_code';

    INSERT INTO public.user_profiles (user_id, name, role)
    VALUES (new.id, v_name, v_role);

    IF v_role = 'donor' THEN
        INSERT INTO public.donor_profiles (user_id, blood_type, postal_code)
        VALUES (new.id, v_blood_type, v_postal_code);
    ELSIF v_role = 'professional' THEN
        INSERT INTO public.professional_profiles (user_id)
        VALUES (new.id);
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Trigger para a função handle_new_user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. Habilitar RLS e Criar Políticas
-- User Profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Donor Profiles
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donors can manage their own profile" ON public.donor_profiles FOR ALL USING (auth.uid() = user_id);

-- Professional Profiles
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Professionals can manage their own profile" ON public.professional_profiles FOR ALL USING (auth.uid() = user_id);

-- Hemocenters
ALTER TABLE public.hemocenters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active hemocenters" ON public.hemocenters FOR SELECT USING (is_active = true);

-- Stock Levels
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read stock levels" ON public.stock_levels FOR SELECT USING (true);
CREATE POLICY "Professionals can update their hemocenter stock" ON public.stock_levels FOR UPDATE
    USING ((get_user_role(auth.uid()) = 'professional') AND (hemocenter_id = (SELECT hemocenter_id FROM professional_profiles WHERE user_id = auth.uid())));

-- Campaigns (CORREÇÃO APLICADA AQUI)
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Professionals can manage their hemocenter campaigns" ON public.campaigns FOR ALL
    USING ((get_user_role(auth.uid()) = 'professional') AND (hemocenter_id = (SELECT hemocenter_id FROM professional_profiles WHERE user_id = auth.uid())));

-- Donor Applications
ALTER TABLE public.donor_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donors can manage their own applications" ON public.donor_applications FOR ALL USING (auth.uid() = donor_user_id);
CREATE POLICY "Professionals can see applications for their hemocenter" ON public.donor_applications FOR SELECT
    USING ((get_user_role(auth.uid()) = 'professional') AND (hemocenter_id = (SELECT hemocenter_id FROM professional_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Professionals can update applications for their hemocenter" ON public.donor_applications FOR UPDATE
    USING ((get_user_role(auth.uid()) = 'professional') AND (hemocenter_id = (SELECT hemocenter_id FROM professional_profiles WHERE user_id = auth.uid())));


-- 14. Inserir Dados de Exemplo
-- Hemocentro de Exemplo
INSERT INTO public.hemocenters (id, name, address, is_active)
VALUES ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Hemocentro Vida Nova', 'Rua das Flores, 123, São Paulo', true);

-- Estoque Inicial para o Hemocentro de Exemplo
INSERT INTO public.stock_levels (hemocenter_id, blood_type, level_percentage, status) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'A+', 85, 'high'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'A-', 45, 'low'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'B+', 60, 'stable'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'B-', 20, 'critical'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'AB+', 75, 'stable'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'AB-', 15, 'critical'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'O+', 55, 'stable'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'O-', 30, 'low');
