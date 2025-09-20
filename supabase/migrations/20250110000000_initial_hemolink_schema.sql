/*
# Hemolink SaaS: Initial Database Schema
This script creates the complete database structure for the Hemolink platform,
including tables for users, hemocenters, stock levels, and security policies.
Applying this migration will resolve the "table not found" errors.

## Query Description:
This is a foundational script that builds the entire database schema from scratch.
- Creates tables: user_profiles, donor_profiles, professional_profiles, hemocenters, stock_levels, campaigns, donor_applications.
- Creates a function and trigger to automatically populate user profiles upon new user registration.
- Enables Row Level Security (RLS) on all tables and applies security policies to protect user data.
- Inserts sample data for one hemocenter to ensure the application is functional immediately.

This operation is safe to run on a new project and is necessary for the application to work.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false (as it's an initial setup)
- Reversible: false (requires manual deletion of tables)
*/

-- 1. Create custom types (Enums)
create type public.user_role as enum ('donor', 'professional', 'admin');
create type public.blood_type as enum ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
create type public.stock_status as enum ('critical', 'low', 'stable', 'high');
create type public.application_status as enum ('pending', 'accepted', 'rejected', 'completed');

-- 2. Create Hemocenters Table
create table public.hemocenters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  latitude float,
  longitude float,
  operating_hours text,
  contact_email text,
  contact_phone text,
  is_active boolean default true,
  created_at timestamptz default now()
);
comment on table public.hemocenters is 'Stores information about blood centers.';

-- 3. Create User Profiles Table
create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null,
  role public.user_role not null,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
comment on table public.user_profiles is 'Stores public-facing user profile information.';

-- 4. Create Donor Profiles Table
create table public.donor_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.user_profiles(id) on delete cascade not null unique,
  blood_type public.blood_type,
  postal_code text,
  last_donation_date date
);
comment on table public.donor_profiles is 'Stores donor-specific information.';

-- 5. Create Professional Profiles Table
create table public.professional_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.user_profiles(id) on delete cascade not null unique,
  hemocenter_id uuid references public.hemocenters(id) on delete set null
);
comment on table public.professional_profiles is 'Links professionals to their respective hemocenters.';

-- 6. Create Stock Levels Table
create table public.stock_levels (
  id uuid primary key default gen_random_uuid(),
  hemocenter_id uuid references public.hemocenters(id) on delete cascade not null,
  blood_type public.blood_type not null,
  level_percentage integer not null check (level_percentage >= 0 and level_percentage <= 100),
  status public.stock_status not null,
  last_updated_at timestamptz default now(),
  updated_by uuid references auth.users(id),
  unique(hemocenter_id, blood_type)
);
comment on table public.stock_levels is 'Tracks blood stock levels for each hemocenter.';

-- 7. Create Campaigns Table
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  hemocenter_id uuid references public.hemocenters(id) on delete cascade not null,
  title text not null,
  description text,
  target_blood_type text default 'ALL',
  start_date date not null,
  end_date date not null,
  is_active boolean generated always as (now() between start_date and end_date) stored,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);
comment on table public.campaigns is 'Stores donation campaigns created by hemocenters.';

-- 8. Create Donor Applications Table
create table public.donor_applications (
  id uuid primary key default gen_random_uuid(),
  donor_user_id uuid references auth.users(id) on delete cascade not null,
  hemocenter_id uuid references public.hemocenters(id) on delete cascade not null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  application_date timestamptz default now(),
  status public.application_status default 'pending',
  processed_by uuid references auth.users(id),
  processed_at timestamptz
);
comment on table public.donor_applications is 'Tracks donor applications for donations.';

