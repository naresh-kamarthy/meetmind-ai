import React, { useEffect, useRef } from 'react';
import { useStore, type Notification } from '../store/useStore';
import { Check, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from './ui/Button';

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, removeNotification } = useStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
    >
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllNotificationsAsRead}
                className="!p-1.5"
                aria-label="Mark all as read"
                icon={CheckCheck}
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="!p-1.5"
              aria-label="Close notifications"
              icon={X}
            />
          </div>
        </div>
        {unreadCount > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{unreadCount} unread</p>
        )}
      </div>

      <div className="overflow-y-auto max-h-72">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                  !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div
                    className={`w-8 h-8 rounded-full ${getNotificationColor(
                      notification.type
                    )} flex items-center justify-center text-white text-xs font-semibold shrink-0`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <button
                          onClick={() => markNotificationAsRead(notification.id)}
                          className="shrink-0 text-slate-400 hover:text-brand-500 transition-colors"
                          aria-label="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {formatTime(notification.timestamp)}
                      </span>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        aria-label="Remove notification"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
