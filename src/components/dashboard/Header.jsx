import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';

import ThemeToggle from '../shared/ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';

const Header = ({ onMenuClick }) => {
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
        <button className="relative p-2 text-textLight hover:bg-section dark:hover:bg-white/10 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full shadow-sm"></span>
        </button>
        
        <div className="flex items-center pl-4 border-l border-border/20">
          <div className="mr-3 text-right hidden md:block">
            <div className="text-sm font-bold text-textDark dark:text-white">Admin User</div>
            <div className="text-xs text-textLight">Administrator</div>
          </div>
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary border border-primary/30 shadow-sm">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
