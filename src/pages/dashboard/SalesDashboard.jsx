import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { Building, Users, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';

const SalesDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = React.useState({
    total: 0,
    newLeads: 0,
    contactedLeads: 0,
    newPercent: 0,
    contactedPercent: 0
  });
  const [activities, setActivities] = React.useState([]);
  const [myLeads, setMyLeads] = React.useState([]);

  React.useEffect(() => {
    const loadData = async () => {
        if (!user) return;
        try {
            // Fetch fresh user data for activities
            const freshUser = await api.getUserById(user.id);
            setActivities(freshUser.activities || []);

            // Fetch leads for stats
            const leads = await api.getLeads();
            const leadsForMe = leads.filter(l => l.assignedAgentId === user.id);
            setMyLeads(leadsForMe);
            
            const total = leadsForMe.length;
            const newL = leadsForMe.filter(l => l.status === 'new').length;
            const contacted = leadsForMe.filter(l => l.status === 'contacted').length;
            
            setStats({
                total,
                newLeads: newL,
                contactedLeads: contacted,
                newPercent: total ? Math.round((newL / total) * 100) : 0,
                contactedPercent: total ? Math.round((contacted / total) * 100) : 0
            });
        } catch (error) {
            console.error("Error loading sales dashboard data", error);
        }
    };
    loadData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-white">
            {t('welcomeBack')}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1">
            {t('salesDashboardOverview')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Assigned Leads Counter */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-gray-200">{t('totalAssignedLeads')}</h3>
           </div>
           <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.total}</p>
           <p className="text-sm text-slate-500">{t('leadsAssignedToYou')}</p>
           
           <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{t('new')} ({stats.newLeads})</span>
                <span>{stats.newPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${stats.newPercent}%` }} />
              </div>
              
              <div className="flex justify-between text-xs text-slate-500">
                <span>{t('contacted')} ({stats.contactedLeads})</span>
                <span>{stats.contactedPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${stats.contactedPercent}%` }} />
              </div>
           </div>
        </div>

        {/* Quick Actions */}
        <Link to="/dashboard/units" className="group bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 hover:shadow-md transition-shadow flex flex-col justify-between">
           <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-4">
                <Home size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('manageUnits')}</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">{t('addEditYourListings')}</p>
           </div>
           <div className="flex items-center text-blue-500 text-sm font-bold">
             {t('viewAll')} <span className="ms-2">→</span>
           </div>
        </Link>

        {/* Units Sold Card */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 opacity-70">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                <Building size={20} />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-gray-200">{t('unitsSold')}</h3>
           </div>
           <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">0</p>
           <p className="text-sm text-slate-500">{t('comingSoon')}</p>
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
           <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             {t('recentActivity')}
           </h3>
           {/* Replaced activity log with myLeads table */}
           <div className="overflow-x-auto max-h-[200px] custom-scrollbar">
             <table className="min-w-full">
               <thead>
                 <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5">
                   <th className="py-2">Name</th>
                   <th className="py-2">Status</th>
                   <th className="py-2">Contact</th>
                   <th className="py-2">Source</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                 {myLeads.length === 0 ? (
                   <tr>
                     <td colSpan="4" className="py-8 text-center text-gray-400 italic">
                       {t('noLeadsAssignedYet', 'No leads assigned yet.')}
                     </td>
                   </tr>
                 ) : (
                   myLeads.map(lead => (
                     <tr key={lead.id} className="text-slate-700 dark:text-gray-300">
                       <td className="py-4 font-bold max-w-[140px] truncate" title={lead.name}>{lead.name}</td>
                       <td className="py-4">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${lead.status === 'new' ? 'bg-blue-500/10 text-blue-500' : lead.status === 'contacted' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-100 dark:bg-white/10'}`}>
                           {lead.status}
                         </span>
                       </td>
                       <td className="py-4 font-mono text-xs">{lead.phone || lead.email}</td>
                       <td className="py-4 text-xs capitalize opacity-70">{lead.source}</td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* Quick Profile View or other sales specific implementation */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          {t('salesRestrictionsNotice')}
        </h2>
        <p className="text-slate-500 dark:text-gray-400">
          {t('salesRoleDescription', 'As a Sales representative, you have access to your assigned leads counter and unit management. Access to full leads list, user management, and other administrative features is restricted.')}
        </p>
      </div>
    </div>
  );
};

export default SalesDashboard;
