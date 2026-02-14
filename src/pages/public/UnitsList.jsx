import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { Filter, Grid, Map as MapIcon, Bed, Bath, Maximize, MapPin, Phone, MessageCircle, ArrowRight, X, Sparkles, RotateCcw, Search } from 'lucide-react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import PageLoader from '../../components/shared/PageLoader';
import LiquidBackground from '../../components/shared/LiquidBackground';
import { estateService } from '../../services/estateService';
import { useStaggerList, useHover3D } from '../../hooks/useGSAPAnimations';
import { useCurrency } from '../../context/CurrencyContext';
import { getFirstImage, UNIT_PLACEHOLDER } from '../../utils/imageHelper';

const UnitCard = ({ unit }) => {
  const cardRef = useHover3D({ intensity: 10, scale: 1.02 });
  const { t, i18n } = useTranslation();
  const { format } = useCurrency();
  const isRTL = i18n.dir() === 'rtl';

  // Get image with robust fallback (Same strategy as FeaturedUnits)
  const imageSrc = unit.images?.[0] ? getFirstImage(unit.images, 'unit') : UNIT_PLACEHOLDER;

  return (
    <div ref={cardRef} className="h-full stagger-item opacity-0">
      <Link to={`/units/${unit.id || unit._id}`} className="block h-full group">
        <div className="h-full flex flex-col glass-panel overflow-hidden group hover:border-primary/50 transition-all duration-300 relative transform-style-3d">
          <div className="relative h-64 overflow-hidden">
            <img 
              src={imageSrc} 
              alt={unit.number}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                e.target.src = UNIT_PLACEHOLDER;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-60"></div>
            
            <div className="absolute top-4 right-4 z-10 translate-z-10">
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/10 ${
                unit.status === 'available' 
                  ? 'bg-green-500/90 text-white shadow-md' 
                  : unit.status === 'reserved'
                  ? 'bg-yellow-500/90 text-black shadow-md'
                  : 'bg-red-500/90 text-white shadow-md'
              }`}>
                {unit.status}
              </div>
            </div>
          </div>
          
          <div className="p-6 flex-grow flex flex-col relative z-10 bg-white dark:bg-gray-900 border-t border-border/10 translate-z-10 text-right">
            
            <div className="flex-grow">
              <h3 className="text-lg md:text-xl font-bold font-heading text-textDark dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors text-right" dir="auto">
                 {unit.titleAr || unit.titleEn || unit.number}
              </h3>
              
              <div className="flex items-center justify-end text-textLight text-sm mb-4">
                <span className="line-clamp-1">
                  {unit.location?.name || unit.project?.location?.name || unit.locationAr || unit.city || 'Cairo'}
                </span>
                <MapPin size={14} className="ml-1 text-primary" />
              </div>
              
              <hr className="border-border/10 mb-4" />

              <div className={`flex items-center justify-end gap-4 text-textLight text-sm mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                 {/* Area */}
                 <div className="flex items-center gap-1">
                   <span className="font-bold text-textDark dark:text-white">{unit.area_m2 || 0}</span>
                   <span className="text-xs">{t('m2', 'm²')}</span>
                   <Maximize size={16} className="text-primary ml-1" />
                 </div>
                 
                 <div className="w-px h-4 bg-border/30"></div>

                 {/* Baths */}
                 <div className="flex items-center gap-1">
                   <span className="font-bold text-textDark dark:text-white">{unit.features?.bathrooms || 0}</span>
                   <span className="text-xs">{t('baths', 'Baths')}</span>
                   <Bath size={16} className="text-primary ml-1" />
                 </div>

                 <div className="w-px h-4 bg-border/30"></div>

                 {/* Beds */}
                 <div className="flex items-center gap-1">
                    <span className="font-bold text-textDark dark:text-white">{unit.features?.bedrooms || 0}</span>
                    <span className="text-xs">{t('beds', 'Beds')}</span>
                    <Bed size={16} className="text-primary ml-1" />
                 </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/10">
               <div className="flex gap-2">
                   <button 
                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* handle whatsapp */ }}
                     className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors shadow-md hover:shadow-lg hover:scale-110 active:scale-95 duration-200"
                   >
                      <MessageCircle size={20} />
                   </button>
                   <button 
                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* handle phone */ }}
                     className="w-10 h-10 rounded-full bg-gray-600/80 text-white flex items-center justify-center hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg hover:scale-110 active:scale-95 duration-200"
                   >
                      <Phone size={20} />
                   </button>
               </div>
               <div>
                  <span className="text-xl md:text-2xl font-bold text-primary font-heading">
                    {format(unit.price)}
                  </span>
               </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

