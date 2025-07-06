
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { MatchProfile } from '@/types/chat';
import { useAuth } from '@/hooks/useAuth';

export const useMatchProfile = (matchId: string | undefined) => {
  const { user } = useAuth();
  const [matchProfile, setMatchProfile] = useState<MatchProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!matchId || !user) {
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);
      try {
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .select('user1_id, user2_id')
          .eq('id', matchId)
          .single();

        if (matchError) throw matchError;
        const otherUser = match.user1_id === user.id ? match.user2_id : match.user1_id;
        setOtherUserId(otherUser);

        const { data: profile, error: profileError } = await supabase
          .rpc('get_user_profile_with_stats', { p_user_id: otherUser })
          .single();

        if (profileError) throw profileError;
        setMatchProfile(profile as MatchProfile);
      } catch (error) {
        console.error('Error loading match profile:', error);
        setMatchProfile(null); // Clear profile on error
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [matchId, user]);

  return { matchProfile, otherUserId, loadingProfile };
};
