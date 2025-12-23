import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, Building, Home, DollarSign, TrendingUp, Plus, UserPlus, FileText, Box, LayoutGrid } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api } from '../../utils/api';
import StatCard from '../../components/dashboard/widgets/StatCard';
import ActivityFeed from '../../components/dashboard/widgets/ActivityFeed';
import Dashboard3D from '../../components/dashboard/Dashboard3D';
import { ENABLE_3D } from '../../config/performance';

import { useToast } from '../../context/ToastContext';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const [viewMode, setViewMode] = useState('2D'); // '2D' or '3D'
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalUnits: 0,
    totalLeads: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projects, units, leads, users] = await Promise.all([
          api.getProjects(),
          api.getUnits(),
          api.getLeads(),
          api.getUsers()
        ]);

        setStats({
          totalProjects: projects.length,
          totalUnits: units.length,
          totalLeads: leads.length,
          totalUsers: users.length
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mock data for Charts
  const salesData = [
    { name: 'Jan', value: 4000, leads: 2400 },
    { name: 'Feb', value: 3000, leads: 1398 },
    { name: 'Mar', value: 2000, leads: 9800 },
    { name: 'Apr', value: 2780, leads: 3908 },
    { name: 'May', value: 1890, leads: 4800 },
    { name: 'Jun', value: 2390, leads: 3800 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 !bg-dark-card/90 border-white/10">
          <p className="text-white font-bold mb-1">{label}</p>
          <p className="text-primary text-sm">
            Sales: ${payload[0].value.toLocaleString()}
          </p>
          {payload[1] && (
            <p className="text-secondary text-sm">
              Leads: {payload[1].value.toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-textDark dark:text-white mb-2">{t('dashboardOverview')}</h1>
          <p className="text-textLight dark:text-gray-400">{t('welcomeMessage')}</p>
        </div>
        <div className="flex gap-3">
           <div></div>
           
           <button 
             onClick={() => toast.success('Report exported successfully!', 3000)}
             className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-shadow"
           >
             {t('exportReport')}
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('totalProjects')}
          value={stats.totalProjects} 
          change="12%"
          trend="up"
          icon={Building} 
          color="from-blue-500 to-cyan-500" 
        />
        <StatCard 
          title={t('totalUnits')}
          value={stats.totalUnits} 
          change="5%"
          trend="up"
          icon={Home} 
          color="from-purple-500 to-pink-500" 
        />
        <StatCard 
          title={t('activeLeads')}
          value={stats.totalLeads} 
          change="8%"
          trend="up"
          icon={Users} 
          color="from-pink-500 to-rose-500" 
        />
        <StatCard 
          title={t('totalRevenue')}
          value="$2.4M" 
          change="24%"
          trend="up"
          icon={DollarSign} 
          color="from-green-500 to-emerald-500" 
        />
      </div>

      {/* Main Content Grid */}
      {viewMode === '3D' ? (
        <Dashboard3D salesData={salesData} leadsData={salesData} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
          <div className="lg:col-span-2 h-full glass-panel p-6 flex flex-col">
            <h3 className="text-xl font-bold text-textDark dark:text-white mb-6 font-heading">{t('revenueAnalytics')}</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7000FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7000FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#718096" tick={{fill: '#718096'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#718096" tick={{fill: '#718096'}} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  <Area type="monotone" dataKey="leads" stroke="#7000FF" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="h-full glass-panel p-6 flex flex-col">
            <h3 className="text-xl font-bold text-textDark dark:text-white mb-6 font-heading">{t('trafficSources')}</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#718096" tick={{fill: '#718096'}} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#00F0FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* Quick Actions & Top Agents */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="glass-panel p-6">
            <h3 className="text-xl font-bold text-textDark dark:text-white mb-6 font-heading">{t('quickActions')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/dashboard/projects', { state: { openCreateModal: true } })}
                className="p-4 rounded-xl bg-section/30 dark:bg-white/5 hover:bg-primary/20 dark:hover:bg-primary/20 hover:border-primary/50 border border-border/20 transition-all group flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Plus size={20} />
                </div>
                <span className="text-sm text-slate-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-white">{t('addListing')}</span>
              </button>
              <button 
                onClick={() => navigate('/dashboard/users', { state: { openCreateModal: true } })}
                className="p-4 rounded-xl bg-section/30 dark:bg-white/5 hover:bg-purple-500/20 hover:border-purple-500/50 border border-border/20 transition-all group flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <UserPlus size={20} />
                </div>
                <span className="text-sm text-slate-600 dark:text-gray-300 group-hover:text-blue-500 dark:group-hover:text-white">{t('newUser')}</span>
              </button>
              <button 
                onClick={() => navigate('/dashboard/reports')}
                className="p-4 rounded-xl bg-section/30 dark:bg-white/5 hover:bg-pink-500/20 hover:border-pink-500/50 border border-border/20 transition-all group flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
                <span className="text-sm text-slate-600 dark:text-gray-300 group-hover:text-pink-500 dark:group-hover:text-white">{t('generateReport')}</span>
              </button>
              <button 
                 onClick={() => navigate('/dashboard/units')}
                 className="p-4 rounded-xl bg-section/30 dark:bg-white/5 hover:bg-green-500/20 hover:border-green-500/50 border border-border/20 transition-all group flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                  <DollarSign size={20} />
                </div>
                <span className="text-sm text-slate-600 dark:text-gray-300 group-hover:text-green-500 dark:group-hover:text-white">{t('recordSale')}</span>
              </button>
            </div>
          </div>

          {/* Top Agents Mini Widget */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">{t('topPerformers')}</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center text-slate-700 dark:text-white font-bold border border-white/10 shadow-lg">
                    A{i}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t('agent')} {i}</p>
                    <p className="text-xs text-primary">$1.{i}M {t('sales')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
