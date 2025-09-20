-- #############################################################################
-- ############# SCRIPT DE MIGRAÇÃO DEFINITIVO PARA HEMOLINK SAAS ##############
-- #############################################################################
-- Este script cria a estrutura completa do banco de dados, corrigindo
-- erros de ordem de criação e colunas geradas.

-- =============================================================================
-- 1. LIMPEZA INICIAL (Opcional, mas recomendado para um início limpo)
-- Remove objetos antigos para evitar conflitos.
-- =============================================================================
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
DROP TYPE IF EXISTS public.blood_type_enum;
DROP TYPE IF EXISTS public.user_role_enum;
DROP TYPE IF EXISTS public.stock_status_enum;
DROP TYPE IF EXISTS public.application_status_enum;

-- =============================================================================
-- 2. CRIAÇÃO DOS TIPOS (ENUMS)
-- Define os tipos de dados personalizados para consistência.
-- =============================================================================
CREATE TYPE public.blood_type_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE public.user_role_enum AS ENUM ('donor', 'professional', 'admin');
CREATE TYPE public.stock_status_enum AS ENUM ('critical', 'low', 'stable', 'high', 'unknown');
CREATE TYPE public.application_status_enum AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'canceled');

-- =============================================================================
-- 3. CRIAÇÃO DAS TABELAS (ORDEM CORRETA)
-- Cria as tabelas na ordem de dependência correta.
-- =============================================================================

-- Tabela de Hemocentros
CREATE TABLE public.hemocenters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    operating_hours TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.hemocenters IS 'Armazena informações sobre os hemocentros parceiros.';

-- Tabela de Perfis de Usuário (Base)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    role user_role_enum NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.user_profiles IS 'Perfil base para todos os usuários, vinculado ao auth.users.';

-- Tabela de Perfis de Doadores
CREATE TABLE public.donor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    blood_type blood_type_enum,
    postal_code VARCHAR(10),
    last_donation_date DATE
);
COMMENT ON TABLE public.donor_profiles IS 'Informações específicas para usuários doadores.';

-- Tabela de Perfis de Profissionais
CREATE TABLE public.professional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    hemocenter_id UUID REFERENCES public.hemocenters(id) ON DELETE SET NULL,
    position VARCHAR(100)
);
COMMENT ON TABLE public.professional_profiles IS 'Informações específicas para profissionais de hemocentros.';

-- Tabela de Níveis de Estoque
CREATE TABLE public.stock_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    blood_type blood_type_enum NOT NULL,
    level_percentage INT NOT NULL CHECK (level_percentage >= 0 AND level_percentage <= 100),
    status stock_status_enum NOT NULL,
    last_updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE (hemocenter_id, blood_type)
);
COMMENT ON TABLE public.stock_levels IS 'Registra os níveis de estoque de sangue por tipo para cada hemocentro.';

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
COMMENT ON TABLE public.campaigns IS 'Campanhas de doação criadas pelos hemocentros.';

-- Tabela de Candidaturas de Doadores
CREATE TABLE public.donor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    application_date TIMESTAMPTZ DEFAULT now(),
    status application_status_enum DEFAULT 'pending',
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMPTZ
);
COMMENT ON TABLE public.donor_applications IS 'Registra as candidaturas de doação feitas pelos usuários.';

-- =============================================================================
-- 4. CRIAÇÃO DA VIEW (CORREÇÃO DO ERRO 'IMMUTABLE')
-- Cria uma view para calcular o status da campanha dinamicamente.
-- =============================================================================
CREATE OR REPLACE VIEW public.v_campaigns AS
SELECT 
    *,
    (now()::date BETWEEN start_date AND end_date) AS is_active
FROM 
    public.campaigns;
COMMENT ON VIEW public.v_campaigns IS 'View que calcula dinamicamente se uma campanha está ativa.';

-- =============================================================================
-- 5. FUNÇÃO E TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PERFIS
-- Garante que um perfil seja criado para cada novo usuário registrado.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  profile_id_var UUID;
BEGIN
  -- Cria o perfil base
  INSERT INTO public.user_profiles (user_id, name, role, phone)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    (new.raw_user_meta_data->>'role')::public.user_role_enum,
    new.raw_user_meta_data->>'phone'
  ) RETURNING id INTO profile_id_var;

  -- Cria o perfil específico (doador ou profissional)
  IF (new.raw_user_meta_data->>'role') = 'donor' THEN
    INSERT INTO public.donor_profiles (profile_id, blood_type, postal_code)
    VALUES (
      profile_id_var,
      (new.raw_user_meta_data->>'blood_type')::public.blood_type_enum,
      new.raw_user_meta_data->>'location'
    );
  ELSIF (new.raw_user_meta_data->>'role') = 'professional' THEN
    -- A associação com o hemocentro será feita manualmente no dashboard do admin
    INSERT INTO public.professional_profiles (profile_id)
    VALUES (profile_id_var);
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cria o trigger que chama a função
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 6. POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- Habilita e define as regras de acesso para cada tabela.
-- =============================================================================

