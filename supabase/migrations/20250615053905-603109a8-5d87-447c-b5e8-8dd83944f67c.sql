
CREATE OR REPLACE FUNCTION public.get_user_profile_with_stats(p_user_id uuid)
RETURNS TABLE (
    user_id uuid,
    name text,
    images text[],
    age integer,
    bio text,
    location text,
    interests text[],
    gender text,
    mbti text,
    zodiac text,
    total_matches integer,
    likes_received integer,
    posts_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    p.name,
    p.images,
    p.age,
    p.bio,
    p.location,
    p.interests,
    p.gender,
    p.mbti,
    p.zodiac,
    COALESCE((SELECT us.total_matches FROM public.user_stats us WHERE us.user_id = p_user_id), 0),
    (SELECT count(*)::integer FROM public.like_requests lr WHERE lr.receiver_id = p_user_id),
    (SELECT count(*)::integer FROM public.posts po WHERE po.user_id = p.user_id)
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
END;
$function$
