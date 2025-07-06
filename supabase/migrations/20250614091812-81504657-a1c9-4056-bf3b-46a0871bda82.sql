
-- Add the 'reactions' column to the 'messages' table
ALTER TABLE public.messages
ADD COLUMN reactions JSONB;

-- It's also good practice to ensure real-time is fully enabled for updates to this column
-- (though the previous migration already attempted to enable it for the table generally).
-- If not already set, ensure replica identity is full for the messages table.
-- This command was in the previous migration, but ensuring its context here.
-- ALTER TABLE public.messages REPLICA IDENTITY FULL; -- Already run in previous migration, commented out to avoid error.

-- Ensure the table is part of the supabase_realtime publication if it wasn't fully effective.
-- This was also in the previous migration.
-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE schemaname = 'public' AND tablename = 'messages' AND pubname = 'supabase_realtime') THEN
--     ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
--   END IF;
-- EXCEPTION
--   WHEN OTHERS THEN
--     RAISE WARNING 'An error occurred while trying to ensure messages table is in supabase_realtime publication: %', SQLERRM;
-- END;
-- $$;
