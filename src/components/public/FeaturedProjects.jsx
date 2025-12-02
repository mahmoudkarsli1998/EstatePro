import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import { api } from '../../utils/api';

const ProjectCard = ({ project }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="h-full"
    >
      <div className="h-full flex flex-col glass-panel overflow-hidden group hover:border-primary/50 transition-all duration-300 relative">
        <div className="relative h-72 overflow-hidden">
          <img 
            src={project.images[0]} 
            alt={project.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-60"></div>
          
          <div className="absolute top-4 right-4 z-10">
            <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/10 ${
              project.status === 'active' 
                ? 'bg-green-500/90 text-white shadow-green-500/20' 
                : 'bg-yellow-500/90 text-black shadow-yellow-500/20'
            }`}>
              {project.status === 'active' ? 'Selling Fast' : 'Upcoming'}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
             <Link to={`/projects/${project.id}`} className="block w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              <Button variant="primary" className="w-full shadow-[0_0_20px_rgba(0,240,255,0.3)]">View Details</Button>
            </Link>
          </div>
        </div>
        
        <div className="p-6 flex-grow flex flex-col relative z-10 bg-gradient-to-b from-transparent to-black/20">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-2xl font-bold font-heading text-white line-clamp-1 group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <span className="text-primary font-bold text-lg bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">
              ${(project.priceRange.min / 1000).toFixed(0)}k+
            </span>
          </div>
          
          <div className="flex items-center text-gray-400 mb-4 text-sm">
            <MapPin size={16} className="mr-1 text-primary" />
            <span className="line-clamp-1">{project.address}</span>
          </div>
          
          <p className="text-gray-300 text-sm mb-6 line-clamp-2 flex-grow leading-relaxed">
            {project.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div className="text-center p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Available</span>
              <span className="font-bold text-white text-lg">{project.stats.available} <span className="text-xs font-normal text-gray-400">Units</span></span>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Delivery</span>
              <span className="font-bold text-white text-lg">{new Date(project.deliveryDate).getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then(data => {
      setProjects(data.slice(0, 3));
      setLoading(false);
    });
  }, []);

  return (
    <section className="py-20 bg-dark-bg">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
              Featured Projects
            </h2>
            <p className="text-gray-400 max-w-2xl">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
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
