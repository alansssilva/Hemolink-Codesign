/*
# Hemolink SaaS: Complete Database Schema
This script creates all necessary tables, functions, and RLS policies for the Hemolink platform.
Applying this migration is CRITICAL for the application to function.
*/

/*
          # Table: user_profiles
          Stores public user data and role, linked to Supabase's auth users.

          ## Query Description: This operation creates the primary user profile table. It is safe to run on a new database. It does not delete or modify existing data in other tables.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Table: user_profiles
          - Columns: user_id, name, role, phone
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: Users can only see their own profile.
          
          ## Performance Impact:
          - Indexes: Primary key on user_id.
          - Triggers: None
          - Estimated Impact: Low
          */
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('donor', 'professional', 'admin')),
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

/*
          # Table: donor_profiles
          Stores specific data for users with the 'donor' role.

          ## Query Description: Creates the profile table for donors. Safe to run.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Table: donor_profiles
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          
          ## Performance Impact:
          - Estimated Impact: Low
          */
CREATE TABLE IF NOT EXISTS public.donor_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    blood_type TEXT NOT NULL,
    postal_code TEXT,
    last_donation_date DATE
);
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donors can view their own profile" ON public.donor_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Donors can update their own profile" ON public.donor_profiles FOR UPDATE USING (auth.uid() = user_id);


/*
          # Table: hemocenters
          Stores information about blood centers.

          ## Query Description: Creates the table for hemocenters. Safe to run.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          
          ## Performance Impact:
          - Estimated Impact: Low
          */
CREATE TABLE IF NOT EXISTS public.hemocenters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    latitude FLOAT,
    longitude FLOAT,
    operating_hours TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.hemocenters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active hemocenters" ON public.hemocenters FOR SELECT USING (is_active = true);
