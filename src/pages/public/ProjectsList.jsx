import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Filter, Map as MapIcon, Grid, ArrowRight, X, Sparkles, RotateCcw, Search } from 'lucide-react';
import Card from '../../components/shared/Card';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import FilterSidebar from '../../components/public/FilterSidebar';
import LiquidBackground from '../../components/shared/LiquidBackground';
import EntityImage from '../../components/shared/EntityImage';
import { estateService } from '../../services/estateService';
import { useStaggerList } from '../../hooks/useGSAPAnimations';
import { useCurrency } from '../../context/CurrencyContext';
import { useTranslation } from 'react-i18next';

const ProjectsList = () => {
  const { t, i18n } = useTranslation();
  const { formatRange, formatCompact } = useCurrency();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    type: '',
    status: '',
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fetchProjects = () => {
    setLoading(true);
    setError(null);
    
    const params = {
      search: searchParams.get('search'),
      type: searchParams.get('type'),
      status: searchParams.get('status'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice')
    };

    const fetchFunc = params.search 
      ? () => estateService.searchProjects(params)
      : () => estateService.getProjects(params);

    fetchFunc()
      .then(data => {
        setProjects(Array.isArray(data) ? data : (data.data || []));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load projects:", err);
        setError(err.message || "Failed to connect to server");
        setLoading(false);
      });
  };

  const filteredProjects = React.useMemo(() => {
    return projects.filter(project => {
        if (filters.search) {
            const search = filters.search.toLowerCase();
            const nameMatch = project.name.toLowerCase().includes(search);
            const devMatch = project.developer?.name?.toLowerCase().includes(search) || 
                             project.developerName?.toLowerCase().includes(search);
            if (!nameMatch && !devMatch) return false;
        }
        if (filters.status && project.status !== filters.status) return false;
        
        // Handle Special "Property Types" from Navbar (Resale, Commercial, Rent)
        if (filters.type) {
            if (filters.type === 'resale') {
                 if (project.status !== 'resale') return false;
            } else if (filters.type === 'rent') {
                 if (project.listingType !== 'rent') return false;
            } else if (filters.type === 'commercial') {
                 if (project.propertyType !== 'commercial') return false;
            } else {
                 if (project.propertyType !== filters.type) return false;
            }
        }
        
        if (filters.minPrice && project.priceRange.min < parseInt(filters.minPrice)) return false;
        if (filters.maxPrice && project.priceRange.max > parseInt(filters.maxPrice)) return false;
        return true;
    });
  }, [projects, filters]);

  const unitKeywords = ['apartment', 'villa', 'studio', 'penthouse', 'chalet', 'duplex', 'townhouse', 'twinhouse', 'room', 'bath', 'شقة', 'فيلا', 'توين', 'تاون', 'ستوديو', 'شاليه', 'دوبلكس', 'غرفة', 'حمام'];

  // Smart Redirection: If searching for unit keywords in projects page and results are empty
  useEffect(() => {
    if (!loading && !error && filteredProjects.length === 0 && filters.search) {
      const search = filters.search.toLowerCase();
      if (unitKeywords.some(k => search.includes(k))) {
         // Suggestion logic
      }
    }
  }, [loading, error, filteredProjects.length, filters.search]);

  useEffect(() => {
    // Initialize filters from URL params
    const initialFilters = {
      search: searchParams.get('search') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      type: searchParams.get('type') || '',
      status: searchParams.get('status') || '',
    };
    setFilters(prev => ({ ...prev, ...initialFilters }));
    
    fetchProjects();
  }, [searchParams, location.key]);

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 9;

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Scroll to top when page changes
  useEffect(() => {
    if(currentPage > 1) {
       window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  // Pass filteredProjects as a dependency so the animation re-runs when the list changes
  const containerRef = useStaggerList({ 
    selector: '.project-item', 
    delay: 0.1, 
    dependencies: [filteredProjects, viewMode, loading] 
  });

  return (
    <div className="min-h-screen pt-24 pb-12 relative">
      <LiquidBackground />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <FilterSidebar 
            filters={filters} 
            setFilters={setFilters} 
            isOpen={isFilterOpen} 
            onClose={() => setIsFilterOpen(false)} 
          />

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold font-heading text-textDark dark:text-white">
                {t('projects')} <span className="text-primary">({filteredProjects.length})</span>
              </h1>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="md:hidden"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <Filter size={18} className="me-2" /> {t('filters')}
                </Button>
                
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
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-80 glass-panel animate-pulse"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 glass-panel border-red-500/20">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                  <X size={32} />
                </div>
                <h3 className="text-xl font-bold text-textDark dark:text-white mb-2">{t('errorLoadingProjects', 'Error loading projects')}</h3>
                <p className="text-textLight dark:text-gray-400 mb-8">{error}</p>
                <Button onClick={fetchProjects} className="shadow-lg">
                   {t('tryAgain', 'Try Again')}
                </Button>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20 px-6 glass-panel border-primary/10">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/30">
                    <Search size={40} />
                </div>
                <h3 className="text-2xl font-bold text-textDark dark:text-white mb-3">
                    {t('noResultsFound', 'We couldn\'t find a match')}
                </h3>
                <p className="text-textLight dark:text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
                    {t('tryAdjustingFilters', 'Try broadening your search or resetting filters to see more compounds.')}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                    <Button 
                      onClick={() => navigate('/projects')} 
                      variant="outline" 
                      className="w-full sm:w-auto px-8 py-3 rounded-xl border-primary/20 text-primary hover:bg-primary/5"
                    >
                      <RotateCcw size={18} className="mr-2" /> {t('resetAllFilters', 'Reset All Filters')}
                    </Button>
                    
                    <Link 
                      to={`/ai-assistant?q=${encodeURIComponent(filters.search)}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                      <Sparkles size={18} /> {t('askAiAssistant', 'Ask our AI Expert')}
                    </Link>
                </div>

                {/* Smart Suggestion for Units */}
                {(() => {
                  const search = filters.search?.toLowerCase();
                  if (search && unitKeywords.some(k => search.includes(k))) {
                    return (
                      <div className="max-w-xl mx-auto p-8 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl border border-primary/20 animate-in fade-in zoom-in duration-700">
                        <div className="flex items-center gap-3 mb-4 justify-center">
                            <Sparkles className="text-primary" size={20} />
                            <span className="text-primary font-bold uppercase tracking-wider text-xs">Smart Discovery</span>
                        </div>
                        <p className="text-textDark dark:text-white font-medium mb-6 text-lg">
                           Looking for specific <span className="text-primary">"{filters.search}"</span> units or inventory?
                        </p>
                        <Link 
                          to={`/units?search=${encodeURIComponent(filters.search)}`}
                          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-black hover:bg-primary/90 transition-all transform hover:scale-105 active:scale-95 shadow-xl"
                        >
                          Switch to Units <ArrowRight size={20} />
                        </Link>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            ) : viewMode === 'grid' ? (
              <>
                <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {currentProjects.map(project => (
                    <div
                      key={project.id || project._id}
                      className="project-item opacity-0"
                    >
                      <Link to={`/projects/${project.id || project._id}`}>
                        <Card hover className="h-full flex flex-col group">
                          {/* Minimized Height: Smaller Image */}
                          <div className="relative h-40 overflow-hidden rounded-t-2xl">
                            <EntityImage 
                              src={project.images?.[0]} 
                              alt={project.name}
                              type="project"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 to-transparent opacity-60"></div>
                            <div className={`absolute top-3 ${i18n.dir() === 'rtl' ? 'left-3' : 'right-3'}`}>
                              <Badge variant={project.status === 'active' ? 'success' : 'warning'}>
                                {project.status === 'active' ? t('sellingFast') : t('upcoming')}
                              </Badge>
                            </div>
                          </div>
                          {/* Minimized Height: Reduced Padding */}
                          <div className="p-4 flex-grow flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-bold font-heading text-textDark dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                                {project.name}
                              </h3>
                            </div>
                            <p className="text-textLight dark:text-gray-400 text-sm mb-1 line-clamp-1">
                              {project.address}
                            </p>
                            {(project.location?.name || project.locationId?.name) && (
                              <p className="text-primary text-xs mb-3">
                                📍 {project.location?.name || project.locationId?.name}
                              </p>
                            )}
                            <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-center">
                              <span className="text-primary font-bold text-lg" style={{ direction: 'ltr' }}>
                                {(project.priceRange?.min || 0) > 0 
                                    ? formatRange(project.priceRange.min, project.priceRange.max, { compact: true })
                                    : t('contactForPrice', 'Contact for Price')}
                              </span>
                              <span className="text-xs text-textLight dark:text-gray-400 bg-background dark:bg-white/5 px-2 py-1 rounded">
                                {project.stats?.available || 0} {t('unitsLeft')}
                              </span>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12 gap-2">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-background dark:bg-white/5 border border-border/20 text-textDark dark:text-white hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {i18n.dir() === 'rtl' ? '→' : '←'}
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => paginate(idx + 1)}
                        className={`w-10 h-10 rounded-lg border border-border/20 flex items-center justify-center transition-colors ${
                          currentPage === idx + 1
                            ? 'bg-primary text-white border-primary'
                            : 'bg-background dark:bg-white/5 text-textDark dark:text-white hover:bg-primary/20'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg bg-background dark:bg-white/5 border border-border/20 text-textDark dark:text-white hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {i18n.dir() === 'rtl' ? '←' : '→'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="h-[600px] glass-panel overflow-hidden relative group">
                {/* Mock Map Background */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500"></div>
                
                {/* Map Pins */}
                {filteredProjects.map((project, index) => (
                  <div 
                    key={project.id || project._id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin"
                    style={{ 
                      top: `${30 + (index * 15)}%`, 
                      left: `${20 + (index * 20)}%` 
                    }}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                        <MapIcon size={16} />
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 glass-panel p-3 opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="h-24 rounded-md overflow-hidden mb-2">
                          <img src={project.images[0]} alt={project.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="font-bold text-sm text-white">{project.name}</div>
                        <div className="text-xs text-primary font-bold">{formatCompact(project.priceRange.min)}+</div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className={`absolute bottom-4 ${i18n.dir() === 'rtl' ? 'left-4' : 'right-4'} glass-panel px-4 py-2 text-xs text-gray-300`}>
                  {t('interactiveMapView')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsList;
