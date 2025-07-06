
-- Add seen_at column to messages table
ALTER TABLE public.messages
ADD COLUMN seen_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS for messages table if not already enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies for messages table to avoid conflicts (optional, but good for a clean slate)
DROP POLICY IF EXISTS "Allow all access to messages" ON public.messages; -- Example, adjust if you have specific existing policies
DROP POLICY IF EXISTS "Users can view messages in their match" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their match" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages or reactions" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;


-- RLS Policies for messages table
CREATE POLICY "Users can view messages in their match"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.matches m
    WHERE m.id = messages.match_id AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can insert messages in their match"
ON public.messages FOR INSERT
WITH CHECK (
  messages.sender_id = auth.uid() AND
  EXISTS (
    SELECT 1
    FROM public.matches m
    WHERE m.id = messages.match_id AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can update messages in their match" -- For reactions and seen_at
ON public.messages FOR UPDATE
USING ( -- Who can attempt an update
  EXISTS (
    SELECT 1
    FROM public.matches m
    WHERE m.id = messages.match_id AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
)
WITH CHECK ( -- What conditions must the update satisfy
  EXISTS (
    SELECT 1
    FROM public.matches m
    WHERE m.id = messages.match_id AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
  -- Application logic will differentiate between updating 'reactions' and 'seen_at'.
  -- For 'seen_at', app should ensure only recipient updates.
  -- For 'reactions', app allows any participant.
);


CREATE POLICY "Users can delete their own messages"
ON public.messages FOR DELETE
USING (
  messages.sender_id = auth.uid()
);

-- Enable RLS for matches table if not already enabled
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies for matches table (optional)
DROP POLICY IF EXISTS "Allow all access to matches" ON public.matches; -- Example
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can delete their own matches" ON public.matches;


-- RLS Policies for matches table
CREATE POLICY "Users can view their own matches"
ON public.matches FOR SELECT
USING (
  matches.user1_id = auth.uid() OR matches.user2_id = auth.uid()
);

CREATE POLICY "Users can delete their own matches"
ON public.matches FOR DELETE
USING (
  matches.user1_id = auth.uid() OR matches.user2_id = auth.uid()
);

-- Enable Realtime for messages table
-- 1. Ensure REPLICA IDENTITY is set (usually default or full is fine for RLS with primary key)
--    If 'id' is PK, it's often default. For RLS depending on other columns for old.*, FULL might be needed.
--    Let's assume 'id' is sufficient for Supabase's default publication.
--    ALTER TABLE public.messages REPLICA IDENTITY FULL; -- Use if specific OLD.* values are needed for RLS on publication that are not PK

-- 2. Add table to supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

