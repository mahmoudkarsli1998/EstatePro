import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationsContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * NotificationBell - Bell icon with unread badge and dropdown
 */
const NotificationBell = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Handle notification click - mark as read and navigate
   */
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id || notification._id);
    }

    // Navigate based on notification type
    if (notification.metadata) {
      const { leadId, projectId, unitId, userId } = notification.metadata;
      
      if (notification.type === 'ASSIGNMENT' && leadId) {
        navigate(`/dashboard/leads`);
      } else if (notification.type === 'LEAD_UPDATE' && leadId) {
        navigate(`/dashboard/leads`);
      } else if (notification.type === 'UNIT_SOLD' && unitId) {
        navigate(`/dashboard/units`);
      } else if (notification.type === 'NEW_LEAD') {
        navigate('/dashboard/leads');
      } else if (projectId) {
        navigate(`/dashboard/projects`);
      }
    }

    setIsOpen(false);
  };

  /**
   * Get notification icon based on type
   */
  const getNotificationIcon = (type) => {
    const icons = {
      ASSIGNMENT: '👤',
      LEAD_UPDATE: '📝',
      UNIT_SOLD: '🏠',
      NEW_LEAD: '🆕',
      FOLLOW_UP: '📞',
      STATUS_CHANGE: '🔄',
      default: '🔔'
    };
    return icons[type] || icons.default;
  };

  /**
   * Format relative time
   */
  const formatRelativeTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now - notificationDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow', 'Just now');
    if (diffMins < 60) return t('minutesAgo', { count: diffMins }, `${diffMins}m ago`);
    if (diffHours < 24) return t('hoursAgo', { count: diffHours }, `${diffHours}h ago`);
    if (diffDays < 7) return t('daysAgo', { count: diffDays }, `${diffDays}d ago`);
    return notificationDate.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label={t('notifications', 'Notifications')}
      >
        <Bell size={22} className="text-textLight dark:text-gray-400 hover:text-textDark dark:hover:text-white transition-colors" />
        
        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-card rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-800 dark:text-white">{t('notifications', 'Notifications')}</h3>
                {unreadCount > 0 && (
                  <span className="bg-primary/20 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                    {unreadCount} {t('new', 'new')}
                  </span>
                )}
              </div>
              
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    markAllAsRead();
                  }}
                  className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                >
                  <CheckCheck size={14} />
                  {t('markAllRead', 'Mark all read')}
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-400 text-sm mt-2">{t('loading', 'Loading...')}</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{t('noNotifications', 'No notifications yet')}</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id || notification._id}
                    className={`relative group cursor-pointer transition-colors ${
                      !notification.isRead 
                        ? 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/15' 
                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div
                      onClick={() => handleNotificationClick(notification)}
                      className="p-4 flex gap-3"
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1.5"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons (shown on hover) */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id || notification._id);
                          }}
                          className="p-1.5 rounded-md bg-white dark:bg-dark-card shadow-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          title={t('markRead', 'Mark as read')}
                        >
                          <Check size={12} className="text-green-500" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id || notification._id);
                        }}
                        className="p-1.5 rounded-md bg-white dark:bg-dark-card shadow-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        title={t('delete', 'Delete')}
                      >
                        <Trash2 size={12} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 5 && (
              <div className="p-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                <button
                  onClick={() => {
                    navigate('/dashboard/notifications');
                    setIsOpen(false);
                  }}
                  className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {t('viewAll', 'View all notifications')}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
