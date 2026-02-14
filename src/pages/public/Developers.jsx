import React, { useEffect, useState } from 'react';
import { commonService } from '../../services/commonService';
import { estateService } from '../../services/estateService';
import DeveloperCard from '../../components/public/DeveloperCard';
import Button from '../../components/shared/Button';
import { useStaggerList } from '../../hooks/useGSAPAnimations';
import { useTranslation } from 'react-i18next';
import { Search, Sparkles, RotateCcw, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Developers = () => {
  const { t } = useTranslation();
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useStaggerList({ selector: '.stagger-item', delay: 0.1, dependencies: [loading, developers] });

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, [searchTerm]);

  const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
          const fetchDevs = searchTerm.trim() 
            ? () => estateService.searchDevelopers({ search: searchTerm })
            : () => commonService.getDevelopers();

          const [devs, allProjects] = await Promise.all([
              fetchDevs().catch(e => {
                  console.error("Dev fetch error", e);
                  return [];
              }),
              estateService.getProjects().catch(() => [])
          ]);
          
          if (!devs || !Array.isArray(devs)) {
              setDevelopers([]);
              return;
          }

          // Map projects to developers
          const enrichedDevs = devs.map(dev => {
              const devId = dev.id || dev._id;
              const myProjects = allProjects.filter(p => {
                  let pDev = p.developer;
                  if (pDev && typeof pDev === 'object') {
                      const pDevId = pDev.id || pDev._id;
                      if (pDevId && devId && String(pDevId) === String(devId)) return true;
                      if (pDev.name && dev.name && pDev.name.toLowerCase() === dev.name.toLowerCase()) return true;
                  }
                  const pDevStr = String(pDev);
                  if (devId && pDevStr === String(devId)) return true;
                  if (dev.name && pDevStr.toLowerCase() === dev.name.toLowerCase()) return true;
                  return false;
              });
              return { ...dev, projects: myProjects };
          });
          
          setDevelopers(enrichedDevs);
      } catch (err) {
          console.error("Failed to load developers", err);
          setError(err.message || "Failed to connect to server");
      } finally {
          setLoading(false);
      }
  };

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

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16 relative">
             <div className="relative group">
                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform" size={20} />
                 <input 
                    type="text" 
                    placeholder={t('searchDeveloper', 'Search developer by name...')}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xl shadow-primary/5 transition-all text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 {searchTerm && (
                     <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-textLight hover:text-primary">
                         <X size={18} />
                     </button>
                 )}
             </div>
        </div>

        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-64 glass-panel animate-pulse bg-primary/5"></div>
                ))}
             </div>
        ) : error ? (
            <div className="text-center py-20 px-6 glass-panel border-red-500/20 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-red-500/5 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500/30">
                    <X size={40} />
                </div>
                <h3 className="text-2xl font-bold text-textDark dark:text-white mb-2">{t('errorLoading', 'Unable to load developers')}</h3>
                <p className="text-textLight dark:text-gray-400 mb-8">{error}</p>
                <Button onClick={loadData} variant="primary" className="px-8 py-3 rounded-xl shadow-lg">
                   <RotateCcw size={18} className="mr-2" /> {t('tryAgain', 'Try Again')}
                </Button>
            </div>
        ) : developers.length > 0 ? (
            <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {developers.map(dev => (
                    <DeveloperCard key={dev.id || dev._id} developer={dev} />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 px-6 glass-panel border-primary/10 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/30">
                    <Search size={40} />
                </div>
                <h3 className="text-2xl font-bold text-textDark dark:text-white mb-3">
                    {t('noResultsFound', 'No developers found')}
                </h3>
                <p className="text-textLight dark:text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
                    {t('noDevsMessage', 'We couldn\'t find any developers matching your search. Try resetting filters or asking our AI.')}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button 
                      onClick={() => setSearchTerm('')} 
                      variant="outline" 
                      className="px-8 py-3 rounded-xl border-primary/20 text-primary hover:bg-primary/5"
                    >
                      <RotateCcw size={18} className="mr-2" /> {t('clearSearch', 'Clear Search')}
                    </Button>
                    <Link 
                      to={`/ai-assistant?q=${encodeURIComponent(searchTerm)}`}
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                      <Sparkles size={18} /> {t('askAiAssistant', 'Ask AI')}
                    </Link>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Developers;
