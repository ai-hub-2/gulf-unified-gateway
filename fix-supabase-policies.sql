-- Fix Supabase RLS Policies for Gulf Unified Platform
-- This ensures anonymous users can read and create links

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view chalets" ON public.chalets;
DROP POLICY IF EXISTS "Anyone can view carriers" ON public.shipping_carriers;
DROP POLICY IF EXISTS "Anyone can view providers" ON public.providers;
DROP POLICY IF EXISTS "Anyone can view links" ON public.links;
DROP POLICY IF EXISTS "Anyone can view payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can create links" ON public.links;
DROP POLICY IF EXISTS "Anyone can create payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can update payments" ON public.payments;

-- Enable RLS on all tables
ALTER TABLE public.chalets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for anonymous access
CREATE POLICY "Anyone can view chalets" ON public.chalets 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can view carriers" ON public.shipping_carriers 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can view providers" ON public.providers 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can view links" ON public.links 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can view payments" ON public.payments 
  FOR SELECT 
  USING (true);

-- Allow anonymous users to create links
CREATE POLICY "Anyone can create links" ON public.links 
  FOR INSERT 
  WITH CHECK (true);

-- Allow anonymous users to create payments
CREATE POLICY "Anyone can create payments" ON public.payments 
  FOR INSERT 
  WITH CHECK (true);

-- Allow anonymous users to update payments
CREATE POLICY "Anyone can update payments" ON public.payments 
  FOR UPDATE 
  USING (true);
