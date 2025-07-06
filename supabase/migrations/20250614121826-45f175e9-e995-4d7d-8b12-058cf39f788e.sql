
-- Drop the existing foreign key constraint on the messages table to redefine it.
-- The name 'messages_match_id_fkey' is the default used by Supabase, so this should work.
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_match_id_fkey;

-- Re-add the foreign key constraint with ON DELETE CASCADE.
-- This ensures that when a match is deleted, all associated messages are also deleted,
-- which will resolve the error you're seeing.
ALTER TABLE public.messages
ADD CONSTRAINT messages_match_id_fkey
FOREIGN KEY (match_id)
REFERENCES public.matches(id)
ON DELETE CASCADE;
