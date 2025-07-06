
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
