-- Add missing UPDATE and DELETE policies for ui_tastes
CREATE POLICY "Allow public update access" ON public.ui_tastes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON public.ui_tastes FOR DELETE USING (true);
