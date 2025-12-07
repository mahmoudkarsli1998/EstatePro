import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, Home, Users, UserCheck, FileText, LogOut, Briefcase, Calendar, BarChart2, X, Shield } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/dashboard/projects', icon: Building },
    { name: 'Units', path: '/dashboard/units', icon: Home },
    { name: 'Leads', path: '/dashboard/leads', icon: Users },
    { name: 'Developers', path: '/dashboard/developers', icon: Briefcase },
    { name: 'Managers', path: '/dashboard/managers', icon: Users },
    { name: 'Admins', path: '/dashboard/admins', icon: Shield },
    { name: 'Agents', path: '/dashboard/agents', icon: UserCheck }, 
    { name: 'Users', path: '/dashboard/users', icon: Users },
    { name: 'Calendar', path: '/dashboard/calendar', icon: Calendar },
    { name: 'Analysis', path: '/dashboard/analysis', icon: BarChart2 },
    { name: 'Reports', path: '/dashboard/reports', icon: FileText },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 w-64 glass-panel !rounded-none !border-l-0 !border-t-0 !border-b-0 border-r border-white/10 text-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    }`}>
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold font-heading text-primary block">
          Estate<span className="text-white">Pro</span>
          <span className="text-xs text-gray-400 block font-sans font-normal mt-1">Admin Panel</span>
        </Link>
        <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
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
                  ? 'bg-primary text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
              }`}
            >
              <Icon size={20} className="mr-3" />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 font-sans">
        <Link 
          to="/login" 
          className="flex items-center px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          <span className="font-medium">Sign Out</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
