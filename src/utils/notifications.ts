
import type { Notification } from '@/types/notifications';

export const processNotificationSenderProfile = (notificationData: any): Notification['sender_profile'] => {
  const profileData = notificationData.sender_profile;
  if (profileData && typeof profileData === 'object' && 'name' in profileData && typeof profileData.name === 'string') {
    return {
      name: profileData.name,
      images: Array.isArray(profileData.images) ? profileData.images : null,
    };
  }
  return null;
};
