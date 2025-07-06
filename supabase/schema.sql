
-- #############################################################################
-- # Supabase Schema Dump
-- #
-- # This file contains all the SQL migrations for the project.
-- # You can run this file on a new Supabase project to replicate the schema.
-- #############################################################################

--
-- From migration: 20250614091532-4b7dd80b-239b-4667-b29d-4c7973f900cf.sql
--

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


--
-- From migration: 20250614091812-81504657-a1c9-4056-bf3b-46a0871bda82.sql
--

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


--
-- From migration: 20250614093711-b547f9ee-e311-4ef3-ace1-e01dbce7596a.sql
--

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


--
-- From migration: 20250614104519-d816a425-fe36-460d-b36a-0b1fad18505c.sql
--

-- Create ENUM types for status and type of like
CREATE TYPE public.like_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE public.like_type AS ENUM ('like', 'super_like');

-- Create the like_requests table
CREATE TABLE public.like_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status public.like_status NOT NULL DEFAULT 'pending',
    type public.like_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    -- The unique constraint will be added below using CREATE UNIQUE INDEX
);

-- Create a partial unique index to ensure a user cannot have multiple active (pending) like requests to the same person.
CREATE UNIQUE INDEX uq_pending_like_request
ON public.like_requests (sender_id, receiver_id)
WHERE (status = 'pending');

-- Enable Row Level Security
ALTER TABLE public.like_requests ENABLE ROW LEVEL SECURITY;

-- Policies for like_requests table

-- Users can create (send) their own like requests
CREATE POLICY "Users can create their own like requests"
ON public.like_requests FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can see like requests they have sent
CREATE POLICY "Users can see like requests they sent"
ON public.like_requests FOR SELECT
USING (auth.uid() = sender_id);

-- Users can see like requests they have received
CREATE POLICY "Users can see like requests they received"
ON public.like_requests FOR SELECT
USING (auth.uid() = receiver_id);

-- Receivers can update the status of PENDING requests sent to them (to 'accepted' or 'rejected')
CREATE POLICY "Receivers can update status of their pending requests"
ON public.like_requests FOR UPDATE
USING (auth.uid() = receiver_id AND status = 'pending')
WITH CHECK (status IN ('accepted', 'rejected'));

-- Trigger function to automatically update 'updated_at' timestamp on any update
CREATE OR REPLACE FUNCTION public.update_like_request_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_update_like_requests_updated_at
BEFORE UPDATE ON public.like_requests
FOR EACH ROW EXECUTE FUNCTION public.update_like_request_updated_at_column();

-- Indexes for performance (besides the unique index)
CREATE INDEX idx_like_requests_receiver_id_status ON public.like_requests (receiver_id, status);
CREATE INDEX idx_like_requests_sender_id_status ON public.like_requests (sender_id, status);

-- Add like_requests table to supabase_realtime publication for realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.like_requests;


--
-- From migration: 20250614104916-0d02cb3f-50b1-4da2-b38f-572bdabc1c4d.sql
--

-- Enum for notification type
CREATE TYPE public.notification_type AS ENUM ('new_message', 'new_like_request', 'like_accepted', 'new_match');

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- The user who will receive the notification
    type public.notification_type NOT NULL,
    title TEXT, -- Optional: Short title for the notification
    message TEXT, -- Optional: More detailed message
    reference_id UUID, -- ID of the related entity (e.g., message_id, like_request_id, match_id)
    reference_table TEXT, -- Name of the related table (e.g., 'messages', 'like_requests', 'matches')
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- The user who triggered the notification (e.g., message sender)
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications table
-- Users can see their own notifications
CREATE POLICY "Users can see their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can mark their own notifications as read (or update them generally if needed)
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id_is_read ON public.notifications (user_id, is_read);
CREATE INDEX idx_notifications_user_id_created_at ON public.notifications (user_id, created_at DESC);

-- Function and Trigger for new messages
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  receiver_profile RECORD;
  sender_profile RECORD;
