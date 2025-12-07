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
import { api } from '../../utils/api';

import { useTranslation } from 'react-i18next';

const UnitDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [unit, setUnit] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('3d');

  useEffect(() => {
    setLoading(true);
    api.getUnitById(id).then(unitData => {
      setUnit(unitData);
      return api.getProjectById(unitData.projectId);
    }).then(projectData => {
      setProject(projectData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

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
        <h2 className="text-2xl font-bold text-white mb-4">{t('unitNotFound') || "Unit Not Found"}</h2>
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
          <Link to={`/projects/${project.id}`} className="inline-flex items-center text-gray-400 hover:text-primary transition-colors">
            <div className={`inline-block ${i18n.dir() === 'rtl' ? 'rotate-180' : ''}`}><ArrowLeft size={16} className="me-2" /></div> {t('backTo')} {project.name}
          </Link>
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
                <h1 className="text-3xl font-bold font-heading text-white mb-2">
                  {t('unitLabel', { number: unit.number })}
                </h1>
                <p className="text-xl text-gray-400 capitalize">
                  {unit.type} • {unit.floor === 0 ? t('groundFloor') : t('floorTh', { floor: unit.floor })}
                </p>
              </div>
              <Badge variant={unit.status === 'available' ? 'success' : 'warning'} className="text-lg px-4 py-1">
                  {t(unit.status) || unit.status}
              </Badge>
            </motion.div>

            {/* Visualizer Tabs */}
            <div className="glass-panel p-1 inline-flex">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === '3d' ? 'bg-primary text-white shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setActiveTab('3d')}
              >
                {t('3dView')}
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'images' ? 'bg-primary text-white shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
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
              className="glass-panel p-2 border-white/10"
            >
              {activeTab === '3d' ? (
                <Unit3DViewer unit={unit} />
              ) : (
                <div className="h-[500px] rounded-xl overflow-hidden">
                  <img src={unit.images[0]} alt={unit.number} className="w-full h-full object-cover" />
                </div>
              )}
            </motion.div>

            {/* Features */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-2xl font-bold font-heading text-white mb-6">
                {t('unitFeatures')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-gray-400 mb-2">{t('bedrooms')}</div>
                  <div className="text-2xl font-bold text-white">{unit.features.bedrooms}</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-gray-400 mb-2">{t('bathrooms')}</div>
                  <div className="text-2xl font-bold text-white">{unit.features.bathrooms}</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-gray-400 mb-2">{t('area')}</div>
                  <div className="text-2xl font-bold text-white">{unit.area_m2} m²</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-gray-400 mb-2">{t('parking')}</div>
                  <div className="text-2xl font-bold text-white">{unit.features.parking}</div>
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
              <h3 className="text-lg font-bold mb-4 text-white">{t('additionalDetails')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">{t('view')}</span>
                  <span className="font-medium text-white">{unit.features.view}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">{t('furnished')}</span>
                  <span className="font-medium text-white">{unit.features.furnished ? t('yes') : t('no')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">{t('balcony')}</span>
                  <span className="font-medium text-white">{unit.features.balcony ? t('yes') : t('no')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">{t('project')}</span>
                  <span className="font-medium text-white">{project.name}</span>
                </div>
              </div>
              {unit.notes && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <span className="text-gray-400 block mb-2">{t('notes')}</span>
                  <p className="text-gray-300">{unit.notes}</p>
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
                    <p className="text-gray-400 mb-1">{t('totalPrice')}</p>
                    <h2 className="text-4xl font-bold text-primary drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" style={{ direction: 'ltr' }}>
                      ${(unit.price).toLocaleString()}
                    </h2>
                  </div>
                  
                  <Button 
                    className="w-full mb-3 shadow-[0_0_15px_rgba(0,240,255,0.3)]" 
                    size="lg"
                    onClick={() => setIsContactOpen(true)}
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
                  <h3 className="text-lg font-bold mb-4 text-white">{t('paymentCalculator')}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{t('downPayment')}</span>
                      <span className="font-medium text-white" style={{ direction: 'ltr' }}>${(unit.price * 0.2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{t('loanAmount')}</span>
                      <span className="font-medium text-white" style={{ direction: 'ltr' }}>${(unit.price * 0.8).toLocaleString()}</span>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{t('estMonthly')}</span>
                        <span className="text-xl font-bold text-primary" style={{ direction: 'ltr' }}>
                          ${Math.round((unit.price * 0.8 * 0.05) / 12).toLocaleString()}
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
