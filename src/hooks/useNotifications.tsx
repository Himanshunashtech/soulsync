import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Notification } from '@/types/notifications';
import { useNotificationMutations } from './useNotificationMutations';
import { useNotificationSubscription } from './useNotificationSubscription';
import { useNewDeviceNotifier } from './useNewDeviceNotifier';
import { processNotificationSenderProfile } from '@/utils/notifications';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useNewDeviceNotifier();

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          user_id,
          type,
          title,
          message,
          reference_id,
          reference_table,
          sender_id,
          is_read,
          read_at,
          created_at,
          sender_profile: profiles ( name, images )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
          console.error('Error fetching notifications with sender profile:', error);
          // Fallback: Try to fetch without sender_profile if the join fails
          const { data: basicData, error: basicError } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (basicError) {
            console.error('Error fetching basic notifications:', basicError);
            throw basicError;
          }

          console.warn("Fetched notifications without sender profile due to previous error.");
          const fetchedNotifications = (basicData || []).map(n => ({
            ...(n as Omit<Notification, 'sender_profile'>), // Cast known fields
            sender_profile: null // Explicitly set to null
          })) as Notification[];
          setNotifications(fetchedNotifications);
          setUnreadCount(fetchedNotifications.filter(n => !n.is_read).length);

      } else {
        const fetchedNotifications = (data || []).map(n => {
          const processedProfile = processNotificationSenderProfile(n);
          return {
            ...n,
            sender_profile: processedProfile,
          } as Notification; // Raw notification data from DB + processed profile
        });
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter(n => !n.is_read).length);
      }

    } catch (error) {
      console.error('Error in fetchNotifications catch block:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const { markAsRead, deleteNotification } = useNotificationMutations({
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    fetchNotifications,
  });

  useNotificationSubscription({
    setNotifications,
    setUnreadCount,
    fetchNotifications,
  });

  return { notifications, unreadCount, loading, markAsRead, fetchNotifications, deleteNotification };
};
