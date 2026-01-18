import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, Briefcase } from 'lucide-react';
import EntityImage from '../shared/EntityImage';
import { useHover3D } from '../../hooks/useGSAPAnimations';

const DeveloperCard = ({ developer }) => {
  const cardRef = useHover3D({ intensity: 5, scale: 1.02 });

  return (
    <div ref={cardRef} className="h-full stagger-item opacity-0">
      <Link to={`/developers/${developer.id || developer._id}`} className="block h-full group">
        <div className="h-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col items-center text-center p-8 relative">
          
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150 group-hover:bg-primary/10"></div>
          
          <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
            <EntityImage 
              src={developer.logo || developer.image} 
              alt={developer.name} 
              type="developer"
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>

          <h3 className="text-xl font-bold font-heading text-textDark dark:text-white mb-2 group-hover:text-primary transition-colors">
            {developer.name}
          </h3>

          <div className="flex items-center gap-2 text-textLight dark:text-gray-400 text-sm mb-6 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-full">
            <Briefcase size={14} />
            <span>{developer.projectsCount ?? developer.projects?.length ?? 0} Projects</span>
          </div>
          
          <div className="mt-auto">
             <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                View Profile <ArrowRight size={14} />
             </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DeveloperCard;
