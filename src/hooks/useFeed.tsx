import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { fetchPostsWithDetails, fetchCommentsWithProfiles } from './feed/feedUtils';
import { usePostMutations } from './feed/usePostMutations';
import { useLikeMutations } from './feed/useLikeMutations';
import { useCommentMutations } from './feed/useCommentMutations';

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  post_images?: { image_url: string; order: number }[];
  created_at: string;
  profiles: {
    name: string;
    images: string[] | null;
  };
  likes_count: number;
  comments_count: number;
  user_liked: boolean;
  post_tags?: { user_id: string; profiles: { name: string } }[];
}

export interface Comment {
  id: string;
  user_id: string; // Ensure this is part of the Comment type if not already
  content: string;
  created_at: string;
  profiles: {
    name: string;
    images: string[] | null;
  };
}

export const useFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPosts = await fetchPostsWithDetails(user);
      
      const postIds = fetchedPosts.map(p => p.id);
      if (postIds.length > 0) {
        const { data: allImages, error: imagesError } = await supabase
          .from('post_images')
          .select('post_id, image_url, order')
          .in('post_id', postIds)
          .order('order');

        if (imagesError) {
          console.error('Error fetching post images:', imagesError);
        } else if (allImages) {
          const imagesByPostId = allImages.reduce((acc, image) => {
            if (!acc[image.post_id]) {
              acc[image.post_id] = [];
            }
            acc[image.post_id].push({ image_url: image.image_url, order: image.order });
            return acc;
          }, {} as Record<string, { image_url: string; order: number }[]>);
          
          fetchedPosts.forEach(post => {
            post.post_images = imagesByPostId[post.id] || [];
          });
        }
      }

      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPosts();
    } else {
      // Clear posts if user logs out or is not available
      setPosts([]);
      setComments({});
      setLoading(false);
    }
  }, [user, loadPosts]);

  const loadCommentsForPost = useCallback(async (postId: string) => {
    try {
      const fetchedComments = await fetchCommentsWithProfiles(postId);
      setComments(prev => ({ ...prev, [postId]: fetchedComments }));
    } catch (error) {
      console.error('Error loading comments for post:', postId, error);
      setComments(prev => ({ ...prev, [postId]: [] })); // Set to empty on error for specific post
    }
  }, []);

  const handlePostCreated = useCallback(() => {
    loadPosts();
  }, [loadPosts]);

  const handlePostDeleted = useCallback((postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
    setComments(prev => {
      const newComments = { ...prev };
      delete newComments[postId];
      return newComments;
    });
    // Optionally, call loadPosts() if there are server-side count changes not reflected
  }, []);
  
  const handleLikeToggled = useCallback(() => {
    loadPosts(); // Reload all posts to update like counts and user_liked status
  }, [loadPosts]);

  const handleCommentAdded = useCallback((postId: string) => {
    loadCommentsForPost(postId);
    // Also reload posts to update comments_count
    setPosts(prevPosts => prevPosts.map(p => 
      p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
    ));
    // A full loadPosts() might be more robust if other stats change
    // loadPosts(); 
  }, [loadCommentsForPost]);


  const { createPost, deletePost, creatingPost, deletingPost } = usePostMutations(
    handlePostCreated,
    handlePostDeleted
  );
  const { toggleLike, likingPost } = useLikeMutations(handleLikeToggled);
  const { addComment, addingComment } = useCommentMutations(handleCommentAdded);

  // Expose a combined loading state if needed, or individual ones
  const isProcessing = creatingPost || deletingPost || likingPost || addingComment;

  return {
    posts,
    loading, // Overall loading for initial posts
    comments,
    loadPosts, // Keep if manual refresh is desired
    createPost,
    deletePost,
    toggleLike,
    loadComments: loadCommentsForPost,
    addComment,
    isProcessing, // Or individual loading states: creatingPost, deletingPost etc.
  };
};