CREATE POLICY "Admins or professionals can manage their hemocenters" ON public.hemocenters FOR ALL USING (
    auth.uid() IN (
        SELECT user_id FROM public.professional_profiles WHERE hemocenter_id = id
    ) OR (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'admin'
);


/*
          # Table: professional_profiles
          Links professionals to their respective hemocenters.

          ## Query Description: Creates the profile table for professionals. Safe to run.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          
          ## Performance Impact:
          - Estimated Impact: Low
          */
CREATE TABLE IF NOT EXISTS public.professional_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    hemocenter_id UUID REFERENCES public.hemocenters(id) ON DELETE SET NULL,
    position TEXT
);
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Professionals can view their own profile" ON public.professional_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all professional profiles" ON public.professional_profiles FOR ALL USING ((SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'admin');


/*
          # Table: stock_levels
          Tracks blood stock levels for each hemocenter.

          ## Query Description: Creates the blood stock tracking table. Safe to run.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          
          ## Performance Impact:
          - Estimated Impact: Low
          */
CREATE TABLE IF NOT EXISTS public.stock_levels (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    blood_type TEXT NOT NULL,
    level_percentage INT NOT NULL CHECK (level_percentage >= 0 AND level_percentage <= 100),
    status TEXT NOT NULL, -- critical, low, stable, high
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(hemocenter_id, blood_type)
);
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view stock levels" ON public.stock_levels FOR SELECT USING (true);
CREATE POLICY "Professionals can update their hemocenter stock" ON public.stock_levels FOR ALL USING (
    auth.uid() IN (
        SELECT user_id FROM public.professional_profiles WHERE hemocenter_id = stock_levels.hemocenter_id
    )
);


/*
          # Table: campaigns
          Stores donation campaigns created by hemocenters.

          ## Query Description: Creates the campaigns table. Safe to run.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          
          ## Performance Impact:
          - Estimated Impact: Low
          */
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_blood_type TEXT DEFAULT 'ALL',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN GENERATED ALWAYS AS (CURRENT_DATE >= start_date AND CURRENT_DATE <= end_date) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active campaigns" ON public.campaigns FOR SELECT USING (is_active = true);
CREATE POLICY "Professionals can manage their hemocenter campaigns" ON public.campaigns FOR ALL USING (
    auth.uid() IN (
        SELECT user_id FROM public.professional_profiles WHERE hemocenter_id = campaigns.hemocenter_id
    )
);


/*
          # Table: donor_applications
          Tracks donation applications from donors.

          ## Query Description: Creates the donor applications table. Safe to run.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          
          ## Performance Impact:
          - Estimated Impact: Low
          */
CREATE TABLE IF NOT EXISTS public.donor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hemocenter_id UUID NOT NULL REFERENCES public.hemocenters(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    application_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, completed
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES auth.users(id)
);
ALTER TABLE public.donor_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donors can manage their own applications" ON public.donor_applications FOR ALL USING (auth.uid() = donor_user_id);
CREATE POLICY "Professionals can view applications for their hemocenter" ON public.donor_applications FOR SELECT USING (
    auth.uid() IN (
        SELECT user_id FROM public.professional_profiles WHERE hemocenter_id = donor_applications.hemocenter_id
    )
);
CREATE POLICY "Professionals can update applications for their hemocenter" ON public.donor_applications FOR UPDATE USING (
    auth.uid() IN (
        SELECT user_id FROM public.professional_profiles WHERE hemocenter_id = donor_applications.hemocenter_id
    )
) WITH CHECK (status IN ('accepted', 'rejected', 'completed'));


/*
          # Function: create_user_profile
          A trigger function to automatically create a user profile upon new user registration.

          ## Query Description: This function automates profile creation. It is safe to run and essential for the registration process.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Security Implications:
          - RLS Status: N/A
          - Policy Changes: No
          
          ## Performance Impact:
          - Triggers: Adds a trigger to auth.users table.
          - Estimated Impact: Low
          */
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a main user profile
    INSERT INTO public.user_profiles (user_id, name, role, phone)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'role',
        NEW.raw_user_meta_data->>'phone'
    );

    -- If the user is a donor, create a donor profile
    IF (NEW.raw_user_meta_data->>'role' = 'donor') THEN
        INSERT INTO public.donor_profiles (user_id, blood_type, postal_code)
        VALUES (
            NEW.id,
            NEW.raw_user_meta_data->>'blood_type',
            NEW.raw_user_meta_data->>'postal_code'
        );
    END IF;
    
    -- If the user is a professional, you might need a manual step to assign them to a hemocenter
    -- For now, we just create the base profile.
    IF (NEW.raw_user_meta_data->>'role' = 'professional') THEN
        INSERT INTO public.professional_profiles(user_id)
        VALUES (NEW.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

/*
          # Data: Insert Sample Hemocenter and Stock
          Inserts initial data for testing purposes.

          ## Query Description: This operation adds sample data. It is safe to run and will not overwrite existing data if the hemocenter already exists.
          
          ## Metadata:
          - Schema-Category: "Data"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Inserts into: hemocenters, stock_levels
          
          ## Security Implications:
          - N/A
          
          ## Performance Impact:
          - Estimated Impact: Low
          */
DO $$
DECLARE
    hemocenter_id_var UUID;
BEGIN
    -- Insert a sample hemocenter if it doesn't exist
    INSERT INTO public.hemocenters (name, address, contact_email)
    VALUES ('Hemo Vida Central', 'Rua da Saúde, 123', 'contato@hemovidacentral.org')
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO hemocenter_id_var;

    -- If hemocenter_id_var is NULL, it means the hemocenter already existed. Let's get its ID.
    IF hemocenter_id_var IS NULL THEN
        SELECT id INTO hemocenter_id_var FROM public.hemocenters WHERE name = 'Hemo Vida Central';
    END IF;

    -- Insert stock levels for the sample hemocenter
    INSERT INTO public.stock_levels (hemocenter_id, blood_type, level_percentage, status)
    VALUES
        (hemocenter_id_var, 'A+', 85, 'high'),
        (hemocenter_id_var, 'A-', 60, 'stable'),
        (hemocenter_id_var, 'B+', 55, 'stable'),
        (hemocenter_id_var, 'B-', 20, 'critical'),
        (hemocenter_id_var, 'AB+', 75, 'stable'),
        (hemocenter_id_var, 'AB-', 40, 'low'),
        (hemocenter_id_var, 'O+', 30, 'low'),
        (hemocenter_id_var, 'O-', 15, 'critical')
    ON CONFLICT (hemocenter_id, blood_type) DO UPDATE
    SET level_percentage = EXCLUDED.level_percentage, status = EXCLUDED.status;
END $$;
