
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Match, MatchProfile } from '@/types/matches';

export const useMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch IDs of users who blocked me
      const { data: blockedByIdsData, error: blockedByError } = await supabase.rpc('get_users_who_blocked_me');
      if (blockedByError) throw blockedByError;
      const blockedByUserIds = blockedByIdsData?.map(item => item.user_id) || [];

      // Users that the current user has blocked should still appear in the matches list,
      // so we no longer fetch and exclude them here.
      const excludedUserIds = blockedByUserIds;

      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (matchesError) throw matchesError;

      const filteredMatches = (matchesData || []).filter(match => {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        return !excludedUserIds.includes(otherUserId);
      });

      const matchesWithDataPromises = filteredMatches.map(async (match) => {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;

        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, name, age, images, bio, location, interests, gender, mbti, zodiac')
          .eq('user_id', otherUserId)
          .single();

        const { data: lastMessageData } = await supabase
          .from('messages')
          .select('content, created_at, sender_id, seen_at')
          .eq('match_id', match.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        let unreadMessageCount = 0;
        if (lastMessageData && lastMessageData.sender_id !== user.id && !lastMessageData.seen_at) {
          const { count } = await supabase
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('match_id', match.id)
              .eq('sender_id', otherUserId)
              .is('seen_at', null);
          unreadMessageCount = count || 0;
        }

        return {
          ...match,
          profiles: profileData ? { ...profileData, user_id: otherUserId } : { user_id: otherUserId, name: 'Unknown', age: null, images: null } as MatchProfile,
          lastMessage: lastMessageData || undefined,
          unreadMessageCount: unreadMessageCount
        } as Match;
      });

      let matchesWithData = await Promise.all(matchesWithDataPromises);

      matchesWithData.sort((a, b) => {
        const aTime = a.lastMessage?.created_at || a.created_at;
        const bTime = b.lastMessage?.created_at || b.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setMatches(matchesWithData);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user, loadMatches]);

  return { matches, loading, reloadMatches: loadMatches };
};
