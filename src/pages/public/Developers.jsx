import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import DeveloperCard from '../../components/public/DeveloperCard';
import PageLoader from '../../components/shared/PageLoader';
import { useStaggerList } from '../../hooks/useGSAPAnimations';
import { useTranslation } from 'react-i18next';

const Developers = () => {
  const { t } = useTranslation();
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useStaggerList({ selector: '.stagger-item', delay: 0.2, dependencies: [loading, developers] });

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getDevelopers().then(data => {
      setDevelopers(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
           <span className="text-primary font-bold uppercase tracking-wider text-sm mb-2 block">{t('partners', 'Our Partners')}</span>
           <h1 className="text-4xl md:text-5xl font-bold font-heading text-textDark dark:text-white mb-6">
             {t('meetDevelopers', 'Meet the Developers')}
           </h1>
           <p className="text-textLight dark:text-gray-400 text-lg leading-relaxed">
             {t('developersDesc', 'We partner with the most reputable real estate developers to bring you the best properties in the market. Explore their profiles and current projects.')}
           </p>
        </div>

        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {developers.map(dev => (
             <DeveloperCard key={dev.id} developer={dev} />
           ))}
        </div>
      </div>
    </div>
  );
};

export default Developers;
