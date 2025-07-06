
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
