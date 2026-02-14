import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Maximize, Home, DollarSign, CheckCircle } from 'lucide-react';
import Unit3DViewer from '../../components/public/Unit3DViewer';
import ContactForm from '../../components/public/ContactForm';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Card from '../../components/shared/Card';
import LiquidBackground from '../../components/shared/LiquidBackground';
import ImageGallery from '../../components/shared/ImageGallery';
import { estateService } from '../../services/estateService';
import { ENABLE_3D } from '../../config/performance';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import { tracker } from '../../services/trackingService';

const UnitDetail = () => {
  const { t, i18n } = useTranslation();
  const { format } = useCurrency();
  const { id } = useParams();
  const [unit, setUnit] = useState(null);
  const [project, setProject] = useState(null);
  const [phase, setPhase] = useState(null);
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(ENABLE_3D ? '3d' : 'images');

  useEffect(() => {
    setLoading(true);
    estateService.getUnitById(id).then(unitData => {
      setUnit(unitData);
      console.log('Unit Data Loaded:', unitData); // Debug: Check if phaseId/blockId exist

      // Resolve project ID from various possible fields
      const pId = unitData.projectId || (typeof unitData.project === 'string' ? unitData.project : unitData.project?.id || unitData.project?._id);
      const isProjectPopulated = typeof unitData.project === 'object' && unitData.project?.name;

      // Resolve Phase & Block
      if (unitData.phaseId && pId) {
         estateService.getProjectPhases(pId).then(phases => {
             const found = Array.isArray(phases) ? phases.find(p => String(p.id) === String(unitData.phaseId) || String(p._id) === String(unitData.phaseId)) : null;
             if (found) setPhase(found);
         });
      }
      if (unitData.blockId) {
         estateService.getBlockById(unitData.blockId).then(setBlock).catch(err => console.warn("Block fetch failed", err));
      }

      if (isProjectPopulated) {
          setProject(unitData.project);
          setLoading(false);
      } else if (pId) {
          return estateService.getProjectById(pId).then(projectData => {
             setProject(projectData);
             setLoading(false);
          });
      } else {
          setProject({ id: '', name: 'Unknown Project' });
          setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  // Track unit view
  useEffect(() => {
    if (unit && project) {
      estateService.registerUnitView(unit._id || unit.id).catch(err => console.error("View tracking failed", err));
      tracker.unitViewed(unit._id || unit.id, unit.type, unit.price, project?.name);
    }
  }, [unit, project]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center relative">
        <LiquidBackground />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen pt-24 flex flex-col justify-center items-center relative">
        <LiquidBackground />
        <h2 className="text-2xl font-bold text-textDark dark:text-white mb-4">{t('unitNotFound') || "Unit Not Found"}</h2>
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
          {project && project.id ? (
            <Link to={`/projects/${project.id || project._id}`} className="inline-flex items-center text-textLight hover:text-primary transition-colors">
                <div className={`inline-block ${i18n.dir() === 'rtl' ? 'rotate-180' : ''}`}><ArrowLeft size={16} className="me-2" /></div> {t('backTo')} {project.name}
            </Link>
          ) : (
            <Link to="/units" className="inline-flex items-center text-textLight hover:text-primary transition-colors">
                <div className={`inline-block ${i18n.dir() === 'rtl' ? 'rotate-180' : ''}`}><ArrowLeft size={16} className="me-2" /></div> {t('backToUnits', 'Back to Units')}
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-between items-start"
            >
              <div>
                <h1 className="text-3xl font-bold font-heading text-textDark dark:text-white mb-2">
                  {t('unitLabel', { number: unit.number })}
                </h1>
                <p className="text-xl text-textLight capitalize">
                  {unit.type} • {unit.floor === 0 ? t('groundFloor') : t('floorTh', { floor: unit.floor })}
                </p>
                {/* Location Info */}
                {(unit.location?.name || unit.project?.location?.name || project?.location?.name) && (
                  <p className="text-primary text-sm font-medium mt-1 flex items-center">
                    📍 {unit.location?.name || unit.project?.location?.name || project?.location?.name}
                    {(unit.location?.city || unit.project?.location?.city || project?.location?.city) && (
                      <span className="text-textLight ml-2">
                        ({unit.location?.city || unit.project?.location?.city || project?.location?.city})
                      </span>
                    )}
                  </p>
                )}
              </div>
              <Badge variant={unit.status === 'available' ? 'success' : 'warning'} className="text-lg px-4 py-1">
                  {t(unit.status) || unit.status}
              </Badge>
            </motion.div>

            {/* Visualizer Tabs */}
            <div className="glass-panel p-1 inline-flex">
              {ENABLE_3D && (
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === '3d' ? 'bg-primary text-white shadow-md' : 'text-textLight hover:text-primary hover:bg-primary/5'
                }`}
                onClick={() => setActiveTab('3d')}
              >
                {t('3dView')}
              </button>
              )}
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'images' ? 'bg-primary text-white shadow-md' : 'text-textLight hover:text-primary hover:bg-primary/5'
                }`}
                onClick={() => setActiveTab('images')}
              >
                {t('photos')}
              </button>
            </div>

            {/* Viewer */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="glass-panel p-2 border-border/20 dark:border-white/10"
            >
              {activeTab === '3d' ? (
                <Unit3DViewer unit={unit} />
              ) : (
                <ImageGallery 
                  images={unit.images?.length > 0 ? unit.images : (unit.image ? [unit.image] : (unit.thumbnail ? [unit.thumbnail] : []))} 
                  type="unit" 
                  aspectRatio="aspect-[16/10]"
                  className="h-[500px]"
                />
              )}
            </motion.div>

            {/* Features */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-2xl font-bold font-heading text-textDark dark:text-white mb-6">
                {t('unitFeatures')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center bg-background dark:bg-section border-border/20">
                  <div className="text-textLight mb-2">{t('bedrooms')}</div>
                  <div className="text-2xl font-bold text-textDark dark:text-white">{unit.features?.bedrooms ?? unit.bedrooms ?? '-'}</div>
                </Card>
                <Card className="p-4 text-center bg-background dark:bg-section border-border/20">
                  <div className="text-textLight mb-2">{t('bathrooms')}</div>
                  <div className="text-2xl font-bold text-textDark dark:text-white">{unit.features?.bathrooms ?? unit.bathrooms ?? '-'}</div>
                </Card>
                <Card className="p-4 text-center bg-background dark:bg-section border-border/20">
                  <div className="text-textLight mb-2">{t('area')}</div>
                  <div className="text-2xl font-bold text-textDark dark:text-white">{unit.area_m2 ?? unit.area ?? '-'} m²</div>
                </Card>
                <Card className="p-4 text-center bg-background dark:bg-section border-border/20">
                  <div className="text-textLight mb-2">{t('parking')}</div>
                  <div className="text-2xl font-bold text-textDark dark:text-white">
                    {(unit.features?.parking ?? unit.parking) === true ? t('yes') : 
                     (unit.features?.parking ?? unit.parking) === false ? t('no') : '-'}
                  </div>
                </Card>
              </div>
            </motion.section>

            {/* Additional Details */}
            <motion.section 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="glass-panel p-6"
            >
              <h3 className="text-lg font-bold mb-4 text-textDark dark:text-white">{t('additionalDetails')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b border-border/20">
                  <span className="text-textLight">{t('view')}</span>
                  <span className="font-medium text-textDark dark:text-white capitalize">{unit.features?.view || unit.view || t('na', 'N/A')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/20">
                  <span className="text-textLight">{t('furnished')}</span>
                  <span className="font-medium text-textDark dark:text-white">{(unit.features?.furnished ?? unit.furnished) ? t('yes') : t('no')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/20">
                  <span className="text-textLight">{t('floor', 'Floor')}</span>
                  <span className="font-medium text-textDark dark:text-white">{unit.floor ?? t('na', 'N/A')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/20">
                  <span className="text-textLight">{t('type', 'Type')}</span>
                  <span className="font-medium text-textDark dark:text-white capitalize">{unit.type || t('na', 'N/A')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/20">
                  <span className="text-textLight">{t('project')}</span>
                  <span className="font-medium text-textDark dark:text-white">{project?.name || project?.nameEn || t('na', 'N/A')}</span>
                </div>
                {unit.buildingAge && (
                  <div className="flex justify-between py-2 border-b border-border/20">
                    <span className="text-textLight">{t('buildingAge', 'Building Age')}</span>
                    <span className="font-medium text-textDark dark:text-white">{unit.buildingAge}</span>
                  </div>
                )}
                {phase && (
                  <div className="flex justify-between py-2 border-b border-border/20">
                    <span className="text-textLight">{t('phase')}</span>
                    <span className="font-medium text-textDark dark:text-white">{phase.name}</span>
                  </div>
                )}
                {block && (
                  <div className="flex justify-between py-2 border-b border-border/20">
                    <span className="text-textLight">{t('block')}</span>
                    <span className="font-medium text-textDark dark:text-white">{block.name}</span>
                  </div>
                )}
              </div>

              {/* Amenities Section */}
              {(unit.features?.amenities?.length > 0 || unit.amenities?.length > 0) && (
                <div className="mt-6 pt-6 border-t border-border/20">
                  <h4 className="text-md font-bold mb-3 text-textDark dark:text-white">{t('amenities', 'Amenities')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(unit.features?.amenities || unit.amenities) 
                      ? (unit.features?.amenities || unit.amenities) 
                      : (typeof (unit.features?.amenities || unit.amenities) === 'string' ? (unit.features?.amenities || unit.amenities).split(',') : [])
                    ).map((amenity, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-primary/10 text-sm text-primary dark:text-primary-light border border-primary/20 capitalize">
                        {amenity.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nearby Facilities Section */}
              {(unit.features?.nearbyFacilities?.length > 0 || unit.nearbyFacilities?.length > 0) && (
                <div className="mt-6 pt-6 border-t border-border/20">
                  <h4 className="text-md font-bold mb-3 text-textDark dark:text-white">{t('nearbyFacilities', 'Nearby Facilities')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(unit.features?.nearbyFacilities || unit.nearbyFacilities) 
                      ? (unit.features?.nearbyFacilities || unit.nearbyFacilities) 
                      : []
                    ).map((facility, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-accent/10 text-sm text-accent dark:text-accent-light border border-accent/20 capitalize">
                        {facility.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {unit.notes && (
                <div className="mt-4 pt-4 border-t border-border/20 dark:border-white/10">
                  <span className="text-textLight block mb-2">{t('notes')}</span>
                  <p className="text-textLight dark:text-gray-300">{unit.notes}</p>
                </div>
              )}
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
                  <div className="text-center mb-6">
                    <p className="text-textLight mb-1">{t('totalPrice')}</p>
                    <h2 className="text-4xl font-bold text-primary drop-shadow-md" style={{ direction: 'ltr' }}>
                      {format(unit.price)}
                    </h2>
                  </div>
                  
                  <Button 
                    className="w-full mb-3 shadow-md" 
                    size="lg"
                    onClick={() => {
                      setIsContactOpen(true);
                      tracker.inquirySubmitted(unit._id || unit.id, unit.type, unit.price);
                    }}
                  >
                    {t('requestInformation')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsContactOpen(true)}
                  >
                    {t('scheduleViewing')}
                  </Button>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4 text-textDark dark:text-white">{t('paymentCalculator')}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-textLight">{t('downPayment')}</span>
                      <span className="font-medium text-textDark dark:text-white" style={{ direction: 'ltr' }}>{format(unit.price * 0.2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-textLight">{t('loanAmount')}</span>
                      <span className="font-medium text-textDark dark:text-white" style={{ direction: 'ltr' }}>{format(unit.price * 0.8)}</span>
                    </div>
                    <div className="pt-4 border-t border-border/20">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-textDark dark:text-white">{t('estMonthly')}</span>
                        <span className="text-xl font-bold text-primary" style={{ direction: 'ltr' }}>
                          {format(Math.round((unit.price * 0.8 * 0.05) / 12))}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-end">{t('basedOnInterest')}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <ContactForm 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)}
        project={project}
        unit={unit}
      />
    </motion.div>
  );
};

export default UnitDetail;
