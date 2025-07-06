
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
