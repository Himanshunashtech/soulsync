
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Notification } from '@/types/notifications';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { processNotificationSenderProfile } from '@/utils/notifications';

interface UseNotificationSubscriptionProps {
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  fetchNotifications: () => void;
}

export const useNotificationSubscription = ({
  setNotifications,
  setUnreadCount,
  fetchNotifications,
}: UseNotificationSubscriptionProps) => {
  const { user } = useAuth();
  const notificationsChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) {
        if (notificationsChannelRef.current) {
            supabase.removeChannel(notificationsChannelRef.current);
            notificationsChannelRef.current = null;
        }
        return;
    }

    const channelName = `notifications:${user.id}`;
    if (notificationsChannelRef.current && notificationsChannelRef.current.topic !== `realtime:${channelName}`) {
        supabase.removeChannel(notificationsChannelRef.current);
        notificationsChannelRef.current = null;
    }

    if (!notificationsChannelRef.current) {
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                async (payload) => {
                    console.log('New notification received via RT:', payload);
                    
                    const newNotificationPayload = payload.new as any; // Raw payload

                    // Fetch the full notification with sender profile if sender_id exists
                    if (newNotificationPayload.sender_id) {
                        const { data: newNotificationData, error } = await supabase
                            .from('notifications')
                            .select(`
                               id, user_id, type, title, message, reference_id, reference_table, sender_id, is_read, read_at, created_at,
                               sender_profile: profiles ( name, images )
                            `)
                            .eq('id', newNotificationPayload.id)
                            .single();

                        if (error) {
                            console.error('Error fetching new notification details:', error);
                            // Fallback to payload.new without profile if fetching details fails
                             const newNotificationWithProcessedProfile = {
                                ...newNotificationPayload,
                                sender_profile: null // Explicitly null as fetch failed
                            } as Notification;
                             setNotifications(prev => [newNotificationWithProcessedProfile, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
                            if (!newNotificationWithProcessedProfile.is_read) {
                                setUnreadCount(prev => prev + 1);
                            }
                            return;
                        }
                        if (newNotificationData) {
                             const processedProfile = processNotificationSenderProfile(newNotificationData);
                             const newNotificationWithProfile = {
                                ...newNotificationData,
                                sender_profile: processedProfile,
                            } as Notification;

                            setNotifications(prev => [newNotificationWithProfile, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
                            if (!newNotificationWithProfile.is_read) {
                                setUnreadCount(prev => prev + 1);
                            }
                        }
                    } else {
                        // Handle new notification without a sender_id (e.g., system notification)
                        const newNotificationWithoutSender = {
                            ...newNotificationPayload,
                            sender_profile: null,
                        } as Notification;
                        setNotifications(prev => [newNotificationWithoutSender, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
                        if (!newNotificationWithoutSender.is_read) {
                            setUnreadCount(prev => prev + 1);
                        }
                    }
                }
            )
            .on( 
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                     console.log('Notification updated via RT:', payload);
                     fetchNotifications(); 
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    // console.log(`Subscribed to notifications channel: ${channelName}`);
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.error(`Notification channel error for ${channelName}:`, err);
                }
            });
        notificationsChannelRef.current = channel;
    }

    return () => {
        if (notificationsChannelRef.current) {
            supabase.removeChannel(notificationsChannelRef.current);
            notificationsChannelRef.current = null;
        }
    };
  }, [user, fetchNotifications, setNotifications, setUnreadCount]);
};
