import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Home, DollarSign, Bell, X, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { api } from '../../../utils/api';

const ActivityItem = ({ item, index }) => {
  // Map icons/colors if coming from API
  let Icon = Home;
  let color = 'text-blue-400';
  let bg = 'bg-blue-500/10';

  if (item.type === 'sale') { Icon = DollarSign; color = 'text-green-400'; bg = 'bg-green-500/10'; }
  else if (item.type === 'new_user') { Icon = User; color = 'text-purple-400'; bg = 'bg-purple-500/10'; }
  else if (item.type === 'alert') { Icon = Bell; color = 'text-yellow-400'; bg = 'bg-yellow-500/10'; }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-4 group p-2 hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg} ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-textLight dark:text-gray-300">
          <span className="font-bold text-textDark dark:text-white">{item.user}</span> {item.action} <span className="text-primary">{item.target}</span>
        </p>
        <p className="text-xs text-textLight dark:text-gray-500 mt-1">{item.time}</p>
      </div>
    </motion.div>
  );
};

const ActivityFeed = () => {
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
        const res = await api.getActivities(1, 5);
        setActivities(res.items);
      } catch (e) {
        console.error("Failed to load activities", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // Fetch modal data when page changes or modal opens
  useEffect(() => {
    if (isModalOpen) {
      const fetchPage = async () => {
        setModalLoading(true);
        try {
          const res = await api.getActivities(modalPage, 10);
          setModalActivities(res.items);
          setModalTotalPages(res.totalPages);
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
      <h3 className="text-xl font-bold text-textDark dark:text-white mb-6 font-heading">Recent Activity</h3>
      
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center p-4"><Loader className="animate-spin text-primary" /></div>
        ) : (
          activities.map((item, index) => (
            <ActivityItem key={item.id} item={item} index={index} />
          ))
        )}
      </div>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full mt-4 py-3 text-sm font-bold text-textLight dark:text-gray-400 hover:text-primary dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors border-t border-border/10 dark:border-white/10"
      >
        View All Activity
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
                <h2 className="text-xl font-bold text-white">All Activity Log</h2>
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
                  modalActivities.map((item, index) => (
                    <ActivityItem key={`modal-${item.id}`} item={item} index={index} />
                  ))
                )}
              </div>

              <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/5">
                <button 
                  disabled={modalPage === 1 || modalLoading}
                  onClick={() => setModalPage(p => Math.max(1, p - 1))}
                  className="flex items-center px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} className="me-2" /> Previous
                </button>
                <span className="text-gray-400 text-sm">
                  Page <span className="text-white font-bold">{modalPage}</span> of {modalTotalPages}
                </span>
                <button 
                  disabled={modalPage === modalTotalPages || modalLoading}
                  onClick={() => setModalPage(p => Math.min(modalTotalPages, p + 1))}
                  className="flex items-center px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight size={16} className="ms-2" />
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