-- Hemocenters
ALTER TABLE public.hemocenters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for hemocenters" ON public.hemocenters FOR SELECT USING (true);
CREATE POLICY "Admin can manage hemocenters" ON public.hemocenters FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_profiles WHERE role = 'admin'));

-- User Profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Professionals can view donor profiles of applicants" ON public.user_profiles FOR SELECT USING (
  (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'professional' AND
  id IN (SELECT profile_id FROM public.donor_profiles WHERE profile_id IN (SELECT user_id FROM public.donor_applications WHERE hemocenter_id IN (SELECT hemocenter_id FROM public.professional_profiles WHERE (SELECT user_id FROM public.user_profiles WHERE id = profile_id) = auth.uid())))
);

-- Donor Profiles
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own donor profile" ON public.donor_profiles FOR SELECT USING ((SELECT user_id FROM public.user_profiles WHERE id = profile_id) = auth.uid());

-- Professional Profiles
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own professional profile" ON public.professional_profiles FOR SELECT USING ((SELECT user_id FROM public.user_profiles WHERE id = profile_id) = auth.uid());

-- Stock Levels
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for stock levels" ON public.stock_levels FOR SELECT USING (true);
CREATE POLICY "Professionals can update their own hemocenter stock" ON public.stock_levels FOR ALL USING (
  (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'professional' AND
  hemocenter_id IN (SELECT hemocenter_id FROM public.professional_profiles WHERE (SELECT user_id FROM public.user_profiles WHERE id = profile_id) = auth.uid())
);

-- Campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Professionals can manage campaigns for their hemocenter" ON public.campaigns FOR ALL USING (
  (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'professional' AND
  hemocenter_id IN (SELECT hemocenter_id FROM public.professional_profiles WHERE (SELECT user_id FROM public.user_profiles WHERE id = profile_id) = auth.uid())
);

-- Donor Applications
ALTER TABLE public.donor_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donors can manage their own applications" ON public.donor_applications FOR ALL USING (auth.uid() = donor_user_id);
CREATE POLICY "Professionals can view applications for their hemocenter" ON public.donor_applications FOR SELECT USING (
  (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'professional' AND
  hemocenter_id IN (SELECT hemocenter_id FROM public.professional_profiles WHERE (SELECT user_id FROM public.user_profiles WHERE id = profile_id) = auth.uid())
);
CREATE POLICY "Professionals can update applications for their hemocenter" ON public.donor_applications FOR UPDATE USING (
  (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'professional' AND
  hemocenter_id IN (SELECT hemocenter_id FROM public.professional_profiles WHERE (SELECT user_id FROM public.user_profiles WHERE id = profile_id) = auth.uid())
);


-- =============================================================================
-- 7. DADOS DE AMOSTRA (SAMPLE DATA)
-- Insere dados iniciais para teste.
-- =============================================================================
DO $$
DECLARE
    hemocenter_id_var UUID;
BEGIN
    -- Insere um hemocentro de exemplo
    INSERT INTO public.hemocenters (name, address, contact_email)
    VALUES ('Hemocentro Vida Plena', 'Rua da Esperança, 123', 'contato@vidaplena.org')
    RETURNING id INTO hemocenter_id_var;

    -- Insere os níveis de estoque para o hemocentro de exemplo
    INSERT INTO public.stock_levels (hemocenter_id, blood_type, level_percentage, status)
    VALUES
        (hemocenter_id_var, 'A+', 85, 'high'),
        (hemocenter_id_var, 'A-', 60, 'stable'),
        (hemocenter_id_var, 'B+', 45, 'low'),
        (hemocenter_id_var, 'B-', 20, 'critical'),
        (hemocenter_id_var, 'AB+', 75, 'stable'),
        (hemocenter_id_var, 'AB-', 55, 'stable'),
        (hemocenter_id_var, 'O+', 30, 'low'),
        (hemocenter_id_var, 'O-', 15, 'critical');
END $$;

-- #############################################################################
-- ############################ FIM DO SCRIPT ##################################
-- #############################################################################
