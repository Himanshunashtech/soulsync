
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProfileViewModal from './ProfileViewModal';
import { useNotifications } from '@/hooks/useNotifications';
import type { MatchProfile } from '@/types/matches';
import EmptyMatchesState from './matches/EmptyMatchesState';
import NotificationPanel from '@/components/NotificationPanel';
import { useMatches } from '@/hooks/useMatches';
import { useNotificationHandler } from '@/hooks/useNotificationHandler';
import LikesCarousel from './matches/LikesCarousel';
import MatchGrid from './matches/MatchGrid';
import { Bell } from 'lucide-react';

interface MatchesScreenProps {
  onNavigate: (screen: string, targetId?: string, params?: any) => void;
}

const MatchesScreen: React.FC<MatchesScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { matches, loading, reloadMatches } = useMatches();
  const [selectedProfile, setSelectedProfile] = useState<MatchProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const {
    notifications,
    unreadCount: totalUnreadNotificationCount,
    markAsRead: markNotificationsAsRead,
    loading: loadingNotifications,
    fetchNotifications,
    deleteNotification,
  } = useNotifications();
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  const openProfile = (profile: MatchProfile) => {
    setSelectedProfile(profile);
    setIsProfileModalOpen(true);
  };

  const { handleNotificationClick } = useNotificationHandler({
    onNavigate,
    markNotificationsAsRead,
    openProfile,
    closeNotificationPanel: () => setShowNotificationPanel(false),
  });

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const handleNavigateToChat = (matchId: string) => {
    onNavigate('chat', matchId);
    const relevantNotificationIds = notifications
        .filter(n => n.type === 'new_message' && n.reference_id === matchId && !n.is_read)
        .map(n => n.id);
    if (relevantNotificationIds.length > 0) {
        markNotificationsAsRead(relevantNotificationIds);
    }
  };

  const nonMessageNotifications = notifications.filter(n => n.type !== 'new_message');
  const unreadNonMessageCount = nonMessageNotifications.filter(n => !n.is_read).length;

  const handleMarkAllNotificationsRead = () => {
    const nonMessageNotificationIds = nonMessageNotifications
      .filter(n => !n.is_read)
      .map(n => n.id);
    if (nonMessageNotificationIds.length > 0) {
      markNotificationsAsRead(nonMessageNotificationIds);
    }
  };

  const toggleNotificationPanel = () => {
    setShowNotificationPanel(prev => !prev);
    if (!showNotificationPanel) {
      fetchNotifications();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        <div className="text-center">
          <div className="text-6xl mb-4 bubble-effect">👻</div>
        <div className="text-xl font-medium">Loading matches...</div>
      </div>
      </div>
    );
  }

  const unreadCountForBadge = totalUnreadNotificationCount;

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white relative">
      <div className="flex justify-between items-center px-6 pt-6 pb-4 sticky top-0 bg-slate-900/80 backdrop-blur-sm z-10">
        <h1 className="text-3xl font-bold text-white">My matches</h1>
        <button onClick={toggleNotificationPanel} className="relative">
          <Bell className="h-6 w-6 text-white" />
          {unreadCountForBadge > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-xs text-white">
              {unreadCountForBadge}
            </span>
          )}
        </button>
      </div>

      {showNotificationPanel && (
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadNonMessageCount}
          loading={loadingNotifications}
          onClose={() => setShowNotificationPanel(false)}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllNotificationsRead}
          onDeleteNotification={deleteNotification}
        />
      )}

      <LikesCarousel onAccept={reloadMatches} />

      {matches.length > 0 ? (
        <MatchGrid
          matches={matches}
          onNavigateToChat={handleNavigateToChat}
        />
      ) : (
        <EmptyMatchesState onNavigateToDiscover={() => onNavigate('discover')} />
      )}

      {selectedProfile && (
        <ProfileViewModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={selectedProfile}
        />
      )}
    </div>
  );
};

export default MatchesScreen;
