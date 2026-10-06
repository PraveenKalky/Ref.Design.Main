-- 07_ensure_website_pages_path.sql
-- Ensure path column exists on website_pages, backfill NULL values from slug, set DEFAULT, and ensure correct FK to public.submissions

ALTER TABLE public.website_pages ADD COLUMN IF NOT EXISTS path TEXT;

-- Backfill path from slug if any existing records have NULL path
UPDATE public.website_pages SET path = slug WHERE path IS NULL;
UPDATE public.website_pages SET path = '/' WHERE path IS NULL OR path = '';

-- Ensure DEFAULT value on column
ALTER TABLE public.website_pages ALTER COLUMN path SET DEFAULT '/';

-- Ensure foreign key website_pages_website_id_fkey references public.submissions(id)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'website_pages_website_id_fkey' 
        AND table_name = 'website_pages'
    ) THEN
        ALTER TABLE public.website_pages DROP CONSTRAINT website_pages_website_id_fkey;
    END IF;
END $$;

ALTER TABLE public.website_pages 
ADD CONSTRAINT website_pages_website_id_fkey 
FOREIGN KEY (website_id) REFERENCES public.submissions(id) ON DELETE CASCADE;
