import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Check, ArrowLeft, Building, Ruler, Calendar } from 'lucide-react';
import Modal from '../../components/shared/Modal';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import ContactForm from '../../components/public/ContactForm';
import LiquidBackground from '../../components/shared/LiquidBackground';
import ImageGallery from '../../components/shared/ImageGallery';
import EntityImage from '../../components/shared/EntityImage';
import { estateService } from '../../services/estateService';
import { crmService } from '../../services/crmService';
import { useCurrency } from '../../context/CurrencyContext';
import { useTranslation } from 'react-i18next';
import { tracker } from '../../services/trackingService';

const ProjectDetail = () => {
  const { t, i18n } = useTranslation();
  const { format, formatCompact } = useCurrency();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [assignedAgent, setAssignedAgent] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Mock agent fallack if needed, but we prefer real one
  // const mockAgent = { ... };



  useEffect(() => {
    setLoading(true);
    Promise.all([
      estateService.getProjectById(id),
      crmService.getAgents()
    ]).then(([projectData, agentsData]) => {
      setProject(projectData);
      
      // Find assigned agent
      const foundAgent = agentsData.find(a => 
        a.assignedProjects && a.assignedProjects.some(pId => String(pId) === String(id) || String(pId?.id || pId?._id) === String(id))
      );
      setAssignedAgent(foundAgent);

      return estateService.getUnits({ projectId: id });
    }).then(unitsData => {
      setUnits(Array.isArray(unitsData) ? unitsData : (unitsData.data || [])); 
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  // Track project view
  useEffect(() => {
    if (project) {
      tracker.projectViewed(project._id || project.id, project.name, project.location?.name || project.city);
    }
  }, [project]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center relative">
        <LiquidBackground />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-24 flex flex-col justify-center items-center relative">
        <LiquidBackground />
        <h2 className="text-2xl font-bold text-white mb-4">{t('projectNotFound')}</h2>
        <Link to="/projects">
          <Button>{t('backToProjects')}</Button>
        </Link>
      </div>
    );
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-12 relative"
    >
      <LiquidBackground />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/projects" className="inline-flex items-center text-textLight hover:text-primary transition-colors">
            <div className={`inline-block ${i18n.dir() === 'rtl' ? 'rotate-180' : ''}`}><ArrowLeft size={16} className="me-2" /></div> {t('backToProjects')}
          </Link>
        </div>

        {/* Header Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-5xl font-bold font-heading text-textDark dark:text-white mb-2">
              {project.name}
            </h1>
            <div className="flex items-center text-textLight mb-1">
              <MapPin size={18} className="mr-2 text-primary" />
              {project.address}
            </div>
            {(project.location?.name || project.locationId?.name) && (
              <div className="flex items-center text-primary text-sm font-medium">
                <Building size={16} className="mr-2" />
                {project.location?.name || project.locationId?.name}
                {(project.location?.city || project.locationId?.city) && (
                  <span className="text-textLight ml-2">
                    ({project.location?.city || project.locationId?.city})
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-end">
              <p className="text-sm text-textLight">{t('startingFrom')}</p>
              <p className="text-2xl font-bold text-primary" style={{ direction: 'ltr' }}>
                {(() => {
                  const prices = units.filter(u => u.price > 0).map(u => u.price);
                  const minPrice = prices.length > 0 ? Math.min(...prices) : (project.priceRange?.min || 0);
                  return minPrice > 0 ? formatCompact(minPrice) : t('contactForPrice', 'Contact for Price');
                })()}
              </p>
            </div>
            <Badge variant={project.status === 'active' ? 'success' : 'warning'} className="text-lg px-4 py-1">
              {project.status === 'active' ? t('sellingFast') : t('upcoming')}
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ImageGallery 
                images={project.images} 
                type="project" 
                aspectRatio="aspect-[16/10]"
              />
            </motion.div>

            {/* Overview */}
            <motion.section 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="glass-panel p-8"
            >
              <h2 className="text-2xl font-bold font-heading text-textDark dark:text-white mb-4">{t('overview')}</h2>
              <p className="text-textLight dark:text-gray-300 leading-relaxed mb-6">
                {project.description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Building size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-textLight">Type</p>
                    <p className="font-bold text-textDark dark:text-white capitalize">{project.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-secondary/10 text-secondary">
                    <Ruler size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-textLight">{t('units')}</p>
                    <p className="font-bold text-textDark dark:text-white">
                        {Math.max(project.stats?.totalUnits || 0, units.length)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-accent/10 text-accent">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-textLight">{t('completion')}</p>
                    <p className="font-bold text-textDark dark:text-white">2025</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Amenities */}
            <motion.section 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="glass-panel p-8"
            >
              <h2 className="text-2xl font-bold font-heading text-textDark dark:text-white mb-6">{t('amenities')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 text-textLight dark:text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                      <Check size={14} />
                    </div>
                    {amenity}
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Available Units */}
            <motion.section 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <h2 className="text-2xl font-bold font-heading text-textDark dark:text-white mb-6">{t('availableUnits')}</h2>
              <div className="space-y-4">
                {units.map((unit) => (
                  <motion.div 
                    key={unit.id}
                    variants={fadeInUp}
                    className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-section dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <EntityImage 
                          src={unit.images?.[0]} 
                          alt={unit.number}
                          type="unit"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-textDark dark:text-white">{t('unitLabel', { number: unit.number })}</h3>
                        <p className="text-textLight text-sm mb-1">
                          {unit.features.bedrooms} {t('bed')} • {unit.features.bathrooms} {t('bath')} • {unit.area_m2} m²
                        </p>
                        <Badge variant={unit.status === 'available' ? 'success' : 'neutral'}>
                          {t(unit.status) || unit.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                      <span className="text-2xl font-bold text-primary" style={{ direction: 'ltr' }}>{format(unit.price)}</span>
                      <div className="flex gap-2 w-full md:w-auto">
                        <Link to={`/units/${unit.id || unit._id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">{t('view')}</Button>
                        </Link>
                        <Button 
                          size="sm" 
                          className="flex-1 shadow-md"
                          onClick={() => {
                            setSelectedUnit(unit);
                            setIsContactOpen(true);
                          }}
                        >
                          {t('enquire')}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-textDark dark:text-white mb-4">{t('interested')}</h3>
                  <p className="text-textLight mb-6">
                    {t('interestedDesc', { name: project.name })}
                  </p>
                  <Button 
                    className="w-full mb-3 shadow-md" 
                    size="lg"
                    onClick={() => {
                      setSelectedUnit(null);
                      setIsContactOpen(true);
                      tracker.contactFormSubmitted('project_inquiry', project.name);
                    }}
                  >
                    {t('contactAgent')}
                  </Button>
                  <Button variant="outline" className="w-full">
                    {t('downloadBrochure')}
                  </Button>
                </Card>
              </motion.div>

              {assignedAgent && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-textDark dark:text-white mb-4">{t('agent')}</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden border border-border/20 dark:border-white/10">
                        <img src={assignedAgent.avatar || 'https://i.pravatar.cc/150'} alt={assignedAgent.name} className="w-full h-full object-cover"/>
                      </div>
                      <div>
                        <p className="font-bold text-textDark dark:text-white">{assignedAgent.name}</p>
                        <p className="text-sm text-textLight">{assignedAgent.jobTitle || t('seniorPropertyConsultant')}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full hover:bg-primary/10 hover:text-primary"
                      onClick={() => setSelectedAgent(assignedAgent)}
                    >
                      {t('viewProfile')}
                    </Button>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ContactForm 
        isOpen={isContactOpen} 
        onClose={() => {
          setIsContactOpen(false);
          setSelectedUnit(null);
        }}
        project={project}
        unit={selectedUnit}
      />

      {/* Agent Profile Modal */}
      {selectedAgent && (
        <Modal
          isOpen={!!selectedAgent}
          onClose={() => setSelectedAgent(null)}
          title={t('agentProfile')}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-800 overflow-hidden border-2 border-primary/50 shrink-0">
                <img src={selectedAgent.avatar} alt={selectedAgent.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-textDark dark:text-white mb-1">{selectedAgent.name}</h2>
                <p className="text-primary font-medium mb-3">{t('seniorPropertyConsultant')}</p>
                <div className="space-y-1 text-sm text-textLight dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-textLight dark:text-gray-500">Email:</span> {selectedAgent.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-textLight dark:text-gray-500">Phone:</span> {selectedAgent.phone}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background dark:bg-white/5 rounded-xl p-4 text-center border border-border/20 dark:border-white/10">
                <div className="text-2xl font-bold text-textDark dark:text-white mb-1">
                    {selectedAgent.totalSales ? format(Number(selectedAgent.totalSales)) : format(0)}
                </div>
                <div className="text-xs text-textLight uppercase tracking-wider">{t('totalSales')}</div>
              </div>
              <div className="bg-background dark:bg-white/5 rounded-xl p-4 text-center border border-border/20 dark:border-white/10">
                <div className="text-2xl font-bold text-textDark dark:text-white mb-1">
                    {selectedAgent.activeListingsCount || selectedAgent.assignedProjects?.length || 0}
                </div>
                <div className="text-xs text-textLight uppercase tracking-wider">{t('activeListings')}</div>
              </div>
              <div className="bg-background dark:bg-white/5 rounded-xl p-4 text-center border border-border/20 dark:border-white/10">
                <div className="text-2xl font-bold text-textDark dark:text-white mb-1">{selectedAgent.rating || 'N/A'}</div>
                <div className="text-xs text-textLight uppercase tracking-wider">{t('rating')}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-textDark dark:text-white mb-3">{t('about')}</h3>
              <p className="text-textLight dark:text-gray-300 leading-relaxed text-sm">
                {selectedAgent.about || t('agentDescription', 'is a dedicated real estate professional with over 5 years of experience...')}
              </p>
            </div>

            {selectedAgent.recentPerformance && selectedAgent.recentPerformance.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-textDark dark:text-white mb-3">{t('recentPerformance')}</h3>
                <div className="space-y-3">
                  {selectedAgent.recentPerformance.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background dark:bg-white/5 border border-border/20 dark:border-white/5">
                      <div>
                        <div className="text-textDark dark:text-white font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-textLight dark:text-gray-500">{new Date(item.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-bold text-sm">+{format(Number(item.amount))}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </motion.div>
  ); 
};

export default ProjectDetail;
