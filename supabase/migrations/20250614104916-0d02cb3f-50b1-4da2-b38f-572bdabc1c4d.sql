
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