-- 9. Function to create a user profile on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  profile_id uuid;
begin
  -- Create a new user_profile
  insert into public.user_profiles (user_id, name, role, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    (new.raw_user_meta_data->>'role')::public.user_role,
    new.raw_user_meta_data->>'phone'
  )
  returning id into profile_id;

  -- If the user is a donor, create a donor_profile
  if (new.raw_user_meta_data->>'role')::public.user_role = 'donor' then
    insert into public.donor_profiles (profile_id, blood_type, postal_code)
    values (
      profile_id,
      (new.raw_user_meta_data->>'blood_type')::public.blood_type,
      new.raw_user_meta_data->>'postal_code'
    );
  end if;
  
  -- Note: Professional profiles are linked manually by an admin for now.
  
  return new;
end;
$$;

-- 10. Trigger to call the function on new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 11. Enable Row Level Security (RLS)
alter table public.hemocenters enable row level security;
alter table public.user_profiles enable row level security;
alter table public.donor_profiles enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.stock_levels enable row level security;
alter table public.campaigns enable row level security;
alter table public.donor_applications enable row level security;

-- 12. RLS Policies
-- Public can view hemocenters, stock levels, and active campaigns
create policy "Allow public read access to hemocenters" on public.hemocenters for select using (true);
create policy "Allow public read access to stock levels" on public.stock_levels for select using (true);
create policy "Allow public read access to active campaigns" on public.campaigns for select using (is_active = true);

-- Users can view all user profiles (for names, etc.)
create policy "Allow users to view all profiles" on public.user_profiles for select using (true);
-- Users can only update their own profile
create policy "Allow users to update their own profile" on public.user_profiles for update using (auth.uid() = user_id);

-- Donors can view their own donor profile
create policy "Allow donors to view their own donor profile" on public.donor_profiles for select using (
  exists (select 1 from user_profiles where user_profiles.id = donor_profiles.profile_id and user_profiles.user_id = auth.uid())
);
-- Donors can update their own donor profile
create policy "Allow donors to update their own donor profile" on public.donor_profiles for update using (
  exists (select 1 from user_profiles where user_profiles.id = donor_profiles.profile_id and user_profiles.user_id = auth.uid())
);

-- Professionals can view applications for their hemocenter
create policy "Allow professionals to manage applications for their hemocenter" on public.donor_applications for all using (
  (get_my_claim('role')::text = '"professional"') and
  hemocenter_id = get_my_claim('hemocenter_id')::uuid
);
-- Donors can view and create their own applications
create policy "Allow donors to manage their own applications" on public.donor_applications for all using (auth.uid() = donor_user_id);

-- Professionals can manage stock for their hemocenter
create policy "Allow professionals to manage stock for their hemocenter" on public.stock_levels for all using (
  (get_my_claim('role')::text = '"professional"') and
  hemocenter_id = get_my_claim('hemocenter_id')::uuid
);

-- Professionals can manage campaigns for their hemocenter
create policy "Allow professionals to manage campaigns for their hemocenter" on public.campaigns for all using (
  (get_my_claim('role')::text = '"professional"') and
  hemocenter_id = get_my_claim('hemocenter_id')::uuid
);

-- 13. Insert Sample Data
-- Insert a sample hemocenter
insert into public.hemocenters (name, address, contact_email, contact_phone)
values ('Hemonúcleo Central', 'Rua da Saúde, 123, Cidade Feliz', 'contato@hemonucleocentral.org', '(11) 5555-1234');

-- Insert sample stock levels for the hemocenter
DO $$
DECLARE
    hemocenter_uuid uuid;
BEGIN
    SELECT id INTO hemocenter_uuid FROM public.hemocenters WHERE name = 'Hemonúcleo Central';
    
    INSERT INTO public.stock_levels (hemocenter_id, blood_type, level_percentage, status)
    VALUES
        (hemocenter_uuid, 'A+', 75, 'stable'),
        (hemocenter_uuid, 'A-', 40, 'low'),
        (hemocenter_uuid, 'B+', 85, 'high'),
        (hemocenter_uuid, 'B-', 60, 'stable'),
        (hemocenter_uuid, 'AB+', 50, 'stable'),
        (hemocenter_uuid, 'AB-', 20, 'critical'),
        (hemocenter_uuid, 'O+', 30, 'low'),
        (hemocenter_uuid, 'O-', 15, 'critical');
END $$;
