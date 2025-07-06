
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { LikeRequest } from '@/types/likes';
import type { MatchProfile } from '@/types/matches';

export const useLikeRequests = () => {
  const { user } = useAuth();
  const [likeRequests, setLikeRequests] = useState<LikeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLikeRequests = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: requestsData, error: requestsError } = await supabase
        .from('like_requests')
        .select(`*, sender_profile:profiles!sender_id(*)`)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');
      
      if (requestsError) throw requestsError;
      
      const { data: requestWithProfiles, error: profileError } = await supabase
        .from('like_requests')
        .select(`
          *,
          sender_profile: profiles!sender_id (
            user_id, name, age, images, bio, location, interests, gender, mbti, zodiac
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (profileError) throw profileError;

      // The join gives an array of profiles, we need to flatten it.
      const formattedData = (requestWithProfiles || []).map(req => ({
        ...req,
        sender_profile: Array.isArray(req.sender_profile) ? req.sender_profile[0] : req.sender_profile,
      })).filter(req => req.sender_profile) as unknown as LikeRequest[];
      
      setLikeRequests(formattedData);

    } catch (err) {
      console.error('Error fetching like requests:', err);
      // Fallback for when the join fails, query separately
      try {
          const { data: requests, error: reqErr } = await supabase
            .from('like_requests')
            .select('*')
            .eq('receiver_id', user.id)
            .eq('status', 'pending');
          if (reqErr) throw reqErr;
          if (!requests || requests.length === 0) {
            setLikeRequests([]);
            return;
          }
          const senderIds = requests.map(r => r.sender_id);
          const { data: profiles, error: profErr } = await supabase.from('profiles').select('*').in('user_id', senderIds);
          if (profErr) throw profErr;
          const profilesMap = new Map(profiles.map(p => [p.user_id, p]));
          const combined = requests.map(req => ({...req, sender_profile: profilesMap.get(req.sender_id)})).filter(r => r.sender_profile) as LikeRequest[];
          setLikeRequests(combined);
      } catch (fallbackError) {
        console.error("Fallback for fetching likes failed too:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLikeRequests();
  }, [fetchLikeRequests]);

  const updateLikeRequestStatus = async (requestId: string, status: 'accepted' | 'rejected') => {
    if(!user) return { error: new Error("User not authenticated") };

    const { error } = await supabase
      .from('like_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('receiver_id', user.id);
    
    if (error) {
      console.error(`Error ${status === 'accepted' ? 'accepting' : 'rejecting'} like request:`, error);
    } else {
      setLikeRequests(prev => prev.filter(req => req.id !== requestId));
    }
    return { error };
  };

  return { likeRequests, loading, updateLikeRequestStatus, refetchLikeRequests: fetchLikeRequests };
};
