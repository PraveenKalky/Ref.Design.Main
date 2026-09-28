-- 05_admin_enhancements.sql
-- Add JSONB media column for handling multiple images and videos

-- 1. Submissions (Website Record)
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::JSONB;

-- 2. Website Pages
ALTER TABLE public.website_pages 
ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::JSONB;

-- 3. Website Sections
ALTER TABLE public.website_sections 
ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::JSONB;
