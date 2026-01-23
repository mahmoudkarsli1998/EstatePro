import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Brain, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles, 
  Info,
  Cpu,
  Layers,
  Search,
  Zap
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { useToast } from '../../context/ToastContext';

/**
 * AiSettings - Admin page for AI configuration and knowledge base management
 */
const AiSettings = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastStats, setLastStats] = useState(null);

  const handleReindex = async () => {
    setIsSyncing(true);
    try {
      const response = await aiService.reindexAi();
      setLastStats(response.indexed || null);
      
      const total = Object.values(response.indexed || {}).reduce((a, b) => a + b, 0);
      toast.success(
        <div>
          <p className="font-bold">{t('syncSuccessful', 'Sync Successful!')}</p>
          <p className="text-xs opacity-80">{t('indexedTotal', 'Indexed {{count}} items', { count: total })}</p>
        </div>,
        { duration: 5000 }
      );
    } catch (error) {
      console.error("AI Reindex failed:", error);
      toast.error(t('syncFailed', 'Failed to update AI knowledge base.'));
    } finally {
      setIsSyncing(false);
    }
  };

  const specs = [
    { label: t('embeddingModel', 'Embedding Model'), value: 'BAAI/bge-small-en-v1.5', icon: Cpu },
    { label: t('dimensions', 'Dimensions'), value: '384', icon: Layers },
    { label: t('searchEngine', 'Search Engine'), value: 'MongoDB Atlas Vector Search', icon: Search },
    { label: t('indexType', 'Index Type'), value: 'HNSW (Approximate)', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
          <Brain className="text-white" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-textDark dark:text-white">
            {t('aiSettings', 'AI Settings')}
          </h1>
          <p className="text-sm text-textLight dark:text-gray-400">
            {t('aiSettingsDesc', 'Manage AI knowledge base and vector search configuration')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Base Sync Card */}
        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary flex items-center justify-center">
                <Database size={22} />
              </div>
              <h3 className="text-lg font-bold text-textDark dark:text-white">
                {t('knowledgeBase', 'Knowledge Base')}
              </h3>
            </div>

            <p className="text-sm text-textLight dark:text-gray-400 leading-relaxed mb-6">
              {t('knowledgeBaseDesc', 'Synchronize projects, units, developers, and locations with the AI vector database for semantic search capabilities.')}
            </p>

            {/* Stats Display */}
            {lastStats && (
              <div className="grid grid-cols-2 gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2">
                {Object.entries(lastStats).map(([key, value]) => (
                  <div key={key} className="p-3 bg-green-500/5 dark:bg-green-500/10 border border-green-500/10 rounded-xl">
                    <div className="text-lg font-black text-green-600 dark:text-green-400">{value}</div>
                    <div className="text-xs text-green-600/70 dark:text-green-400/70 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={handleReindex}
              disabled={isSyncing}
              className={`
                w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all
                ${isSyncing 
                  ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95'}
              `}
            >
              {isSyncing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>{t('syncing', 'Syncing...')}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{t('syncNow', 'Sync Knowledge Base')}</span>
                </>
              )}
            </button>

            <div className="mt-4 p-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 rounded-xl flex items-start gap-2">
              <Info size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {t('syncHint', 'Run this after adding or modifying projects, units, developers, or locations to update AI search results.')}
              </p>
            </div>
          </div>
        </div>

        {/* AI Specs Card */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500 flex items-center justify-center">
              <Cpu size={22} />
            </div>
            <h3 className="text-lg font-bold text-textDark dark:text-white">
              {t('systemInfo', 'System Information')}
            </h3>
          </div>

          <div className="space-y-3">
            {specs.map((spec, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-border/5"
              >
                <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                  <spec.icon size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-textLight dark:text-gray-400">{spec.label}</p>
                  <p className="text-sm font-bold text-textDark dark:text-white">{spec.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Indexes Status */}
          <div className="mt-6 pt-6 border-t border-border/10">
            <h4 className="text-sm font-bold text-textDark dark:text-white mb-3">
              {t('vectorIndexes', 'Vector Indexes')}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {['projects', 'developers', 'locations', 'units'].map((index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-green-500/5 rounded-lg">
                  <CheckCircle2 size={12} className="text-green-500" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 capitalize">
                    {index}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSettings;
