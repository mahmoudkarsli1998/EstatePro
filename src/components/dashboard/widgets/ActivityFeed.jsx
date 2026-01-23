import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Home, DollarSign, Bell, X, ChevronLeft, ChevronRight, Loader, UserPlus, FileText, CheckCircle } from 'lucide-react';
import { crmService } from '../../../services/crmService';
import { useNotifications } from '../../../context/NotificationsContext';
import { useTranslation } from 'react-i18next';

const ActivityItem = ({ item, index, isNotification = false }) => {
  const { t } = useTranslation();
  
  // Map icons/colors based on type
  const getIconAndStyle = () => {
    const typeMap = {
      // Activity types
      sale: { Icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
      new_user: { Icon: UserPlus, color: 'text-purple-400', bg: 'bg-purple-500/10' },
      alert: { Icon: Bell, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
      listing: { Icon: Home, color: 'text-blue-400', bg: 'bg-blue-500/10' },
      // Notification types
      ASSIGNMENT: { Icon: UserPlus, color: 'text-orange-400', bg: 'bg-orange-500/10' },
      LEAD_UPDATE: { Icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
      NEW_LEAD: { Icon: User, color: 'text-green-400', bg: 'bg-green-500/10' },
      UNIT_SOLD: { Icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      FOLLOW_UP: { Icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10' },
      STATUS_CHANGE: { Icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    };
    return typeMap[item.type] || { Icon: Home, color: 'text-blue-400', bg: 'bg-blue-500/10' };
  };

  const { Icon, color, bg } = getIconAndStyle();

  // Get display text for notifications vs activities
  const getDisplayText = () => {
    if (isNotification) {
      return {
        title: item.title || t('notification', 'Notification'),
        subtitle: item.message || '',
        time: item.createdAt ? formatTimeAgo(item.createdAt) : t('recently', 'Recently')
      };
    }
    
    // Safely extract user name for activities
    const userName = (() => {
      if (!item.user) return t('unknownUser', 'Unknown User');
      if (typeof item.user === 'string') return item.user;
      return item.user.name || item.user.fullName || t('user', 'User');
    })();

    // Safely extract target name
    const targetName = (() => {
      if (!item.target) return t('item', 'item');
      if (typeof item.target === 'string') return item.target;
      return item.target.name || item.target.title || t('item', 'Item');
    })();

    return {
      title: userName,
      action: item.action || t('performedAction', 'performed an action on'),
      target: targetName,
      time: item.time || t('recently', 'Recently')
    };
  };

  const displayText = getDisplayText();

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-start gap-4 group p-2 hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0 ${
        isNotification && !item.isRead ? 'bg-primary/5' : ''
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg} ${color} group-hover:scale-110 transition-transform relative`}>
        <Icon size={18} />
        {isNotification && !item.isRead && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-dark-card" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        {isNotification ? (
          <>
            <p className="text-sm font-medium text-textDark dark:text-white truncate">{displayText.title}</p>
            <p className="text-xs text-textLight dark:text-gray-400 truncate">{displayText.subtitle}</p>
          </>
        ) : (
          <p className="text-sm text-textLight dark:text-gray-300">
            <span className="font-bold text-textDark dark:text-white">{displayText.title}</span>{' '}
            {displayText.action}{' '}
            <span className="text-primary">{displayText.target}</span>
          </p>
        )}
        <p className="text-xs text-textLight dark:text-gray-500 mt-1">{displayText.time}</p>
      </div>
    </motion.div>
  );
};

// Helper to format time ago
const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const ActivityFeed = () => {
  const { t } = useTranslation();
  const { notifications } = useNotifications();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalActivities, setModalActivities] = useState([]);
  const [modalPage, setModalPage] = useState(1);
  const [modalTotalPages, setModalTotalPages] = useState(1);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch initial widget data
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await crmService.getActivities(1, 5);
        const data = Array.isArray(res) ? res : (res?.items || []);
        setActivities(data);
      } catch (e) {
        console.error("Failed to load activities", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // Combine notifications and activities, sorted by time
  const combinedFeed = useMemo(() => {
    // Convert notifications to activity format with source marker
    const notificationItems = (notifications || []).slice(0, 5).map(n => ({
      ...n,
      id: `notif-${n.id || n._id}`,
      _isNotification: true,
      _timestamp: new Date(n.createdAt).getTime()
    }));

    // Add timestamp to activities for sorting
    const activityItems = (activities || []).map((a, idx) => ({
      ...a,
      id: `activity-${a.id || a._id || idx}`,
      _isNotification: false,
      _timestamp: a.createdAt ? new Date(a.createdAt).getTime() : Date.now() - Math.random() * 86400000
    }));

    // Merge and sort by timestamp (newest first)
    return [...notificationItems, ...activityItems]
      .sort((a, b) => b._timestamp - a._timestamp)
      .slice(0, 8); // Show top 8 items
  }, [notifications, activities]);

  // Fetch modal data when page changes or modal opens
  useEffect(() => {
    if (isModalOpen) {
      const fetchPage = async () => {
        setModalLoading(true);
        try {
          const res = await crmService.getActivities(modalPage, 10);
          setModalActivities(res.items || []);
          setModalTotalPages(res.totalPages || 1);
        } catch (e) {
          console.error("Failed to load page", e);
        } finally {
          setModalLoading(false);
        }
      };
      fetchPage();
    }
  }, [isModalOpen, modalPage]);

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-textDark dark:text-white font-heading flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {t('recentActivity', 'Recent Activity')}
        </h3>
        {notifications.filter(n => !n.isRead).length > 0 && (
          <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
            {notifications.filter(n => !n.isRead).length} {t('new', 'new')}
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center p-4"><Loader className="animate-spin text-primary" /></div>
        ) : combinedFeed.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Bell size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('noRecentActivity', 'No recent activity')}</p>
          </div>
        ) : (
          combinedFeed.map((item, index) => (
            <ActivityItem 
              key={item.id} 
              item={item} 
              index={index} 
              isNotification={item._isNotification}
            />
          ))
        )}
      </div>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full mt-4 py-3 text-sm font-bold text-textLight dark:text-gray-400 hover:text-primary dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors border-t border-border/10 dark:border-white/10"
      >
        {t('viewAllActivity', 'View All Activity')}
      </button>

      {/* View All Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-dark-card border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white">{t('allActivityLog', 'All Activity Log')}</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {modalLoading ? (
                  <div className="flex justify-center py-10"><Loader className="animate-spin text-primary" size={32} /></div>
                ) : (
                  (modalActivities || []).map((item, index) => (
                    <ActivityItem key={`modal-${item.id || index}`} item={item} index={index} />
                  ))
                )}
              </div>

              <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/5">
                <button 
                  disabled={modalPage === 1 || modalLoading}
                  onClick={() => setModalPage(p => Math.max(1, p - 1))}
                  className="flex items-center px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} className="me-2" /> {t('previous', 'Previous')}
                </button>
                <span className="text-gray-400 text-sm">
                  {t('page', 'Page')} <span className="text-white font-bold">{modalPage}</span> {t('of', 'of')} {modalTotalPages}
                </span>
                <button 
                  disabled={modalPage === modalTotalPages || modalLoading}
                  onClick={() => setModalPage(p => Math.min(modalTotalPages, p + 1))}
                  className="flex items-center px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('next', 'Next')} <ChevronRight size={16} className="ms-2" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivityFeed;

