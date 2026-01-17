import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { reindexAi } from '../../services/aiService';
import { useToast } from '../../context/ToastContext';

/**
 * AiReindexControl - Dashboard widget to trigger AI knowledge base synchronization
 */
const AiReindexControl = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastStats, setLastStats] = useState(null);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await reindexAi();
      // Assume structure: { message: "...", indexed: { projects: X, developers: Y } }
      setLastStats(response.indexed || null);
      
      const projectCount = response.indexed?.projects || 0;
      toast.success(
        <div>
          <p className="font-bold">{t('syncSuccessful', 'Sync Successful!')}</p>
          <p className="text-xs opacity-80">{t('indexedStats', 'Indexed {{count}} projects.', { count: projectCount })}</p>
        </div>,
        { duration: 5000 }
      );
    } catch (error) {
      console.error("AI Reindex failed:", error);
      toast.error(t('syncFailed', 'Failed to update AI knowledge base. Please check server status.'));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="glass-panel p-6 overflow-hidden relative group">
      {/* Background Decor */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary flex items-center justify-center shadow-inner">
            <Database size={20} />
          </div>
          <h3 className="text-lg font-bold text-textDark dark:text-white font-heading tracking-tight">
            {t('aiKnowledgeBase', 'AI Knowledge Base')}
          </h3>
        </div>

        <p className="text-sm text-textLight dark:text-gray-400 leading-relaxed mb-6">
          {t('aiSyncDescription', 'Synchronize newly added projects and units with the AI assistant memory for smarter search results.')}
        </p>

        <div className="mt-auto space-y-4">
          {lastStats && (
            <div className="p-3 bg-green-500/5 dark:bg-green-500/10 border border-green-500/10 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
              <CheckCircle2 size={16} className="text-green-500" />
              <span className="text-xs font-bold text-green-600 dark:text-green-400">
                {t('lastSyncSuccess', 'Last sync: {{count}} items indexed', { 
                  count: (lastStats.projects || 0) + (lastStats.developers || 0) 
                })}
              </span>
            </div>
          )}

          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={`
              w-full py-3.5 px-6 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all
              ${isSyncing 
                ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 hover:shadow-primary/30'}
            `}
          >
            {isSyncing ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>{t('syncing', 'Syncing Knowledge...')}</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>{t('syncNow', 'Sync Knowledge Base')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiReindexControl;
