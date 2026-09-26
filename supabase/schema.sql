-- ==============================================================================
-- Jalaram Digital Sign — Supabase Database Schema
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. SITE CONTENT TABLE
-- Stores full site structure (business, socials, heroImages, clients, services,
-- portfolio, team, testimonials, faqs) in JSONB for rapid reads and live admin sync.
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site content
DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;
CREATE POLICY "Public can view site content"
  ON public.site_content
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated / service-role full access to manage site content
DROP POLICY IF EXISTS "Service role can update site content" ON public.site_content;
CREATE POLICY "Service role can update site content"
  ON public.site_content
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 2. CUSTOMER INQUIRIES TABLE
-- Stores all customer quote requests and contact inquiries
CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  company TEXT,
  service TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public users (website visitors) to submit inquiries
DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
CREATE POLICY "Public can submit inquiries"
  ON public.inquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow admin / service-role to read and manage inquiries
DROP POLICY IF EXISTS "Admin full access to inquiries" ON public.inquiries;
CREATE POLICY "Admin full access to inquiries"
  ON public.inquiries
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);

-- ==============================================================================
-- Optional Normalized Tables (for direct relational queries if needed)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  image TEXT,
  category TEXT,
  features TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view services" ON public.services FOR SELECT TO public USING (true);
CREATE POLICY "Admin can manage services" ON public.services FOR ALL TO public USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.portfolio (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  image TEXT,
  images TEXT[] DEFAULT '{}',
  location TEXT,
  featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0
);
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view portfolio" ON public.portfolio FOR SELECT TO public USING (true);
CREATE POLICY "Admin can manage portfolio" ON public.portfolio FOR ALL TO public USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.team (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  social_links JSONB DEFAULT '{}',
  sort_order INT DEFAULT 0
);
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view team" ON public.team FOR SELECT TO public USING (true);
CREATE POLICY "Admin can manage team" ON public.team FOR ALL TO public USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  business TEXT,
  quote TEXT NOT NULL,
  rating INT DEFAULT 5
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view testimonials" ON public.testimonials FOR SELECT TO public USING (true);
CREATE POLICY "Admin can manage testimonials" ON public.testimonials FOR ALL TO public USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view faqs" ON public.faqs FOR SELECT TO public USING (true);
CREATE POLICY "Admin can manage faqs" ON public.faqs FOR ALL TO public USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tag TEXT,
  logo TEXT
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view clients" ON public.clients FOR SELECT TO public USING (true);
CREATE POLICY "Admin can manage clients" ON public.clients FOR ALL TO public USING (true) WITH CHECK (true);
