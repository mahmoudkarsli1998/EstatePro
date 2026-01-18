import React from 'react';
import { Search, User, Menu } from 'lucide-react';
import ThemeToggle from '../shared/ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';
import NotificationBell from './NotificationBell';

import { useAuth } from '../../hooks/useAuth';
import { getFullImageUrl } from '../../utils/imageUrlHelper';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 glass-panel !rounded-none !border-l-0 !border-r-0 !border-t-0 border-b border-border/20 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 font-sans">
      <div className="flex items-center gap-4 w-full md:w-96">
        <button 
          onClick={onMenuClick}
          className="p-2 text-textLight hover:text-textDark dark:hover:text-white hover:bg-section dark:hover:bg-white/10 rounded-lg md:hidden transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="relative w-full hidden md:block">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border/20 bg-background dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-textDark dark:text-white placeholder-textLight transition-all focus:bg-white dark:focus:bg-white/10"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationBell />
        
        <div className="flex items-center pl-4 border-l border-border/20">
          <div className="mr-3 text-right hidden md:block">
            <div className="text-sm font-bold text-textDark dark:text-white">{user?.name || 'User'}</div>
            <div className="text-xs text-textLight capitalize">{user?.role || 'Guest'}</div>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/30 shadow-sm">
            <img 
              src={getFullImageUrl(user?.avatar)} 
              alt={user?.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

