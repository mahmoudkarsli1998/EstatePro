import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, Grid, Map as MapIcon, Search, RotateCcw, X, Sparkles, ArrowRight } from 'lucide-react';
import Button from './Button';
import PageLoader from './PageLoader';
import LiquidBackground from './LiquidBackground';
import FilterSidebar from '../public/FilterSidebar';
import { useStaggerList } from '../../hooks/useGSAPAnimations';

const BaseContentPage = ({
  title,
  entityType = 'units',
  fetchFunction,
  filterOptions = {},
  renderCard,
  searchPlaceholder = 'Search...',
  showViewToggle = true,
  emptyStateMessage = 'No results found',
  emptyStateSuggestion = 'Try adjusting your search or filters',
  smartSuggestionKeywords = [],
  smartSuggestionLink = null,
  children
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    type: '',
    status: '',
    beds: '',
    location: '',
    ...filterOptions
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const containerRef = useStaggerList({ 
    selector: '.stagger-item', 
    delay: 0.1, 
    dependencies: [items, loading] 
  });

  const fetchItems = () => {
    setLoading(true);
    setError(null);
    
    const searchText = searchParams.get('search');
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const beds = searchParams.get('beds');
    const location = searchParams.get('location');
    const status = searchParams.get('status');
    
    const params = {};
    if (searchText) params.search = searchText;
    if (type) params.type = type;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (beds) params.beds = beds;
    if (location) params.city = location;
    if (status) params.status = status;
    
    fetchFunction(params)
      .then(data => {
        // Handle different response formats
        let itemsData = [];
        if (Array.isArray(data)) {
          itemsData = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          itemsData = data.data;
        } else if (data && data.items && Array.isArray(data.items)) {
          itemsData = data.items;
        } else if (data && typeof data === 'object') {
          // If it's an object but not matching expected patterns, try to find array in it
          const possibleArrays = ['data', 'items', 'results', 'projects', 'units'];
          for (const key of possibleArrays) {
            if (data[key] && Array.isArray(data[key])) {
              itemsData = data[key];
              break;
            }
          }
        }
        
        setItems(itemsData);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to load ${entityType}:`, err);
        setError(err.message || "Failed to connect to server");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, [searchParams]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (key === 'location') {
          newSearchParams.set('city', value);
        } else {
          newSearchParams.set(key, value);
        }
      }
    });
    
    const currentPath = window.location.pathname;
    const queryString = newSearchParams.toString();
    const newUrl = queryString ? `${currentPath}?${queryString}` : currentPath;
    
    if (window.location.search !== `?${queryString}`) {
      navigate(newUrl, { replace: true });
    }
  }, [filters, navigate]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      minPrice: '',
      maxPrice: '',
      type: '',
      status: '',
      beds: '',
      location: '',
      ...filterOptions
    };
    setFilters(resetFilters);
    navigate(window.location.pathname, { replace: true });
  };

  const renderSmartSuggestion = () => {
    if (!smartSuggestionKeywords.length || !searchParams.get('search')) {
      return null;
    }

    const search = searchParams.get('search')?.toLowerCase();
    if (smartSuggestionKeywords.some(k => search?.includes(k))) {
      return (
        <div className="max-w-xl mx-auto p-8 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl border border-primary/20 animate-in fade-in zoom-in duration-700">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <Sparkles className="text-primary" size={20} />
            <span className="text-primary font-bold uppercase tracking-wider text-xs">Smart Discovery</span>
          </div>
          <p className="text-textDark dark:text-white font-medium mb-6 text-lg">
            Looking for <span className="text-primary">"{searchParams.get('search')}"</span> {smartSuggestionLink?.text || 'items'}?
          </p>
          {smartSuggestionLink && (
            <button
              onClick={() => navigate(smartSuggestionLink.path)}
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-black hover:bg-primary/90 transition-all transform hover:scale-105 active:scale-95 shadow-xl"
            >
              Switch to {smartSuggestionLink.text} <ArrowRight size={20} />
            </button>
          )}
        </div>
      );
    }
    return null;
  };

  if (children) {
    return children({
      items,
      loading,
      error,
      viewMode,
      setViewMode,
      filters,
      setFilters: handleFilterChange,
      handleReset,
      isFilterOpen,
      setIsFilterOpen,
      containerRef,
      fetchItems
    });
  }

  return (
    <div className="min-h-screen pt-24 pb-12 relative">
      <LiquidBackground />
      
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-12 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold font-heading text-textDark dark:text-white">
            {title} <span className="text-primary">({items.length})</span>
          </h1>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Filter Toggle Button */}
            <Button
              onClick={() => setIsFilterOpen(true)}
              variant="outline"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 border-primary/20 text-primary hover:bg-primary/5"
            >
              <Filter size={20} />
              Filters
            </Button>
            
            {showViewToggle && (
              <div className="glass-panel p-1 flex">
                  <button 
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-textLight hover:text-textDark'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid size={20} />
                  </button>
                  <button 
                    className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-primary/20 text-primary' : 'text-textLight hover:text-textDark'}`}
                    onClick={() => setViewMode('map')}
                  >
                    <MapIcon size={20} />
                  </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'grid' ? (
          <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {loading ? (
              [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-80 glass-panel animate-pulse shadow-sm"></div>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-20 glass-panel border-red-500/20">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                  <X size={32} />
                </div>
                <p className="text-xl text-textLight dark:text-gray-400 mb-6">{error}</p>
                <Button onClick={fetchItems} className="shadow-lg">
                  {t('tryAgain', 'Try Again')}
                </Button>
              </div>
            ) : items.length > 0 ? (
              items.map(item => (
                <div key={item.id || item._id} className="stagger-item opacity-0">
                  {renderCard(item)}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 px-6 glass-panel border-primary/10">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/30">
                  <Search size={40} />
                </div>
                <h3 className="text-2xl font-bold text-textDark dark:text-white mb-3">
                  {t('noResultsFound', emptyStateMessage)}
                </h3>
                <p className="text-textLight dark:text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
                  {t('tryAdjustingFilters', emptyStateSuggestion)}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl border-primary/20 text-primary hover:bg-primary/5"
                  >
                    <RotateCcw size={18} className="mr-2" /> {t('resetAllFilters', 'Reset All Filters')}
                  </Button>
                </div>

                {renderSmartSuggestion()}
              </div>
            )}
          </div>
        ) : (
          <div className="h-[600px] glass-panel flex items-center justify-center text-textLight">
            {t('mapViewComingSoon', 'Map view coming soon')}
          </div>
        )}
      </div>

      <FilterSidebar
        filters={filters}
        setFilters={handleFilterChange}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
};

export default BaseContentPage;