BEGIN
  -- Get receiver's profile (the other user in the match)
  SELECT p.user_id, p.name INTO receiver_profile
  FROM public.matches m
  JOIN public.profiles p ON (p.user_id = CASE WHEN m.user1_id = NEW.sender_id THEN m.user2_id ELSE m.user1_id END)
  WHERE m.id = NEW.match_id;

  -- Get sender's profile
  SELECT name INTO sender_profile FROM public.profiles WHERE user_id = NEW.sender_id;

  IF receiver_profile.user_id IS NOT NULL AND sender_profile.name IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_table, sender_id)
    VALUES (
      receiver_profile.user_id,
      'new_message',
      'New Message from ' || sender_profile.name,
      LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END, -- Truncate message
      NEW.id,
      'messages',
      NEW.sender_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_new_message_notification
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.create_message_notification();


-- Function and Trigger for new like requests
CREATE OR REPLACE FUNCTION public.create_like_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  sender_profile RECORD;
BEGIN
  SELECT name INTO sender_profile FROM public.profiles WHERE user_id = NEW.sender_id;

  IF sender_profile.name IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_table, sender_id)
    VALUES (
      NEW.receiver_id,
      'new_like_request',
      sender_profile.name || ' sent you a ' || NEW.type::text || '!',
      'You have a new like request.',
      NEW.id,
      'like_requests',
      NEW.sender_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_new_like_request_notification
AFTER INSERT ON public.like_requests
FOR EACH ROW EXECUTE FUNCTION public.create_like_request_notification();


-- Function and Trigger for accepted like requests (which results in a match)
CREATE OR REPLACE FUNCTION public.create_like_accepted_notification()
RETURNS TRIGGER AS $$
DECLARE
  original_sender_profile RECORD; -- Profile of who INITIALLY sent the like request
  accepting_user_profile RECORD; -- Profile of who ACCEPTED the like request
BEGIN
  -- Only create notification if status changes TO 'accepted' FROM 'pending'
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    SELECT name INTO original_sender_profile FROM public.profiles WHERE user_id = NEW.sender_id; -- This is the user who sent the original like
    SELECT name INTO accepting_user_profile FROM public.profiles WHERE user_id = NEW.receiver_id; -- This is the user who just accepted it

    IF original_sender_profile.name IS NOT NULL AND accepting_user_profile.name IS NOT NULL THEN
      -- Notify the original sender that their like was accepted
      INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_table, sender_id)
      VALUES (
        NEW.sender_id, -- User to notify (original sender of like request)
        'like_accepted',
        accepting_user_profile.name || ' accepted your ' || NEW.type::text || '!',
        'You have a new match! You can now chat with ' || accepting_user_profile.name || '.',
        NEW.id, -- Reference to the like_request
        'like_requests',
        NEW.receiver_id -- The user who performed the action (accepted the like)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_like_accepted_notification
AFTER UPDATE OF status ON public.like_requests
FOR EACH ROW EXECUTE FUNCTION public.create_like_accepted_notification();

-- Function and Trigger for new matches
CREATE OR REPLACE FUNCTION public.create_new_match_notification()
RETURNS TRIGGER AS $$
DECLARE
  user1_profile_name TEXT;
  user2_profile_name TEXT;
BEGIN
  SELECT name INTO user1_profile_name FROM public.profiles WHERE user_id = NEW.user1_id;
  SELECT name INTO user2_profile_name FROM public.profiles WHERE user_id = NEW.user2_id;

  IF user1_profile_name IS NOT NULL AND user2_profile_name IS NOT NULL THEN
    -- Notify user1 about match with user2
    INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_table, sender_id)
    VALUES (
      NEW.user1_id,
      'new_match',
      'New Match with ' || user2_profile_name || '!',
      'You can now start a conversation.',
      NEW.id,
      'matches',
      NEW.user2_id -- The other user in the match
    );

    -- Notify user2 about match with user1
    INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_table, sender_id)
    VALUES (
      NEW.user2_id,
      'new_match',
      'New Match with ' || user1_profile_name || '!',
      'You can now start a conversation.',
      NEW.id,
      'matches',
      NEW.user1_id -- The other user in the match
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_new_match_notification
AFTER INSERT ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.create_new_match_notification();


--
-- From migration: 20250614113140-4fb92bd0-eaac-4d98-b536-5c3dc132b613.sql
--

-- Create enum type for interested_in_gender
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_preference_enum') THEN
        CREATE TYPE public.gender_preference_enum AS ENUM ('male', 'female', 'non-binary', 'everyone');
    END IF;
END$$;

-- Create enum type for looking_for
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_type_enum') THEN
        CREATE TYPE public.relationship_type_enum AS ENUM ('long_term_relationship', 'short_term_relationship', 'new_friends', 'casual_dating', 'dont_know_yet');
    END IF;
END$$;

-- Create table for dating_preferences
CREATE TABLE IF NOT EXISTS public.dating_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  interested_in_gender public.gender_preference_enum DEFAULT 'everyone',
  min_age_preference INTEGER DEFAULT 18 CHECK (min_age_preference >= 18),
  max_age_preference INTEGER DEFAULT 99 CHECK (max_age_preference >= 18 AND max_age_preference >= min_age_preference),
  max_distance_preference INTEGER DEFAULT 100 CHECK (max_distance_preference > 0), -- in km or miles, unit to be decided by app logic
  looking_for public.relationship_type_enum[] DEFAULT ARRAY['dont_know_yet']::public.relationship_type_enum[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dating_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for dating_preferences
CREATE POLICY "Users can view their own dating preferences"
  ON public.dating_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dating preferences"
  ON public.dating_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dating preferences"
  ON public.dating_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dating preferences"
  ON public.dating_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.update_dating_preferences_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dating_preferences_modtime
  BEFORE UPDATE ON public.dating_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dating_preferences_updated_at_column();

-- Ensure profiles table exists and user_id is primary key or unique for the FK reference
-- This is assumed to be true based on existing schema structure (profiles.user_id is usually the FK to auth.users.id and primary key or unique for profiles table)

-- Add a function to get or create dating preferences for a user
CREATE OR REPLACE FUNCTION public.get_or_create_dating_preferences(p_user_id UUID)
RETURNS SETOF public.dating_preferences AS $$
DECLARE
  prefs public.dating_preferences%ROWTYPE;
BEGIN
  SELECT * INTO prefs FROM public.dating_preferences WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.dating_preferences (user_id) VALUES (p_user_id)
    RETURNING * INTO prefs;
  END IF;

  RETURN NEXT prefs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_or_create_dating_preferences(UUID) TO authenticated;


--
-- From migration: 20250614115229-559f2032-25ff-487e-9c4e-f73dbcae08ab.sql
--

-- Create a table for user notification settings
CREATE TABLE public.notification_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    new_message_enabled BOOLEAN NOT NULL DEFAULT true,
    new_like_request_enabled BOOLEAN NOT NULL DEFAULT true,
    like_accepted_enabled BOOLEAN NOT NULL DEFAULT true,
    new_match_enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notification_settings IS 'Stores user-specific settings for different notification types.';

-- Add a trigger to update the updated_at column on change
CREATE OR REPLACE FUNCTION public.update_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW EXECUTE FUNCTION public.update_notification_settings_updated_at();

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Policies for notification_settings
CREATE POLICY "Users can manage their own notification settings"
ON public.notification_settings
FOR ALL
USING (auth.uid() = user_id);

-- Helper function to get or create settings for a user to ensure they always exist.
CREATE OR REPLACE FUNCTION public.get_or_create_notification_settings(p_user_id uuid)
RETURNS SETOF public.notification_settings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  settings public.notification_settings%ROWTYPE;
BEGIN
  SELECT * INTO settings FROM public.notification_settings WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.notification_settings (user_id) VALUES (p_user_id)
    RETURNING * INTO settings;
  END IF;

  RETURN NEXT settings;
END;
$$;

-- Function to check if a specific notification type is enabled for a user
CREATE OR REPLACE FUNCTION public.are_notifications_enabled(p_user_id uuid, p_type public.notification_type)
RETURNS BOOLEAN AS $$
DECLARE
    settings RECORD;
BEGIN
    -- Ensure settings exist, then check the specific flag
    SELECT * INTO settings FROM public.get_or_create_notification_settings(p_user_id);

    RETURN CASE p_type
        WHEN 'new_message' THEN settings.new_message_enabled
        WHEN 'new_like_request' THEN settings.new_like_request_enabled
        WHEN 'like_accepted' THEN settings.like_accepted_enabled
        WHEN 'new_match' THEN settings.new_match_enabled
        ELSE TRUE -- Default to true for any unhandled types
    END;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- === UPDATE EXISTING NOTIFICATION TRIGGER FUNCTIONS ===

-- 1. Update trigger for new messages
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  receiver_profile RECORD;
  sender_profile RECORD;
BEGIN
  SELECT p.user_id, p.name INTO receiver_profile
  FROM public.matches m
  JOIN public.profiles p ON (p.user_id = CASE WHEN m.user1_id = NEW.sender_id THEN m.user2_id ELSE m.user1_id END)
  WHERE m.id = NEW.match_id;

  SELECT name INTO sender_profile FROM public.profiles WHERE user_id = NEW.sender_id;

  IF receiver_profile.user_id IS NOT NULL AND sender_profile.name IS NOT NULL AND public.are_notifications_enabled(receiver_profile.user_id, 'new_message') THEN
    INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_table, sender_id)
    VALUES (
      receiver_profile.user_id, 'new_message', 'New Message from ' || sender_profile.name,
      LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
      NEW.id, 'messages', NEW.sender_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update trigger for new like requests
CREATE OR REPLACE FUNCTION public.create_like_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  sender_profile RECORD;
BEGIN
  SELECT name INTO sender_profile FROM public.profiles WHERE user_id = NEW.sender_id;

  IF sender_profile.name IS NOT NULL AND public.are_notifications_enabled(NEW.receiver_id, 'new_like_request') THEN
    INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_table, sender_id)
    VALUES (
      NEW.receiver_id, 'new_like_request', sender_profile.name || ' sent you a ' || NEW.type::text || '!',
      'You have a new like request.', NEW.id, 'like_requests', NEW.sender_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update trigger for accepted like requests
CREATE OR REPLACE FUNCTION public.create_like_accepted_notification()
RETURNS TRIGGER AS $$
DECLARE
  original_sender_profile RECORD;
  accepting_user_profile RECORD;
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    SELECT name INTO original_sender_profile FROM public.profiles WHERE user_id = NEW.sender_id;
    SELECT name INTO accepting_user_profile FROM public.profiles WHERE user_id = NEW.receiver_id;

    IF original_sender_profile.name IS NOT NULL AND accepting_user_profile.name IS NOT NULL AND public.are_notifications_enabled(NEW.sender_id, 'like_accepted') THEN
      INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_table, sender_id)
      VALUES (
        NEW.sender_id, 'like_accepted', accepting_user_profile.name || ' accepted your ' || NEW.type::text || '!',
        'You have a new match! You can now chat with ' || accepting_user_profile.name || '.',
        NEW.id, 'like_requests', NEW.receiver_id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update trigger for new matches
CREATE OR REPLACE FUNCTION public.create_new_match_notification()
RETURNS TRIGGER AS $$
DECLARE
  user1_profile_name TEXT;
  user2_profile_name TEXT;
BEGIN
  SELECT name INTO user1_profile_name FROM public.profiles WHERE user_id = NEW.user1_id;
  SELECT name INTO user2_profile_name FROM public.profiles WHERE user_id = NEW.user2_id;

  IF user1_profile_name IS NOT NULL AND user2_profile_name IS NOT NULL THEN
    -- Notify user1
    IF public.are_notifications_enabled(NEW.user1_id, 'new_match') THEN
      INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_table, sender_id)
      VALUES (
        NEW.user1_id, 'new_match', 'New Match with ' || user2_profile_name || '!',
        'You can now start a conversation.', NEW.id, 'matches', NEW.user2_id
      );
    END IF;

    -- Notify user2
    IF public.are_notifications_enabled(NEW.user2_id, 'new_match') THEN
      INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_table, sender_id)
      VALUES (
        NEW.user2_id, 'new_match', 'New Match with ' || user1_profile_name || '!',
        'You can now start a conversation.', NEW.id, 'matches', NEW.user1_id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


--
-- From migration: 20250614120730-e462a7a6-9e20-4563-9684-f093ee81fa25.sql
--

-- Create a table to store blocked user relationships
CREATE TABLE public.blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (blocker_id, blocked_id)
);

