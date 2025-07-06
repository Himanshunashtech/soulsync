
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';

export const useChatPresence = (matchId: string | undefined, otherUserId: string | null) => {
  const { user } = useAuth();
  const [otherUserOnlineStatus, setOtherUserOnlineStatus] = useState<'Online' | 'Offline'>('Offline');
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!matchId || !user || !otherUserId) {
      setOtherUserOnlineStatus('Offline'); // Reset if prerequisites are not met
      return;
    }

    if (presenceChannelRef.current) {
      if (presenceChannelRef.current.state === 'joined') {
        presenceChannelRef.current.untrack();
      }
      supabase.removeChannel(presenceChannelRef.current);
      presenceChannelRef.current = null;
    }
    
    const presChannelKey = `presence:chat:${matchId}`;
    const presChannel = supabase.channel(presChannelKey, {
      config: { presence: { key: user.id } },
    });

    const updatePresenceState = (newState: RealtimePresenceState) => {
      const presenceEntriesForOtherUser = newState[otherUserId];
      if (presenceEntriesForOtherUser && presenceEntriesForOtherUser.length > 0) {
        setOtherUserOnlineStatus('Online');
      } else {
        setOtherUserOnlineStatus('Offline');
      }
    };

    presChannel
      .on('presence', { event: 'sync' }, () => {
        updatePresenceState(presChannel.presenceState());
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key === otherUserId) updatePresenceState(presChannel.presenceState());
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
         if (key === otherUserId) updatePresenceState(presChannel.presenceState());
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presChannel.track({ user_id: user.id, online_at: new Date().toISOString() });
          // Initial check after subscribing and tracking
          updatePresenceState(presChannel.presenceState());
        }
      });
    presenceChannelRef.current = presChannel;

    return () => {
      if (presenceChannelRef.current) {
        if (presenceChannelRef.current.state === 'joined') {
          presenceChannelRef.current.untrack();
        }
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, [matchId, user, otherUserId]);

  return { otherUserOnlineStatus };
};