const UnitsList = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fetchUnits = () => {
    setLoading(true);
    setError(null);
    
    const params = {
      search: searchParams.get('search'),
      type: searchParams.get('type'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      projectId: searchParams.get('projectId'),
      city: searchParams.get('city'),
      beds: searchParams.get('beds')
    };

    const fetchFunc = params.search 
      ? () => estateService.searchUnits(params)
      : () => estateService.getUnits(params);

    fetchFunc()
      .then(data => {
        setUnits(Array.isArray(data) ? data : (data.data || []));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load units:", err);
        setError(err.message || "Failed to connect to server");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUnits();
  }, [location.key, searchParams]);

  const filteredUnits = units; // Server-side filtering now handled by API

  const containerRef = useStaggerList({ 
    selector: '.stagger-item', 
    delay: 0.1, 
    dependencies: [filteredUnits, loading] 
  });

  return (
    <div className="min-h-screen pt-24 pb-12 relative">
      <LiquidBackground />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold font-heading text-textDark dark:text-white">
                {t('properties', 'Units')} <span className="text-primary">({filteredUnits.length})</span>
            </h1>
            
            <div className="glass-panel p-1 flex">
                <button 
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-textLight hover:text-textDark dark:text-gray-400 dark:hover:text-white'}`}
                onClick={() => setViewMode('grid')}
                >
                <Grid size={20} />
                </button>
                <button 
                className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-primary/20 text-primary' : 'text-textLight hover:text-textDark dark:text-gray-400 dark:hover:text-white'}`}
                onClick={() => setViewMode('map')}
                >
                <MapIcon size={20} />
                </button>
            </div>
        </div>

        {viewMode === 'grid' ? (
            <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-80 glass-panel animate-pulse shadow-sm"></div>
                    ))
                ) : error ? (
                    <div className="col-span-full text-center py-20 glass-panel border-red-500/20">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                          <X size={32} />
                        </div>
                        <p className="text-xl text-textLight dark:text-gray-400 mb-6">{error}</p>
                        <Button onClick={fetchUnits} className="shadow-lg">
                            {t('tryAgain', 'Try Again')}
                        </Button>
                    </div>
                ) : filteredUnits.length > 0 ? (
                    filteredUnits.map(unit => (
                        <UnitCard key={unit.id || unit._id} unit={unit} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 px-6 glass-panel border-primary/10">
                        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/30">
                            <Search size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-textDark dark:text-white mb-3">
                            {t('noResultsFound', 'We couldn\'t find a match')}
                        </h3>
                        <p className="text-textLight dark:text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
                            {t('tryAdjustingFilters', 'Try broadening your search or resetting filters to see more properties.')}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            <Button 
                              onClick={() => navigate('/units')} 
                              variant="outline" 
                              className="w-full sm:w-auto px-8 py-3 rounded-xl border-primary/20 text-primary hover:bg-primary/5"
                            >
                              <RotateCcw size={18} className="mr-2" /> {t('resetAllFilters', 'Reset All Filters')}
                            </Button>
                            
                            <Link 
                              to={`/ai-assistant?q=${encodeURIComponent(searchParams.get('search') || '')}`}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                            >
                              <Sparkles size={18} /> {t('askAiAssistant', 'Ask our AI Expert')}
                            </Link>
                        </div>

                        {/* Smart Suggestion for Projects */}
                        {(() => {
                           const projectKeywords = ['compound', 'project', 'developer', 'development', 'mall', 'tower', 'park', 'كمبوند', 'مشروع', 'مطور', 'شركه', 'شركات'];
                           const search = searchParams.get('search')?.toLowerCase();
                           if (search && projectKeywords.some(k => search.includes(k))) {
                             return (
                               <div className="max-w-xl mx-auto p-8 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl border border-primary/20 animate-in fade-in zoom-in duration-700">
                                 <div className="flex items-center gap-3 mb-4 justify-center">
                                     <Sparkles className="text-primary" size={20} />
                                     <span className="text-primary font-bold uppercase tracking-wider text-xs">Smart Discovery</span>
                                 </div>
                                 <p className="text-textDark dark:text-white font-medium mb-6 text-lg">
                                    Looking for <span className="text-primary">"{searchParams.get('search')}"</span> compounds or developer portfolios?
                                 </p>
                                 <Link 
                                   to={`/projects?search=${encodeURIComponent(searchParams.get('search'))}`}
                                   className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-black hover:bg-primary/90 transition-all transform hover:scale-105 active:scale-95 shadow-xl"
                                 >
                                   Switch to Compounds <ArrowRight size={20} />
                                 </Link>
                               </div>
                             );
                           }
                           return null;
                        })()}
                    </div>
                )}
            </div>
        ) : (
             <div className="h-[600px] glass-panel flex items-center justify-center text-textLight">
                 {t('mapViewComingSoon', 'Map view coming soon')}
             </div>
        )}
      </div>
    </div>
  );
};

export default UnitsList;
