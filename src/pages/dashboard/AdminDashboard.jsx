import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, Building, Home, DollarSign, TrendingUp, Plus, UserPlus, FileText, Box, LayoutGrid, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { estateService } from '../../services/estateService';
import { crmService } from '../../services/crmService';
import StatCard from '../../components/dashboard/widgets/StatCard';
import ActivityFeed from '../../components/dashboard/widgets/ActivityFeed';
import Dashboard3D from '../../components/dashboard/Dashboard3D';
import { ENABLE_3D } from '../../config/performance';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';
import AiReindexControl from '../../components/dashboard/AiReindexControl';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { format, formatCompact } = useCurrency();
  
  const [viewMode, setViewMode] = useState('2D'); // '2D' or '3D'
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalUnits: 0,
    totalLeads: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [chartData, setChartData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projects, units, leads, users] = await Promise.all([
          estateService.getProjects(),
          estateService.getUnits(),
          crmService.getLeads(),
          crmService.getUsers()
        ]);

        // Calculate real revenue from sold units
        const soldUnits = units.filter(u => u.status === 'sold');
        const totalRevenue = soldUnits.reduce((sum, u) => sum + (u.price || 0), 0);

        setStats({
          totalProjects: projects.length,
          totalUnits: units.length,
          totalLeads: leads.length,
          totalUsers: users.length,
          totalRevenue
        });

        // Generate chart data from real data - last 6 months
        const monthlyData = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = d.toLocaleString('default', { month: 'short' });
          monthlyData[key] = { name: key, value: 0, leads: 0, monthDate: d };
        }

        // Count leads per month
        leads.forEach(lead => {
          if (lead.createdAt) {
            const d = new Date(lead.createdAt);
            const key = d.toLocaleString('default', { month: 'short' });
            if (monthlyData[key]) monthlyData[key].leads += 1;
          }
        });

        // Distribute sold units revenue by month (use createdAt or distribute evenly)
        soldUnits.forEach((unit, index) => {
          const keys = Object.keys(monthlyData);
          // If unit has soldDate use it, else distribute
          const key = unit.soldDate 
            ? new Date(unit.soldDate).toLocaleString('default', { month: 'short' })
            : keys[index % keys.length];
          if (monthlyData[key]) monthlyData[key].value += unit.price || 0;
        });

        setChartData(Object.values(monthlyData));

        // Calculate top performers (agents/sales with most closed leads)
        const agentUsers = users.filter(u => ['agent', 'sales', 'manager'].includes(u.role?.toLowerCase()));
        const performerStats = agentUsers.map(agent => {
          const agentLeads = leads.filter(l => 
            l.assignedAgent?._id === agent._id || 
            l.assignedAgent === agent._id ||
            l.assignedAgent?.toString() === agent._id?.toString()
          );
          const closedLeads = agentLeads.filter(l => l.status === 'closed' || l.status === 'converted');
          return {
            id: agent._id,
            name: agent.fullName || agent.name || 'Agent',
            initials: (agent.fullName || agent.name || 'A').substring(0, 2).toUpperCase(),
            closedCount: closedLeads.length,
            totalLeads: agentLeads.length,
            // Estimate revenue from closed deals
            revenue: closedLeads.length * (totalRevenue / (soldUnits.length || 1))
          };
        }).sort((a, b) => b.closedCount - a.closedCount).slice(0, 3);

        setTopPerformers(performerStats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 !bg-dark-card/90 border-white/10">
          <p className="text-white font-bold mb-1">{label}</p>
          <p className="text-primary text-sm">
            Sales: {format(payload[0].value)}
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

  // State for export menu
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['Month', 'Revenue', 'Leads'];
    const rows = chartData.map(row => [row.name, row.value, row.leads]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('CSV exported successfully!');
  };

  // Export to PDF (print-friendly version)
  const exportToPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Dashboard Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #1a1a2e; border-bottom: 2px solid #00F0FF; padding-bottom: 10px; }
            h2 { color: #555; margin-top: 30px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
            .kpi-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #00F0FF; }
            .kpi-title { font-size: 12px; color: #666; text-transform: uppercase; }
            .kpi-value { font-size: 24px; font-weight: bold; color: #1a1a2e; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #f3f4f6; font-weight: 600; }
            .footer { margin-top: 40px; text-align: center; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>📊 Dashboard Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">Total Projects</div>
              <div class="kpi-value">${stats.totalProjects}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Total Units</div>
              <div class="kpi-value">${stats.totalUnits}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Active Leads</div>
              <div class="kpi-value">${stats.totalLeads}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Total Revenue</div>
              <div class="kpi-value">$${stats.totalRevenue?.toLocaleString() || 0}</div>
            </div>
          </div>

          <h2>Monthly Performance</h2>
          <table>
            <thead>
              <tr><th>Month</th><th>Revenue</th><th>Leads</th></tr>
            </thead>
            <tbody>
              ${chartData.map(row => `
                <tr>
                  <td>${row.name}</td>
                  <td>$${row.value?.toLocaleString() || 0}</td>
                  <td>${row.leads}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${topPerformers.length > 0 ? `
            <h2>Top Performers</h2>
            <table>
              <thead>
                <tr><th>Name</th><th>Closed Deals</th><th>Estimated Revenue</th></tr>
              </thead>
              <tbody>
                ${topPerformers.map(p => `
                  <tr>
                    <td>${p.name}</td>
                    <td>${p.closedCount}</td>
                    <td>$${p.revenue?.toLocaleString() || 0}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          <div class="footer">
            <p>Generated by EstatePro Dashboard</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
    toast.success('PDF generated!');
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
          {/* Export Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-[var(--button-bg)] text-primary rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-shadow border border-primary/10 flex items-center gap-2"
            >
              <Download size={16} />
              {t('exportReport')}
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-xl border border-border/20 py-2 z-50">
                <button
                  onClick={() => { exportToPDF(); setShowExportMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-textDark dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-2"
                >
                  📄 {t('exportPDF', 'Export as PDF')}
                </button>
                <button
                  onClick={() => { exportToCSV(); setShowExportMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-textDark dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-2"
                >
                  📊 {t('exportCSV', 'Export as CSV')}
                </button>
              </div>
            )}
          </div>
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
          value={formatCompact(stats.totalRevenue)} 
          change={stats.totalRevenue > 0 ? '+' + Math.round((stats.totalRevenue / 1000000) * 10) + '%' : '0%'}
          trend="up"
          icon={DollarSign} 
          color="from-green-500 to-emerald-500" 
        />
      </div>

      {/* Main Content Grid */}
      {viewMode === '3D' ? (
        <Dashboard3D salesData={chartData} leadsData={chartData} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
          <div className="lg:col-span-2 h-full glass-panel p-6 flex flex-col">
            <h3 className="text-xl font-bold text-textDark dark:text-white mb-6 font-heading">{t('revenueAnalytics')}</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
                  <YAxis stroke="#718096" tick={{fill: '#718096'}} axisLine={false} tickLine={false} tickFormatter={(value) => formatCompact(value)} />
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
                <BarChart data={chartData}>
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
              {topPerformers.length > 0 ? topPerformers.map((performer, i) => (
                <div key={performer.id || i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center text-slate-700 dark:text-white font-bold border border-white/10 shadow-lg">
                    {performer.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{performer.name}</p>
                    <p className="text-xs text-primary">{performer.closedCount} {t('closedDeals', 'closed deals')} • {formatCompact(performer.revenue)}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400">{t('noDataYet', 'No data yet')}</p>
              )}
            </div>
          </div>

          {/* AI Knowledge Base Sync */}
          <AiReindexControl />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
