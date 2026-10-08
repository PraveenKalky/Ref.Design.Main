-- 10_sections_standalone.sql
-- Extend website_sections table to support standalone uploads
-- and tag-based discovery on the Sections library page.

-- 1. Allow website_id to be nullable (standalone sections have no parent website)
ALTER TABLE public.website_sections
  ALTER COLUMN website_id DROP NOT NULL;

-- 2. Add columns for standalone uploads, tags, and popularity
ALTER TABLE public.website_sections
  ADD COLUMN IF NOT EXISTS is_standalone BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS save_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id);

-- 3. Performance indexes
CREATE INDEX IF NOT EXISTS idx_ws_standalone
  ON public.website_sections(is_standalone);

CREATE INDEX IF NOT EXISTS idx_ws_tags
  ON public.website_sections USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_ws_save_count
  ON public.website_sections(save_count DESC);

CREATE INDEX IF NOT EXISTS idx_ws_section_type_status
  ON public.website_sections(section_type, status);

CREATE INDEX IF NOT EXISTS idx_ws_created_at
  ON public.website_sections(created_at DESC);

-- 4. RLS: Public can view approved sections (already exists, kept for safety)
DROP POLICY IF EXISTS "Public can view approved sections" ON public.website_sections;
CREATE POLICY "Public can view approved sections"
ON public.website_sections
FOR SELECT
USING (status = 'Approved');

-- 5. RLS: Authenticated users can INSERT their own standalone sections
DROP POLICY IF EXISTS "Users can insert own sections" ON public.website_sections;
CREATE POLICY "Users can insert own sections"
ON public.website_sections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = submitted_by OR submitted_by IS NULL);

-- 6. RLS: Users can manage their own sections (rename, delete)
DROP POLICY IF EXISTS "Users can manage own website sections" ON public.website_sections;
CREATE POLICY "Users can manage own website sections"
ON public.website_sections
FOR ALL
TO authenticated
USING (
  submitted_by = auth.uid()
  OR
  website_id IN (
    SELECT id FROM public.submissions WHERE submitted_by = auth.uid()
  )
);
