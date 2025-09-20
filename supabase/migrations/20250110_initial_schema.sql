/*
# Hemolink SaaS: Initial Database Schema
This script creates all the necessary tables, functions, and security policies for the Hemolink platform.
Applying this migration is CRITICAL for the application to function correctly.
*/

/*
# Table: user_profiles
Stores public-facing user data and role information, linked to Supabase's internal auth.users.
*/
CREATE TABLE public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'donor',
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.user_profiles IS 'Public profile information for all users.';

/*
# Table: donor_profiles
Stores specific information for users with the "donor" role.
*/
CREATE TABLE public.donor_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    blood_type TEXT,
    postal_code TEXT,
    last_donation_date DATE
);
COMMENT ON TABLE public.donor_profiles IS 'Profile details specific to blood donors.';

/*
# Table: hemocenters
Stores information about participating blood centers.
*/
CREATE TABLE public.hemocenters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    latitude FLOAT,
    longitude FLOAT,
    operating_hours TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.hemocenters IS 'Information about participating blood centers.';

/*
# Table: professional_profiles
Stores information for users with the "professional" role, linking them to a hemocenter.
*/
CREATE TABLE public.professional_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    hemocenter_id UUID REFERENCES public.hemocenters(id) ON DELETE SET NULL,
    position TEXT
);
COMMENT ON TABLE public.professional_profiles IS 'Profile details for hemocenter professionals.';

/*
# Table: stock_levels
Tracks blood stock levels for each hemocenter and blood type.
*/
CREATE TABLE public.stock_levels (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    blood_type TEXT NOT NULL,
    level_percentage INT NOT NULL CHECK (level_percentage >= 0 AND level_percentage <= 100),
    status TEXT NOT NULL, -- e.g., 'critical', 'low', 'stable', 'high'
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE (hemocenter_id, blood_type)
);
COMMENT ON TABLE public.stock_levels IS 'Tracks blood stock levels for each hemocenter.';

/*
# Table: campaigns
Stores information about donation campaigns run by hemocenters.
*/
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_blood_type TEXT DEFAULT 'ALL',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN GENERATED ALWAYS AS (CURRENT_DATE >= start_date AND CURRENT_DATE <= end_date) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.campaigns IS 'Donation campaigns run by hemocenters.';

/*
# Table: donor_applications
Tracks donor applications for donations.
*/
CREATE TABLE public.donor_applications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    donor_user_id UUID NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    application_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed'
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.donor_applications IS 'Tracks donor applications for donations.';

-- =================================================================
-- FUNCTIONS & TRIGGERS
-- =================================================================

/*
# Function: create_user_profile_on_signup
This function is triggered after a new user signs up. It creates a corresponding
profile in `public.user_profiles` and a role-specific profile.
*/
CREATE OR REPLACE FUNCTION public.create_user_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a general user profile
  INSERT INTO public.user_profiles (user_id, name, role, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'phone'
  );

  -- Create a role-specific profile
  IF (NEW.raw_user_meta_data->>'role' = 'donor') THEN
    INSERT INTO public.donor_profiles (user_id, blood_type, postal_code)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'blood_type',
      NEW.raw_user_meta_data->>'postal_code'
    );
  ELSIF (NEW.raw_user_meta_data->>'role' = 'professional') THEN
    INSERT INTO public.professional_profiles (user_id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/*
# Trigger: on_auth_user_created
Executes the function to create profiles when a new user is created in auth.users.
*/
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile_on_signup();

-- =================================================================
-- ROW LEVEL SECURITY (RLS)
-- =================================================================

-- Enable RLS for all relevant tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hemocenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_applications ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Allow users to see their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to see other public profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Policies for donor_profiles
CREATE POLICY "Allow donors to see and manage their own profile" ON public.donor_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow professionals to see donor profiles" ON public.donor_profiles FOR SELECT USING (
  (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) IN ('professional', 'admin')
);

-- Policies for professional_profiles
CREATE POLICY "Allow professionals to see and manage their own profile" ON public.professional_profiles FOR ALL USING (auth.uid() = user_id);

-- Policies for hemocenters, stock_levels, campaigns (Publicly readable)
CREATE POLICY "Allow public read access" ON public.hemocenters FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.stock_levels FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.campaigns FOR SELECT USING (true);

-- Policies for write access (Professionals only)
CREATE POLICY "Allow professionals to manage their hemocenter data" ON public.stock_levels FOR ALL USING (
  (SELECT hemocenter_id FROM public.professional_profiles WHERE user_id = auth.uid()) = hemocenter_id
);
CREATE POLICY "Allow professionals to manage their hemocenter campaigns" ON public.campaigns FOR ALL USING (
  (SELECT hemocenter_id FROM public.professional_profiles WHERE user_id = auth.uid()) = hemocenter_id
);

-- Policies for donor_applications
CREATE POLICY "Allow donors to see and create their own applications" ON public.donor_applications FOR ALL USING (auth.uid() = donor_user_id);
CREATE POLICY "Allow professionals to see applications for their hemocenter" ON public.donor_applications FOR ALL USING (
  (SELECT hemocenter_id FROM public.professional_profiles WHERE user_id = auth.uid()) = hemocenter_id
);

-- =================================================================
-- SAMPLE DATA (for demonstration purposes)
-- =================================================================

-- Create a sample hemocenter
INSERT INTO public.hemocenters (name, address) VALUES ('Hemocentro Central', 'Rua Principal, 123');

-- Create initial stock levels for the sample hemocenter
DO $$
DECLARE
    hemocenter_id_var UUID;
    blood_types TEXT[] := ARRAY['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    bt TEXT;
    lvl INT;
    stat TEXT;
BEGIN
    -- Get the ID of the hemocenter we just created
    SELECT id INTO hemocenter_id_var FROM public.hemocenters WHERE name = 'Hemocentro Central';

    -- Loop through blood types and insert stock levels
    FOREACH bt IN ARRAY blood_types
    LOOP
        lvl := floor(random() * 100 + 1)::int;
        IF lvl < 25 THEN stat := 'critical';
        ELSIF lvl < 50 THEN stat := 'low';
        ELSIF lvl < 80 THEN stat := 'stable';
        ELSE stat := 'high';
        END IF;

        INSERT INTO public.stock_levels (hemocenter_id, blood_type, level_percentage, status)
        VALUES (hemocenter_id_var, bt, lvl, stat);
    END LOOP;
END $$;
