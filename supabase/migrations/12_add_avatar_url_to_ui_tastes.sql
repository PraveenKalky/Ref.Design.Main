-- Add avatar_url column to ui_tastes for creator profile photos
ALTER TABLE ui_tastes ADD COLUMN IF NOT EXISTS avatar_url text;
