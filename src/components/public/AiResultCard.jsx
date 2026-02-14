import React, { useState } from 'react';
import { MapPin, ArrowRight, Bed, Bath, Maximize, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getFullImageUrl, getFirstImage, UNIT_PLACEHOLDER } from '../../utils/imageHelper';

/**
 * AiResultCard - Modern, premium result card for AI chat responses
 * Features: Rounded corners, subtle shadows, premium typography
 */
const AiResultCard = ({ item, target, isSuggestion, onClick }) => {
    const { t, i18n } = useTranslation();
    const [imageError, setImageError] = useState(false);
    const isRTL = i18n.dir() === 'rtl';

    // Helper for images with proper URL construction (Sync with FeaturedUnits)
    const getImageUrl = (item) => {
        const imgList = item.images || (item.image ? [item.image] : (item.thumbnail ? [item.thumbnail] : []));
        if (!imgList || imgList.length === 0) return UNIT_PLACEHOLDER;
        return getFirstImage(imgList, target === 'projects' ? 'project' : 'unit');
    };

    // A unit ALWAYS has a project object/id. A project NEVER has a parent project.
    // Also projects have slugs and lists of phases/blocks.
    const isProject = item.type === 'project' || 
                      (item.priceRange && !item.price) || 
                      (item.slug && !item.projectId && !item.project) || 
                      target === 'projects';

    // Format price for display
    const formatPrice = (price) => {
        if (!price) return t('priceOnRequest', 'Price on Request');
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: 'EGP',
            maximumFractionDigits: 0
        }).format(price).replace('EGP', 'EGP');
    };

    return (
        <div 
            onClick={onClick}
            className={`
                group relative overflow-hidden rounded-2xl 
                border border-gray-100 dark:border-gray-800 
                bg-white dark:bg-gray-900 
                shadow-sm hover:shadow-xl 
                transition-all duration-300 ease-out
                cursor-pointer transform hover:-translate-y-1
                ${isSuggestion 
                    ? 'border-amber-200/60 dark:border-amber-700/40 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20' 
                    : 'hover:border-primary/30 dark:hover:border-primary/50'
                }
            `}
        >
            {/* Image Container - Modern rounded with overlay */}
            <div className="relative h-28 sm:h-32 overflow-hidden">
                <img 
                    src={imageError ? UNIT_PLACEHOLDER : getImageUrl(item)}
                    alt={item.name || item.titleEn} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={() => setImageError(true)}
                    loading="lazy"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Premium Badge */}
                {isSuggestion && (
                    <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/90 text-white shadow-lg backdrop-blur-sm">
                            <SparklesIcon size={10} />
                            {t('recommended', 'Recommended')}
                        </span>
                    </div>
                )}

                {/* Quick View Button */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center shadow-lg backdrop-blur-sm">
                        <Eye size={14} className="text-primary" />
                    </div>
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-3 left-3">
                    <div className="px-3 py-1.5 rounded-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg">
                        <span className="text-sm font-bold text-primary">
                            {isProject 
                                ? (item.priceRange?.min ? `${(item.priceRange.min / 1000000).toFixed(1)}M+ EGP` : t('priceOnRequest', 'Price on Request'))
                                : formatPrice(item.price)
                            }
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4">
                {/* Title */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                        {isProject 
                            ? (item.name || item.titleEn || t('project', 'Project')) 
                            : (item.titleEn || item.name || `${item.type || t('unit', 'Unit')} in ${item.project?.name || 'Project'}`)
                        }
                    </h4>
                </div>

                {/* Location or Features */}
                {isProject ? (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <MapPin size={12} className="text-primary flex-shrink-0" />
                        <span className="truncate">
                            {item.locationName || item.cityName || item.city || (item.location?.name) || t('egypt', 'Egypt')}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                            <Bed size={12} className="text-gray-400" />
                            {item.features?.bedrooms || item.bedrooms || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <Bath size={12} className="text-gray-400" />
                            {item.features?.bathrooms || item.bathrooms || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <Maximize size={12} className="text-gray-400" />
                            {item.area_m2 || 0}m²
                        </span>
                    </div>
                )}

                {/* Action Button */}
                <div className={`flex items-center justify-${isRTL ? 'start' : 'end'}`}>
                    <div className={`inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {t('viewDetails', 'View Details')}
                        <ArrowRight size={12} className={isRTL ? 'rotate-180' : ''} />
                    </div>
                </div>
            </div>

            {/* Subtle border glow on hover */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent group-hover:border-primary/20 transition-colors duration-300" />
        </div>
    );
};

// Simple Sparkles icon component
const SparklesIcon = ({ size = 16 }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path 
            d="M9.937 15.5C9.937 18.5 7.5 21 4.5 21C2.5 21 1 19 1.5 17C2 14.5 4.5 13 7 13C9.5 13 11 14.5 11 17V21" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
        />
        <path 
            d="M14.063 8.5C14.063 11.5 16.5 14 19.5 14C21.5 14 23 12 22.5 10C22 7.5 19.5 6 17 6C14.5 6 13 7.5 13 10V14" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
        />
        <path 
            d="M12 1V4M12 20V23M4.22 4.22L6.34 6.34M17.66 17.66L19.78 19.78M1 12H4M20 12H23M4.22 19.78L6.34 17.66M17.66 6.34L19.78 4.22" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
        />
    </svg>
);

export default AiResultCard;
