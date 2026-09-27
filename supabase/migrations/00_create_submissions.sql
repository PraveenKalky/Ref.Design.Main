-- Create the submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    normalised_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    image_url TEXT,
    logo_url TEXT,
    categories TEXT[] DEFAULT '{}'::TEXT[],
    styles TEXT[] DEFAULT '{}'::TEXT[],
    types TEXT[] DEFAULT '{}'::TEXT[],
    subjects TEXT[] DEFAULT '{}'::TEXT[],
    platforms TEXT[] DEFAULT '{}'::TEXT[],
    creator JSONB,
    contributors JSONB DEFAULT '[]'::JSONB,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    submitted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT
);

-- Ensure normalised_url is unique to prevent duplicate submissions
ALTER TABLE public.submissions ADD CONSTRAINT unique_normalised_url UNIQUE (normalised_url);

-- Enable Row Level Security
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved submissions
CREATE POLICY "Public can view approved submissions"
ON public.submissions
FOR SELECT
USING (status = 'Approved');

-- Policy: Users can view their own submissions regardless of status
CREATE POLICY "Users can view own submissions"
ON public.submissions
FOR SELECT
TO authenticated
USING (auth.uid() = submitted_by);

-- Policy: Users can insert their own submissions
CREATE POLICY "Users can insert own submissions"
ON public.submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = submitted_by);

-- Create a storage bucket for submission assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('submissions', 'submissions', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Anyone can view assets
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'submissions' );

-- Storage Policy: Authenticated users can upload assets
CREATE POLICY "Auth Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'submissions' );
