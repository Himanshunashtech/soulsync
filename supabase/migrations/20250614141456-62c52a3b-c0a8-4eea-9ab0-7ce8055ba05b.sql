
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
