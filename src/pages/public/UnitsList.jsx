import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Grid, Map as MapIcon, Bed, Bath, Maximize, MapPin, Phone, MessageCircle } from 'lucide-react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import PageLoader from '../../components/shared/PageLoader';
import LiquidBackground from '../../components/shared/LiquidBackground';
import { api } from '../../utils/api';
import { useStaggerList, useHover3D } from '../../hooks/useGSAPAnimations';

// Reusing UnitCard Logic internally for this page or importing if exported. 
// Since FeaturedUnits has it internally, I'll recreate a robust one here.

const UnitCard = ({ unit }) => {
  const cardRef = useHover3D({ intensity: 10, scale: 1.02 });
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <div ref={cardRef} className="h-full stagger-item opacity-0">
      <Link to={`/units/${unit.id}`} className="block h-full group">
        <div className="h-full flex flex-col glass-panel overflow-hidden group hover:border-primary/50 transition-all duration-300 relative transform-style-3d">
          <div className="relative h-64 overflow-hidden">
            <img 
              src={`${unit.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'}?w=800&q=80&auto=format`} 
              alt={unit.number} 
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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
                <span className="line-clamp-1">{unit.locationAr || unit.city || 'Cairo'}</span>
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
                   <button className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors shadow-md hover:shadow-lg hover:scale-110 active:scale-95 duration-200">
                      <MessageCircle size={20} />
                   </button>
                   <button className="w-10 h-10 rounded-full bg-gray-600/80 text-white flex items-center justify-center hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg hover:scale-110 active:scale-95 duration-200">
                      <Phone size={20} />
                   </button>
               </div>
               <div>
                  <span className="text-[10px] text-textLight block text-left mb-0.5" style={{ textAlign: 'left' }}>EGP</span>
                  <span className="text-xl md:text-2xl font-bold text-primary font-heading">
                    {unit.price?.toLocaleString()}
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
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  // Basic filtering state
  const [searchParams] = useSearchParams();
  const [filterType, setFilterType] = useState(searchParams.get('type') || 'all');

  useEffect(() => {
    setLoading(true);
    api.getUnits().then(data => {
      setUnits(data);
      setLoading(false);
    });
  }, []);

  const filteredUnits = units.filter(unit => {
      // Basic filter logic can be expanded
      if(filterType === 'all') return true;
      // if(filterType === 'resale') return unit.status === 'resale'; // Example
      return true;
  });

  const containerRef = useStaggerList({ 
    selector: '.stagger-item', 
    delay: 0.1, 
    dependencies: [filteredUnits, loading] 
  });

  if (loading) return <PageLoader />;

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
                {filteredUnits.length > 0 ? (
                    filteredUnits.map(unit => (
                        <UnitCard key={unit.id} unit={unit} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-20">
                        <p className="text-xl text-textLight">{t('noUnitsFound', 'No properties found.')}</p>
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
