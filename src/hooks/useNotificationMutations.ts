
import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Notification } from '@/types/notifications';

interface UseNotificationMutationsProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  fetchNotifications: () => Promise<void>;
}

export const useNotificationMutations = ({
  notifications,
  setNotifications,
  unreadCount,
  setUnreadCount,
  fetchNotifications,
}: UseNotificationMutationsProps) => {
  const { user } = useAuth();

  const markAsRead = async (notificationIds: string[] | 'all') => {
    if (!user || (Array.isArray(notificationIds) && notificationIds.length === 0)) return;

    const idsToUpdate = notificationIds === 'all' 
      ? notifications.filter(n => !n.is_read).map(n => n.id)
      : notificationIds;

    if (idsToUpdate.length === 0) return;

    // Optimistic update
    const now = new Date().toISOString();
    setNotifications(prev => 
      prev.map(n => 
        idsToUpdate.includes(n.id) && !n.is_read
          ? { ...n, is_read: true, read_at: now }
          : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - idsToUpdate.length));

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: now })
        .in('id', idsToUpdate)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notifications as read:', error);
        fetchNotifications(); // Revert optimistic update on error
      }
    } catch (err) {
      console.error(err);
      fetchNotifications();
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;
    const notificationToDelete = notifications.find(n => n.id === notificationId);

    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notificationToDelete && !notificationToDelete.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting notification:', error);
        // Revert on error
        setNotifications(originalNotifications);
        setUnreadCount(originalUnreadCount);
      }
    } catch (err) {
      console.error(err);
      // Revert on error
      setNotifications(originalNotifications);
      setUnreadCount(originalUnreadCount);
    }
  };

  return { markAsRead, deleteNotification };
};
