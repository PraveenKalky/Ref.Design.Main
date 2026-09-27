-- Create the website_sections table for individual captured DOM sections
CREATE TABLE IF NOT EXISTS public.website_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL,
    section_title TEXT,
    image_url TEXT NOT NULL,
    page_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    status TEXT DEFAULT 'Approved' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_website_sections_website_id ON public.website_sections(website_id);
CREATE INDEX IF NOT EXISTS idx_website_sections_type ON public.website_sections(section_type);

-- Enable RLS
ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved sections
CREATE POLICY "Public can view approved sections"
ON public.website_sections
FOR SELECT
USING (status = 'Approved');
