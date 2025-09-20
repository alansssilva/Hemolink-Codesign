/*
# Hemolink SaaS Database Schema
Complete database structure for blood donation management platform

## Query Description:
This migration creates the foundational database structure for the Hemolink SaaS platform.
It establishes user management, hemocenter data, blood stock tracking, campaigns, and donor applications.
This is a safe initial setup that creates new tables without affecting existing data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Creates user profiles linked to auth.users
- Establishes hemocenters with location data
- Blood stock tracking with real-time levels
- Campaign management system
- Donor application workflow

## Security Implications:
- RLS Status: Enabled on all public tables
- Policy Changes: Yes - creates appropriate access policies
- Auth Requirements: Uses Supabase auth.users integration

## Performance Impact:
- Indexes: Added for foreign keys and search fields
- Triggers: Profile creation trigger on auth.users
- Estimated Impact: Minimal, optimized for read-heavy workload
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users profile table (linked to auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('donor', 'professional', 'admin')),
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Donor specific profile information
CREATE TABLE public.donor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blood_type TEXT NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  postal_code TEXT,
  last_donation_date DATE,
  total_donations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Hemocenters table
CREATE TABLE public.hemocenters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  postal_code TEXT,
  operating_hours TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional profiles linked to hemocenters
CREATE TABLE public.professional_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hemocenter_id UUID REFERENCES public.hemocenters(id) ON DELETE CASCADE,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Blood stock levels
CREATE TABLE public.stock_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hemocenter_id UUID REFERENCES public.hemocenters(id) ON DELETE CASCADE,
  blood_type TEXT NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  level_percentage INTEGER NOT NULL CHECK (level_percentage >= 0 AND level_percentage <= 100),
  status TEXT NOT NULL CHECK (status IN ('critical', 'low', 'stable', 'high')) DEFAULT 'stable',
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(hemocenter_id, blood_type)
);

-- Donation campaigns
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hemocenter_id UUID REFERENCES public.hemocenters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_blood_type TEXT CHECK (target_blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'ALL')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donor applications
CREATE TABLE public.donor_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hemocenter_id UUID REFERENCES public.hemocenters(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
  notes TEXT,
  scheduled_date DATE,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_donor_profiles_user_id ON public.donor_profiles(user_id);
CREATE INDEX idx_donor_profiles_blood_type ON public.donor_profiles(blood_type);
CREATE INDEX idx_professional_profiles_user_id ON public.professional_profiles(user_id);
CREATE INDEX idx_professional_profiles_hemocenter_id ON public.professional_profiles(hemocenter_id);
CREATE INDEX idx_stock_levels_hemocenter_id ON public.stock_levels(hemocenter_id);
CREATE INDEX idx_stock_levels_blood_type ON public.stock_levels(blood_type);
CREATE INDEX idx_campaigns_hemocenter_id ON public.campaigns(hemocenter_id);
CREATE INDEX idx_campaigns_is_active ON public.campaigns(is_active);
CREATE INDEX idx_donor_applications_donor_user_id ON public.donor_applications(donor_user_id);
CREATE INDEX idx_donor_applications_hemocenter_id ON public.donor_applications(hemocenter_id);
CREATE INDEX idx_donor_applications_status ON public.donor_applications(status);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hemocenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for donor_profiles
CREATE POLICY "Donors can view own profile" ON public.donor_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Donors can update own profile" ON public.donor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Donors can insert own profile" ON public.donor_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Professionals can view donor profiles" ON public.donor_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role IN ('professional', 'admin')
    )
  );

-- RLS Policies for hemocenters
CREATE POLICY "Anyone can view active hemocenters" ON public.hemocenters
  FOR SELECT USING (is_active = true);

CREATE POLICY "Professionals can manage their hemocenter" ON public.hemocenters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.professional_profiles 
      WHERE user_id = auth.uid() AND hemocenter_id = id
    )
  );

-- RLS Policies for professional_profiles
CREATE POLICY "Professionals can view own profile" ON public.professional_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Professionals can update own profile" ON public.professional_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for stock_levels
CREATE POLICY "Anyone can view stock levels" ON public.stock_levels
  FOR SELECT USING (true);

CREATE POLICY "Professionals can manage stock for their hemocenter" ON public.stock_levels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.professional_profiles 
      WHERE user_id = auth.uid() AND hemocenter_id = stock_levels.hemocenter_id
    )
  );

-- RLS Policies for campaigns
CREATE POLICY "Anyone can view active campaigns" ON public.campaigns
  FOR SELECT USING (is_active = true);

CREATE POLICY "Professionals can manage campaigns for their hemocenter" ON public.campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.professional_profiles 
      WHERE user_id = auth.uid() AND hemocenter_id = campaigns.hemocenter_id
    )
  );

-- RLS Policies for donor_applications
CREATE POLICY "Donors can view own applications" ON public.donor_applications
  FOR SELECT USING (auth.uid() = donor_user_id);

CREATE POLICY "Donors can create applications" ON public.donor_applications
  FOR INSERT WITH CHECK (auth.uid() = donor_user_id);

CREATE POLICY "Professionals can view applications for their hemocenter" ON public.donor_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.professional_profiles 
      WHERE user_id = auth.uid() AND hemocenter_id = donor_applications.hemocenter_id
    )
  );

CREATE POLICY "Professionals can update applications for their hemocenter" ON public.donor_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.professional_profiles 
      WHERE user_id = auth.uid() AND hemocenter_id = donor_applications.hemocenter_id
    )
  );

-- Function to automatically create user profile after registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'donor')
  );
  
  -- If the user is a donor, create donor profile
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'donor') = 'donor' THEN
    INSERT INTO public.donor_profiles (user_id, blood_type, postal_code)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'blood_type',
      NEW.raw_user_meta_data->>'postal_code'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_donor_profiles_updated_at BEFORE UPDATE ON public.donor_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_hemocenters_updated_at BEFORE UPDATE ON public.hemocenters
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_professional_profiles_updated_at BEFORE UPDATE ON public.professional_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Insert sample hemocenters
INSERT INTO public.hemocenters (name, address, latitude, longitude, postal_code, contact_email, contact_phone) VALUES
('Hemocentro São Paulo Central', 'Av. Paulista, 1000, São Paulo, SP', -23.5558, -46.6396, '01310-100', 'contato@hemosp.com.br', '(11) 3333-4444'),
('Hemocentro Rio de Janeiro', 'Rua das Laranjeiras, 500, Rio de Janeiro, RJ', -22.9068, -43.1729, '22240-000', 'contato@hemorj.com.br', '(21) 2222-3333'),
('Hemocentro Brasília', 'SQN 302, Bloco A, Brasília, DF', -15.7801, -47.9292, '70735-010', 'contato@hemodf.com.br', '(61) 3333-5555');

-- Insert sample stock levels
INSERT INTO public.stock_levels (hemocenter_id, blood_type, level_percentage, status) 
SELECT 
  h.id,
  bt.blood_type,
  CASE 
    WHEN bt.blood_type IN ('O-', 'AB-') THEN floor(random() * 30 + 20)::integer  -- 20-50% for rare types
    ELSE floor(random() * 60 + 30)::integer  -- 30-90% for common types
  END,
  CASE 
    WHEN floor(random() * 60 + 30) < 40 THEN 'low'
    WHEN floor(random() * 60 + 30) < 80 THEN 'stable'
    ELSE 'high'
  END
FROM public.hemocenters h
CROSS JOIN (VALUES ('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-'), ('O+'), ('O-')) AS bt(blood_type);

-- Insert sample campaigns
INSERT INTO public.campaigns (hemocenter_id, title, description, target_blood_type, start_date, end_date, is_active)
SELECT 
  h.id,
  'Campanha de Doação ' || h.name,
  'Campanha urgente para reposição de estoque de sangue tipo O-',
  'O-',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  true
FROM public.hemocenters h;
