import React from 'react';
import { useTranslation } from 'react-i18next';
import { Key, LockOpen, Building2, RefreshCw, Percent, KeyRound, Tag, PieChart } from 'lucide-react';
import { useStaggerList } from '../../hooks/useGSAPAnimations';
import { useNavigate } from 'react-router-dom';

const CategoryCard = ({ icon: Icon, title, onClick }) => (
  <div 
    onClick={onClick}
    className="category-item opacity-0 flex flex-col items-center justify-center p-6 glass-panel rounded-2xl hover:bg-white/10 transition-all duration-300 cursor-pointer group hover:-translate-y-2 border border-white/5 active:scale-95"
  >
    <div className="w-14 h-14 mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md">
      <Icon size={28} />
    </div>
    <span className="font-bold text-textLight dark:text-gray-300 group-hover:text-primary dark:group-hover:text-white transition-colors text-sm text-center tracking-wide">{title}</span>
  </div>
);

const CategoryGrid = () => {
  const { t } = useTranslation();
  const containerRef = useStaggerList({ selector: '.category-item', delay: 0.2, threshold: 0.1 });
  const navigate = useNavigate();

  const categories = [
    { icon: Key, title: t('estateProKeys'), filter: { type: 'keys' } },
    { icon: LockOpen, title: t('unlocked'), filter: { status: 'unlocked' } },
    { icon: Building2, title: t('developerUnits'), filter: { type: 'developer' } },
    { icon: RefreshCw, title: t('resaleUnits'), filter: { status: 'resale' } },
    { icon: Percent, title: t('offers'), filter: { type: 'offer' } },
    { icon: KeyRound, title: t('moveNow'), filter: { status: 'ready' } },
    { icon: Tag, title: t('sellYourUnit'), action: '/sell' }, 
    { icon: PieChart, title: t('invest'), filter: { type: 'invest' } }
  ];

  const handleCategoryClick = (category) => {
    if (category.action) {
      navigate(category.action);
    } else if (category.filter) {
      const params = new URLSearchParams(category.filter);
      navigate({
        pathname: '/projects',
        search: params.toString()
      });
    }
  };

  return (
    <section className="py-16 relative z-10 -mt-10">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-12">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-textDark dark:text-white mb-8 pl-2 border-l-4 border-primary">
          {t('whatAreYouLookingFor')}
        </h2>
        
        <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat, index) => (
            <CategoryCard 
              key={index} 
              icon={cat.icon} 
              title={cat.title} 
              onClick={() => handleCategoryClick(cat)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
