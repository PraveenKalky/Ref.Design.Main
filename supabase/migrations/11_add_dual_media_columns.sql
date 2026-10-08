-- 11_add_dual_media_columns.sql
-- Add thumbnail_url, fullpage_image_url, and use_separate_media to public.submissions

ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS fullpage_image_url TEXT,
ADD COLUMN IF NOT EXISTS use_separate_media BOOLEAN DEFAULT FALSE;

-- Sync existing image_url to thumbnail_url and fullpage_image_url for backward compatibility
UPDATE public.submissions 
SET 
  thumbnail_url = COALESCE(thumbnail_url, image_url),
  fullpage_image_url = COALESCE(fullpage_image_url, image_url)
WHERE thumbnail_url IS NULL OR fullpage_image_url IS NULL;
