import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Map as MapIcon, Grid } from 'lucide-react';
import Card from '../../components/shared/Card';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import FilterSidebar from '../../components/public/FilterSidebar';
import LiquidBackground from '../../components/shared/LiquidBackground';
import { api } from '../../utils/api';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    type: '',
    status: '',
  });

  useEffect(() => {
    setLoading(true);
    api.getProjects().then(data => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  const filteredProjects = projects.filter(project => {
    if (filters.search && !project.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.status && project.status !== filters.status) return false;
    if (filters.minPrice && project.priceRange.min < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && project.priceRange.max > parseInt(filters.maxPrice)) return false;
    return true;
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
              <h1 className="text-3xl font-bold font-heading text-white">
                Projects <span className="text-primary">({filteredProjects.length})</span>
              </h1>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="md:hidden"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <Filter size={18} className="mr-2" /> Filters
                </Button>
                
                <div className="glass-panel p-1 flex">
                  <button 
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid size={20} />
                  </button>
                  <button 
                    className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white'}`}
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
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20 glass-panel">
                <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
                <p className="text-gray-400">Try adjusting your filters.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link to={`/projects/${project.id}`}>
                      <Card hover className="h-full flex flex-col group">
                        <div className="relative h-48 overflow-hidden rounded-t-2xl">
                          <img 
                            src={project.images[0]} 
                            alt={project.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 to-transparent opacity-60"></div>
                          <div className="absolute top-3 right-3">
                            <Badge variant={project.status === 'active' ? 'success' : 'warning'}>
                              {project.status === 'active' ? 'Selling Fast' : 'Upcoming'}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold font-heading text-white group-hover:text-primary transition-colors line-clamp-1">
                              {project.name}
                            </h3>
                          </div>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-1">
                            {project.address}
                          </p>
                          <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                            <span className="text-primary font-bold text-lg">
                              ${(project.priceRange.min / 1000).toFixed(0)}k - ${(project.priceRange.max / 1000).toFixed(0)}k
                            </span>
                            <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                              {project.stats.available} Units Left
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-[600px] glass-panel overflow-hidden relative group">
                {/* Mock Map Background */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500"></div>
                
                {/* Map Pins */}
                {filteredProjects.map((project, index) => (
                  <div 
                    key={project.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin"
                    style={{ 
                      top: `${30 + (index * 15)}%`, 
                      left: `${20 + (index * 20)}%` 
                    }}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,240,255,0.5)] animate-bounce">
                        <MapIcon size={16} />
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 glass-panel p-3 opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="h-24 rounded-md overflow-hidden mb-2">
                          <img src={project.images[0]} alt={project.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="font-bold text-sm text-white">{project.name}</div>
                        <div className="text-xs text-primary font-bold">${(project.priceRange.min / 1000).toFixed(0)}k+</div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="absolute bottom-4 right-4 glass-panel px-4 py-2 text-xs text-gray-300">
                  Interactive Map View
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
