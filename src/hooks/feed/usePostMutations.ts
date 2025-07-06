
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

interface PostMutations {
  createPost: (content: string, imageUrls: string[], taggedUserIds: string[]) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  creatingPost: boolean;
  deletingPost: boolean;
}

export const usePostMutations = (
  onPostCreated: () => void,
  onPostDeleted: (postId: string) => void
): PostMutations => {
  const { user } = useAuth();
  const [creatingPost, setCreatingPost] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);

  const createPost = async (content: string, imageUrls: string[], taggedUserIds: string[]) => {
    if ((!content.trim() && imageUrls.length === 0) || !user) return;
    setCreatingPost(true);
    try {
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim() || null,
          image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        })
        .select()
        .single();

      if (postError) throw postError;

      if (imageUrls.length > 0 && postData) {
        const imagesToInsert = imageUrls.map((url, index) => ({
          post_id: postData.id,
          image_url: url,
          order: index,
        }));

        const { error: imagesError } = await supabase
          .from('post_images')
          .insert(imagesToInsert);

        if (imagesError) throw imagesError;
      }

      if (taggedUserIds.length > 0 && postData) {
        const tagsToInsert = taggedUserIds.map((userId) => ({
          post_id: postData.id,
          user_id: userId,
        }));

        const { error: tagsError } = await supabase
          .from('post_tags')
          .insert(tagsToInsert);
        
        if (tagsError) throw tagsError;
      }

      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setCreatingPost(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;
    setDeletingPost(true);
    try {
      await supabase.from('likes').delete().eq('post_id', postId);
      await supabase.from('comments').delete().eq('post_id', postId);
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);
      if (error) throw error;
      onPostDeleted(postId);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setDeletingPost(false);
    }
  };

  return { createPost, deletePost, creatingPost, deletingPost };
};
