import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, Home, Users, UserCheck, FileText, LogOut, Briefcase, Calendar, BarChart2, X, Shield, MapPin } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user, hasRole, logout } = useAuth();
  const isRtl = i18n.language === 'ar';

  const allLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: [] }, // All
    { name: 'Profile', path: '/dashboard/profile', icon: UserCheck, roles: [] }, // All
    
    // Shared
    { name: 'Units', path: '/dashboard/units', icon: Home, roles: ['admin', 'manager', 'sales', 'agent'] },
    
    // Admin/Manager only
    { name: 'Projects', path: '/dashboard/projects', icon: Building, roles: ['admin', 'manager'] },
    { name: 'Locations', path: '/dashboard/locations', icon: MapPin, roles: ['admin', 'manager'] },
    { name: 'Leads', path: '/dashboard/leads', icon: Users, roles: ['admin', 'manager', 'sales'] },
    { name: 'Developers', path: '/dashboard/developers', icon: Briefcase, roles: ['admin', 'manager'] },
    { name: 'Managers', path: '/dashboard/managers', icon: Users, roles: ['admin', 'manager'] },
    { name: 'Admins', path: '/dashboard/admins', icon: Shield, roles: ['admin', 'manager'] },
    { name: 'Agents', path: '/dashboard/agents', icon: UserCheck, roles: ['admin', 'manager'] }, 
    { name: 'Users', path: '/dashboard/users', icon: Users, roles: ['admin', 'manager'] },
    { name: 'Calendar', path: '/dashboard/calendar', icon: Calendar, roles: ['admin', 'manager'] },
    { name: 'Analysis', path: '/dashboard/analysis', icon: BarChart2, roles: ['admin', 'manager'] },
    { name: 'Reports', path: '/dashboard/reports', icon: FileText, roles: ['admin', 'manager'] },
  ];

  const links = allLinks.filter(link => {
    if (link.roles.length === 0) return true;
    return hasRole(link.roles);
  });

  return (
    <aside className={`fixed inset-y-0 start-0 w-64 glass-panel !rounded-none !border-l-0 !border-t-0 !border-b-0 border-e border-slate-200 dark:border-white/10 text-slate-900 dark:text-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : `${isRtl ? 'translate-x-full' : '-translate-x-full'} md:translate-x-0`
    }`}>
      <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold font-heading text-primary block">
          Estate<span className="text-slate-900 dark:text-white">Pro</span>
          <span className="text-xs text-gray-400 block font-sans font-normal mt-1">
            {user?.role === 'admin' ? 'Admin Panel' : 
             user?.role === 'manager' ? 'Manager Panel' : 
             user?.role === 'sales' ? 'Sales Dashboard' : 'Agent Panel'}
          </span>
        </Link>
        <button onClick={onClose} className="md:hidden text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-grow p-4 space-y-2 overflow-y-auto font-sans">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-[var(--button-bg)] text-primary font-bold shadow-md border border-primary/10' 
                  : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary dark:hover:text-white hover:translate-x-1 rtl:hover:-translate-x-1'
              }`}
            >
              <Icon size={20} className="me-3" />
              <span className="font-medium">{t(link.name.toLowerCase())}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-white/10 font-sans">
        <a 
          href="/login"
          className="flex items-center px-4 py-3 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            logout();
            window.location.href = '/login'; // Force full reload to be safe, or just navigate
          }}
        >
          <LogOut size={20} className="me-3" />
          <span className="font-medium">{t('signOut', 'Sign Out')}</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
