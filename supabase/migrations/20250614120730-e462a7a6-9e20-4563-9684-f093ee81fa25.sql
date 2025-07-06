
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

