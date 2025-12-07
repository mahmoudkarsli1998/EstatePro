import React from 'react';
import { Key, LockOpen, Building2, RefreshCw, Percent, KeyRound, Tag, PieChart } from 'lucide-react';
import { useStaggerList } from '../../hooks/useGSAPAnimations';
import { useNavigate } from 'react-router-dom';

const CategoryCard = ({ icon: Icon, title, onClick }) => (
  <div 
    onClick={onClick}
    className="category-item opacity-0 flex flex-col items-center justify-center p-6 glass-panel rounded-2xl hover:bg-white/10 transition-all duration-300 cursor-pointer group hover:-translate-y-2 border border-white/5 active:scale-95"
  >
    <div className="w-14 h-14 mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.2)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]">
      <Icon size={28} />
    </div>
    <span className="font-bold text-gray-300 group-hover:text-white transition-colors text-sm text-center tracking-wide">{title}</span>
  </div>
);

const CategoryGrid = () => {
  const containerRef = useStaggerList({ selector: '.category-item', delay: 0.2, threshold: 0.1 });
  const navigate = useNavigate();

  const categories = [
    { icon: Key, title: "EstatePro Keys", filter: { type: 'keys' } },
    { icon: LockOpen, title: "Unlocked", filter: { status: 'unlocked' } },
    { icon: Building2, title: "Developer Units", filter: { type: 'developer' } },
    { icon: RefreshCw, title: "Resale Units", filter: { status: 'resale' } },
    { icon: Percent, title: "Offers", filter: { type: 'offer' } },
    { icon: KeyRound, title: "Move Now", filter: { status: 'ready' } },
    { icon: Tag, title: "Sell Your Unit", action: '/sell' }, // Example direct link
    { icon: PieChart, title: "Invest", filter: { type: 'invest' } }
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
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-white mb-8 pl-2 border-l-4 border-primary">
          What Are You Looking For?
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
