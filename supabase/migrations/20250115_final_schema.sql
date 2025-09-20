-- #############################################################################
-- ############# SCRIPT DE MIGRAÇÃO DEFINITIVO PARA HEMOLINK SAAS ##############
-- #############################################################################
-- Este script limpa o estado anterior e cria a estrutura completa e correta.

-- ========= LIMPEZA INICIAL (GARANTE AMBIENTE LIMPO) =========
drop schema if exists public cascade;
create schema public;
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;

-- ========= CRIAÇÃO DOS TIPOS ENUM (MELHORA A CONSISTÊNCIA) =========
create type public.user_role as enum ('donor', 'professional', 'admin');
create type public.blood_type as enum ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
create type public.stock_status as enum ('critical', 'low', 'stable', 'high');
create type public.application_status as enum ('pending', 'accepted', 'rejected', 'completed');

-- ========= CRIAÇÃO DAS TABELAS (ORDEM CORRETA DE DEPENDÊNCIA) =========

-- Tabela de Hemocentros
create table public.hemocenters (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    address text,
    latitude numeric,
    longitude numeric,
    operating_hours text,
    contact_email text,
    contact_phone text,
    is_active boolean default true not null,
    created_at timestamptz default now() not null
);

-- Tabela de Perfis de Usuário (dados comuns)
create table public.user_profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    name text not null,
    role user_role not null,
    phone text,
    updated_at timestamptz default now()
);

-- Tabela de Perfis de Doadores (dados específicos)
create table public.donor_profiles (
    user_id uuid primary key references public.user_profiles(user_id) on delete cascade,
    blood_type blood_type,
    postal_code text,
    last_donation_date date
);

-- Tabela de Perfis de Profissionais (dados específicos)
create table public.professional_profiles (
    user_id uuid primary key references public.user_profiles(user_id) on delete cascade,
    hemocenter_id uuid references public.hemocenters(id),
    position text
);

-- Tabela de Estoque de Sangue
create table public.stock_levels (
    id uuid primary key default gen_random_uuid(),
    hemocenter_id uuid not null references public.hemocenters(id) on delete cascade,
    blood_type blood_type not null,
    level_percentage integer not null check (level_percentage >= 0 and level_percentage <= 100),
    status stock_status not null,
    last_updated_at timestamptz default now() not null,
    updated_by uuid references auth.users(id),
    unique (hemocenter_id, blood_type)
);

-- Tabela de Campanhas
create table public.campaigns (
    id uuid primary key default gen_random_uuid(),
    hemocenter_id uuid not null references public.hemocenters(id) on delete cascade,
    title text not null,
    description text,
    target_blood_type text default 'ALL',
    start_date timestamptz not null,
    end_date timestamptz not null,
    created_at timestamptz default now() not null,
    created_by uuid references auth.users(id)
);

-- Tabela de Candidaturas de Doadores
create table public.donor_applications (
    id uuid primary key default gen_random_uuid(),
    donor_user_id uuid not null references public.donor_profiles(user_id) on delete cascade,
    hemocenter_id uuid not null references public.hemocenters(id) on delete cascade,
    campaign_id uuid references public.campaigns(id) on delete set null,
    application_date timestamptz default now() not null,
    status application_status default 'pending' not null,
    processed_at timestamptz,
    processed_by uuid references public.professional_profiles(user_id)
);

-- ========= FUNÇÃO TRIGGER (AUTOMAÇÃO DE CRIAÇÃO DE PERFIL) =========
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Cria o perfil base
  insert into public.user_profiles (user_id, name, role, phone)
  values (new.id, new.raw_user_meta_data->>'name', (new.raw_user_meta_data->>'role')::user_role, new.raw_user_meta_data->>'phone');

  -- Cria o perfil específico de doador
  if (new.raw_user_meta_data->>'role')::user_role = 'donor' then
    insert into public.donor_profiles (user_id, blood_type, postal_code)
    values (new.id, (new.raw_user_meta_data->>'blood_type')::blood_type, new.raw_user_meta_data->>'postal_code');
  
  -- Cria o perfil específico de profissional (ainda sem hemocentro)
  elsif (new.raw_user_meta_data->>'role')::user_role = 'professional' then
     insert into public.professional_profiles (user_id)
     values (new.id);
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- ========= CRIAÇÃO DO TRIGGER =========
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ========= CRIAÇÃO DA VIEW (LÓGICA DE CAMPANHA ATIVA) =========
create or replace view public.v_campaigns as
select
  *,
  (now() between start_date and end_date) as is_active
from public.campaigns;

-- ========= POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY) =========

-- Tabela user_profiles
alter table public.user_profiles enable row level security;
create policy "Users can view their own profile" on public.user_profiles for select using (auth.uid() = user_id);
create policy "Users can update their own profile" on public.user_profiles for update using (auth.uid() = user_id);

-- Tabela donor_profiles
alter table public.donor_profiles enable row level security;
create policy "Donors can view their own profile" on public.donor_profiles for select using (auth.uid() = user_id);
create policy "Donors can update their own profile" on public.donor_profiles for update using (auth.uid() = user_id);

-- Tabela professional_profiles
alter table public.professional_profiles enable row level security;
create policy "Professionals can view their own profile" on public.professional_profiles for select using (auth.uid() = user_id);
create policy "Professionals can update their own profile" on public.professional_profiles for update using (auth.uid() = user_id);

-- Tabela hemocenters
alter table public.hemocenters enable row level security;
create policy "All authenticated users can view active hemocenters" on public.hemocenters for select to authenticated using (is_active = true);

-- Tabela stock_levels
alter table public.stock_levels enable row level security;
create policy "All authenticated users can view stock levels" on public.stock_levels for select to authenticated using (true);
create policy "Professionals can update their own hemocenter stock" on public.stock_levels for update using (
  auth.uid() in (select user_id from professional_profiles where hemocenter_id = stock_levels.hemocenter_id)
);

-- Tabela campaigns (CORREÇÃO APLICADA AQUI)
alter table public.campaigns enable row level security;
create policy "All authenticated users can view campaigns" on public.campaigns for select to authenticated using (true);
create policy "Professionals can manage their own hemocenter campaigns" on public.campaigns for all using (
  auth.uid() in (select user_id from professional_profiles where hemocenter_id = campaigns.hemocenter_id)
);

-- Tabela donor_applications
alter table public.donor_applications enable row level security;
create policy "Donors can manage their own applications" on public.donor_applications for all using (auth.uid() = donor_user_id);
create policy "Professionals can view applications for their hemocenter" on public.donor_applications for select using (
  auth.uid() in (select user_id from professional_profiles where hemocenter_id = donor_applications.hemocenter_id)
);
create policy "Professionals can update applications for their hemocenter" on public.donor_applications for update using (
  auth.uid() in (select user_id from professional_profiles where hemocenter_id = donor_applications.hemocenter_id)
);

-- ========= DADOS DE EXEMPLO (PARA TESTES) =========
-- Inserir um hemocentro de exemplo
insert into public.hemocenters (id, name, address, is_active)
values ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Hemocentro Vida', 'Rua da Esperança, 123', true);

-- Inserir estoque inicial para o hemocentro
insert into public.stock_levels (hemocenter_id, blood_type, level_percentage, status)
values
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'A+', 85, 'high'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'A-', 60, 'stable'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'B+', 45, 'low'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'B-', 75, 'stable'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'AB+', 90, 'high'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'AB-', 20, 'critical'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'O+', 55, 'stable'),
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'O-', 30, 'low');
