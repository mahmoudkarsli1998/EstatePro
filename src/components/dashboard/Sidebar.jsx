import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, Home, Users, UserCheck, FileText, LogOut } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/dashboard/projects', icon: Building },
    { name: 'Units', path: '/dashboard/units', icon: Home },
    { name: 'Leads', path: '/dashboard/leads', icon: Users },
    { name: 'Users', path: '/dashboard/users', icon: UserCheck },
    { name: 'Reports', path: '/dashboard/reports', icon: FileText },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-dark-card border-r border-white/10 text-white z-50 flex flex-col backdrop-blur-xl">
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="text-2xl font-bold font-heading text-primary block">
          Estate<span className="text-white">Pro</span>
          <span className="text-xs text-gray-500 block font-normal mt-1">Admin Panel</span>
        </Link>
      </div>

      <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} className="mr-3" />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link 
          to="/login" 
          className="flex items-center px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          <span className="font-medium">Sign Out</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
