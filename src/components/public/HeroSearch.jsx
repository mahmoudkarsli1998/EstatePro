import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, Clock, TrendingUp, X, ArrowRight, Sparkles, LayoutTemplate, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../shared/Button';
import { useNavigate } from 'react-router-dom';
import { estateService } from '../../services/estateService';
import Fuse from 'fuse.js';

/**
 * HeroSearch - Enhanced search with suggestions and search history
 */
const HeroSearch = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('compounds'); // 'compounds' | 'units'
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';

  // Form state
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [beds, setBeds] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [smartActive, setSmartActive] = useState(true); // Active by default

  // Search suggestions state
  const [suggestions, setSuggestions] = useState({ projects: [], units: [], developers: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // Search history state
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('search_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Popular searches
  const popularSearches = [
    { text: 'Maadi apartments', icon: TrendingUp },
    { text: 'New Cairo villas', icon: TrendingUp },
    { text: 'October projects', icon: TrendingUp },
    { text: 'Capital compounds', icon: TrendingUp },
  ];

  // Save search to history
  const saveToHistory = useCallback((query) => {
    if (!query.trim()) return;
    
    const newHistory = [
      { query: query.trim(), timestamp: Date.now() },
      ...searchHistory.filter(h => h.query !== query.trim())
    ].slice(0, 10); // Keep only last 10 searches
    
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  }, [searchHistory]);

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search_history');
  };

  // Fetch suggestions as user types
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions({ projects: [], units: [], developers: [] });
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      setSuggestionsLoading(true);
      try {
        // Fetch all entities
        const [projects, units, developers] = await Promise.all([
          estateService.getProjects(),
          estateService.getUnits(),
          estateService.getDevelopers()
        ]);

        const query = searchQuery.trim();

        // Fuzzy search for projects
        const fuseProjects = new Fuse(projects, { keys: ['name'], threshold: 0.4 });
        const projectMatches = fuseProjects.search(query).slice(0, 3).map(res => ({ type: 'project', text: res.item.name, slug: res.item.slug }));

        // Fuzzy search for units
        const fuseUnits = new Fuse(units, { keys: ['titleEn', 'city'], threshold: 0.4 });
        const unitMatches = fuseUnits.search(query).slice(0, 3).map(res => ({ type: 'unit', text: res.item.titleEn || `${res.item.type} in ${res.item.city}`, id: res.item.id }));

        // Fuzzy search for developers
        const fuseDevelopers = new Fuse(developers, { keys: ['name', 'companyName'], threshold: 0.4 });
        const developerMatches = fuseDevelopers.search(query).slice(0, 3).map(res => ({ type: 'developer', text: res.item.name || res.item.companyName, id: res.item.id }));

        setSuggestions({ projects: projectMatches, units: unitMatches, developers: developerMatches });
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setSuggestionsLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    saveToHistory(suggestion.text);
    
    // Direct navigation for matched entities
    if (suggestion.type === 'project' && suggestion.slug) {
      navigate(`/projects/${suggestion.slug}`);
    } else if (suggestion.type === 'unit' && suggestion.id) {
      navigate(`/units/${suggestion.id}`);
    } else if (suggestion.type === 'developer' && suggestion.id) {
      navigate(`/developers/${suggestion.id}`);
    } else {
      // Fallback to search list
      const target = suggestion.type === 'project' ? '/projects' : (suggestion.type === 'developer' ? '/developers' : '/units');
      navigate(`${target}?search=${encodeURIComponent(suggestion.text)}`);
    }
  };

  // Handle history item click
  const handleHistoryClick = (historyItem) => {
    setSearchQuery(historyItem.query);
    setShowSuggestions(false);
    handleSearch(historyItem.query);
  };

  const handleSearch = (overrideQuery = null, overrideTab = null) => {
    const query = typeof overrideQuery === 'string' ? overrideQuery : searchQuery;
    const tabToUse = overrideTab || activeTab;

    if (!query.trim() && !beds && !priceRange && !propertyType) return;
    
    // Save to history
    if (query.trim()) saveToHistory(query);

    // standard search navigation
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    
    // Smart Mapping: If query contains keywords, auto-switch tab if appropriate
    let finalTab = tabToUse;
    const unitKeywords = ['apartment', 'villa', 'studio', 'penthouse', 'chalet', 'duplex', 'townhouse', 'twinhouse', 'room', 'bath', 'شقة', 'فيلا', 'توين', 'تاون', 'ستوديو', 'شاليه', 'دوبلكس', 'غرفة', 'حمام'];
    const projectKeywords = ['compound', 'project', 'development', 'park', 'view', 'tower', 'mall', 'complex', 'hill', 'residence', 'كمبوند', 'مشروع', 'تطوير', 'برج', 'مول', 'مجمع', 'بارك'];
    
    const searchLower = query.toLowerCase();
    
    // Switch to Units if query has unit keywords but on compounds tab
    if (tabToUse === 'compounds' && query && unitKeywords.some(k => searchLower.includes(k))) {
        finalTab = 'units';
    } 
    // Switch to Projects if query has "compound" keywords but on units tab
    else if (tabToUse === 'units' && query && projectKeywords.some(k => searchLower.includes(k))) {
        finalTab = 'compounds';
    }

    // Parse filters
    if (propertyType && propertyType !== 'all') params.append('type', propertyType);
    
    // Parse price range logic (mock implementation)
    if (priceRange === '0-1m') {
      params.append('minPrice', '0');
      params.append('maxPrice', '1000000');
    } else if (priceRange === '1m-5m') {
      params.append('minPrice', '1000000');
      params.append('maxPrice', '5000000');
    } else if (priceRange === '5m+') {
      params.append('minPrice', '5000000');
    }

    if (beds) params.append('beds', beds);

    navigate({
      pathname: finalTab === 'compounds' ? '/projects' : '/units',
      search: params.toString()
    });
    
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto glass-panel rounded-2xl border border-white/10 backdrop-blur-md bg-section/95 dark:bg-black/60 relative z-20">
      {/* Tabs */}
      <div className="flex border-b border-white/10 relative">
        <button
          className={`flex-1 py-5 text-center font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 relative ${
            activeTab === 'compounds'
              ? 'text-primary'
              : 'text-textLight dark:text-gray-400 hover:text-textDark dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('compounds')}
        >
          <div className="flex items-center justify-center gap-2">
            <LayoutTemplate size={16} className={activeTab === 'compounds' ? 'text-primary' : 'text-gray-400'} />
            {t('compounds')}
          </div>
          {activeTab === 'compounds' && (
            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          )}
        </button>
        <button
          className={`flex-1 py-5 text-center font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 relative ${
            activeTab === 'units'
              ? 'text-primary'
              : 'text-textLight dark:text-gray-400 hover:text-textDark dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('units')}
        >
          <div className="flex items-center justify-center gap-2">
            <Home size={16} className={activeTab === 'units' ? 'text-primary' : 'text-gray-400'} />
            {t('units', 'Units')}
          </div>
          {activeTab === 'units' && (
            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          )}
        </button>
      </div>

      {/* Search Content */}
      <div className="p-6">
        {/* Main Search Input with Suggestions */}
        <div className="relative mb-0">
          <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-primary`} size={20} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length >= 2) {
                setShowSuggestions(true);
              }
            }}
            onFocus={() => {
              if (searchQuery.length >= 2 || searchHistory.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay to allow clicking on suggestions
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-xl bg-background dark:bg-white/5 border border-border/20 dark:border-white/10 text-textDark dark:text-white placeholder-textLight dark:placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:bg-background/80 dark:focus:bg-white/10 transition-all text-lg`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              } else if (e.key === 'Escape') {
                setShowSuggestions(false);
              }
            }}
          />
          
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-12' : 'right-12'}`}
            >
              <X size={18} />
            </button>
          )}
          
          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className={`absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-border/20 dark:border-gray-700 overflow-visible animate-in fade-in slide-in-from-top-2`} style={{maxHeight:'60vh',overflowY:'auto'}}>
              {/* Loading State */}
              {suggestionsLoading && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {t('loading', 'Loading...')}
                </div>
              )}

              {/* Search History */}
              {!suggestionsLoading && searchHistory.length > 0 && (
                <div className="border-b border-border/10 dark:border-gray-700">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700/50">
                    <div className={`flex items-center gap-2 text-xs text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Clock size={12} />
                      <span>{t('recentSearches', 'Recent Searches')}</span>
                    </div>
                    <button 
                      onClick={clearHistory}
                      className="text-xs text-primary hover:underline"
                    >
                      {t('clear', 'Clear')}
                    </button>
                  </div>
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(item)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <Clock size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{item.query}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions - Categorized */}
              {!suggestionsLoading && (
                <>
                  {['projects','units','developers'].map((cat) => (
                    suggestions[cat] && suggestions[cat].length > 0 && (
                      <div key={cat} className="border-b border-border/10 dark:border-gray-700">
                        <div className={`flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Search size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {cat === 'projects' ? t('projects','Projects') : cat === 'units' ? t('units','Units') : t('developers','Developers')}
                          </span>
                        </div>
                        {suggestions[cat].map((suggestion, index) => (
                          <button
                            key={cat+index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                          >
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              suggestion.type === 'project' 
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                : suggestion.type === 'unit'
                                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {suggestion.type === 'project' ? t('project', 'Project') : suggestion.type === 'unit' ? t('unit', 'Unit') : t('developer','Developer')}
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{suggestion.text}</span>
                            <ArrowRight size={14} className={`text-gray-400 ml-auto ${isRTL ? 'rotate-180' : ''}`} />
                          </button>
                        ))}
                      </div>
                    )
                  ))}
                </>
              )}

              {/* Popular Searches - shown when no query */}
              {!suggestionsLoading && !searchQuery && (
                <div className="p-4">
                  <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <TrendingUp size={14} className="text-primary" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t('popularSearches', 'Popular Searches')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((item, index) => (
                      <button
                        key={index}
                          onClick={() => {
                            setSearchQuery(item.text);
                            setShowSuggestions(false);
                            handleSearch(item.text);
                          }}
                        className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {item.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filters Row (Always Visible) */}
        <div className="block opacity-100">
          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <div className="flex-1 relative">
              <select 
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-lg border border-border/20 dark:border-white/10 text-textDark dark:text-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer bg-background dark:bg-white/5"
              >

                <option value="" className="bg-background dark:bg-dark-bg">{t('propertyTypes')}</option>
                <option value="apartment" className="bg-background dark:bg-dark-bg">{t('apartment')}</option>
                <option value="villa" className="bg-background dark:bg-dark-bg">{t('villa')}</option>
                <option value="townhouse" className="bg-background dark:bg-dark-bg">{t('townhouse')}</option>
                <option value="office" className="bg-background dark:bg-dark-bg">{t('office')}</option>
              </select>
              <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-textLight dark:text-gray-400 pointer-events-none ${isRTL ? 'right-auto left-4 rotate-180' : ''}`} size={16} />
            </div>

            <div className="flex-1 relative">
              <select 
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-lg border border-border/20 dark:border-white/10 text-textDark dark:text-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer bg-background dark:bg-white/5"
              >


                <option value="" className="bg-dark-bg">{t('bedsAndBaths')}</option>
                <option value="1" className="bg-background dark:bg-dark-bg">{t('onePlusBed')}</option>
                <option value="2" className="bg-background dark:bg-dark-bg">{t('twoPlusBeds')}</option>
                <option value="3" className="bg-background dark:bg-dark-bg">{t('threePlusBeds')}</option>
              </select>
              <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-textLight dark:text-gray-400 pointer-events-none ${isRTL ? 'right-auto left-4 rotate-180' : ''}`} size={16} />
            </div>

            <div className="flex-1 relative">
              <select 
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-lg border border-border/20 dark:border-white/10 text-textDark dark:text-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer bg-background dark:bg-white/5"
              >


                <option value="" className="bg-dark-bg">{t('priceRange')}</option>
                <option value="0-1m" className="bg-background dark:bg-dark-bg">{t('under1M')}</option>
                <option value="1m-5m" className="bg-background dark:bg-dark-bg">{t('oneToFiveM')}</option>
                <option value="5m+" className="bg-background dark:bg-dark-bg">{t('fiveMPlus')}</option>
              </select>
              <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-textLight dark:text-gray-400 pointer-events-none ${isRTL ? 'right-auto left-4 rotate-180' : ''}`} size={16} />
            </div>

            <div className="w-full md:w-auto">
              <Button 
                onClick={handleSearch}
                className="w-full md:w-40 h-full justify-center font-bold text-white shadow-lg hover:shadow-xl transition-all"
              >
                {t('search')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;
