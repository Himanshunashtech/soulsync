
-- Create a table to store user tags on posts
CREATE TABLE public.post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT post_tags_unique UNIQUE(post_id, user_id)
);

-- Add comments for clarity
COMMENT ON TABLE public.post_tags IS 'Stores user tags on posts.';
COMMENT ON COLUMN public.post_tags.post_id IS 'The post that is being tagged.';
COMMENT ON COLUMN public.post_tags.user_id IS 'The user who is being tagged.';

-- Enable Row Level Security
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for post_tags
CREATE POLICY "Public can view post tags"
  ON public.post_tags
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert tags for their own posts"
  ON public.post_tags
  FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM posts WHERE id = post_id));

CREATE POLICY "Users can update tags for their own posts"
  ON public.post_tags
  FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM posts WHERE id = post_id));

CREATE POLICY "Users can delete tags for their own posts"
  ON public.post_tags
  FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM posts WHERE id = post_id));
