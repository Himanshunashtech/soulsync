import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Notification } from '@/types/notifications';
import type { MatchProfile } from '@/types/chat';

interface NotificationHandlerProps {
  onNavigate: (screen: string, targetId?: string, params?: any) => void;
  markNotificationsAsRead: (ids: string[]) => Promise<void>;
  openProfile: (profile: MatchProfile) => void;
  closeNotificationPanel: () => void;
}

export const useNotificationHandler = ({
  onNavigate,
  markNotificationsAsRead,
  openProfile,
  closeNotificationPanel,
}: NotificationHandlerProps) => {
  const { user } = useAuth();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markNotificationsAsRead([notification.id]);
    }
    closeNotificationPanel();

    switch (notification.type) {
      case 'new_message':
      case 'new_match':
        if (notification.reference_id) {
          onNavigate('chat', notification.reference_id);
        }
        break;
      case 'like_accepted':
        if (notification.sender_id && user?.id) { // notification.user_id is the current user
          try {
            const { data: matchData, error } = await supabase
              .from('matches')
              .select('id')
              .or(`(user1_id.eq.${user.id},user2_id.eq.${notification.sender_id}),(user1_id.eq.${notification.sender_id},user2_id.eq.${user.id})`)
              .maybeSingle();

            if (error) {
              console.error('Error fetching match for like_accepted notification:', error);
              break;
            }

            if (matchData?.id) {
              onNavigate('chat', matchData.id);
            } else {
              console.warn('Match not found for like_accepted notification. Navigating to matches list. User IDs:', user.id, notification.sender_id);
              onNavigate('matches');
            }
          } catch (e) {
            console.error('Exception fetching match for like_accepted:', e);
            onNavigate('matches'); // Fallback navigation
          }
        }
        break;
      case 'new_like_request':
      case 'new_bouquet':
        if (notification.sender_id) {
          try {
            const { data: profileData, error } = await supabase
              .rpc('get_user_profile_with_stats', { p_user_id: notification.sender_id })
              .single();

            if (error) {
              console.error('Error fetching profile for notification:', error);
              break;
            }

            if (profileData) {
              openProfile(profileData as MatchProfile);
            } else {
              console.warn('Sender profile not found for notification. Sender ID:', notification.sender_id);
            }
          } catch (e) {
            console.error('Exception fetching profile for notification:', e);
          }
        }
        break;
      default:
        console.log('Clicked notification with unhandled type:', notification.type, notification);
    }
  };

  return { handleNotificationClick };
};