COMMENT ON TABLE public.blocked_users IS 'Stores relationships of users who have blocked other users.';

-- Add RLS to the table
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Users can block other users
CREATE POLICY "Users can block other users"
ON public.blocked_users
FOR INSERT
WITH CHECK (auth.uid() = blocker_id);

-- Users can see their own blocked list
CREATE POLICY "Users can view their own blocked list"
ON public.blocked_users
FOR SELECT
USING (auth.uid() = blocker_id);

-- Users can unblock other users
CREATE POLICY "Users can unblock users"
ON public.blocked_users
FOR DELETE
USING (auth.uid() = blocker_id);

-- Function to handle the process of blocking a user
CREATE OR REPLACE FUNCTION public.block_user(p_blocked_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Insert into the blocked_users table
  INSERT INTO public.blocked_users (blocker_id, blocked_id)
  VALUES (auth.uid(), p_blocked_user_id)
  ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

  -- 2. Delete any existing match between the two users
  DELETE FROM public.matches
  WHERE (user1_id = auth.uid() AND user2_id = p_blocked_user_id)
     OR (user1_id = p_blocked_user_id AND user2_id = auth.uid());

  -- 3. Delete any pending like requests between them
  DELETE FROM public.like_requests
  WHERE (sender_id = auth.uid() AND receiver_id = p_blocked_user_id AND status = 'pending')
     OR (sender_id = p_blocked_user_id AND receiver_id = auth.uid() AND status = 'pending');
END;
$$;

COMMENT ON FUNCTION public.block_user(p_blocked_user_id UUID) IS 'Blocks a user, removes the match, and deletes pending like requests between them.';

-- Function to get IDs of users blocked by the current user
CREATE OR REPLACE FUNCTION public.get_blocked_user_ids()
RETURNS TABLE(user_id UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT blocked_id
  FROM public.blocked_users
  WHERE blocker_id = auth.uid();
$$;

-- Function to get IDs of users who have blocked the current user
CREATE OR REPLACE FUNCTION public.get_users_who_blocked_me()
RETURNS TABLE(user_id UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT blocker_id
    FROM public.blocked_users
    WHERE blocked_id = auth.uid();
$$;


--
-- From migration: 20250614121826-45f175e9-e995-4d7d-8b12-058cf39f788e.sql
--

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


--
-- From migration: 20250614122838-771e95ed-e289-474c-a480-f1173e70f853.sql
--

-- This migration updates the block_user function to no longer delete the match.
-- This is necessary to preserve the chat history for the user who initiated the block,
-- while UI logic will handle hiding the match from the blocked user.

CREATE OR REPLACE FUNCTION public.block_user(p_blocked_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Insert into the blocked_users table
  INSERT INTO public.blocked_users (blocker_id, blocked_id)
  VALUES (auth.uid(), p_blocked_user_id)
  ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

  -- NOTE: The step that deletes the match has been removed.
  -- This preserves the chat history. The application's logic will now be responsible
  -- for determining who can see the match based on the block list.

  -- 2. Delete any pending like requests between them
  DELETE FROM public.like_requests
  WHERE (sender_id = auth.uid() AND receiver_id = p_blocked_user_id AND status = 'pending')
     OR (sender_id = p_blocked_user_id AND receiver_id = auth.uid() AND status = 'pending');
END;
$$;

COMMENT ON FUNCTION public.block_user(p_blocked_user_id UUID) IS 'Blocks a user and deletes pending like requests, but keeps the match to preserve chat history for the blocker.';


--
-- From migration: 20250614123519-2c7ba459-e2d3-4587-8d75-8d8d7a9ecfc2.sql
--

-- This migration adds a new function `unblock_user` to handle unblocking a user.
-- This function is designed to not only remove the block but also delete the associated
-- match, swipes, and like requests. This allows the unblocked user to reappear in the
-- discover feed for a potential new match.

CREATE OR REPLACE FUNCTION public.unblock_user(p_unblocked_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Remove the block entry from blocked_users table
  DELETE FROM public.blocked_users
  WHERE blocker_id = auth.uid() AND blocked_id = p_unblocked_user_id;

  -- 2. Delete the match to allow for rematching in the future
  DELETE FROM public.matches
  WHERE (user1_id = auth.uid() AND user2_id = p_unblocked_user_id)
     OR (user1_id = p_unblocked_user_id AND user2_id = auth.uid());

  -- 3. Delete swipe history so they can reappear in the discover feed
  DELETE FROM public.swipes
  WHERE (swiper_id = auth.uid() AND swiped_id = p_unblocked_user_id)
     OR (swiper_id = p_unblocked_user_id AND swiped_id = auth.uid());

  -- 4. Delete any pending or accepted like requests between them
  DELETE FROM public.like_requests
  WHERE (sender_id = auth.uid() AND receiver_id = p_unblocked_user_id)
     OR (sender_id = p_unblocked_user_id AND receiver_id = auth.uid());
END;
$$;

COMMENT ON FUNCTION public.unblock_user(p_unblocked_user_id UUID) IS 'Unblocks a user, and removes the match, swipes, and like requests to enable future rematching.';


--
-- From migration: 20250614130001-95ee4709-023c-4204-95d7-98326133eb0d.sql
--

CREATE OR REPLACE FUNCTION public.get_my_sessions()
RETURNS TABLE(
    id uuid,
    user_agent text,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
      s.id,
      s.user_agent,
      s.created_at,
      s.updated_at
  FROM auth.sessions s
  WHERE s.user_id = auth.uid()
  ORDER BY s.updated_at DESC;
$$;


--
-- From migration: 20250614130644-626dade2-10ff-4ed1-9ee8-57b8b1e0e559.sql
--

-- First, add 'new_device_login' to our existing list of notification types.
ALTER TYPE public.notification_type ADD VALUE 'new_device_login';

-- Next, create a function that checks if a login is from a new device/browser
-- and creates a notification if it is.
CREATE OR REPLACE FUNCTION public.notify_on_new_device(p_user_agent TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session_count INT;
BEGIN
  -- We count how many sessions with the exact same user agent already exist for this user.
  -- If the count is 1, it means this is the first session with this user agent,
  -- indicating a new device or browser login.
  SELECT count(*)
  INTO v_session_count
  FROM auth.sessions s
  WHERE s.user_id = v_user_id AND s.user_agent = p_user_agent;

  -- Only send a notification if this is the very first time we see this session signature
  -- and notifications for this event type are enabled for the user.
  IF v_session_count = 1 AND public.are_notifications_enabled(v_user_id, 'new_device_login') THEN
    INSERT INTO public.notifications (user_id, type, title, message, reference_table)
    VALUES (
      v_user_id,
      'new_device_login',
      'New Device Login',
      'A new login to your account was detected. You can review your active sessions in the Login Activity settings.',
      'auth.sessions'
    );
  END IF;
END;
$$;

-- We also need to add a new column to the notification_settings table to allow users
-- to toggle this new notification type on or off.
ALTER TABLE public.notification_settings
ADD COLUMN IF NOT EXISTS new_device_login_enabled BOOLEAN NOT NULL DEFAULT true;

-- Finally, update our function that checks if notifications are enabled to include this new type.
CREATE OR REPLACE FUNCTION public.are_notifications_enabled(p_user_id uuid, p_type notification_type)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
    settings RECORD;
BEGIN
    -- Ensure settings exist, then check the specific flag
    SELECT * INTO settings FROM public.get_or_create_notification_settings(p_user_id);

    RETURN CASE p_type
        WHEN 'new_message' THEN settings.new_message_enabled
        WHEN 'new_like_request' THEN settings.new_like_request_enabled
        WHEN 'like_accepted' THEN settings.like_accepted_enabled
        WHEN 'new_match' THEN settings.new_match_enabled
        WHEN 'new_device_login' THEN settings.new_device_login_enabled -- Added this line
        ELSE TRUE -- Default to true for any unhandled types
    END;
END;
$function$


--
-- From migration: 20250614131323-4ef7f6d9-5e88-4bf3-b61c-2778a5a64c90.sql
--

-- Allow users to delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);


--
-- From migration: 20250614132243-ee4cf56b-1689-4c1e-b362-026437f22c3b.sql
--

-- Add a column to profiles to track visibility
ALTER TABLE public.profiles
ADD COLUMN is_visible BOOLEAN NOT NULL DEFAULT TRUE;


--
-- From migration: 20250614140258-26d7bbf0-76d3-4c23-822d-3d1df7279112.sql
--

-- Drop the old trigger for creating matches on mutual swipe.
-- This ensures matches are only created upon explicit acceptance of a like request.
DROP TRIGGER IF EXISTS handle_mutual_swipe ON public.swipes;

-- Create a function that will be triggered when a like request is updated to 'accepted'.
CREATE OR REPLACE FUNCTION public.handle_accepted_like_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the status is changing from 'pending' to 'accepted'
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Insert a new row into the matches table
    -- The LEAST/GREATEST functions prevent duplicate matches with swapped user IDs.
    INSERT INTO public.matches (user1_id, user2_id)
    VALUES (
      LEAST(NEW.sender_id, NEW.receiver_id),
      GREATEST(NEW.sender_id, NEW.receiver_id)
    )
    -- If a match already exists for any reason (e.g., a race condition), do nothing.
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that executes the new function after a like_request is updated.
CREATE TRIGGER on_like_request_accepted
AFTER UPDATE ON public.like_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_accepted_like_request();


--
-- From migration: 20250614141456-62c52a3b-c0a8-4eea-9ab0-7ce8055ba05b.sql
--

CREATE OR REPLACE FUNCTION public.delete_user_data()
RETURNS void AS $$
DECLARE
  target_user_id UUID := auth.uid();
BEGIN
  -- Delete data in an order that respects potential foreign keys.
  -- Start with tables that reference other tables or have fewer dependencies.
  DELETE FROM public.comments WHERE user_id = target_user_id;
  DELETE FROM public.likes WHERE user_id = target_user_id;
  DELETE FROM public.messages WHERE sender_id = target_user_id;
  DELETE FROM public.notifications WHERE user_id = target_user_id OR sender_id = target_user_id;
  
  -- Delete posts after comments and likes which might reference them.
  DELETE FROM public.posts WHERE user_id = target_user_id;

  -- Delete from junction/activity tables.
  DELETE FROM public.swipes WHERE swiper_id = target_user_id OR swiped_id = target_user_id;
  DELETE FROM public.like_requests WHERE sender_id = target_user_id OR receiver_id = target_user_id;
  DELETE FROM public.matches WHERE user1_id = target_user_id OR user2_id = target_user_id;
  DELETE FROM public.blocked_users WHERE blocker_id = target_user_id OR blocked_id = target_user_id;

  -- Delete from settings and stats tables.
  DELETE FROM public.user_stats WHERE user_id = target_user_id;
  DELETE FROM public.dating_preferences WHERE user_id = target_user_id;
  DELETE FROM public.notification_settings WHERE user_id = target_user_id;
  
  -- Finally, delete the user's profile.
  DELETE FROM public.profiles WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


--
-- From migration: 20250615050124-65d386f4-3d0e-4c86-b3b9-ab166721006f.sql
--

-- Create a table to store multiple images for each post
CREATE TABLE public.post_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security for the new table
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

-- Add policies to control access to post images
CREATE POLICY "Public post images are viewable by everyone." ON public.post_images FOR SELECT USING (true);
CREATE POLICY "Users can insert images for their own posts." ON public.post_images FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM posts WHERE id = post_id));
CREATE POLICY "Users can update images for their own posts." ON public.post_images FOR UPDATE USING (auth.uid() = (SELECT user_id FROM posts WHERE id = post_id));
CREATE POLICY "Users can delete images for their own posts." ON public.post_images FOR DELETE USING (auth.uid() = (SELECT user_id FROM posts WHERE id = post_id));

-- Create a new storage bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Add policies for the new storage bucket
CREATE POLICY "Post images are publicly viewable." ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "Authenticated users can upload post images." ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post-images');
CREATE POLICY "Owners can update their post images." ON storage.objects FOR UPDATE USING (bucket_id = 'post-images' AND owner = auth.uid());
CREATE POLICY "Owners can delete their post images." ON storage.objects FOR DELETE USING (bucket_id = 'post-images' AND owner = auth.uid());


--
-- From migration: 20250615051630-145f6bcd-e18f-4853-95d8-1b551acda459.sql
--

-- Create a table to store user tags on posts
CREATE TABLE public.post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT post_tags_unique UNIQUE(post_id, user_id)
);

-- Add comments for clarity
COMMENT ON TABLE public.post_tags IS 'Stores user tags on posts.';
COMMENT ON COLUMN public.post_tags.post_id IS 'The post that is being tagged.';
COMMENT ON COLUMN public.post_tags.user_id IS 'The user who is being tagged.';

-- Enable Row Level Security
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for post_tags
CREATE POLICY "Public can view post tags"
  ON public.post_tags
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert tags for their own posts"
  ON public.post_tags
  FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM posts WHERE id = post_id));

CREATE POLICY "Users can update tags for their own posts"
  ON public.post_tags
  FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM posts WHERE id = post_id));

