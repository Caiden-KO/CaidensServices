import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Coupon = {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expires_at: string | null;
  max_uses: number | null;
  times_used: number;
  active: boolean;
  created_at: string;
};

export type QuoteRequest = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  project_type: 'website' | 'web-app' | 'ecommerce' | 'landing-page' | 'other';
  budget: string | null;
  timeline: string | null;
  description: string;
  status: 'new' | 'reviewed' | 'responded' | 'closed';
  created_at: string;
};

export type PricingPlan = {
  id: string;
  name: string;
  price: number;
  tagline: string;
  features: string[];
  popular?: boolean;
  cta: string;
};

export type Profile = {
  id: string;
  username: string;
  two_factor_enabled: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  original_price: number;
  discount_amount: number;
  total_price: number;
  coupon_code: string | null;
  customer_email: string;
  customer_name: string;
  project_details: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
};

export type TotpSecret = {
  id: string;
  user_id: string;
  secret: string;
  verified: boolean;
  created_at: string;
};
