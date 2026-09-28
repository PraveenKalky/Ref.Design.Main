-- 04_create_website_pages.sql
-- Creates the website_pages table and enhances submissions and website_sections

-- 1. Add thumbnail_url and fullpage_image_url to public.submissions if they don't exist
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS fullpage_image_url TEXT;

-- Sync existing image_url to thumbnail_url for backward compatibility
UPDATE public.submissions 
SET thumbnail_url = image_url 
WHERE thumbnail_url IS NULL AND image_url IS NOT NULL;

-- 2. Create the website_pages table for internal routes discovered/captured
CREATE TABLE IF NOT EXISTS public.website_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    slug TEXT NOT NULL,
    page_title TEXT NOT NULL,
    page_type TEXT DEFAULT 'page',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_website_page UNIQUE (website_id, slug)
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_website_pages_website_id ON public.website_pages(website_id);
CREATE INDEX IF NOT EXISTS idx_website_pages_slug ON public.website_pages(slug);

-- 3. Add page_id reference to public.website_sections
ALTER TABLE public.website_sections 
ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES public.website_pages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_website_sections_page_id ON public.website_sections(page_id);

-- 4. Enable RLS on website_pages
ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;

-- Public can view pages
CREATE POLICY "Public can view website pages"
ON public.website_pages
FOR SELECT
USING (true);

-- Authenticated / Service Role can insert and update
CREATE POLICY "Auth can manage website pages"
ON public.website_pages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
