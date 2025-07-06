
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface BlockedUser {
  user_id: string;
  name: string;
  image: string | null;
}

export const useBlockedUsers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: blockedUsers, isLoading, error } = useQuery({
    queryKey: ['blockedUsers', user?.id],
    queryFn: async (): Promise<BlockedUser[]> => {
      if (!user) return [];

      const { data: blockedIdsData, error: blockedIdsError } = await supabase.rpc('get_blocked_user_ids');

      if (blockedIdsError) {
        console.error('Error fetching blocked user IDs:', blockedIdsError);
        throw blockedIdsError;
      }

      const blockedUserIds = blockedIdsData?.map(item => item.user_id) || [];

      if (blockedUserIds.length === 0) {
        return [];
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, images')
        .in('user_id', blockedUserIds);

      if (profilesError) {
        console.error('Error fetching blocked user profiles:', profilesError);
        throw profilesError;
      }

      return profilesData.map(profile => ({
        user_id: profile.user_id,
        name: profile.name || 'Unknown User',
        image: profile.images?.[0] || null,
      }));
    },
    enabled: !!user,
  });

  const { mutate, isPending: isUnblocking } = useMutation({
    mutationFn: async (blockedUserId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      // Call the new RPC function to handle unblocking and clearing history
      const { error } = await supabase.rpc('unblock_user', {
        p_unblocked_user_id: blockedUserId,
      });

      if (error) {
        console.error('Error unblocking user:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      // Note: We don't need to explicitly invalidate discover profiles here.
      // The DiscoverScreen refetches profiles on mount, and since the swipe history
      // is cleared by the `unblock_user` function, the user will reappear naturally.
    },
  });

  return {
    blockedUsers,
    isLoading,
    error,
    unblockUser: mutate,
    isUnblocking,
  };
};
