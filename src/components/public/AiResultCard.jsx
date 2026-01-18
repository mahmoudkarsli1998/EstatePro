import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AiResultCard = ({ item, target, isSuggestion, onClick }) => {
    const { t } = useTranslation();
    // Helper for images
    const getImageUrl = (img) => img ? `http://localhost:3000/uploads/${img}` : 'https://placehold.co/400x250?text=No+Image';

    // A unit ALWAYS has a project object/id. A project NEVER has a parent project.
    // Also projects have slugs and lists of phases/blocks.
    const isProject = item.type === 'project' || 
                      (item.priceRange && !item.price) || 
                      (item.slug && !item.projectId && !item.project) || 
                      target === 'projects';

    return (
        <div 
            onClick={onClick}
            className={`flex gap-3 p-3 rounded-xl border border-border/10 transition-all cursor-pointer bg-white dark:bg-gray-800 group/card ${isSuggestion ? 'border-amber-200/50 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10' : ''}`}
        >
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                    src={getImageUrl(item.images?.[0])} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                    <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-xs text-textDark dark:text-white truncate">
                            {isProject ? (item.name || item.titleEn || t('project')) : (item.titleEn || item.name || `${item.type || t('unit')} in ${item.project?.name || 'Project'}`)}
                        </h4>
                        {isSuggestion && (
                           <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">Sug</span>
                        )}
                    </div>
                    
                    {isProject ? (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                            <MapPin size={8} />
                            <span className="truncate">
                                {item.locationName || item.cityName || item.city || (item.location?.name) || t('egypt', 'Egypt')}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                            <span>🛏️ {item.features?.bedrooms || item.bedrooms || 0}</span>
                            <span>🚿 {item.features?.bathrooms || item.bathrooms || 0}</span>
                            <span>📏 {item.area_m2 || 0}m²</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-end">
                    <div className="text-[11px] font-bold text-primary">
                        {isProject 
                            ? (item.priceRange?.min ? `${item.priceRange.min.toLocaleString()} EGP` : 'Price on Request')
                            : (item.price ? `${item.price.toLocaleString()} EGP` : 'Price on Request')
                        }
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-primary font-medium opacity-0 group-hover/card:opacity-100 transition-opacity">
                        Details <ArrowRight size={10} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiResultCard;
