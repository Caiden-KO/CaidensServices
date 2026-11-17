/*
# Add profiles, orders, and totp_secrets tables for auth + 2FA + orders

## Overview
This migration adds user profiles (storing usernames), order records (for saved
checkout data), and TOTP secrets (for 2FA verification). The app now has a sign-in
screen, so policies are scoped to `authenticated` with ownership checks via
`auth.uid()`.

## New Tables

### profiles
Stores the public profile for each user — specifically their chosen username.
- `id` (uuid, primary key, references auth.users on delete cascade)
- `username` (text, unique, not null) — the display name chosen at signup
- `two_factor_enabled` (boolean, default false) — whether 2FA is active
- `created_at` (timestamptz, default now())

### totp_secrets
Stores the TOTP shared secret for users who have enrolled in 2FA.
- `id` (uuid, primary key)
- `user_id` (uuid, not null, references auth.users on delete cascade)
- `secret` (text, not null) — base32-encoded TOTP secret
- `verified` (boolean, default false) — whether the user completed verification
- `created_at` (timestamptz, default now())

### orders
Stores checkout orders placed by authenticated users.
- `id` (uuid, primary key)
- `user_id` (uuid, not null, defaults to auth.uid(), references auth.users on delete cascade)
- `plan_id` (text, not null) — which pricing plan was selected
- `plan_name` (text, not null) — plan name at time of order
- `original_price` (numeric, not null) — plan price before discount
- `discount_amount` (numeric, default 0) — how much was discounted
- `total_price` (numeric, not null) — final price paid
- `coupon_code` (text, nullable) — coupon code used if any
- `customer_email` (text, not null) — email for receipt
- `customer_name` (text, not null) — name on the order
- `project_details` (text, nullable) — optional project description
- `status` (text, default 'pending') — pending, confirmed, completed, cancelled
- `created_at` (timestamptz, default now())

## Security
- RLS enabled on all new tables.
- profiles: authenticated users can read/update their own profile. INSERT is handled
  via a trigger or the frontend after signup.
- totp_secrets: only the owner can read/insert/update/delete their own secret.
- orders: only the owner can read/insert their orders. service_role also has access
  for the email receipt edge function.
- All owner columns default to auth.uid() so inserts that omit user_id succeed.
*/

-- =====================
-- PROFILES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  two_factor_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =====================
-- TOTP SECRETS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS totp_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE totp_secrets ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON totp_secrets TO authenticated;

DROP POLICY IF EXISTS "select_own_totp" ON totp_secrets;
CREATE POLICY "select_own_totp" ON totp_secrets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_totp" ON totp_secrets;
CREATE POLICY "insert_own_totp" ON totp_secrets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_totp" ON totp_secrets;
CREATE POLICY "update_own_totp" ON totp_secrets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_totp" ON totp_secrets;
CREATE POLICY "delete_own_totp" ON totp_secrets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =====================
-- ORDERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL,
  plan_name text NOT NULL,
  original_price numeric NOT NULL,
  discount_amount numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL,
  coupon_code text,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  project_details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT ON orders TO service_role;

DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_orders" ON orders;
CREATE POLICY "delete_own_orders" ON orders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Index for looking up orders by user
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_totp_user_id ON totp_secrets (user_id);
