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
    >
      <Card hover className="h-full flex flex-col">
        <div className="relative h-64 overflow-hidden group">
          <img 
            src={project.images[0]} 
            alt={project.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-4 right-4">
            <Badge variant={project.status === 'active' ? 'success' : 'warning'}>
              {project.status === 'active' ? 'Selling Fast' : 'Upcoming'}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <Link to={`/projects/${project.id}`} className="w-full">
              <Button variant="primary" className="w-full">View Details</Button>
            </Link>
          </div>
        </div>
        
        <div className="p-6 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold font-heading text-white line-clamp-1">
              {project.name}
            </h3>
            <span className="text-primary font-bold">
              ${(project.priceRange.min / 1000).toFixed(0)}k+
            </span>
          </div>
          
          <div className="flex items-center text-gray-400 mb-4 text-sm">
            <MapPin size={16} className="mr-1" />
            <span className="line-clamp-1">{project.address}</span>
          </div>
          
          <p className="text-gray-300 text-sm mb-6 line-clamp-2 flex-grow">
            {project.description}
          </p>
          
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div className="text-sm">
              <span className="block text-gray-500">Units</span>
              <span className="font-semibold text-white">{project.stats.available} Available</span>
            </div>
            <div className="text-sm text-right">
              <span className="block text-gray-500">Delivery</span>
              <span className="font-semibold text-white">{new Date(project.deliveryDate).getFullYear()}</span>
            </div>
          </div>
        </div>
      </Card>
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
