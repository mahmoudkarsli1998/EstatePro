import React from 'react';
import { Bell, Search, User } from 'lucide-react';

import ThemeToggle from '../shared/ThemeToggle';

const Header = () => {
  return (
    <header className="h-16 bg-dark-card/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center w-96">
        <div className="relative w-full">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <button className="relative p-2 text-gray-400 hover:bg-white/10 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_#FF0055]"></span>
        </button>
        
        <div className="flex items-center pl-4 border-l border-white/10">
          <div className="mr-3 text-right hidden md:block">
            <div className="text-sm font-bold text-white">Admin User</div>
            <div className="text-xs text-gray-400">Administrator</div>
          </div>
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary border border-primary/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
