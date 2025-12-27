import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Bed, Bath, Maximize } from 'lucide-react';
import Button from '../shared/Button';
import { api } from '../../utils/api';
import { useStaggerList, useHover3D } from '../../hooks/useGSAPAnimations';

const UnitCard = ({ unit }) => {
  const cardRef = useHover3D({ intensity: 10, scale: 1.02 });

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
             <Link to={`/units/${unit.id}`} className="block w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              <Button variant="primary" className="w-full shadow-lg">View Details</Button>
            </Link>
          </div>
        </div>
        
        <div className="p-6 flex-grow flex flex-col relative z-10 bg-gradient-to-b from-transparent to-black/20 translate-z-10">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold font-heading text-textDark dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                {unit.titleEn || unit.number}
              </h3>
              <div className="flex items-center text-textLight text-xs mt-1">
                <MapPin size={12} className="mr-1 text-primary" />
                <span className="line-clamp-1">{unit.city || 'Cairo'}</span>
              </div>
            </div>
            <span className="text-primary font-bold text-lg bg-primary/10 px-2 py-1 rounded-lg border border-primary/20 whitespace-nowrap">
              ${(unit.price / 1000).toFixed(0)}k
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/10">
            <div className="flex flex-col items-center p-2 rounded-lg bg-background/50 dark:bg-white/5 border border-border/10">
              <Bed size={16} className="text-primary mb-1" />
              <span className="text-sm font-bold text-textDark dark:text-white">{unit.features?.bedrooms || 0}</span>
              <span className="text-[10px] text-textLight uppercase">Beds</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-background/50 dark:bg-white/5 border border-border/10">
              <Bath size={16} className="text-primary mb-1" />
              <span className="text-sm font-bold text-textDark dark:text-white">{unit.features?.bathrooms || 0}</span>
              <span className="text-[10px] text-textLight uppercase">Baths</span>
            </div>
             <div className="flex flex-col items-center p-2 rounded-lg bg-background/50 dark:bg-white/5 border border-border/10">
              <Maximize size={16} className="text-primary mb-1" />
              <span className="text-sm font-bold text-textDark dark:text-white">{unit.features?.area_m2 || 0}</span>
              <span className="text-[10px] text-textLight uppercase">m²</span>
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
    api.getUnits().then(data => {
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
              <UnitCard key={unit.id} unit={unit} />
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
