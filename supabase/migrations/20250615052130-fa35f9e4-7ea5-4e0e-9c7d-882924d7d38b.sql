
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
