/*
# Hemolink SaaS - Correção do Schema Inicial do Banco de Dados
Este script corrige a ordem de criação das tabelas e funções para resolver o erro 'relation does not exist'.

## Query Description:
Este script de migração completo cria toda a estrutura do banco de dados para a plataforma Hemolink SaaS na ordem correta.
Ele estabelece as tabelas de usuários, hemocentros, estoque, campanhas e candidaturas, e depois cria as funções e políticas de segurança que dependem delas.
Esta operação é segura para um banco de dados vazio e irá estruturá-lo corretamente.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: false
*/

-- 1. Criação dos Tipos (ENUMS)
CREATE TYPE public.user_role AS ENUM ('donor', 'professional', 'admin');
CREATE TYPE public.blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE public.stock_status AS ENUM ('critical', 'low', 'stable', 'high');
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');

-- 2. Criação das Tabelas na ordem correta de dependência
-- Tabela de Perfis de Usuário (Tabela principal de perfis)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.user_profiles IS 'Stores public profile information for all users.';

-- Tabela de Hemocentros
CREATE TABLE public.hemocenters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    operating_hours VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.hemocenters IS 'Stores information about partner blood centers.';

-- Tabela de Perfis de Doadores (depende de user_profiles)
CREATE TABLE public.donor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    blood_type blood_type,
    postal_code VARCHAR(10),
    last_donation_date DATE
);
COMMENT ON TABLE public.donor_profiles IS 'Stores specific information for donor users.';

-- Tabela de Perfis de Profissionais (depende de user_profiles e hemocenters)
CREATE TABLE public.professional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    hemocenter_id UUID REFERENCES public.hemocenters(id) ON DELETE SET NULL,
    position VARCHAR(100)
);
COMMENT ON TABLE public.professional_profiles IS 'Stores specific information for professional users.';

-- Tabela de Níveis de Estoque (depende de hemocenters e user_profiles)
CREATE TABLE public.stock_levels (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    hemocenter_id UUID REFERENCES public.hemocenters(id) ON DELETE CASCADE NOT NULL,
    blood_type blood_type NOT NULL,
    level_percentage INT NOT NULL CHECK (level_percentage >= 0 AND level_percentage <= 100),
    status stock_status NOT NULL,
    last_updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(hemocenter_id, blood_type)
);
COMMENT ON TABLE public.stock_levels IS 'Tracks blood stock levels for each blood center.';

-- Tabela de Campanhas (depende de hemocenters e user_profiles)
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hemocenter_id UUID REFERENCES public.hemocenters(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_blood_type VARCHAR(10) DEFAULT 'ALL',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN GENERATED ALWAYS AS (CURRENT_DATE >= start_date AND CURRENT_DATE <= end_date) STORED,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.campaigns IS 'Stores information about donation campaigns.';

-- Tabela de Candidaturas de Doadores (depende de user_profiles, hemocenters, campaigns)
CREATE TABLE public.donor_applications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    donor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    hemocenter_id UUID REFERENCES public.hemocenters(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    application_date TIMESTAMPTZ DEFAULT now(),
    status application_status DEFAULT 'pending',
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMPTZ
);
COMMENT ON TABLE public.donor_applications IS 'Tracks donor applications for donations.';

-- 3. Criação da Função para criar perfil (DEPOIS das tabelas de perfil)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  profile_id_var UUID;
BEGIN
  -- Cria o perfil base em user_profiles
  INSERT INTO public.user_profiles (user_id, name, role, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    (NEW.raw_user_meta_data->>'role')::public.user_role,
    NEW.raw_user_meta_data->>'phone'
  ) RETURNING id INTO profile_id_var;

  -- Se for doador, cria o perfil de doador
  IF (NEW.raw_user_meta_data->>'role') = 'donor' THEN
    INSERT INTO public.donor_profiles (profile_id, blood_type, postal_code)
    VALUES (
      profile_id_var,
      (NEW.raw_user_meta_data->>'blood_type')::public.blood_type,
      NEW.raw_user_meta_data->>'location'
    );
  -- Se for profissional, cria o perfil de profissional (sem hemocentro inicialmente)
  ELSIF (NEW.raw_user_meta_data->>'role') = 'professional' THEN
    INSERT INTO public.professional_profiles (profile_id)
    VALUES (profile_id_var);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criação do Trigger que usa a função
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Habilitação do RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hemocenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_applications ENABLE ROW LEVEL SECURITY;

-- 6. Criação das Políticas de Segurança (RLS)
-- user_profiles
CREATE POLICY "Allow public read access" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow individual update access" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- hemocenters, stock_levels, campaigns (público para leitura)
CREATE POLICY "Allow public read access" ON public.hemocenters FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.stock_levels FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.campaigns FOR SELECT USING (true);

-- Profissionais podem gerenciar seu hemocentro
CREATE POLICY "Allow professionals to manage their hemocenter" ON public.hemocenters FOR UPDATE
  USING (
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'professional' AND
    id = (SELECT hemocenter_id FROM public.professional_profiles WHERE profile_id = (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()))
  );

-- Profissionais podem gerenciar o estoque do seu hemocentro
CREATE POLICY "Allow professionals to manage stock" ON public.stock_levels FOR ALL
  USING (
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'professional' AND
    hemocenter_id = (SELECT hemocenter_id FROM public.professional_profiles WHERE profile_id = (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()))
  );

-- Profissionais podem gerenciar campanhas do seu hemocentro
CREATE POLICY "Allow professionals to manage campaigns" ON public.campaigns FOR ALL
  USING (
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'professional' AND
    hemocenter_id = (SELECT hemocenter_id FROM public.professional_profiles WHERE profile_id = (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()))
  );

-- donor_applications
CREATE POLICY "Allow donors to see their own applications" ON public.donor_applications FOR SELECT
  USING (auth.uid() = donor_user_id);
CREATE POLICY "Allow donors to create applications" ON public.donor_applications FOR INSERT
  WITH CHECK (auth.uid() = donor_user_id);
CREATE POLICY "Allow professionals to see and manage applications for their hemocenter" ON public.donor_applications FOR ALL
  USING (
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'professional' AND
    hemocenter_id = (SELECT hemocenter_id FROM public.professional_profiles WHERE profile_id = (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()))
  );

-- donor_profiles & professional_profiles
CREATE POLICY "Allow users to see their own profiles" ON public.donor_profiles FOR SELECT
  USING ((SELECT user_id FROM public.user_profiles WHERE id = profile_id) = auth.uid());
CREATE POLICY "Allow users to see their own profiles" ON public.professional_profiles FOR SELECT
  USING ((SELECT user_id FROM public.user_profiles WHERE id = profile_id) = auth.uid());

-- 7. Inserção de Dados de Exemplo
INSERT INTO public.hemocenters (id, name, address, contact_email, contact_phone)
VALUES ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Hemocentro Vida', 'Rua Principal, 123, São Paulo', 'contato@hemovidasp.org', '(11) 5555-1234');

INSERT INTO public.stock_levels (hemocenter_id, blood_type, level_percentage, status) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'A+', 85, 'high'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'A-', 60, 'stable'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'B+', 70, 'stable'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'B-', 20, 'critical'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'AB+', 55, 'stable'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'AB-', 40, 'low'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'O+', 30, 'low'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'O-', 15, 'critical');
