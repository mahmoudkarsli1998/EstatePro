import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin, Phone, MessageCircle } from 'lucide-react';
import BaseContentPage from '../../components/shared/BaseContentPage';
import { estateService } from '../../services/estateService';
import { useHover3D } from '../../hooks/useGSAPAnimations';
import { useCurrency } from '../../context/CurrencyContext';
import { getFirstImage, UNIT_PLACEHOLDER } from '../../utils/imageHelper';
import Button from '../../components/shared/Button';


const UnitCard = ({ unit }) => {
  const cardRef = useHover3D({ intensity: 10, scale: 1.02 });
  const { t, i18n } = useTranslation();
  const { format } = useCurrency();
  const isRTL = i18n.dir() === 'rtl';

  // Get image with robust fallback (Same strategy as FeaturedUnits)
  const imageSrc = unit.images?.[0] ? getFirstImage(unit.images, 'unit') : UNIT_PLACEHOLDER;

  return (
    <div ref={cardRef} className="h-full stagger-item opacity-0">
      <Link to={`/units/${unit.id || unit._id}`} className="h-full stagger-item opacity-0 block group">
        <div className="h-full flex flex-col glass-panel overflow-hidden group hover:border-primary/50 transition-all duration-300 relative transform-style-3d text-right">
          {/* Image Section */}
          <div className="relative h-64 overflow-hidden">
            <img 
              src={imageSrc} 
              alt={unit.titleAr || unit.titleEn || unit.number}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                e.target.src = UNIT_PLACEHOLDER;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-60"></div>
            
            {/* Status Badge */}
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
              <Button variant="primary" className="w-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">View Details</Button>
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
  const navigate = useNavigate();

  const projectKeywords = ['compound', 'project', 'developer', 'development', 'mall', 'tower', 'park', 'كمبوند', 'مشروع', 'مطور', 'شركه', 'شركات'];

  return (
    <BaseContentPage
      title={t('properties', 'Units')}
      entityType="units"
      fetchFunction={(params) => {
        const hasFilters = Object.keys(params).length > 0;
        return hasFilters 
          ? estateService.searchUnits(params)
          : estateService.getUnits();
      }}
      filterOptions={{
        beds: '',
        location: ''
      }}
      searchPlaceholder="Search units..."
      emptyStateMessage="We couldn't find a match"
      emptyStateSuggestion="Try broadening your search or resetting filters to see more properties."
      smartSuggestionKeywords={projectKeywords}
      smartSuggestionLink={{
        text: 'Compounds',
        path: '/projects'
      }}
      renderCard={(unit) => <UnitCard unit={unit} />}
    />
  );
};

export default UnitsList;
