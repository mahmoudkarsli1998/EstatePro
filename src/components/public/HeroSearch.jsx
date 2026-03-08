import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, Clock, TrendingUp, X, ArrowRight, LayoutTemplate, Home, MapPin, Building2, User, Tag } from 'lucide-react';
import Button from '../shared/Button';
import { useNavigate } from 'react-router-dom';
import { estateService } from '../../services/estateService';
import { searchItems, parseSearchQuery, SearchStrategies } from '../../utils/smartSearch';

/**
 * HeroSearch - Smart search without AI, using algorithmic filtering
 */
const HeroSearch = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('compounds');
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';

  // Form state
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [beds, setBeds] = useState('');
  const [priceRange, setPriceRange] = useState('');

  // Data cache
  const [allProjects, setAllProjects] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [allDevelopers, setAllDevelopers] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState({ projects: [], units: [], developers: [], locations: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Search history
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('search_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projects, units, developers] = await Promise.all([
          estateService.getProjects(),
          estateService.getUnits(),
          estateService.getDevelopers()
        ]);
        setAllProjects(projects || []);
        setAllUnits(units || []);
        setAllDevelopers(developers || []);
        setDataLoaded(true);
      } catch (err) {
        console.error('Error loading search data:', err);
      }
    };
    loadData();
  }, []);

  // Parse query for filters
  const parsedQuery = useMemo(() => {
    return parseSearchQuery(searchQuery);
  }, [searchQuery]);

  // Generate suggestions based on query
  useEffect(() => {
    if (!isFocused) {
      setShowSuggestions(false);
      return;
    }

    if (!searchQuery.trim() || searchQuery.length < 2 || !dataLoaded) {
      if (searchQuery.length === 0 && searchHistory.length > 0) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
      return;
    }

    setSuggestionsLoading(true);

    // Debounce suggestions
    const timeoutId = setTimeout(() => {
      const query = searchQuery.trim();

      // Search projects
      const projectResults = searchItems(allProjects, query, {
        fields: ['name', 'location', 'city', 'description'],
        strategy: SearchStrategies.MULTI_FIELD,
        threshold: 0.2
      }).slice(0, 4);

      // Search units
      const unitResults = searchItems(allUnits, query, {
        fields: ['titleEn', 'titleAr', 'city', 'type', 'projectName'],
        strategy: SearchStrategies.MULTI_FIELD,
        threshold: 0.2
      }).slice(0, 4);

      // Search developers
      const developerResults = searchItems(allDevelopers, query, {
        fields: ['name', 'companyName', 'description'],
        strategy: SearchStrategies.MULTI_FIELD,
        threshold: 0.2
      }).slice(0, 3);

      // Generate location suggestions
      const commonLocations = [
        { name: 'Maadi', arName: 'المعادي' },
        { name: 'New Cairo', arName: 'القاهرة الجديدة' },
        { name: '6 October', arName: '6 أكتوبر' },
        { name: 'Sheikh Zayed', arName: 'الشيخ زايد' },
        { name: 'Nasr City', arName: 'مدينة نصر' },
        { name: 'Heliopolis', arName: 'مصر الجديدة' },
        { name: 'Mohandessin', arName: 'المهندسين' },
        { name: 'Zamalek', arName: 'الزمالك' },
        { name: 'Fifth Settlement', arName: 'التجمع الخامس' },
        { name: 'Rehab', arName: 'الرحاب' },
        { name: 'Madinaty', arName: 'مدينتي' },
      ];

      const locationMatches = commonLocations.filter(loc => 
        loc.name.toLowerCase().includes(query.toLowerCase()) ||
        loc.arName.includes(query)
      ).slice(0, 3);

      setSuggestions({
        projects: projectResults.map(p => ({
          type: 'project',
          text: p.name,
          slug: p.slug,
          subtitle: p.location || p.city,
          score: p._score
        })),
        units: unitResults.map(u => ({
          type: 'unit',
          text: u.titleEn || u.titleAr || `${u.type} in ${u.city}`,
          id: u.id || u._id,
          subtitle: `${u.type} • ${u.city}${u.price ? ` • ${u.price.toLocaleString()} EGP` : ''}`,
          score: u._score
        })),
        developers: developerResults.map(d => ({
          type: 'developer',
          text: d.name || d.companyName,
          id: d.id || d._id,
          score: d._score
        })),
        locations: locationMatches
      });

      setShowSuggestions(true);
      setSuggestionsLoading(false);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, allProjects, allUnits, allDevelopers, dataLoaded, searchHistory.length, isFocused]);

  // Save to history
  const saveToHistory = useCallback((query) => {
    if (!query.trim()) return;
    const newHistory = [
      { query: query.trim(), timestamp: Date.now() },
      ...searchHistory.filter(h => h.query !== query.trim())
    ].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  }, [searchHistory]);

  // Clear history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search_history');
  };

  // Handle search submission
  const handleSearch = (overrideQuery = null) => {
    const query = typeof overrideQuery === 'string' ? overrideQuery : searchQuery;
    
    if (!query.trim() && !beds && !priceRange && !propertyType) return;

    // Save to history
    if (query.trim()) saveToHistory(query);

    // Parse the query for filters
    const { searchText, filters: parsedFilters } = parseSearchQuery(query);

    // Build URL params
    const params = new URLSearchParams();
    
    // Add search text if present
    if (searchText) params.append('search', searchText);
    
    // Merge dropdown filters with parsed filters
    const finalFilters = { ...parsedFilters };
    
    if (propertyType && propertyType !== 'all') {
      finalFilters.type = propertyType;
    }
    
    if (beds) {
      finalFilters.beds = parseInt(beds);
    }
    
    if (priceRange) {
      if (priceRange === '0-1m') {
        finalFilters.minPrice = 0;
        finalFilters.maxPrice = 1000000;
      } else if (priceRange === '1m-5m') {
        finalFilters.minPrice = 1000000;
        finalFilters.maxPrice = 5000000;
      } else if (priceRange === '5m+') {
        finalFilters.minPrice = 5000000;
      }
    }

    // Add all filters to params
    Object.entries(finalFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    // Determine target based on query content
    let target = activeTab;
    const lowerQuery = query.toLowerCase();
    const unitKeywords = ['apartment', 'villa', 'studio', 'penthouse', 'chalet', 'duplex', 'townhouse', 'twinhouse', 'room', 'bed', 'bath', 'شقة', 'فيلا', 'توين', 'تاون', 'ستوديو', 'شاليه', 'دوبلكس', 'غرفة', 'حمام'];
    const projectKeywords = ['compound', 'project', 'development', 'park', 'view', 'tower', 'mall', 'complex', 'كمبوند', 'مشروع', 'تطوير', 'برج', 'مول', 'مجمع', 'بارك'];
    
    if (unitKeywords.some(k => lowerQuery.includes(k))) target = 'units';
    else if (projectKeywords.some(k => lowerQuery.includes(k))) target = 'compounds';

    navigate({
      pathname: target === 'compounds' ? '/projects' : '/units',
      search: params.toString()
    });

    setShowSuggestions(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'location') {
      setSearchQuery(suggestion.name);
      handleSearch(suggestion.name);
    } else if (suggestion.type === 'project' && suggestion.slug) {
      navigate(`/projects/${suggestion.slug}`);
    } else if (suggestion.type === 'unit' && suggestion.id) {
      navigate(`/units/${suggestion.id}`);
    } else if (suggestion.type === 'developer' && suggestion.id) {
      navigate(`/developers/${suggestion.id}`);
    } else {
      setSearchQuery(suggestion.text);
      handleSearch(suggestion.text);
    }
    setShowSuggestions(false);
  };

  // Popular searches
  const popularSearches = [
    { text: '2 bedroom in Maadi', type: 'units' },
    { text: 'villa under 5M', type: 'units' },
    { text: 'New Cairo compounds', type: 'projects' },
    { text: 'studio apartments', type: 'units' },
  ];

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
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
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
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          )}
        </button>
      </div>

      {/* Search Content */}
      <div className="p-6">
        {/* Search Input with Suggestions */}
        <div className="relative mb-0">
          <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-primary`} size={20} />
          <input
            type="text"
            placeholder={t('searchPlaceholder', 'Search by name, location, type...')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length >= 2) {
                setShowSuggestions(true);
              }
            }}
            onFocus={() => {
              setIsFocused(true);
              if (searchQuery.length >= 2 || searchHistory.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsFocused(false);
                setShowSuggestions(false);
              }, 200);
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
            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-border/20 dark:border-gray-700 overflow-visible" style={{maxHeight:'60vh',overflowY:'auto'}}>
              {/* Loading State */}
              {suggestionsLoading && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  <div className="inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
                  {t('loading', 'Searching...')}
                </div>
              )}

              {/* Search History */}
              {!suggestionsLoading && searchQuery.length === 0 && searchHistory.length > 0 && (
                <div className="border-b border-border/10 dark:border-gray-700">
                  <div className={`flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
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
                      onClick={() => {
                        setSearchQuery(item.query);
                        handleSearch(item.query);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <Clock size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{item.query}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Location Suggestions */}
              {!suggestionsLoading && suggestions.locations.length > 0 && (
                <div className="border-b border-border/10 dark:border-gray-700">
                  <div className={`flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <MapPin size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{t('locations', 'Locations')}</span>
                  </div>
                  {suggestions.locations.map((loc, index) => (
                    <button
                      key={`loc-${index}`}
                      onClick={() => handleSuggestionClick({ type: 'location', name: loc.name })}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                        {t('location', 'Location')}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{loc.name}</span>
                      <span className="text-xs text-gray-400">{loc.arName}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Project Suggestions */}
              {!suggestionsLoading && suggestions.projects.length > 0 && (
                <div className="border-b border-border/10 dark:border-gray-700">
                  <div className={`flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Building2 size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{t('projects', 'Projects')}</span>
                  </div>
                  {suggestions.projects.map((suggestion, index) => (
                    <button
                      key={`proj-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {t('project', 'Project')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-700 dark:text-gray-300 block truncate">{suggestion.text}</span>
                        {suggestion.subtitle && (
                          <span className="text-xs text-gray-400 block truncate">{suggestion.subtitle}</span>
                        )}
                      </div>
                      <ArrowRight size={14} className={`text-gray-400 flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                  ))}
                </div>
              )}

              {/* Unit Suggestions */}
              {!suggestionsLoading && suggestions.units.length > 0 && (
                <div className="border-b border-border/10 dark:border-gray-700">
                  <div className={`flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Home size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{t('units', 'Units')}</span>
                  </div>
                  {suggestions.units.map((suggestion, index) => (
                    <button
                      key={`unit-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        {t('unit', 'Unit')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-700 dark:text-gray-300 block truncate">{suggestion.text}</span>
                        {suggestion.subtitle && (
                          <span className="text-xs text-gray-400 block truncate">{suggestion.subtitle}</span>
                        )}
                      </div>
                      <ArrowRight size={14} className={`text-gray-400 flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                  ))}
                </div>
              )}

              {/* Developer Suggestions */}
              {!suggestionsLoading && suggestions.developers.length > 0 && (
                <div className="border-b border-border/10 dark:border-gray-700">
                  <div className={`flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <User size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{t('developers', 'Developers')}</span>
                  </div>
                  {suggestions.developers.map((suggestion, index) => (
                    <button
                      key={`dev-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                        {t('developer', 'Developer')}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{suggestion.text}</span>
                      <ArrowRight size={14} className={`text-gray-400 flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Searches - shown when no query */}
              {!suggestionsLoading && searchQuery.length === 0 && (
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

        {/* Smart Search Hints */}
        <div className={`mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span>{t('try', 'Try')}:</span>
          {['2 bed Maadi', 'villa under 5M', 'New Cairo', 'studio', 'compound'].map((hint, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(hint);
                handleSearch(hint);
              }}
              className="text-primary hover:underline cursor-pointer"
            >
              "{hint}"
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="block opacity-100 mt-4">
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <div className="flex-1 relative">
              <select 
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-lg border border-border/20 dark:border-white/10 text-textDark dark:text-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer bg-background dark:bg-white/5"
              >
                <option value="">{t('propertyTypes', 'All Types')}</option>
                <option value="apartment">{t('apartment', 'Apartment')}</option>
                <option value="villa">{t('villa', 'Villa')}</option>
                <option value="studio">{t('studio', 'Studio')}</option>
                <option value="penthouse">{t('penthouse', 'Penthouse')}</option>
                <option value="duplex">{t('duplex', 'Duplex')}</option>
                <option value="townhouse">{t('townhouse', 'Townhouse')}</option>
                <option value="twinhouse">{t('twinhouse', 'Twinhouse')}</option>
                <option value="office">{t('office', 'Office')}</option>
              </select>
              <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-textLight dark:text-gray-400 pointer-events-none ${isRTL ? 'right-auto left-4 rotate-180' : ''}`} size={16} />
            </div>

            <div className="flex-1 relative">
              <select 
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-lg border border-border/20 dark:border-white/10 text-textDark dark:text-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer bg-background dark:bg-white/5"
              >
                <option value="">{t('beds', 'Any Beds')}</option>
                <option value="0">{t('studio', 'Studio')}</option>
                <option value="1">{t('oneBed', '1+ Beds')}</option>
                <option value="2">{t('twoBeds', '2+ Beds')}</option>
                <option value="3">{t('threeBeds', '3+ Beds')}</option>
                <option value="4">{t('fourBeds', '4+ Beds')}</option>
                <option value="5">{t('fiveBeds', '5+ Beds')}</option>
              </select>
              <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-textLight dark:text-gray-400 pointer-events-none ${isRTL ? 'right-auto left-4 rotate-180' : ''}`} size={16} />
            </div>

            <div className="flex-1 relative">
              <select 
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-lg border border-border/20 dark:border-white/10 text-textDark dark:text-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer bg-background dark:bg-white/5"
              >
                <option value="">{t('priceRange', 'Any Price')}</option>
                <option value="0-1m">{t('under1M', 'Under 1M')}</option>
                <option value="1m-5m">{t('oneToFiveM', '1M - 5M')}</option>
                <option value="5m+">{t('fiveMPlus', '5M+')}</option>
              </select>
              <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-textLight dark:text-gray-400 pointer-events-none ${isRTL ? 'right-auto left-4 rotate-180' : ''}`} size={16} />
            </div>

            <div className="w-full md:w-auto">
              <Button 
                onClick={() => handleSearch()}
                className="w-full md:w-40 h-full justify-center font-bold text-white shadow-lg hover:shadow-xl transition-all gap-2"
              >
                <Search size={18} />
                {t('search', 'Search')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;
