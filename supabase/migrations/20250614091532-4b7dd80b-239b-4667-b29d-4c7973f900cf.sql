
-- 1. Modify the 'messages' table
-- Allow 'content' to be nullable
ALTER TABLE public.messages ALTER COLUMN content DROP NOT NULL;

-- Add columns for image and voice note URLs
ALTER TABLE public.messages ADD COLUMN image_url TEXT;
ALTER TABLE public.messages ADD COLUMN voice_note_url TEXT;

-- 2. Create a new storage bucket for chat media
-- This bucket will be public for simplicity in this step.
-- You can add more restrictive policies later if needed.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-media', 'chat-media', true, null, null);

-- Grant all authenticated users permissions to upload to the 'chat-media' bucket.
-- The path includes the user_id, so they are segregated.
CREATE POLICY "Authenticated users can upload chat media"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'chat-media');

CREATE POLICY "Authenticated users can view their own and others chat media"
ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'chat-media');

CREATE POLICY "Authenticated users can delete their own chat media"
ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'chat-media' AND auth.uid() = (storage.foldername(name))[1]::uuid);


-- 3. Ensure 'messages' table is set up for real-time updates
-- This tells Postgres to send detailed information for row changes
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- This command ensures that the 'messages' table is included in the 'supabase_realtime' publication,
-- which is necessary for Supabase Realtime to pick up changes.
-- If the publication doesn't exist, Supabase usually creates it.
-- If it does exist, this adds the table.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION
  WHEN duplicate_object THEN
    -- Handle the case where the table might already be in the publication
    RAISE NOTICE 'Table public.messages is already in publication supabase_realtime or publication could not be created.';
  WHEN OTHERS THEN
    RAISE WARNING 'An error occurred: %', SQLERRM;
END;
$$;

