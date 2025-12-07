import React from 'react';
import { motion } from 'framer-motion';
import LiquidBackground from '../../components/shared/LiquidBackground';
import MaadiScene from '../../components/public/MaadiScene';
import { MapPin, Navigation, Building } from 'lucide-react';

import { useTranslation } from 'react-i18next';

const Locations = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen relative pt-24 pb-12 overflow-hidden">
      <LiquidBackground />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-white mb-6 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            {t('exploreLocations')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('locationsDesc')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <MaadiScene />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="glass-panel p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="text-primary" /> {t('maadiDistrict')}
              </h2>
              <p className="text-gray-400 mb-4">
                {t('maadiDesc')}
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <Building size={18} className="text-secondary" />
                  <span>3 {t('activeProjects')}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Navigation size={18} className="text-secondary" />
                  <span>15 {t('minsToDowntown')}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6">
              <h3 className="text-xl font-bold text-white mb-3">{t('upcomingLocations')}</h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between text-gray-400 border-b border-white/5 pb-2">
                  <span>{t('newCairo')}</span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Q4 2026</span>
                </li>
                <li className="flex items-center justify-between text-gray-400 border-b border-white/5 pb-2">
                  <span>{t('sheikhZayed')}</span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Q1 2027</span>
                </li>
                <li className="flex items-center justify-between text-gray-400">
                  <span>{t('northCoast')}</span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">{t('summer')} 2027</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Locations;
