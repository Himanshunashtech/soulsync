
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

interface LikeMutations {
  toggleLike: (postId: string, currentlyLiked: boolean) => Promise<void>;
  likingPost: boolean;
}

export const useLikeMutations = (onLikeToggled: () => void): LikeMutations => {
  const { user } = useAuth();
  const [likingPost, setLikingPost] = useState(false);

  const toggleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!user) return;
    setLikingPost(true);
    try {
      if (currentlyLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: postId
          });
      }
      onLikeToggled();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikingPost(false);
    }
  };

  return { toggleLike, likingPost };
};
