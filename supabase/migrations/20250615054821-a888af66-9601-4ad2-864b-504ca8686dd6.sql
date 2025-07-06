
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
