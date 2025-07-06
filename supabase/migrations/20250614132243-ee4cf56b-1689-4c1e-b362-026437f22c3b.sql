
-- Add a column to profiles to track visibility
ALTER TABLE public.profiles
ADD COLUMN is_visible BOOLEAN NOT NULL DEFAULT TRUE;
