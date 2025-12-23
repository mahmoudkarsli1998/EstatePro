import React, { useRef } from 'react';
import LiquidBackground from '../../components/shared/LiquidBackground';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useFadeIn, useSlideIn } from '../../hooks/useGSAPAnimations';

import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  const headerRef = useFadeIn({ delay: 0.2 });
  const infoRef = useSlideIn({ direction: 'left', delay: 0.4 });
  const formRef = useSlideIn({ direction: 'right', delay: 0.6 });

  return (
    <div className="min-h-screen relative pt-24 pb-12 overflow-hidden">
      <LiquidBackground />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div ref={headerRef} className="text-center mb-16 opacity-0">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-textDark dark:text-white mb-6 drop-shadow-md">
            {t('getInTouch')}
          </h1>
          <p className="text-xl text-textLight dark:text-gray-300 max-w-2xl mx-auto">
            {t('getInTouchDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div ref={infoRef} className="space-y-8 opacity-0">
            <div className="glass-panel p-8">
              <h2 className="text-2xl font-bold font-heading text-textDark dark:text-white mb-6">{t('contactInformation')}</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-textDark dark:text-white font-bold mb-1">{t('visitUs')}</h3>
                    <p className="text-textLight dark:text-gray-400 whitespace-pre-line">{t('visitUsAddress')}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="text-textDark dark:text-white font-bold mb-1">{t('callUs')}</h3>
                    <p className="text-textLight dark:text-gray-400" style={{ direction: 'ltr' }}>+1 (555) 123-4567<br />+1 (555) 987-6543</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-textDark dark:text-white font-bold mb-1">{t('emailUs')}</h3>
                    <p className="text-textLight dark:text-gray-400">hello@estatepro.com<br />support@estatepro.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-textDark dark:text-white font-bold mb-1">{t('workingHours')}</h3>
                    <p className="text-textLight dark:text-gray-400 whitespace-pre-line">{t('workingHoursDesc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="glass-panel h-64 w-full overflow-hidden relative group">
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <p className="text-gray-500">{t('interactiveMap')}</p>
              </div>
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
            </div>
          </div>

          {/* Contact Form Wrapper */}
           <div ref={formRef} className="glass-panel p-8 opacity-0">
             <h2 className="text-2xl font-bold font-heading text-textDark dark:text-white mb-6">{t('sendMessage')}</h2>
             <form className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-textLight dark:text-gray-300 mb-2">{t('firstName')}</label>
                   <input type="text" className="w-full px-4 py-3 rounded-lg bg-background dark:bg-white/5 border border-border/20 dark:border-white/10 text-textDark dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all" placeholder={t('firstName')} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-textLight dark:text-gray-300 mb-2">{t('lastName')}</label>
                   <input type="text" className="w-full px-4 py-3 rounded-lg bg-background dark:bg-white/5 border border-border/20 dark:border-white/10 text-textDark dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all" placeholder={t('lastName')} />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-textLight dark:text-gray-300 mb-2">{t('emailAddress')}</label>
                 <input type="email" className="w-full px-4 py-3 rounded-lg bg-background dark:bg-white/5 border border-border/20 dark:border-white/10 text-textDark dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-textLight dark:text-gray-300 mb-2">{t('subject')}</label>
                 <select className="w-full px-4 py-3 rounded-lg bg-background dark:bg-white/5 border border-border/20 dark:border-white/10 text-textDark dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all [&>option]:bg-background dark:[&>option]:bg-gray-900">
                   <option>{t('generalInquiry')}</option>
                   <option>{t('propertyListing')}</option>
                   <option>{t('partnership')}</option>
                   <option>{t('support')}</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-textLight dark:text-gray-300 mb-2">{t('message')}</label>
                 <textarea rows="4" className="w-full px-4 py-3 rounded-lg bg-background dark:bg-white/5 border border-border/20 dark:border-white/10 text-textDark dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all" placeholder={t('howCanWeHelp')}></textarea>
               </div>
               <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                 {t('sendMsgButton')}
               </button>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
