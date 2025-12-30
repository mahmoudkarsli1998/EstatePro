import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User, ChevronDown, Home, Building2, MapPin, Users, Repeat, Briefcase, Key } from 'lucide-react';
import Button from '../shared/Button';
import ThemeToggle from '../shared/ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileDropdown = (name) => {
    setActiveMobileDropdown(activeMobileDropdown === name ? null : name);
  };

  // Links based on the user's image (RTL Order in UI: Home -> Properties -> Compounds -> Developers -> Types)
  // Array Order (LTR): Home, Properties, Compounds, Developers, Types
  const navLinks = [
    { 
      name: t('home'), 
      path: '/', 
      icon: <Home size={18} /> 
    },
    { 
      name: t('properties', 'Units'), 
      path: '/units', 
      icon: <Building2 size={18} /> 
    },
    { 
      name: t('compounds', 'Compounds'), // Projects
      path: '/projects', 
      icon: <MapPin size={18} /> 
    },
    { 
      name: t('developers', 'Developers'), 
      path: '/developers', 
      icon: <Users size={18} /> 
    },
    { 
      name: t('propertyTypes', 'Property Types'), 
      path: '#',
      icon: null, // Image doesn't clearly show an icon for the dropdown header itself, just arrow
      hasDropdown: true,
      dropdownItems: [
        { name: t('resale', 'Resale'), path: '/projects?type=resale', icon: <Repeat size={16} /> },
        { name: t('commercial', 'Commercial'), path: '/projects?type=commercial', icon: <Briefcase size={16} /> },
        { name: t('forRent', 'For Rent'), path: '/projects?type=rent', icon: <Key size={16} /> },
      ]
    },
    { 
      name: t('contact'), 
      path: '/contact',
      icon: null 
    },
  ];

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[95%] md:w-[90%] max-w-7xl rounded-2xl ${
        isScrolled
          ? 'bg-background/90 dark:bg-section/90 backdrop-blur-md border border-border/50 shadow-lg py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold font-heading text-textDark dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-lg font-bold">E</span>
          </div>
          <span>Estate<span className="text-primary dark:text-accent">Pro</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6 lg:space-x-8 rtl:space-x-reverse">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group">
              <Link
                to={link.path}
                className={`font-medium transition-all duration-300 relative flex flex-col items-center gap-1 ${
                  location.pathname === link.path ? 'text-primary dark:text-accent' : 'text-textLight hover:text-primary dark:hover:text-accent'
                }`}
                onClick={(e) => link.hasDropdown && e.preventDefault()}
              >
                {/* Icon (if exists, showing mostly on hover or if design requires, keeping it subtle) */}
                {/* User image shows icons above text. We will implement this layout. */}
                {link.icon && <span className="opacity-70 group-hover:opacity-100 transition-opacity">{link.icon}</span>}
                
                <div className="flex items-center gap-1">
                    {link.name}
                    {link.hasDropdown && <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />}
                </div>

                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full ${
                  location.pathname === link.path ? 'w-full' : ''
                }`}></span>
              </Link>
              
              {/* Dropdown Menu */}
              {link.hasDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top pt-2">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden p-2 flex flex-col gap-1">
                    {link.dropdownItems.map((item, index) => (
                      <Link 
                        key={index} 
                        to={item.path}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-textDark dark:text-gray-200"
                      >
                        <span className="text-primary">{item.icon}</span>
                        <span className="font-medium text-sm">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          <LanguageSwitcher />
          <ThemeToggle />
          <button className="p-2 text-textLight hover:text-primary transition-colors">
            <Search size={20} />
          </button>
          <Link to="/login">
            <Button variant="primary" size="sm" className="shadow-md hover:shadow-lg">
              <User size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
              {t('login')}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-textDark dark:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl p-4 flex flex-col space-y-4 mx-4 max-h-[80vh] overflow-y-auto">
          {navLinks.map((link) => (
             <div key={link.name}>
                 <Link
                   to={link.path}
                   className="flex items-center justify-between text-textLight hover:text-primary dark:text-gray-300 dark:hover:text-white font-medium py-2 transition-colors"
                   onClick={(e) => {
                       if (link.hasDropdown) {
                           e.preventDefault();
                           toggleMobileDropdown(link.name);
                       } else {
                           setIsMobileMenuOpen(false);
                       }
                   }}
                 >
                   <span className="flex items-center gap-2">
                       {link.icon && link.icon}
                       {link.name}
                   </span>
                   {link.hasDropdown && (
                       <ChevronDown 
                         size={16} 
                         className={`transition-transform duration-200 ${activeMobileDropdown === link.name ? 'rotate-180' : ''}`}
                       />
                   )}
                 </Link>
                 
                 {link.hasDropdown && activeMobileDropdown === link.name && (
                     <div className="pl-6 rtl:pr-6 border-l rtl:border-r border-border/20 mt-1 flex flex-col gap-2">
                         {link.dropdownItems.map((item, idx) => (
                             <Link 
                                 key={idx}
                                 to={item.path}
                                 className="flex items-center gap-2 text-sm text-textLight/80 hover:text-primary py-2"
                                 onClick={() => setIsMobileMenuOpen(false)}
                             >
                                 {item.icon} {item.name}
                             </Link>
                         ))}
                     </div>
                 )}
             </div>
          ))}
          <div className="pt-4 border-t border-border/10 flex flex-col space-y-3">
             <div className="flex gap-4 justify-center">
                 <ThemeToggle />
                 <LanguageSwitcher />
             </div>
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full">{t('login')}</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
