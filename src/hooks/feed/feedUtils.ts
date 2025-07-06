
import { supabase } from '@/integrations/supabase/client';
import type { Post, Comment } from '@/hooks/useFeed'; // We'll update this import path later if useFeed.tsx changes significantly
import type { User } from '@supabase/supabase-js';

// Helper to fetch profile data for a list of user IDs
const fetchProfilesForUserIds = async (userIds: string[]) => {
  if (userIds.length === 0) return {};
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, name, images')
    .in('user_id', userIds);

  if (profilesError) throw profilesError;

  return (profilesData || []).reduce((acc, profile) => {
    acc[profile.user_id] = profile;
    return acc;
  }, {} as Record<string, { name: string; images: string[] | null }>);
};

export const fetchPostsWithDetails = async (currentUser: User | null): Promise<Post[]> => {
  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (postsError) throw postsError;
  if (!postsData || postsData.length === 0) return [];

  const userIds = [...new Set(postsData.map(post => post.user_id))];
  const profilesMap = await fetchProfilesForUserIds(userIds);

  const postIds = postsData.map(p => p.id);
  const { data: tagsData, error: tagsError } = await supabase
    .from('post_tags')
    .select('post_id, user_id, profiles(name)')
    .in('post_id', postIds);

  if (tagsError) throw tagsError;

  const tagsByPostId = (tagsData || []).reduce((acc, tag) => {
    if (!acc[tag.post_id]) {
      acc[tag.post_id] = [];
    }
    acc[tag.post_id].push({ user_id: tag.user_id, profiles: tag.profiles as { name: string } });
    return acc;
  }, {} as Record<string, { user_id: string, profiles: { name: string } }[]>);

  const postsWithStats = await Promise.all(
    postsData.map(async (post) => {
      const [likesResult, commentsResult, userLikeResult] = await Promise.all([
        supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', post.id),
        supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', post.id),
        currentUser ? supabase.from('likes').select('id').eq('post_id', post.id).eq('user_id', currentUser.id).maybeSingle() : Promise.resolve({ data: null, error: null })
      ]);

      const profile = profilesMap[post.user_id] || { name: 'Unknown User', images: null };

      return {
        ...post,
        profiles: {
          name: profile.name,
          images: profile.images
        },
        likes_count: likesResult.count || 0,
        comments_count: commentsResult.count || 0,
        user_liked: !!userLikeResult.data,
        post_tags: tagsByPostId[post.id] || [],
      };
    })
  );
  return postsWithStats;
};

export const fetchCommentsWithProfiles = async (postId: string): Promise<Comment[]> => {
  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (commentsError) throw commentsError;
  if (!commentsData || commentsData.length === 0) return [];

  const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
  const profilesMap = await fetchProfilesForUserIds(userIds);

  return commentsData.map(comment => {
    const profile = profilesMap[comment.user_id] || { name: 'Unknown User', images: null };
    return {
      ...comment,
      profiles: {
        name: profile.name,
        images: profile.images
      }
    };
  });
};
