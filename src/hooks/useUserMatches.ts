import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { SimpleMatch, MatchProfile } from '@/types/chat';

export const useUserMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<SimpleMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch IDs of users who blocked me
        const { data: blockedByIdsData, error: blockedByError } = await supabase.rpc('get_users_who_blocked_me');
        if (blockedByError) throw blockedByError;
        const blockedByUserIds = blockedByIdsData?.map(item => item.user_id) || [];

        // Users that the current user has blocked should still appear in the matches list,
        // so we no longer fetch and exclude them here.
        const excludedUserIds = blockedByUserIds;

        // Fetch all matches where the current user is user1_id or user2_id
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('id, user1_id, user2_id')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

        if (matchesError) throw matchesError;
        if (!matchesData) {
          setMatches([]);
          setLoading(false);
          return;
        }

        // Filter out matches with blocked users before fetching profiles
        const filteredMatches = matchesData.filter(match => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          return !excludedUserIds.includes(otherUserId);
        });

        const otherUserIds = filteredMatches
          .map(match => (match.user1_id === user.id ? match.user2_id : match.user1_id))
          .filter(id => id !== null) as string[];
        
        if (otherUserIds.length === 0) {
          setMatches([]);
          setLoading(false);
          return;
        }

        // Fetch profiles of the other users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, name, images')
          .in('user_id', otherUserIds);

        if (profilesError) throw profilesError;

        const profilesMap = new Map<string, MatchProfile>();
        profilesData?.forEach(p => profilesMap.set(p.user_id, p as MatchProfile));

        const detailedMatches: SimpleMatch[] = filteredMatches.map(match => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const otherUserProfile = profilesMap.get(otherUserId);
          return {
            matchId: match.id,
            otherUserId: otherUserId,
            otherUserName: otherUserProfile?.name || 'Unknown User',
            otherUserImage: otherUserProfile?.images?.[0] || '/placeholder.svg',
          };
        }).filter(m => m.otherUserId); // Ensure otherUserId is valid

        setMatches(detailedMatches);
      } catch (e) {
        console.error('Error fetching user matches:', e);
        setError(e);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  return { matches, loading, error };
};
