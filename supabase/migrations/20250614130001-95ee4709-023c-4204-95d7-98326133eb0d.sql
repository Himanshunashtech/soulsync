
CREATE OR REPLACE FUNCTION public.get_my_sessions()
RETURNS TABLE(
    id uuid,
    user_agent text,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
      s.id,
      s.user_agent,
      s.created_at,
      s.updated_at
  FROM auth.sessions s
  WHERE s.user_id = auth.uid()
  ORDER BY s.updated_at DESC;
$$;
