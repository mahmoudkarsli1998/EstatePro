import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Map as MapIcon, MapPin, X, Search } from 'lucide-react';
import BaseContentPage from '../../components/shared/BaseContentPage';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import Card from '../../components/shared/Card';
import EntityImage from '../../components/shared/EntityImage';
import { estateService } from '../../services/estateService';
import { useCurrency } from '../../context/CurrencyContext';
import { useTranslation } from 'react-i18next';
import { useHover3D } from '../../hooks/useGSAPAnimations';

const ProjectsList = () => {
  const { t, i18n } = useTranslation();
  const { formatRange, formatCompact } = useCurrency();
  const navigate = useNavigate();
  
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 9;
  
  const unitKeywords = ['apartment', 'villa', 'studio', 'penthouse', 'chalet', 'duplex', 'townhouse', 'twinhouse', 'room', 'bath', 'شقة', 'فيلا', 'توين', 'تاون', 'ستوديو', 'شاليه', 'دوبلكس', 'غرفة', 'حمام'];

  const ProjectCard = ({ project }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';
    const cardRef = useHover3D({ intensity: 10, scale: 1.02 });

    return (
      <Link to={`/projects/${project.id || project._id}`}>
        <div ref={cardRef} className="h-full">
          <Card hover className="h-full flex flex-col glass-panel overflow-hidden group transform-style-3d">
          <div className="relative h-72 overflow-hidden">
            <EntityImage 
              src={project.images?.[0]} 
              alt={project.name}
              type="project"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-60"></div>
            
            <div className={`absolute top-4 right-4 z-10 translate-z-10`}>
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
                {((project?.priceRange?.min || 0) / 1000).toFixed(0)}k+
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
                  {project.stats?.available || 0} <span className="text-xs font-normal text-textLight">Units</span>
                </span>
              </div>
              <div className="text-center p-2 rounded-lg bg-background/50 dark:bg-white/5 border border-border/10">
                <span className="block text-xs text-textLight uppercase tracking-wider mb-1">Delivery</span>
                <span className="font-bold text-textDark dark:text-white text-lg">{project.deliveryDate ? new Date(project.deliveryDate).getFullYear() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Link>
    );
  };

  return (
    <BaseContentPage
      title={t('projects')}
      entityType="projects"
      fetchFunction={(params) => {
        const hasFilters = Object.keys(params).length > 0;
        return hasFilters 
          ? estateService.searchProjects(params)
          : estateService.getProjects();
      }}
      searchPlaceholder="Search projects..."
      emptyStateMessage="We couldn't find a match"
      emptyStateSuggestion="Try broadening your search or resetting filters to see more compounds."
      smartSuggestionKeywords={unitKeywords}
      smartSuggestionLink={{
        text: 'Units',
        path: '/units'
      }}
      renderCard={(project) => <ProjectCard project={project} />}
    />
  );
};

export default ProjectsList;
