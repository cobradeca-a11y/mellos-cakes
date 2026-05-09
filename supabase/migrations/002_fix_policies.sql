-- =============================================
-- FIX: RLS policies para permitir operações autenticadas
-- =============================================

-- Remover policies conflitantes e recriar de forma simples e funcional

-- CUSTOMERS
drop policy if exists "Authenticated users read" on public.customers;
drop policy if exists "Authenticated users write" on public.customers;
create policy "Enable all for authenticated" on public.customers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PRODUCTS
drop policy if exists "Authenticated users read" on public.products;
drop policy if exists "Authenticated users write" on public.products;
create policy "Enable all for authenticated" on public.products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PRODUCT CATEGORIES
drop policy if exists "Authenticated users read" on public.product_categories;
drop policy if exists "Authenticated users write" on public.product_categories;
create policy "Enable all for authenticated" on public.product_categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PRODUCT VARIANTS
drop policy if exists "Authenticated users read" on public.product_variants;
drop policy if exists "Authenticated users write" on public.product_variants;
create policy "Enable all for authenticated" on public.product_variants
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- INGREDIENTS
drop policy if exists "Authenticated users read" on public.ingredients;
drop policy if exists "Authenticated users write" on public.ingredients;
create policy "Enable all for authenticated" on public.ingredients
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- INGREDIENT MOVEMENTS
drop policy if exists "Authenticated users read" on public.ingredient_movements;
drop policy if exists "Authenticated users write" on public.ingredient_movements;
create policy "Enable all for authenticated" on public.ingredient_movements
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- SUPPLIERS
drop policy if exists "Authenticated users read" on public.suppliers;
drop policy if exists "Authenticated users write" on public.suppliers;
create policy "Enable all for authenticated" on public.suppliers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- RECIPES
drop policy if exists "Authenticated users read" on public.recipes;
drop policy if exists "Authenticated users write" on public.recipes;
create policy "Enable all for authenticated" on public.recipes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- RECIPE ITEMS
drop policy if exists "Authenticated users read" on public.recipe_items;
drop policy if exists "Authenticated users write" on public.recipe_items;
create policy "Enable all for authenticated" on public.recipe_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- RECIPE COMPOSITIONS
drop policy if exists "Authenticated users read" on public.recipe_compositions;
drop policy if exists "Authenticated users write" on public.recipe_compositions;
create policy "Enable all for authenticated" on public.recipe_compositions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ORDERS
drop policy if exists "Authenticated users read" on public.orders;
drop policy if exists "Authenticated users write" on public.orders;
create policy "Enable all for authenticated" on public.orders
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ORDER ITEMS
drop policy if exists "Authenticated users read" on public.order_items;
drop policy if exists "Authenticated users write" on public.order_items;
create policy "Enable all for authenticated" on public.order_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- QUOTES
drop policy if exists "Authenticated users read" on public.quotes;
drop policy if exists "Authenticated users write" on public.quotes;
create policy "Enable all for authenticated" on public.quotes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- QUOTE ITEMS
drop policy if exists "Authenticated users read" on public.quote_items;
drop policy if exists "Authenticated users write" on public.quote_items;
create policy "Enable all for authenticated" on public.quote_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PRODUCTION TASKS
drop policy if exists "Authenticated users read" on public.production_tasks;
drop policy if exists "Authenticated users write" on public.production_tasks;
create policy "Enable all for authenticated" on public.production_tasks
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- DELIVERIES
drop policy if exists "Authenticated users read" on public.deliveries;
drop policy if exists "Authenticated users write" on public.deliveries;
create policy "Enable all for authenticated" on public.deliveries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- CASHFLOW ENTRIES
drop policy if exists "Authenticated users read" on public.cashflow_entries;
drop policy if exists "Authenticated users write" on public.cashflow_entries;
create policy "Enable all for authenticated" on public.cashflow_entries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- CONTENT POSTS
drop policy if exists "Authenticated users read" on public.content_posts;
drop policy if exists "Authenticated users write" on public.content_posts;
create policy "Enable all for authenticated" on public.content_posts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- CONTENT CAMPAIGNS
drop policy if exists "Authenticated users read" on public.content_campaigns;
drop policy if exists "Authenticated users write" on public.content_campaigns;
create policy "Enable all for authenticated" on public.content_campaigns
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PURCHASE ORDERS
drop policy if exists "Authenticated users read" on public.purchase_orders;
drop policy if exists "Authenticated users write" on public.purchase_orders;
create policy "Enable all for authenticated" on public.purchase_orders
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- PURCHASE ORDER ITEMS
drop policy if exists "Authenticated users read" on public.purchase_order_items;
drop policy if exists "Authenticated users write" on public.purchase_order_items;
create policy "Enable all for authenticated" on public.purchase_order_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- BUSINESS SETTINGS
drop policy if exists "Authenticated users read settings" on public.business_settings;
drop policy if exists "Admins update settings" on public.business_settings;
create policy "Enable all for authenticated" on public.business_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- NOTIFICATIONS
drop policy if exists "Users see own notifications" on public.notifications;
drop policy if exists "Users update own notifications" on public.notifications;
create policy "Enable all for authenticated" on public.notifications
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- AUDIT LOGS
drop policy if exists "Authenticated users read audit" on public.audit_logs;
drop policy if exists "Service role write audit" on public.audit_logs;
create policy "Enable all for authenticated" on public.audit_logs
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- CUSTOMER NOTES
drop policy if exists "Enable all for authenticated" on public.customer_notes;
create policy "Enable all for authenticated" on public.customer_notes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
