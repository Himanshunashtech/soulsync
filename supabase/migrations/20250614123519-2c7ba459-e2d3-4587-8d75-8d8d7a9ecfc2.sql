
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
