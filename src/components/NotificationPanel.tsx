
import React from 'react';
import type { Notification } from '@/types/notifications';
import NotificationItem from './NotificationItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, BellOff } from 'lucide-react'; // Added ArrowLeft, BellOff

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number; // This is the total unread count
  loading: boolean;
  onClose: () => void;
  onNotificationClick: (notification: Notification) => Promise<void>;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  unreadCount, // Total unread count for all notification types
  loading,
  onClose,
  onNotificationClick,
  onMarkAllAsRead,
  onDeleteNotification,
}) => {
  const filteredNotifications = notifications.filter(n => n.type !== 'new_message');
  const filteredUnreadCount = filteredNotifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col z-[100] text-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-slate-800 sticky top-0 bg-slate-950 z-10">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-3 text-slate-300 hover:bg-slate-800 hover:text-white h-10 w-10">
          <ArrowLeft size={24} />
        </Button>
        <h3 className="font-semibold text-xl">Notifications</h3>
        <div className="ml-auto">
          {/* Show "Mark all read" if there are any visible unread notifications of the filtered types */}
          {filteredUnreadCount > 0 && (
            <Button variant="link" size="sm" onClick={onMarkAllAsRead} className="text-blue-400 px-1 hover:text-blue-300">
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading && filteredNotifications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400">
          <BellOff size={48} className="mb-4 text-slate-500 animate-pulse" />
          <p className="text-lg">Loading notifications...</p>
        </div>
      ) : !loading && filteredNotifications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400">
          <BellOff size={48} className="mb-4 text-slate-500" />
          <p className="text-lg">No important notifications</p>
          <p className="text-sm">Likes, matches, and other updates will appear here.</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="divide-y divide-slate-800">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onNotificationClick={onNotificationClick}
                onDelete={onDeleteNotification}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default NotificationPanel;
