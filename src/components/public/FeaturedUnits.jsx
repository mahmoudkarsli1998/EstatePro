import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Bed, Bath, Maximize, Phone, MessageCircle } from 'lucide-react';
import Button from '../shared/Button';
import { estateService } from '../../services/estateService';
import { useStaggerList, useHover3D } from '../../hooks/useGSAPAnimations';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';

const UnitCard = ({ unit }) => {
  const cardRef = useHover3D({ intensity: 10, scale: 1.02 });
  const { t, i18n } = useTranslation();
  const { format } = useCurrency();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <div ref={cardRef} className="h-full stagger-item opacity-0">
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

          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 translate-z-20">
             <Link to={`/units/${unit.id || unit._id}`} className="block w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              <Button variant="primary" className="w-full shadow-lg">View Details</Button>
            </Link>
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
                <span className="text-xl md:text-2xl font-bold text-primary font-heading">
                  {format(unit.price)}
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedUnits = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useStaggerList({ selector: '.stagger-item', delay: 0.2, dependencies: [loading, units] });

  useEffect(() => {
    estateService.getUnits().then(data => {
      // Filter for available units and take top 6, or just top 6 if mock data is limited
      const featured = data.filter(u => u.status === 'available').slice(0, 6);
      setUnits(featured.length > 0 ? featured : data.slice(0, 6)); // Fallback if no available
      setLoading(false);
    });
  }, []);

  return (
    <section className="py-20 bg-section/30 dark:bg-black/20">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-textDark dark:text-white mb-4">
              Featured Units
            </h2>
            <p className="text-textLight dark:text-gray-400 max-w-2xl">
              Explore our exclusive selection of premium properties ready for you to move in.
            </p>
          </div>
          <Link to="/units" className="hidden md:flex items-center text-primary font-medium hover:text-blue-700 transition-colors">
            View All Units <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-gray-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
            {units.map(unit => (
              <UnitCard key={unit.id || unit._id} unit={unit} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center md:hidden">
          <Link to="/units">
            <Button variant="outline" className="w-full">View All Units</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedUnits;
