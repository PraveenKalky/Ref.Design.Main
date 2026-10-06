-- Run this in your Supabase SQL Editor to clean up existing duplicate Dipcoins
-- It relies on ON DELETE CASCADE to remove associated pages and sections

DELETE FROM public.submissions
WHERE title ILIKE '%dipcoin%';

-- To verify:
SELECT id, title FROM public.submissions WHERE title ILIKE '%dipcoin%';
