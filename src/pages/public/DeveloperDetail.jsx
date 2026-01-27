import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { commonService } from '../../services/commonService';
import { estateService } from '../../services/estateService';
import PageLoader from '../../components/shared/PageLoader';
import { Building2, MapPin, Mail, Phone, Globe, ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '../../components/shared/Button';
import { useStaggerList } from '../../hooks/useGSAPAnimations';

// Temporary Project Card for reuse (ideally import from FeaturedProjects if exported, but creating a simplified one here)
const ProjectCardSimple = ({ project }) => (
  <Link to={`/projects/${project.id || project._id}`} className="group block h-full">
    <div className="h-full bg-white dark:bg-white/5 border border-border/20 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
       <div className="h-48 overflow-hidden relative">
          <img 
            src={project.images[0]} 
            alt={project.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold">
            {project.status}
          </div>
       </div>
       <div className="p-6 flex-grow flex flex-col">
           <h3 className="text-xl font-bold font-heading text-textDark dark:text-white mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
           <div className="flex items-center text-textLight text-sm mb-4">
              <MapPin size={14} className="mr-1" /> {project.address}
           </div>
           <Button variant="outline" size="sm" className="w-full mt-auto group-hover:bg-primary group-hover:text-white group-hover:border-primary">
              View Project
           </Button>
       </div>
    </div>
  </Link>
);

const DeveloperDetail = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const [developer, setDeveloper] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const projectsRef = useStaggerList({ selector: '.project-card', delay: 0.2, dependencies: [loading] });

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                setLoading(true);
                const devs = await commonService.getDevelopers();
                const dev = devs.find(d => String(d.id || d._id) === id);
                const allProjects = await estateService.getProjects();
                
                if (dev) {
                    setDeveloper(dev);
                    // Filter projects for this developer
                    // Relies on project.developer being either ID string, object with ID, or Name string
                    const devProjects = allProjects.filter(p => {
                        let pDev = p.developer;
                        const devId = dev.id || dev._id;
                        
                        // 1. If project developer is an object
                        if (pDev && typeof pDev === 'object') {
                            const pDevId = pDev.id || pDev._id || pDev.developerId;
                            if (pDevId && devId && String(pDevId) === String(devId)) return true;
                            if (pDev.name && dev.name && pDev.name.toLowerCase() === dev.name.toLowerCase()) return true;
                            return false;
                        }
                        
                        // 2. If primitive
                        const pDevStr = String(pDev);
                        const devIdStr = String(devId);
                        
                        // Match ID
                        if (devId && pDevStr === devIdStr) return true;
                        
                        // Match Name
                        if (dev.name && pDevStr.toLowerCase() === dev.name.toLowerCase()) return true;
                        
                        return false;
                    });
                    setProjects(devProjects);
                }
            } catch (error) {
                console.error("Failed to fetch developer details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

  if (loading) return <PageLoader />;

  if (!developer) {
      return (
          <div className="min-h-screen pt-32 container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold mb-4">{t('developerNotFound')}</h2>
              <Link to="/developers"><Button variant="primary">{t('backToDevelopers')}</Button></Link>
          </div>
      )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background dark:bg-dark-bg">
       <div className="container mx-auto px-4 md:px-6">
           <Link to="/developers" className="inline-flex items-center text-textLight hover:text-primary mb-8 transition-colors">
               <ArrowLeft size={16} className="mr-2 rtl:hidden" /> 
               <ArrowRight size={16} className="ml-2 ltr:hidden" />
               {t('backToDevelopers', 'Back to Developers')}
           </Link>

           {/* Hero Profile */}
           <div className="bg-white dark:bg-section/30 border border-border/20 rounded-3xl p-8 md:p-12 shadow-sm mb-16 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[200px] -mr-10 -mt-10 md:block hidden"></div>
               
               <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                   <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white dark:bg-white/5 border-4 border-white dark:border-white/10 shadow-lg flex items-center justify-center p-4 flex-shrink-0">
                       {developer.logo && !developer.logo.includes('placeholder') ? (
                           <img src={developer.logo} alt={developer.name} className="w-full h-full object-contain rounded-full" />
                       ) : (
                           <Building2 size={60} className="text-primary/50" />
                       )}
                   </div>
                   
                   <div className="text-center md:text-start flex-grow">
                       <h1 className="text-3xl md:text-5xl font-bold font-heading text-textDark dark:text-white mb-4">
                           {developer.name}
                       </h1>
                       <p className="text-lg text-textLight dark:text-gray-400 max-w-2xl mb-8 leading-relaxed">
                           {t('developerBioPlaceholder', 'One of the leading real estate developers in the region, committed to delivering excellence and innovation in every project.')}
                       </p>
                       
                       <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8">
                           {developer.contactEmail && (
                               <a href={`mailto:${developer.contactEmail}`} className="flex items-center gap-2 text-textDark dark:text-gray-300 hover:text-primary transition-colors">
                                   <div className="w-8 h-8 rounded-full bg-section dark:bg-white/5 flex items-center justify-center text-primary"><Mail size={16} /></div>
                                   {developer.contactEmail}
                               </a>
                           )}
                            {developer.contactPhone && (
                               <a href={`tel:${developer.contactPhone}`} className="flex items-center gap-2 text-textDark dark:text-gray-300 hover:text-primary transition-colors">
                                   <div className="w-8 h-8 rounded-full bg-section dark:bg-white/5 flex items-center justify-center text-primary"><Phone size={16} /></div>
                                   {developer.contactPhone}
                               </a>
                           )}
                           <div className="flex items-center gap-2 text-textDark dark:text-gray-300 opacity-70">
                                   <div className="w-8 h-8 rounded-full bg-section dark:bg-white/5 flex items-center justify-center"><Globe size={16} /></div>
                                   www.{developer.name.toLowerCase().replace(/\s+/g, '')}.com
                           </div>
                       </div>
                   </div>
                   
                   <div className="md:ml-auto flex flex-col gap-4 min-w-[200px]">
                        <div className="bg-section dark:bg-white/5 rounded-2xl p-6 text-center">
                            <span className="block text-4xl font-bold text-primary mb-1">{projects.length}</span>
                            <span className="text-sm font-medium uppercase tracking-wider text-textLight">{t('projects', 'Projects')}</span>
                        </div>
                        <div className="bg-section dark:bg-white/5 rounded-2xl p-6 text-center">
                            <span className="block text-4xl font-bold text-accent mb-1">{new Date().getFullYear() - 2010}</span>
                            <span className="text-sm font-medium uppercase tracking-wider text-textLight">{t('yearsExperience', 'Years Exp.')}</span>
                        </div>
                   </div>
               </div>
           </div>

           {/* Projects Section */}
           <div>
               <h2 className="text-2xl md:text-3xl font-bold font-heading text-textDark dark:text-white mb-8 border-b border-border/10 pb-4">
                   {t('developerProjects', 'Projects by')} {developer.name}
               </h2>
               
               {projects.length > 0 ? (
                   <div ref={projectsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {projects.map(project => (
                           <div key={project.id} className="project-card opacity-0">
                               <ProjectCardSimple project={project} />
                           </div>
                       ))}
                   </div>
               ) : (
                   <div className="text-center py-20 bg-section/30 rounded-3xl border border-dashed border-border/30">
                       <Building2 size={48} className="mx-auto text-textLight opacity-30 mb-4" />
                       <p className="text-xl text-textLight font-medium">{t('noProjectsFound', 'No projects listed yet.')}</p>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};

export default DeveloperDetail;
