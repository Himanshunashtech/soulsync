
-- Create a table to store multiple images for each post
CREATE TABLE public.post_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security for the new table
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

-- Add policies to control access to post images
CREATE POLICY "Public post images are viewable by everyone." ON public.post_images FOR SELECT USING (true);
CREATE POLICY "Users can insert images for their own posts." ON public.post_images FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM posts WHERE id = post_id));
CREATE POLICY "Users can update images for their own posts." ON public.post_images FOR UPDATE USING (auth.uid() = (SELECT user_id FROM posts WHERE id = post_id));
CREATE POLICY "Users can delete images for their own posts." ON public.post_images FOR DELETE USING (auth.uid() = (SELECT user_id FROM posts WHERE id = post_id));

-- Create a new storage bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Add policies for the new storage bucket
CREATE POLICY "Post images are publicly viewable." ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "Authenticated users can upload post images." ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post-images');
CREATE POLICY "Owners can update their post images." ON storage.objects FOR UPDATE USING (bucket_id = 'post-images' AND owner = auth.uid());
CREATE POLICY "Owners can delete their post images." ON storage.objects FOR DELETE USING (bucket_id = 'post-images' AND owner = auth.uid());
