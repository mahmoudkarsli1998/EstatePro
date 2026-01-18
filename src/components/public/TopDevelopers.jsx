import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../shared/Button';
import { commonService } from '../../services/commonService';
import { estateService } from '../../services/estateService';
import { useStaggerList } from '../../hooks/useGSAPAnimations';
import DeveloperCard from './DeveloperCard';

const TopDevelopers = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useStaggerList({ selector: '.stagger-item', delay: 0.2, dependencies: [loading, developers] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devs, projects] = await Promise.all([
          commonService.getDevelopers(),
          estateService.getProjects()
        ]);
        
        // Enrich developers with project count
        const enrichedDevs = devs.map(dev => {
          const devId = dev.id || dev._id;
          const devName = dev.name?.toLowerCase();
          
          const projectCount = projects.filter(p => {
            const pDev = p.developer;
            
            // If project developer is an object
            if (pDev && typeof pDev === 'object') {
              const pDevId = pDev.id || pDev._id || pDev.developerId;
              if (pDevId && devId && String(pDevId) === String(devId)) return true;
              if (pDev.name && devName && pDev.name.toLowerCase() === devName) return true;
              return false;
            }
            
            // If primitive (ID or name string)
            const pDevStr = String(pDev);
            if (devId && pDevStr === String(devId)) return true;
            if (devName && pDevStr.toLowerCase() === devName) return true;
            
            return false;
          }).length;
          
          return { ...dev, projectsCount: projectCount };
        });
        
        setDevelopers(enrichedDevs.slice(0, 4)); // Show top 4
      } catch (error) {
        console.error('Failed to fetch developers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <section className="py-20 bg-section/30 dark:bg-black/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-textDark dark:text-white mb-4">
              Top Developers
            </h2>
            <p className="text-textLight dark:text-gray-400 max-w-2xl">
              Partnering with the most reputable names in the real estate industry.
            </p>
          </div>
          <Link to="/developers" className="hidden md:flex items-center text-primary font-medium hover:text-blue-700 transition-colors">
            View All Developers <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {developers.map((dev, idx) => (
              <DeveloperCard key={dev.id || dev._id || idx} developer={dev} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center md:hidden">
          <Link to="/developers">
            <Button variant="outline" className="w-full">View All Developers</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopDevelopers;
