
import React from 'react';
import { Bell } from 'lucide-react';
// Removed NotificationPanel import and related types/props

interface MatchListHeaderProps {
  matchesCount: number;
  unreadNotificationCount: number;
  // showNotificationPanel: boolean; // Removed
  toggleNotificationPanel: () => void;
  // notifications: Notification[]; // Removed
  // loadingNotifications: boolean; // Removed
  // handleNotificationClick: (notification: Notification) => Promise<void>; // Removed
  // handleMarkAllNotificationsRead: () => void; // Removed
  // onCloseNotificationPanel: () => void; // Removed
}

const MatchListHeader: React.FC<MatchListHeaderProps> = ({
  matchesCount,
  unreadNotificationCount,
  toggleNotificationPanel,
}) => {
  return (
    <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md flex justify-between items-center sticky top-0 z-20"> {/* z-index for sticky header itself */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-sm mb-2">Matches</h1>
        <p className="text-slate-300 font-medium">You have {matchesCount} conversations</p>
      </div>
      <div className="relative">
        <button
          onClick={toggleNotificationPanel}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <Bell size={24} className="text-white" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-0 right-0 block h-5 w-5 transform -translate-y-1/2 translate-x-1/2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-pink-500 text-xs font-bold text-white">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            </span>
          )}
        </button>
        {/* NotificationPanel rendering removed from here */}
      </div>
    </div>
  );
};

export default MatchListHeader;
