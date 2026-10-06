-- 08_add_delete_update_policies.sql
-- Add missing DELETE and UPDATE policies for submissions and related tables

-- 1. Submissions DELETE Policy
CREATE POLICY "Users can delete own submissions"
ON public.submissions
FOR DELETE
TO authenticated
USING (auth.uid() = submitted_by);

-- 2. Submissions UPDATE Policy
CREATE POLICY "Users can update own submissions"
ON public.submissions
FOR UPDATE
TO authenticated
USING (auth.uid() = submitted_by);

-- 3. Website Sections UPDATE/DELETE Policies
CREATE POLICY "Users can manage own website sections"
ON public.website_sections
FOR ALL
TO authenticated
USING (
    website_id IN (
        SELECT id FROM public.submissions WHERE submitted_by = auth.uid()
    )
)
WITH CHECK (
    website_id IN (
        SELECT id FROM public.submissions WHERE submitted_by = auth.uid()
    )
);

