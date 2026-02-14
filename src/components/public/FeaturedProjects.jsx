import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import Button from '../shared/Button';
import { estateService } from '../../services/estateService';
import { useStaggerList, useHover3D } from '../../hooks/useGSAPAnimations';
import { getFirstImage } from '../../utils/imageHelper';

// Placeholder image for projects
const PROJECT_PLACEHOLDER = 'https://via.placeholder.com/800x600?text=No+Image';

const ProjectCard = ({ project }) => {
  const cardRef = useHover3D({ intensity: 10, scale: 1.02 });

  // Get image with proper fallback handling
  const imageSrc = project.images?.[0] ? getFirstImage(project.images, 'project') : PROJECT_PLACEHOLDER;

  return (
    <Link to={`/projects/${project.id || project._id}`} ref={cardRef} className="h-full stagger-item opacity-0 block group">
      <div className="h-full flex flex-col glass-panel overflow-hidden group hover:border-primary/50 transition-all duration-300 relative transform-style-3d">
        <div className="relative h-72 overflow-hidden">
          <img 
            src={imageSrc} 
            alt={project.name} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.src = PROJECT_PLACEHOLDER;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-60"></div>
          
          <div className="absolute top-4 right-4 z-10 translate-z-10">
            <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/10 ${
              project.status === 'active' 
                ? 'bg-green-500/90 text-white shadow-md' 
                : 'bg-yellow-500/90 text-black shadow-md'
            }`}>
              {project.status === 'active' ? 'Selling Fast' : 'Upcoming'}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 translate-z-20">
             <Button variant="primary" className="w-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">View Details</Button>
          </div>
        </div>
        
        <div className="p-6 flex-grow flex flex-col relative z-10 bg-gradient-to-b from-transparent to-black/20 translate-z-10">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-2xl font-bold font-heading text-textDark dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <span className="text-primary font-bold text-lg bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">
              ${((project?.priceRange?.min || 0) / 1000).toFixed(0)}k+
            </span>
          </div>
          
          <div className="flex items-center text-textLight mb-4 text-sm">
            <MapPin size={16} className="mr-1 text-primary" />
            <span className="line-clamp-1">{project.address}</span>
          </div>
          
          <p className="text-textLight dark:text-gray-300 text-sm mb-6 line-clamp-2 flex-grow leading-relaxed">
            {project.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/10">
            <div className="text-center p-2 rounded-lg bg-background/50 dark:bg-white/5 border border-border/10">
              <span className="block text-xs text-textLight uppercase tracking-wider mb-1">Available</span>
              <span className="font-bold text-textDark dark:text-white text-lg">
                {project.stats?.available ?? project.stats?.totalUnits ?? '-'} <span className="text-xs font-normal text-textLight">Units</span>
              </span>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50 dark:bg-white/5 border border-border/10">
              <span className="block text-xs text-textLight uppercase tracking-wider mb-1">Delivery</span>
              <span className="font-bold text-textDark dark:text-white text-lg">{project.deliveryDate ? new Date(project.deliveryDate).getFullYear() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const FeaturedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useStaggerList({ selector: '.stagger-item', delay: 0.2, dependencies: [loading, projects] });

  // PERFORMANCE FIX: Only fetch on mount with proper dependency handling
  // This eliminates the 5-second interval that caused unnecessary re-renders
  useEffect(() => {
    // Only run once on mount
    let isMounted = true;
    
    const loadProjects = async () => {
      try {
        console.log('DEBUG: FeaturedProjects - Fetching project data on mount...');
        const data = await estateService.getProjects();
        if (isMounted) {
          setProjects(data.slice(0, 6));
          setLoading(false);
        }
      } catch (err) {
        console.error('DEBUG: FeaturedProjects - Error fetching projects:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadProjects();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency = run once on mount

  // Listen for custom refresh event (for external triggers like after adding new project)
  useEffect(() => {
    const handleRefresh = () => {
      console.log('DEBUG: FeaturedProjects - Manual refresh triggered');
      estateService.getProjects()
        .then(data => setProjects(data.slice(0, 6)))
        .catch(err => console.error('DEBUG: FeaturedProjects - Error on refresh:', err));
    };

    window.addEventListener('refreshProjects', handleRefresh);
    return () => window.removeEventListener('refreshProjects', handleRefresh);
  }, []);

  return (
    <section className="py-20 bg-background dark:bg-dark-bg">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-textDark dark:text-white mb-4">
              Featured Projects
            </h2>
            <p className="text-textLight dark:text-gray-400 max-w-2xl">
              Discover our hand-picked selection of premium properties offering the best in luxury and comfort.
            </p>
          </div>
          <Link to="/projects" className="hidden md:flex items-center text-primary font-medium hover:text-blue-700 transition-colors">
            View All Projects <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-gray-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
            {projects.map(project => (
              <ProjectCard key={project.id || project._id} project={project} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center md:hidden">
          <Link to="/projects">
            <Button variant="outline" className="w-full">View All Projects</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
