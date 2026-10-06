-- ============================================================================
-- PERMANENT FIX & CLEANUP: RLS, CONSTRAINTS, AND ORPHAN DELETION
-- ============================================================================

-- 1. FORCE CLEANUP OF BROKEN/EMPTY RECORDS (Bypasses RLS when run in SQL Editor)
-- This deletes the specific 4 empty records we identified and any other completely blank rows.
DELETE FROM public.submissions
WHERE title = '' OR title IS NULL OR url = '' OR url IS NULL;

-- 2. FORCE CLEANUP OF DUPLICATE DIPCOIN RECORDS
-- Keeps the original Dipcoin (eafdb43c-28bc-4710-9abd-00ebbf8d3283) and removes the broken duplicates.
DELETE FROM public.submissions
WHERE title ILIKE '%dipcoin%' 
  AND id != 'eafdb43c-28bc-4710-9abd-00ebbf8d3283';

-- 3. ADD CHECK CONSTRAINTS TO PREVENT FUTURE BROKEN RECORDS
-- Ensures that the Chrome Extension/API cannot insert empty strings for critical fields.
ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_title_check CHECK (length(trim(title)) > 0),
  ADD CONSTRAINT submissions_url_check CHECK (length(trim(url)) > 0);

-- 4. ENSURE ON DELETE CASCADE FOR RELATIONS
-- If the foreign keys were created without CASCADE, we recreate them.
-- (Checking and fixing website_pages)
ALTER TABLE public.website_pages
  DROP CONSTRAINT IF EXISTS website_pages_website_id_fkey,
  ADD CONSTRAINT website_pages_website_id_fkey
  FOREIGN KEY (website_id)
  REFERENCES public.submissions(id)
  ON DELETE CASCADE;

-- (Checking and fixing website_sections)
ALTER TABLE public.website_sections
  DROP CONSTRAINT IF EXISTS website_sections_website_id_fkey,
  ADD CONSTRAINT website_sections_website_id_fkey
  FOREIGN KEY (website_id)
  REFERENCES public.submissions(id)
  ON DELETE CASCADE;

-- 5. GUARANTEE DELETE RLS POLICIES FOR AUTHENTICATED USERS
-- Drops existing delete policy to avoid conflicts, then creates a robust one.
DROP POLICY IF EXISTS "Users can delete own submissions" ON public.submissions;
CREATE POLICY "Users can delete own submissions"
ON public.submissions
FOR DELETE
TO authenticated
USING (auth.uid() = submitted_by);

-- Ensure website_sections and website_pages have cascading/matching RLS for deletes
DROP POLICY IF EXISTS "Users can manage own website sections" ON public.website_sections;
CREATE POLICY "Users can manage own website sections"
ON public.website_sections
FOR ALL
TO authenticated
USING ( website_id IN ( SELECT id FROM public.submissions WHERE submitted_by = auth.uid() ) );

DROP POLICY IF EXISTS "Users can manage own website pages" ON public.website_pages;
CREATE POLICY "Users can manage own website pages"
ON public.website_pages
FOR ALL
TO authenticated
USING ( website_id IN ( SELECT id FROM public.submissions WHERE submitted_by = auth.uid() ) );

