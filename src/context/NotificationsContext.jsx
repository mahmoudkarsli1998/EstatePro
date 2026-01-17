import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { crmService } from '../services/crmService';

const NotificationsContext = createContext(null);

// Polling interval in milliseconds (30 seconds)
const POLL_INTERVAL = 30000;

/**
 * Check if user is authenticated by looking for token in localStorage
 */
const isAuthenticated = () => {
  // Check all possible token keys
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
  return !!token;
};

/**
 * Check if on a public page that doesn't need notifications
 */
const isPublicPage = () => {
  const pathname = window.location.pathname;
  const publicPaths = ['/login', '/invite-accept', '/register', '/', '/projects', '/units', '/about', '/contact', '/locations', '/developers'];
  // Check if it's exactly a public path or starts with one
  return publicPaths.some(path => pathname === path || (path !== '/' && pathname.startsWith(path)));
};

/**
 * NotificationsProvider - Manages notification state with polling
 */
export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(async () => {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
    const pathname = window.location.pathname;
    
    console.log('[Notifications] Checking fetch conditions:', {
      hasToken: !!authToken,
      pathname,
      isDashboard: pathname.startsWith('/dashboard')
    });
    
    // Only fetch if user is authenticated and on a dashboard page
    if (!authToken || !pathname.startsWith('/dashboard')) {
      console.log('[Notifications] Skipping fetch - not authenticated or not on dashboard');
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('[Notifications] Fetching notifications...');
      const data = await crmService.getNotifications();
      console.log('[Notifications] Received data:', data);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
      console.log('[Notifications] Unread count:', data.filter(n => !n.isRead).length);
    } catch (err) {
      // Silently handle 401 errors (user not authenticated)
      if (err?.response?.status === 401) {
        console.log('[Notifications] 401 error - clearing notifications');
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      console.error('[Notifications] Failed to fetch:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mark a single notification as read
   */
  const markAsRead = useCallback(async (id) => {
    try {
      await crmService.markNotificationRead(id);
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(n => n.id === id || n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Refresh to get accurate state
      fetchNotifications();
    }
  }, [fetchNotifications]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await crmService.markAllNotificationsRead();
      // Optimistically update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(async (id) => {
    try {
      await crmService.deleteNotification(id);
      // Remove from local state
      setNotifications(prev => {
        const notification = prev.find(n => n.id === id || n._id === id);
        if (notification && !notification.isRead) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n.id !== id && n._id !== id);
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  /**
   * Create a new notification
   * @param {Object} data - Notification data
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @param {string} data.type - Notification type (ASSIGNMENT, NEW_LEAD, etc.)
   * @param {string} data.userId - Target user ID (optional, defaults to current user)
   * @param {Object} data.metadata - Additional metadata (leadId, projectId, etc.)
   */
  const createNotification = useCallback(async (data) => {
    try {
      const newNotification = await crmService.createNotification(data);
      
      // Optimistically add to local state if it's for current user
      if (newNotification) {
        const normalized = { ...newNotification, id: newNotification.id || newNotification._id };
        setNotifications(prev => [normalized, ...prev]);
        if (!normalized.isRead) {
          setUnreadCount(count => count + 1);
        }
      }
      
      return newNotification;
    } catch (err) {
      console.error('Failed to create notification:', err);
      throw err;
    }
  }, []);

  // Initial fetch and polling setup
  useEffect(() => {
    // Initial fetch only if authenticated
    if (isAuthenticated()) {
      fetchNotifications();
    }

    // Set up polling (will check auth internally)
    const intervalId = setInterval(() => {
      if (isAuthenticated()) {
        fetchNotifications();
      }
    }, POLL_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

/**
 * Hook to use notifications context
 */
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  
  if (!context) {
    // Return safe defaults if used outside provider
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      fetchNotifications: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      deleteNotification: () => {},
      createNotification: () => {}
    };
  }
  
  return context;
};

export default NotificationsContext;
