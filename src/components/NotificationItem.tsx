
import React, { useState, useRef } from 'react';
import type { Notification } from '@/types/notifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Heart, UserPlus, Bell, ShieldAlert, Trash2 } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onNotificationClick: (notification: Notification) => void | Promise<void>;
  onDelete: (notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onNotificationClick, onDelete }) => {
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'new_message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'new_like_request':
      case 'like_accepted':
        return <Heart className="w-5 h-5 text-pink-500" />;
      case 'new_match':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'new_device_login':
        return <ShieldAlert className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const [translateX, setTranslateX] = useState(0);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
    if (itemRef.current) {
        // Disable transition during drag for immediate feedback
        itemRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    
    // Allow swiping left only, and cap it
    if (diff < 0) {
      setTranslateX(Math.max(diff, -80)); // Max swipe is 80px
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    if (itemRef.current) {
        itemRef.current.style.transition = 'transform 0.3s ease';
    }

    // Snap open or closed based on threshold
    if (translateX < -40) {
      setTranslateX(-80);
    } else {
      setTranslateX(0);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };
  
  const handleItemClick = () => {
    if (translateX !== 0) {
      setTranslateX(0);
      return;
    }
    onNotificationClick(notification);
  };

  return (
    <div className="relative bg-slate-900 overflow-hidden w-full">
      <div 
        className="absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-red-600 text-white cursor-pointer"
        onClick={handleDeleteClick}
        role="button"
        aria-label="Delete notification"
      >
        <Trash2 className="w-6 h-6" />
      </div>

      <div
        ref={itemRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleItemClick}
        style={{ transform: `translateX(${translateX}px)` }}
        className={`relative p-3 flex items-start space-x-3 bg-slate-900 cursor-pointer ${!notification.is_read ? 'bg-slate-700/50 hover:bg-slate-800/70' : 'hover:bg-slate-800'}`}
      >
        <div className="flex-shrink-0 pt-1">
          {notification.sender_profile?.images?.[0] ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={notification.sender_profile.images[0]} alt={notification.sender_profile.name} />
              <AvatarFallback>{notification.sender_profile.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              {getIcon()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-100">{notification.title}</p>
          <p className="text-sm text-slate-400 truncate">{notification.message}</p>
          <p className="text-xs text-slate-500 mt-0.5">{getTimeAgo(notification.created_at)}</p>
        </div>
        {!notification.is_read && (
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full self-center flex-shrink-0" title="Unread"></div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
