-- Database schema for e-commerce admin dashboard

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Profiles table (for user profiles)
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  role text default 'admin' check (role in ('admin', 'staff')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Store settings table
create table if not exists store_settings (
  id uuid default uuid_generate_v4() primary key,
  store_name text not null,
  store_logo text,
  store_description text,
  currency text default 'USD',
  payment_provider text check (payment_provider in ('stripe', 'paystack')),
  stripe_public_key text,
  stripe_secret_key text,
  paystack_public_key text,
  paystack_secret_key text,
  shipping_enabled boolean default true,
  shipping_rates jsonb,
  store_status text default 'open' check (store_status in ('open', 'closed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories table
create table if not exists categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null,
  description text,
  image text,
  parent_id uuid references categories on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_slug unique (slug)
);

-- Products table
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null,
  description text,
  short_description text,
  price decimal(10, 2) not null,
  cost_price decimal(10, 2),
  stock_quantity integer default 0,
  sku text,
  barcode text,
  weight decimal(10, 2),
  dimensions jsonb,
  category_id uuid references categories on delete set null,
  featured boolean default false,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references profiles on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_product_slug unique (slug)
);

-- Product variants table
create table if not exists product_variants (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products on delete cascade not null,
  name text not null,
  sku text,
  price decimal(10, 2) not null,
  cost_price decimal(10, 2),
  stock_quantity integer default 0,
  barcode text,
  attributes jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product images table
create table if not exists product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products on delete cascade not null,
  variant_id uuid references product_variants on delete set null,
  image_url text not null,
  alt_text text,
  is_primary boolean default false,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders table
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text not null,
  customer_id uuid references profiles on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_address jsonb,
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal decimal(10, 2) not null,
  tax_amount decimal(10, 2) default 0,
  shipping_amount decimal(10, 2) default 0,
  discount_amount decimal(10, 2) default 0,
  total_amount decimal(10, 2) not null,
  payment_method text,
  payment_status text default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_order_number unique (order_number)
);

-- Order items table
create table if not exists order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders on delete cascade not null,
  product_id uuid references products on delete set null,
  product_name text not null,
  product_sku text,
  variant_id uuid references product_variants on delete set null,
  variant_name text,
  quantity integer not null,
  unit_price decimal(10, 2) not null,
  total_price decimal(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Customers table (denormalized for quick lookups)
create table if not exists customers (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  total_orders integer default 0,
  total_spent decimal(12, 2) default 0,
  last_order_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_customer_email unique (email)
);

-- Notifications table
create table if not exists notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles on delete cascade not null,
  title text not null,
  message text,
  type text default 'info' check (type in ('info', 'success', 'warning', 'error')),
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table store_settings enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table customers enable row level security;
alter table notifications enable row level security;

-- Policies for profiles
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Admins can manage profiles"
  on profiles for all
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Policies for store_settings
create policy "Anyone can view store settings"
  on store_settings for select
  using (true);

create policy "Admins can manage store settings"
  on store_settings for all
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Policies for categories
create policy "Anyone can view categories"
  on categories for select
  using (true);

create policy "Admins can manage categories"
  on categories for all
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Policies for products
create policy "Anyone can view published products"
  on products for select
  using (status = 'published');

create policy "Admins can manage products"
  on products for all
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Policies for product_variants
create policy "Anyone can view variants of published products"
  on product_variants for select
  using (exists (
    select 1 from products p where p.id = product_variants.product_id and p.status = 'published'
  ));

create policy "Admins can manage variants"
  on product_variants for all
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Policies for product_images
create policy "Anyone can view images of published products"
  on product_images for select
  using (exists (
    select 1 from products p where p.id = product_images.product_id and p.status = 'published'
  ));

create policy "Admins can manage images"
  on product_images for all
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Policies for orders
create policy "Admins can view all orders"
  on orders for select
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Admins can manage orders"
  on orders for all
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Policies for order_items
create policy "Admins can view all order items"
  on order_items for select
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Admins can manage order items"
  on order_items for all
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Policies for customers
create policy "Admins can view all customers"
  on customers for select
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Policies for notifications
create policy "Users can view own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Admins can manage notifications"
  on notifications for all
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Triggers for updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

create trigger update_store_settings_updated_at
  before update on store_settings
  for each row execute function update_updated_at_column();

create trigger update_categories_updated_at
  before update on categories
  for each row execute function update_updated_at_column();

create trigger update_products_updated_at
  before update on products
  for each row execute function update_updated_at_column();

create trigger update_product_variants_updated_at
  before update on product_variants
  for each row execute function update_updated_at_column();

create trigger update_product_images_updated_at
  before update on product_images
  for each row execute function update_updated_at_column();

create trigger update_orders_updated_at
  before update on orders
  for each row execute function update_updated_at_column();

create trigger update_customers_updated_at
  before update on customers
  for each row execute function update_updated_at_column();

-- Function to update customer stats when order is placed
create or replace function update_customer_stats()
returns trigger as $$
begin
  insert into customers (profile_id, full_name, email, total_orders, total_spent, last_order_at)
  values (
    new.customer_id,
    new.customer_name,
    new.customer_email,
    1,
    new.total_amount,
    new.created_at
  )
  on conflict (email) do update
  set
    total_orders = customers.total_orders + 1,
    total_spent = customers.total_spent + new.total_amount,
    last_order_at = new.created_at,
    full_name = coalesce(customers.full_name, new.customer_name);

  return new;
end;
$$ language plpgsql;

create trigger update_customer_stats_on_order
  after insert on orders
  for each row execute function update_customer_stats();

-- Function to handle new user registration
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'admin')
  );
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Insert default store settings if not exists
insert into store_settings (store_name, store_description, currency, shipping_rates, store_status)
values (
  'My Store',
  'Welcome to my store!',
  'USD',
  '{"standard": {"rate": 5.99, "free_threshold": 50}, "express": {"rate": 12.99}}',
  'open'
)
on conflict do nothing;
