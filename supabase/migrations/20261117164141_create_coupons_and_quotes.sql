/*
# Create coupons and quote_requests tables

## Overview
This migration creates the core data tables for CaidensServices — a web development
freelance business site. The app has no sign-in screen (single-tenant), so all policies
are scoped to `anon, authenticated` with `USING (true)` because the data is intentionally
public/shared.

## New Tables

### coupons
Stores discount codes that customers can apply at checkout.
- `id` (uuid, primary key)
- `code` (text, unique) — the coupon code string customers type in
- `description` (text) — what the coupon is for
- `discount_type` (text) — 'percentage' or 'fixed'
- `discount_value` (numeric) — percentage (0-100) or dollar amount
- `expires_at` (timestamptz, nullable) — when the coupon expires (null = never)
- `max_uses` (integer, nullable) — max times it can be used (null = unlimited)
- `times_used` (integer, default 0) — how many times it has been redeemed
- `active` (boolean, default true) — can be toggled off to deactivate
- `created_at` (timestamptz, default now())

### quote_requests
Stores project quote requests submitted by potential clients through the contact form.
- `id` (uuid, primary key)
- `name` (text) — client's full name
- `email` (text) — client's email address
- `company` (text, nullable) — company name (optional, for businesses)
- `project_type` (text) — category: 'website', 'web-app', 'ecommerce', 'landing-page', 'other'
- `budget` (text, nullable) — estimated budget range
- `timeline` (text, nullable) — desired timeline
- `description` (text) — project details
- `status` (text, default 'new') — 'new', 'reviewed', 'responded', 'closed'
- `created_at` (timestamptz, default now())

## Security
- RLS enabled on both tables.
- CRUD granted to `anon, authenticated` (single-tenant, no auth screen).
- All policies use `USING (true)` / `WITH CHECK (true)` because data is intentionally
  public/shared in this no-auth app.
*/

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
  expires_at timestamptz,
  max_uses integer,
  times_used integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON coupons TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_coupons" ON coupons;
CREATE POLICY "anon_select_coupons" ON coupons FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_coupons" ON coupons;
CREATE POLICY "anon_insert_coupons" ON coupons FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_coupons" ON coupons;
CREATE POLICY "anon_update_coupons" ON coupons FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_coupons" ON coupons;
CREATE POLICY "anon_delete_coupons" ON coupons FOR DELETE
  TO anon, authenticated USING (true);

-- Quote requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  project_type text NOT NULL DEFAULT 'website' CHECK (project_type IN ('website', 'web-app', 'ecommerce', 'landing-page', 'other')),
  budget text,
  timeline text,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'responded', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON quote_requests TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_quotes" ON quote_requests;
CREATE POLICY "anon_select_quotes" ON quote_requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quotes" ON quote_requests;
CREATE POLICY "anon_insert_quotes" ON quote_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_quotes" ON quote_requests;
CREATE POLICY "anon_update_quotes" ON quote_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_quotes" ON quote_requests;
CREATE POLICY "anon_delete_quotes" ON quote_requests FOR DELETE
  TO anon, authenticated USING (true);

-- Index for looking up coupons by code
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons (code);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quote_requests (created_at DESC);