import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Cookie } from 'lucide-react';
import CookieSettingsButton from '../shared/CookieSettingsButton';

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-[#0F1418] border-t border-white/5 text-textDark dark:text-white pt-16 pb-8 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="text-2xl font-bold font-heading text-white mb-4 block">
              Estate<span className="text-accent">Pro</span>
            </Link>
            <p className="text-gray-400 mb-6">
              {t('footerDesc')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-accent transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li><Link to="/projects" className="text-gray-400 hover:text-accent transition-colors">{t('allProjects')}</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-accent transition-colors">{t('aboutUs')}</Link></li>

              <li><Link to="/contact" className="text-gray-400 hover:text-accent transition-colors">{t('contactUs')}</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-accent transition-colors">{t('careers')}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('services')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">{t('propertyManagement')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">{t('consulting')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">{t('development')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">{t('interiorDesign')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('contactUs')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={20} className="text-accent mr-2 mt-1 shrink-0 rtl:ml-2 rtl:mr-0" />
                <span className="text-gray-400">123 Innovation Blvd, Tech City, TC 90210</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="text-accent mr-2 shrink-0 rtl:ml-2 rtl:mr-0" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="text-accent mr-2 shrink-0 rtl:ml-2 rtl:mr-0" />
                <span className="text-gray-400">hello@estatepro.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} EstatePro. {t('rightsReserved')}
          </p>
          <div className="flex items-center space-x-6 rtl:space-x-reverse text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">{t('privacyPolicy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('termsOfService')}</a>
            <CookieSettingsButton variant="text" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
