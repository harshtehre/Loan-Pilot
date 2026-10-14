-- LoanPilot AI production Supabase schema
create extension if not exists "uuid-ossp";

create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  business_type text check (business_type in ('nbfc','fintech_startup','loan_agency','consultant')),
  plan text not null default 'starter' check (plan in ('starter','business','professional','enterprise')),
  created_at timestamptz not null default now()
);

create table if not exists organization_settings (
  organization_id uuid primary key references organizations(id) on delete cascade,
  ai_detail text not null default 'standard' check (ai_detail in ('concise','standard','detailed')),
  notification_preferences jsonb not null default '{"new_application":true,"high_risk":true}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  full_name text,
  email text not null,
  status text not null default 'active' check (status in ('active','disabled')),
  created_at timestamptz not null default now()
);

create table if not exists roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  role text not null check (role in ('owner','admin','loan_officer','analyst','viewer')),
  unique(user_id, organization_id)
);

create table if not exists loan_products (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  interest_rate numeric(5,2) not null,
  min_credit_score int,
  min_monthly_income numeric(12,2),
  max_loan_amount numeric(12,2) not null,
  min_tenure_months int not null,
  max_tenure_months int not null,
  employment_requirements jsonb not null default '{}',
  eligibility_rules jsonb not null default '{}',
  required_documents text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists applicants (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  full_name text not null,
  age int,
  gender text,
  phone text,
  email text,
  address text,
  employment_type text,
  company text,
  employment_years numeric(4,1),
  monthly_income numeric(12,2),
  created_at timestamptz not null default now()
);

create table if not exists financial_profiles (
  id uuid primary key default uuid_generate_v4(),
  applicant_id uuid not null references applicants(id) on delete cascade,
  monthly_expenses numeric(12,2),
  existing_emi numeric(12,2),
  dependents int not null default 0,
  savings numeric(12,2),
  credit_score int,
  created_at timestamptz not null default now()
);

create table if not exists applications (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  applicant_id uuid not null references applicants(id) on delete cascade,
  assigned_officer_id uuid references users(id),
  requested_amount numeric(12,2) not null,
  requested_tenure_months int not null,
  status text not null default 'draft' check (status in ('draft','submitted','under_review','ai_analysis','approved','rejected','needs_documents')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references applications(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  doc_type text not null check (doc_type in ('id_proof','income_proof','bank_statement','employment_proof','other')),
  storage_path text not null,
  original_name text,
  mime_type text,
  file_size bigint,
  extracted_fields jsonb not null default '{}',
  confidence numeric(4,3),
  status text not null default 'pending' check (status in ('pending','validated','needs_review','provider_required')),
  uploaded_at timestamptz not null default now()
);

create table if not exists eligibility_results (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references applications(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  score int not null check (score between 0 and 100),
  model_version text not null,
  feature_explanations jsonb not null default '{}',
  predicted_at timestamptz not null default now()
);

create table if not exists risk_assessments (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references applications(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  risk_level text not null check (risk_level in ('low','medium','high')),
  positive_factors jsonb not null default '[]',
  risk_factors jsonb not null default '[]',
  recommended_action text,
  model_version text not null,
  assessed_at timestamptz not null default now()
);

create table if not exists ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id),
  application_id uuid references applications(id),
  title text,
  created_at timestamptz not null default now()
);

create table if not exists ai_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references applications(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  storage_path text,
  generated_by uuid references users(id),
  generated_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  plan text not null,
  status text not null default 'inactive',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references users(id),
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references users(id),
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function current_org_id() returns uuid
language sql stable security definer set search_path = public
as $$ select organization_id from public.users where id = auth.uid() $$;

create or replace function app_current_role() returns text
language sql stable security definer set search_path = public
as $$ select role from public.roles where user_id = auth.uid() limit 1 $$;
