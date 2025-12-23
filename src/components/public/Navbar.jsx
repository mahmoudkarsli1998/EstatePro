import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User } from 'lucide-react';
import Button from '../shared/Button';
import ThemeToggle from '../shared/ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('projects'), path: '/projects' },
    { name: t('location'), path: '/locations' },
    // { name: t('designStudio'), path: '/design' },
    { name: t('sell'), path: '/sell' },
    { name: t('aboutUs'), path: '/about' },
    { name: t('contact'), path: '/contact' },
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
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-medium transition-all duration-300 relative group ${
                location.pathname === link.path ? 'text-primary dark:text-accent' : 'text-textLight hover:text-primary dark:hover:text-accent'
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full ${
                location.pathname === link.path ? 'w-full' : ''
              }`}></span>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center space-x-4">
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
          className="md:hidden p-2 text-textDark dark:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-background/95 dark:bg-section/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl p-4 flex flex-col space-y-4 mx-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-textLight hover:text-primary dark:text-gray-300 dark:hover:text-white font-medium py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-border/10 flex flex-col space-y-3">
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
