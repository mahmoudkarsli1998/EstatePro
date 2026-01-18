import React, { useState } from 'react';
import { Search, Sparkles, Brain, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import AiResultCard from './AiResultCard';

const AiSearchWidget = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [enableRag, setEnableRag] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const response = await api.askAi(query, enableRag);
      setResults(response);
    } catch (error) {
      console.error('AI Search Error:', error);
      setResults({
        target: 'chat',
        message: 'Sorry, I encountered an error. Please try again.',
        data: [],
        suggestions: []
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCardClick = (item, target) => {
    const isProject = item.type === 'project' || target === 'projects';
    if (isProject) {
      navigate(`/projects/${item.slug || item.id || item._id}`);
    } else {
      navigate(`/units/${item._id || item.id}`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Search Input with RAG Toggle */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10 backdrop-blur-md bg-white/90 dark:bg-black/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Brain className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-textDark dark:text-white tracking-tight">
                AI Search
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Powered by EstatePro Intelligence
              </p>
            </div>
          </div>

          {/* RAG Toggle */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-full border border-border/10">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="flex items-center gap-2">
                {enableRag ? (
                  <Sparkles size={16} className="text-primary animate-pulse" />
                ) : (
                  <Target size={16} className="text-gray-400" />
                )}
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  {enableRag ? 'Smart Mode' : 'Exact Mode'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={enableRag}
                  onChange={(e) => setEnableRag(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-purple-600 shadow-inner"></div>
              </div>
            </label>
          </div>
        </div>

        {/* Mode Description */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-purple-600/5 border border-primary/10">
          <div className="flex items-start gap-3">
            <Zap size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600 dark:text-gray-300">
              {enableRag ? (
                <>
                  <span className="font-black text-primary">Smart Mode:</span> AI will provide personalized suggestions if no exact matches are found. Perfect for exploratory searches.
                </>
              ) : (
                <>
                  <span className="font-black text-gray-700 dark:text-gray-200">Exact Mode:</span> Returns only precise matches to your query. Best for specific requirements.
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-primary" size={22} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything... (e.g., 'Studio in Maadi under 2M')"
              className="w-full pl-14 pr-32 py-5 rounded-2xl bg-background dark:bg-white/5 border-2 border-border/20 dark:border-white/10 text-textDark dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium"
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={!query.trim() || isSearching}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="hidden sm:inline">Searching...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {results && (
        <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* AI Message */}
          {(results.message || results.explanation) && (
            <div className="mb-6 p-6 bg-gradient-to-br from-primary/5 to-purple-600/5 dark:from-primary/10 dark:to-purple-600/10 rounded-2xl border border-primary/10">
              <div className="flex items-start gap-4">
                <Brain className="text-primary flex-shrink-0 mt-1" size={24} />
                <p className="text-textDark dark:text-white font-medium leading-relaxed" dir="auto">
                  {results.message || results.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Exact Matches */}
          {results.data?.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Target className="text-primary" size={20} />
                <h3 className="text-xl font-black text-textDark dark:text-white">
                  Exact Matches
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.data.map((item, index) => (
                  <AiResultCard
                    key={item._id || item.id || index}
                    item={item}
                    target={results.target}
                    onClick={() => handleCardClick(item, results.target)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {results.suggestions?.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-amber-500 animate-pulse" size={20} />
                <h3 className="text-xl font-black text-textDark dark:text-white">
                  AI Suggestions
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.suggestions.map((item, index) => (
                  <AiResultCard
                    key={`sug-${item._id || item.id || index}`}
                    item={item}
                    target={results.target}
                    isSuggestion={true}
                    onClick={() => handleCardClick(item, results.target)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {results.data?.length === 0 && results.suggestions?.length === 0 && results.target !== 'chat' && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-gray-400" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">
                No results found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search terms or toggle Smart Mode for AI suggestions
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiSearchWidget;