CREATE POLICY "Users can delete tags for their own posts"
  ON public.post_tags
  FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM posts WHERE id = post_id));


--
-- From migration: 20250615052130-fa35f9e4-7ea5-4e0e-9c7d-882924d7d38b.sql
--

-- A function to securely search for users to tag in posts.
-- This function runs with elevated privileges to bypass row-level security on profiles
-- for this specific purpose, but still respects the is_visible flag.
CREATE OR REPLACE FUNCTION search_users_for_tagging(
  p_search_query TEXT,
  p_exclude_user_ids UUID[]
)
RETURNS TABLE(id UUID, name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.user_id as id, p.name
  FROM public.profiles p
  WHERE
    p.name ILIKE '%' || p_search_query || '%'
    AND NOT (p.user_id = ANY(p_exclude_user_ids))
    AND p.is_visible = true
  LIMIT 5;
END;
$$;


--
-- From migration: 20250615053905-603109a8-5d87-447c-b5e8-8dd83944f67c.sql
--

CREATE OR REPLACE FUNCTION public.get_user_profile_with_stats(p_user_id uuid)
RETURNS TABLE (
    user_id uuid,
    name text,
    images text[],
    age integer,
    bio text,
    location text,
    interests text[],
    gender text,
    mbti text,
    zodiac text,
    total_matches integer,
    likes_received integer,
    posts_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    p.name,
    p.images,
    p.age,
    p.bio,
    p.location,
    p.interests,
    p.gender,
    p.mbti,
    p.zodiac,
    COALESCE((SELECT us.total_matches FROM public.user_stats us WHERE us.user_id = p_user_id), 0),
    (SELECT count(*)::integer FROM public.like_requests lr WHERE lr.receiver_id = p_user_id),
    (SELECT count(*)::integer FROM public.posts po WHERE po.user_id = p.user_id)
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
END;
$function$


--
-- From migration: 20250615054821-a888af66-9601-4ad2-864b-504ca8686dd6.sql
--

-- 1. Create a table to store available bouquets/flowers
CREATE TABLE public.bouquets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for bouquets table
ALTER TABLE public.bouquets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access to bouquets"
ON public.bouquets FOR SELECT
TO authenticated
USING (true);

-- 2. Populate the bouquets table with some options.
-- Note: You will need to upload corresponding images to the /public/bouquets/ folder.
INSERT INTO public.bouquets (name, image_url) VALUES
('Single Red Rose', '/bouquets/rose.png'),
('Sunflower Bouquet', '/bouquets/sunflower.png'),
('Tulip Mix', '/bouquets/tulips.png'),
('Orchid', '/bouquets/orchid.png'),
('Lilly Bunch', '/bouquets/lilly.png'),
('Mixed Wildflowers', '/bouquets/wildflowers.png');

-- 3. Create a table to track sent bouquets between users
CREATE TABLE public.user_bouquets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bouquet_id UUID NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for user_bouquets table
ALTER TABLE public.user_bouquets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see bouquets they sent or received"
ON public.user_bouquets FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send bouquets"
ON public.user_bouquets FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- 4. Add 'new_bouquet' to our notification types if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'notification_type' AND e.enumlabel = 'new_bouquet') THEN
        ALTER TYPE public.notification_type ADD VALUE 'new_bouquet';
    END IF;
END$$;


-- 5. Add a setting for bouquet notifications
ALTER TABLE public.notification_settings
ADD COLUMN IF NOT EXISTS new_bouquet_enabled BOOLEAN NOT NULL DEFAULT true;

-- 6. Update our notification check function to include bouquets
CREATE OR REPLACE FUNCTION public.are_notifications_enabled(p_user_id uuid, p_type notification_type)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
    settings RECORD;
BEGIN
    SELECT * INTO settings FROM public.get_or_create_notification_settings(p_user_id);
    RETURN CASE p_type
        WHEN 'new_message' THEN settings.new_message_enabled
        WHEN 'new_like_request' THEN settings.new_like_request_enabled
        WHEN 'like_accepted' THEN settings.like_accepted_enabled
        WHEN 'new_match' THEN settings.new_match_enabled
        WHEN 'new_device_login' THEN settings.new_device_login_enabled
        WHEN 'new_bouquet' THEN settings.new_bouquet_enabled
        ELSE TRUE
    END;
END;
$function$;

-- 7. Create a function to notify users when they receive a bouquet
CREATE OR REPLACE FUNCTION public.create_bouquet_notification()
RETURNS TRIGGER AS $$
DECLARE
  sender_profile RECORD;
  bouquet_info RECORD;
BEGIN
  SELECT name INTO sender_profile FROM public.profiles WHERE user_id = NEW.sender_id;
  SELECT name INTO bouquet_info FROM public.bouquets WHERE id = NEW.bouquet_id;

  IF sender_profile.name IS NOT NULL AND bouquet_info.name IS NOT NULL AND public.are_notifications_enabled(NEW.receiver_id, 'new_bouquet') THEN
    INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_table, sender_id)
    VALUES (
      NEW.receiver_id,
      'new_bouquet',
      sender_profile.name || ' sent you a ' || bouquet_info.name,
      'You received a new gift. Check your profile to see it!',
      NEW.id,
      'user_bouquets',
      NEW.sender_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create a trigger to run the notification function
DROP TRIGGER IF EXISTS trigger_new_bouquet_notification ON public.user_bouquets;
CREATE TRIGGER trigger_new_bouquet_notification
AFTER INSERT ON public.user_bouquets
FOR EACH ROW EXECUTE FUNCTION public.create_bouquet_notification();

-- 9. Create a function to get a summary of received bouquets for a profile
CREATE OR REPLACE FUNCTION public.get_received_bouquets_summary(p_user_id uuid)
RETURNS TABLE (
    sender_id uuid,
    sender_name text,
    sender_image text,
    bouquet_id uuid,
    bouquet_name text,
    bouquet_image_url text,
    bouquet_count bigint,
    last_sent_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    ub.sender_id,
    p.name as sender_name,
    p.images[1] as sender_image,
    ub.bouquet_id,
    b.name as bouquet_name,
    b.image_url as bouquet_image_url,
    count(*) as bouquet_count,
    max(ub.created_at) as last_sent_at
  FROM public.user_bouquets ub
  JOIN public.bouquets b ON ub.bouquet_id = b.id
  JOIN public.profiles p ON ub.sender_id = p.user_id
  WHERE ub.receiver_id = p_user_id
  GROUP BY ub.sender_id, p.name, p.images[1], ub.bouquet_id, b.name, b.image_url
  ORDER BY last_sent_at DESC;
END;
$function$;

