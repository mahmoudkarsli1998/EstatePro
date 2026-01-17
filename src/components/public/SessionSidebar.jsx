import React from 'react';
import { X, MessageCircle, Trash2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * SessionSidebar - Displays chat session history for the AI widget
 */
const SessionSidebar = ({ 
  sessions = [], 
  activeId, 
  onSelect, 
  onDelete, 
  onClose,
  isLoading = false 
}) => {
  const { t } = useTranslation();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return t('yesterday', 'Yesterday');
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="absolute inset-0 top-[65px] bg-white dark:bg-gray-900 z-20 flex flex-col animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/10">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-primary" />
          <h4 className="font-bold text-sm text-textDark dark:text-white">
            {t('chatHistory', 'Chat History')}
          </h4>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X size={18} className="text-gray-400" />
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && sessions.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {t('noChatsYet', 'No previous chats')}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('startChatHint', 'Start a conversation to see it here')}
            </p>
          </div>
        )}

        {!isLoading && sessions.map((session) => (
          <div
            key={session.sessionId}
            onClick={() => onSelect(session.sessionId)}
            className={`
              group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all
              ${activeId === session.sessionId 
                ? 'bg-primary/10 border border-primary/20' 
                : 'hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'}
            `}
          >
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
              ${activeId === session.sessionId 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}
            `}>
              <MessageCircle size={14} />
            </div>

            <div className="flex-1 min-w-0">
              <p className={`
                text-xs font-bold truncate
                ${activeId === session.sessionId 
                  ? 'text-primary' 
                  : 'text-textDark dark:text-white'}
              `}>
                {session.title || t('untitled', 'Untitled Chat')}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                {formatDate(session.updatedAt || session.createdAt)}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.sessionId);
              }}
              className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
              title={t('delete', 'Delete')}
            >
              <Trash2 size={14} className="text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionSidebar;
