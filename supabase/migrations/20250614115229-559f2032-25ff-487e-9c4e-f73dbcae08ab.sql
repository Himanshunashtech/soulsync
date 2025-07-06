
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
