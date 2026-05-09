-- =============================================
-- MELLOS CAKES - COMPLETE DATABASE SCHEMA
-- =============================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- =============================================
-- PROFILES & AUTH
-- =============================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text not null,
  role text not null default 'atendente' check (role in ('admin','financeiro','producao','social_media','atendente')),
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- BUSINESS SETTINGS
-- =============================================

create table public.business_settings (
  id uuid primary key default uuid_generate_v4(),
  name text not null default 'MellosCakes',
  logo_url text,
  phone text,
  email text,
  address jsonb,
  currency text not null default 'BRL',
  default_markup numeric not null default 2.5,
  payment_methods text[] default array['pix','dinheiro','cartao_credito','cartao_debito'],
  social_channels jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- CUSTOMERS
-- =============================================

create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_settings(id),
  name text not null,
  phone text,
  email text,
  address jsonb,
  birthdate date,
  preferences text,
  restrictions text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_notes (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id) on delete cascade not null,
  content text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- =============================================
-- PRODUCT CATALOG
-- =============================================

create table public.product_categories (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_settings(id),
  name text not null,
  description text,
  sort_order int default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_settings(id),
  category_id uuid references public.product_categories(id),
  name text not null,
  description text,
  base_price numeric not null default 0,
  images text[] default '{}',
  min_production_days int not null default 3,
  available boolean not null default true,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade not null,
  name text not null,
  weight_kg numeric,
  servings int,
  price_modifier numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =============================================
-- SUPPLIERS
-- =============================================

create table public.suppliers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_settings(id),
  name text not null,
  contact_name text,
  phone text,
  email text,
  address jsonb,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- INGREDIENTS & STOCK
-- =============================================

create table public.ingredients (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_settings(id),
  name text not null,
  category text,
  supplier_id uuid references public.suppliers(id),
  unit text not null default 'kg',
  cost_per_unit numeric not null default 0,
  stock_quantity numeric not null default 0,
  min_stock numeric not null default 0,
  expiry_date date,
  lot text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ingredient_movements (
  id uuid primary key default uuid_generate_v4(),
  ingredient_id uuid references public.ingredients(id) on delete cascade not null,
  type text not null check (type in ('entrada','saida','ajuste','consumo')),
  quantity numeric not null,
  unit_cost numeric,
  reason text,
  order_id uuid,
  purchase_order_id uuid,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- =============================================
-- RECIPES
-- =============================================

create table public.recipes (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_settings(id),
  name text not null,
  category text,
  yield_quantity numeric not null default 1,
  yield_unit text not null default 'unidade',
  prep_time_minutes int,
  instructions text,
  notes text,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recipe_items (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  ingredient_id uuid references public.ingredients(id) not null,
  quantity numeric not null,
  unit text not null,
  notes text
);

create table public.recipe_compositions (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade not null,
  recipe_id uuid references public.recipes(id) not null,
  role text not null check (role in ('massa','recheio','cobertura','decoracao','complemento')),
  quantity numeric not null default 1,
  notes text
);

-- =============================================
-- PURCHASE ORDERS
-- =============================================

create table public.purchase_orders (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_settings(id),
  supplier_id uuid references public.suppliers(id),
  status text not null default 'pendente' check (status in ('pendente','confirmado','recebido','cancelado')),
  total_amount numeric not null default 0,
  expected_delivery date,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.purchase_order_items (
  id uuid primary key default uuid_generate_v4(),
  purchase_order_id uuid references public.purchase_orders(id) on delete cascade not null,
  ingredient_id uuid references public.ingredients(id) not null,
  quantity numeric not null,
  unit_price numeric not null,
  total_price numeric not null,
  received_quantity numeric default 0
);

-- =============================================
-- QUOTES & ORDERS
-- =============================================

create table public.quotes (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_settings(id),
  customer_id uuid references public.customers(id),
  quote_number text not null,
  status text not null default 'rascunho' check (status in ('rascunho','enviado','aprovado','recusado','expirado')),
  total_amount numeric not null default 0,
  valid_until date,
  deposit_required numeric default 0,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quote_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid references public.quotes(id) on delete cascade not null,
  product_id uuid references public.products(id),
  description text not null,
  quantity int not null default 1,
  unit_price numeric not null,
  total_price numeric not null,
  customizations text
);

create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_settings(id),
  customer_id uuid references public.customers(id),
  quote_id uuid references public.quotes(id),
  order_number text not null,
  status text not null default 'confirmado' check (status in ('orcamento','confirmado','em_producao','finalizado','entregue','cancelado')),
  total_amount numeric not null default 0,
  estimated_cost numeric default 0,
  deposit_paid numeric not null default 0,
  balance_due numeric not null default 0,
  payment_method text,
  delivery_date timestamptz not null,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id),
  description text not null,
  quantity int not null default 1,
  unit_price numeric not null,
  total_price numeric not null,
  customizations text,
  estimated_cost numeric default 0
);

-- =============================================
-- PRODUCTION & DELIVERY
-- =============================================

create table public.production_tasks (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_settings(id),
  order_id uuid references public.orders(id) on delete cascade not null,
  order_item_id uuid references public.order_items(id),
  title text not null,
  description text,
  priority int not null default 2 check (priority between 1 and 5),
  scheduled_date date,
  scheduled_time time,
  duration_minutes int,
  completed boolean not null default false,
  completed_at timestamptz,
  assigned_to uuid references public.profiles(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deliveries (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  type text not null default 'retirada' check (type in ('retirada','entrega')),
  address jsonb,
  contact_name text,
  contact_phone text,
  delivery_fee numeric default 0,
  scheduled_at timestamptz,
  status text not null default 'pendente' check (status in ('pendente','em_rota','entregue','cancelado')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- FINANCIAL
-- =============================================

create table public.cashflow_entries (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_settings(id),
  type text not null check (type in ('receita','despesa')),
  category text not null,
  description text not null,
  amount numeric not null,
  date date not null,
  payment_method text,
  order_id uuid references public.orders(id),
  paid boolean not null default false,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- SOCIAL MEDIA
-- =============================================

create table public.content_campaigns (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_settings(id),
  name text not null,
  description text,
  start_date date,
  end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.content_posts (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_settings(id),
  campaign_id uuid references public.content_campaigns(id),
  title text not null,
  caption text,
  hashtags text,
  cta text,
  channel text not null check (channel in ('instagram','facebook','whatsapp','tiktok')),
  status text not null default 'ideia' check (status in ('ideia','rascunho','aprovado','agendado','publicado')),
  scheduled_at timestamptz,
  published_at timestamptz,
  media_urls text[] default '{}',
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  business_id uuid references public.business_settings(id),
  type text not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

-- =============================================
-- AUDIT LOGS
-- =============================================

create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_settings(id),
  user_id uuid references public.profiles(id),
  table_name text not null,
  record_id uuid not null,
  action text not null check (action in ('insert','update','delete')),
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

-- =============================================
-- INDEXES
-- =============================================

create index idx_customers_name on public.customers using gin (name gin_trgm_ops);
create index idx_customers_phone on public.customers(phone);
create index idx_products_name on public.products using gin (name gin_trgm_ops);
create index idx_ingredients_name on public.ingredients using gin (name gin_trgm_ops);
create index idx_orders_status on public.orders(status);
create index idx_orders_delivery_date on public.orders(delivery_date);
create index idx_orders_customer on public.orders(customer_id);
create index idx_cashflow_date on public.cashflow_entries(date);
create index idx_cashflow_type on public.cashflow_entries(type);
create index idx_content_posts_status on public.content_posts(status);
create index idx_content_posts_scheduled on public.content_posts(scheduled_at);
create index idx_notifications_user on public.notifications(user_id, read);
create index idx_audit_logs_table on public.audit_logs(table_name, record_id);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.ingredients for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.recipes for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.suppliers for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.cashflow_entries for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.content_posts for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.deliveries for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.production_tasks for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.purchase_orders for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.quotes for each row execute function public.set_updated_at();

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_variants enable row level security;
alter table public.ingredients enable row level security;
alter table public.ingredient_movements enable row level security;
alter table public.suppliers enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_items enable row level security;
alter table public.recipe_compositions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.production_tasks enable row level security;
alter table public.deliveries enable row level security;
alter table public.cashflow_entries enable row level security;
alter table public.content_posts enable row level security;
alter table public.content_campaigns enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.business_settings enable row level security;

-- Profiles: users can read own, admin reads all
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins manage all profiles" on public.profiles using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Generic authenticated access for operational tables
create policy "Authenticated users read" on public.customers for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.customers for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.products for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.products for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.product_categories for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.product_categories for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.ingredients for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.ingredients for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.ingredient_movements for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.ingredient_movements for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.suppliers for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.suppliers for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.recipes for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.recipes for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.recipe_items for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.recipe_items for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.recipe_compositions for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.recipe_compositions for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.orders for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.orders for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.order_items for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.order_items for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.quotes for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.quotes for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.quote_items for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.quote_items for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.production_tasks for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.production_tasks for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.deliveries for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.deliveries for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.cashflow_entries for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.cashflow_entries for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.content_posts for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.content_posts for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.content_campaigns for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.content_campaigns for all using (auth.role() = 'authenticated');

create policy "Users see own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);

create policy "Authenticated users read audit" on public.audit_logs for select using (auth.role() = 'authenticated');
create policy "Service role write audit" on public.audit_logs for insert with check (true);

create policy "Authenticated users read" on public.purchase_orders for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.purchase_orders for all using (auth.role() = 'authenticated');

create policy "Authenticated users read" on public.purchase_order_items for select using (auth.role() = 'authenticated');
create policy "Authenticated users write" on public.purchase_order_items for all using (auth.role() = 'authenticated');

create policy "Authenticated users read settings" on public.business_settings for select using (auth.role() = 'authenticated');
create policy "Admins update settings" on public.business_settings for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- =============================================
-- STORAGE BUCKETS
-- =============================================

insert into storage.buckets (id, name, public) values ('products', 'products', true);
insert into storage.buckets (id, name, public) values ('ingredients', 'ingredients', false);
insert into storage.buckets (id, name, public) values ('recipes', 'recipes', true);
insert into storage.buckets (id, name, public) values ('social-media', 'social-media', true);
insert into storage.buckets (id, name, public) values ('business', 'business', true);

create policy "Public read products" on storage.objects for select using (bucket_id = 'products');
create policy "Auth upload products" on storage.objects for insert with check (bucket_id = 'products' and auth.role() = 'authenticated');
create policy "Auth delete products" on storage.objects for delete using (bucket_id = 'products' and auth.role() = 'authenticated');

create policy "Public read recipes" on storage.objects for select using (bucket_id = 'recipes');
create policy "Auth upload recipes" on storage.objects for insert with check (bucket_id = 'recipes' and auth.role() = 'authenticated');

create policy "Public read social" on storage.objects for select using (bucket_id = 'social-media');
create policy "Auth upload social" on storage.objects for insert with check (bucket_id = 'social-media' and auth.role() = 'authenticated');

create policy "Public read business" on storage.objects for select using (bucket_id = 'business');
create policy "Auth upload business" on storage.objects for insert with check (bucket_id = 'business' and auth.role() = 'authenticated');

-- =============================================
-- INITIAL DATA
-- =============================================

insert into public.business_settings (name, currency, default_markup)
values ('MellosCakes', 'BRL', 2.5);
