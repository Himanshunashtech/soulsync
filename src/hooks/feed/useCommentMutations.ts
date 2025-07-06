
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

interface CommentMutations {
  addComment: (postId: string, content: string) => Promise<void>;
  addingComment: boolean;
}

export const useCommentMutations = (
  onCommentAdded: (postId: string) => void
): CommentMutations => {
  const { user } = useAuth();
  const [addingComment, setAddingComment] = useState(false);

  const addComment = async (postId: string, content: string) => {
    if (!content.trim() || !user) return;
    setAddingComment(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          post_id: postId,
          content: content.trim()
        });
      if (error) throw error;
      onCommentAdded(postId);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setAddingComment(false);
    }
  };

  return { addComment, addingComment };
};
