-- 1. Limpeza inicial (opcional, para garantir um ambiente limpo)
DROP VIEW IF EXISTS public.v_campaigns;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.donor_applications;
DROP TABLE IF EXISTS public.campaigns;
DROP TABLE IF EXISTS public.stock_levels;
DROP TABLE IF EXISTS public.hemocenters;
DROP TABLE IF EXISTS public.professional_profiles;
DROP TABLE IF EXISTS public.donor_profiles;
DROP TABLE IF EXISTS public.user_profiles;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.blood_type;
DROP TYPE IF EXISTS public.stock_status;
DROP TYPE IF EXISTS public.application_status;

-- 2. Definição de Tipos (ENUMs)
CREATE TYPE public.user_role AS ENUM ('donor', 'professional', 'admin');
CREATE TYPE public.blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE public.stock_status AS ENUM ('critical', 'low', 'stable', 'high', 'unknown');
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');

-- 3. Criação das Tabelas na Ordem Correta de Dependência
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role user_role NOT NULL DEFAULT 'donor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.user_profiles IS 'Stores public-facing profile information for all users.';

CREATE TABLE public.donor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  blood_type blood_type,
  postal_code VARCHAR(10),
  last_donation_date DATE
);
COMMENT ON TABLE public.donor_profiles IS 'Stores specific information for users with the donor role.';

CREATE TABLE public.hemocenters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  operating_hours VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.hemocenters IS 'Information about blood centers.';

CREATE TABLE public.professional_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  hemocenter_id UUID REFERENCES public.hemocenters(id) ON DELETE SET NULL,
  position VARCHAR(100)
);
COMMENT ON TABLE public.professional_profiles IS 'Stores specific information for users with the professional role.';

CREATE TABLE public.stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
  blood_type blood_type NOT NULL,
  level_percentage INT NOT NULL CHECK (level_percentage >= 0 AND level_percentage <= 100),
  status stock_status NOT NULL DEFAULT 'unknown',
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(hemocenter_id, blood_type)
);
COMMENT ON TABLE public.stock_levels IS 'Tracks blood stock levels for each hemocenter.';

CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_blood_type blood_type,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.campaigns IS 'Donation campaigns organized by hemocenters.';

CREATE TABLE public.donor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  application_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  status application_status NOT NULL DEFAULT 'pending',
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ
);
COMMENT ON TABLE public.donor_applications IS 'Applications from donors to donate blood.';

-- 4. Criação da VIEW para Campanhas
CREATE VIEW public.v_campaigns AS
SELECT
  c.*,
  (CURRENT_DATE >= c.start_date AND CURRENT_DATE <= c.end_date) AS is_active
FROM
  public.campaigns c;

COMMENT ON VIEW public.v_campaigns IS 'A view on the campaigns table that dynamically calculates the is_active status.';

-- 5. Funções e Triggers do Banco de Dados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- Cria o perfil de usuário geral
  INSERT INTO public.user_profiles (user_id, name, phone, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone',
    (NEW.raw_user_meta_data->>'role')::user_role
  ) RETURNING id INTO profile_id;

  -- Se o usuário for um doador, cria o perfil de doador
  IF (NEW.raw_user_meta_data->>'role')::user_role = 'donor' THEN
    INSERT INTO public.donor_profiles (user_profile_id, blood_type, postal_code)
    VALUES (
      profile_id,
      (NEW.raw_user_meta_data->>'blood_type')::blood_type,
      NEW.raw_user_meta_data->>'postal_code'
    );
  END IF;

  -- Se o usuário for um profissional, cria o perfil profissional
  IF (NEW.raw_user_meta_data->>'role')::user_role = 'professional' THEN
    INSERT INTO public.professional_profiles (user_profile_id)
    VALUES (profile_id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Inserção de Dados de Exemplo
-- Inserir um hemocentro de exemplo
INSERT INTO public.hemocenters (id, name, address, contact_email, contact_phone, is_active)
VALUES 
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Hemocentro Central', 'Rua Principal, 123, São Paulo', 'contato@hemocentrocentral.org', '(11) 1234-5678', true)
ON CONFLICT (id) DO NOTHING;

-- Inserir níveis de estoque para o hemocentro de exemplo
INSERT INTO public.stock_levels (hemocenter_id, blood_type, level_percentage, status)
VALUES
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'A+', 85, 'high'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'A-', 45, 'low'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'B+', 60, 'stable'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'B-', 20, 'critical'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'AB+', 90, 'high'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'AB-', 75, 'stable'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'O+', 30, 'low'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'O-', 15, 'critical')
ON CONFLICT (hemocenter_id, blood_type) DO UPDATE 
SET level_percentage = EXCLUDED.level_percentage, status = EXCLUDED.status;

-- 7. Políticas de Segurança (Row Level Security - RLS)
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hemocenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_applications ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Allow users to see their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Políticas para donor_profiles
CREATE POLICY "Allow donors to manage their own profile" ON public.donor_profiles FOR ALL USING (
  (SELECT role FROM public.user_profiles WHERE id = user_profile_id) = 'donor' AND
  (SELECT user_id FROM public.user_profiles WHERE id = user_profile_id) = auth.uid()
);

-- Políticas para professional_profiles
CREATE POLICY "Allow professionals to manage their own profile" ON public.professional_profiles FOR ALL USING (
  (SELECT role FROM public.user_profiles WHERE id = user_profile_id) = 'professional' AND
  (SELECT user_id FROM public.user_profiles WHERE id = user_profile_id) = auth.uid()
);

-- Políticas para hemocenters e stock_levels (leitura pública)
CREATE POLICY "Allow public read access" ON public.hemocenters FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON public.stock_levels FOR SELECT USING (true);

-- Políticas para campanhas (leitura pública via VIEW)
CREATE POLICY "Allow public read access" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Allow professionals to manage campaigns in their hemocenter" ON public.campaigns FOR ALL USING (
  (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'professional' AND
  hemocenter_id = (SELECT hemocenter_id FROM professional_profiles pp JOIN user_profiles up ON pp.user_profile_id = up.id WHERE up.user_id = auth.uid())
) WITH CHECK (
  (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'professional' AND
  hemocenter_id = (SELECT hemocenter_id FROM professional_profiles pp JOIN user_profiles up ON pp.user_profile_id = up.id WHERE up.user_id = auth.uid())
);

-- Políticas para donor_applications
CREATE POLICY "Allow donors to see and create their own applications" ON public.donor_applications FOR ALL USING (auth.uid() = donor_user_id) WITH CHECK (auth.uid() = donor_user_id);
CREATE POLICY "Allow professionals to see applications for their hemocenter" ON public.donor_applications FOR SELECT USING (
  (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'professional' AND
  hemocenter_id = (SELECT hemocenter_id FROM professional_profiles pp JOIN user_profiles up ON pp.user_profile_id = up.id WHERE up.user_id = auth.uid())
);
CREATE POLICY "Allow professionals to update applications for their hemocenter" ON public.donor_applications FOR UPDATE USING (
  (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'professional' AND
  hemocenter_id = (SELECT hemocenter_id FROM professional_profiles pp JOIN user_profiles up ON pp.user_profile_id = up.id WHERE up.user_id = auth.uid())
);
