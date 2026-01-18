import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { Download, Calendar, Filter, RefreshCw, TrendingUp, Users, DollarSign, Home, FileText, Printer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import { useReactToPrint } from 'react-to-print'; /* Removed to avoid dependency error */
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import { estateService } from '../../services/estateService';
import { crmService } from '../../services/crmService';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';

// Custom Tooltip for better readability with forced high contrast
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="bg-white p-4 rounded-lg shadow-2xl border border-gray-200 text-black z-[100] relative"
        style={{ backgroundColor: '#ffffff', color: '#000000', opacity: 1 }}
      >
        <p className="font-bold text-sm mb-2 border-b border-gray-200 pb-1 text-black">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm flex items-center gap-2 mb-1">
            <span 
              className="w-3 h-3 rounded-full border border-gray-100" 
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="font-medium capitalize text-gray-700">{entry.name}:</span>
            <span className="font-bold text-black">
              {entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('ticket') 
                ? `$${entry.value.toLocaleString()}` 
                : entry.value.toLocaleString()}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Reports = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { format, formatCompact } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    units: [],
    leads: [],
    users: [],
    projects: []
  });
  const [timeRange, setTimeRange] = useState('6m'); // 'all', '1y', '6m', '30d'
  const [selectedProject, setSelectedProject] = useState('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const reportRef = useRef();

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [units, leads, users, projects] = await Promise.all([
          estateService.getUnits(),
          crmService.getLeads(),
          crmService.getUsers(),
          estateService.getProjects()
        ]);
        setData({ units, leads, users, projects });
      } catch (error) {
        console.error("Failed to fetch report data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Logic
  const filterDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    
    if (timeRange === 'all') return true;
    
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (timeRange === '30d') return diffDays <= 30;
    if (timeRange === '6m') return diffDays <= 180;
    if (timeRange === '1y') return diffDays <= 365;
    return true;
  };

  const filterProject = (item) => {
    if (selectedProject === 'all') return true;
    // For units/leads, they might have projectId
    // For users, they don't map to project directly usually, so we might keep them or filter if possible
    return item.projectId === parseInt(selectedProject);
  };

  // Process Data for Charts
  const processedData = useMemo(() => {
    if (loading) return null;

    // Filter raw data first
    const filteredUnits = data.units.filter(item => filterProject(item));
    const filteredLeads = data.leads.filter(item => filterProject(item));
    // Users are global usually, unless we filter agents by assignment. Let's keep users global for now unless project is selected?
    // Actually, let's just filter leads/units by project. Users might not be project specific in this mock.
    const filteredUsers = data.users; 

    // Group by month
    const timeline = {};
    const now = new Date();
    const monthsBack = timeRange === '30d' ? 1 : timeRange === '6m' ? 6 : 12;

    // Initialize timeline
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      timeline[key] = { name: key, revenue: 0, leads: 0, users: 0, rawDate: d };
    }

    // Process Leads
    filteredLeads.forEach(lead => {
      if (filterDate(lead.createdAt)) {
        const d = new Date(lead.createdAt);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (timeline[key]) timeline[key].leads += 1;
      }
    });

    // Process Users (Global stats typically, but let's just show them)
    // If a project is selected, showing "New Users" might be misleading if they aren't linked.
    // Let's only count users if NO project is selected, OR if we had a way to link them.
    // For now, we'll zero out users if a project is selected to be safe/accurate.
    if (selectedProject === 'all') {
      filteredUsers.forEach(user => {
        if (filterDate(user.createdAt)) {
          const d = new Date(user.createdAt);
          const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
          if (timeline[key]) timeline[key].users += 1;
        }
      });
    }

    // Process Revenue (Units)
    filteredUnits.forEach((unit, index) => {
      if (unit.status === 'sold') {
         // Mock distribution since we lack 'soldDate'
         const keys = Object.keys(timeline);
         const randomKey = keys[index % keys.length];
         if (timeline[randomKey]) timeline[randomKey].revenue += unit.price;
      }
    });

    const timelineData = Object.values(timeline).sort((a,b) => a.rawDate - b.rawDate);

    // Property Distribution
    const typeDist = {};
    filteredUnits.forEach(u => {
      const type = t(u.type) || u.type; 
      typeDist[type] = (typeDist[type] || 0) + 1;
    });
    const pieData = Object.entries(typeDist).map(([name, value]) => ({ name, value }));

    // Status Distribution
    const statusDist = { [t('available')]: 0, [t('sold')]: 0, [t('reserved')]: 0 };
    filteredUnits.forEach(u => {
      const statusKey = u.status === 'sold' ? t('sold') : u.status === 'reserved' ? t('reserved') : t('available');
      statusDist[statusKey] = (statusDist[statusKey] || 0) + 1;
    });
    const statusPieData = Object.entries(statusDist).map(([name, value]) => ({ name, value }));

    // Metrics
    const totalRevenue = filteredUnits.reduce((acc, u) => u.status === 'sold' ? acc + u.price : acc, 0);
    const totalLeads = filteredLeads.filter(l => filterDate(l.createdAt)).length;
    const closedLeads = filteredLeads.filter(l => l.status === 'closed').length;
    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

    return {
      timelineData,
      pieData,
      statusPieData,
      metrics: {
        totalRevenue,
        totalLeads,
        conversionRate,
        avgTicket: totalRevenue / (filteredUnits.filter(u => u.status === 'sold').length || 1)
      }
    };

  }, [data, timeRange, selectedProject, loading, t]);

  const COLORS = ['#00F0FF', '#7000FF', '#FF0055', '#00D18B', '#FFD700'];
  const STATUS_COLORS = ['#00D18B', '#FF0055', '#FFD700'];

  const handlePrint = () => {
    toast.info(t('preparingReport') || 'Preparing report for printing...', 2000);
    const printContent = document.getElementById('printable-report');
    const windowUrl = 'about:blank';
    const uniqueName = new Date();
    const windowName = 'Print' + uniqueName.getTime();
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

    printWindow.document.write(`
      <html>
        <head>
          <title>Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; background: #fff; }
            h1 { color: #333; border-bottom: 2px solid #ccc; padding-bottom: 10px; }
            h2 { color: #555; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .metric-card { display: inline-block; width: 45%; border: 1px solid #ddd; padding: 15px; margin: 10px 2% 10px 0; background: #fafafa; }
            .metric-title { color: #777; font-size: 14px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #333; margin-top: 5px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['Month', 'Revenue', 'Leads', 'Users'];
    const rows = processedData.timelineData.map(row => [
      row.name,
      row.revenue,
      row.leads,
      row.users
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success(t('csvExported', 'CSV exported successfully!'));
  };

  const [showExportDropdown, setShowExportDropdown] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-end gap-4">
        <div className="w-full xl:w-auto">
          <h1 className="text-3xl font-bold font-heading text-textDark dark:text-white mb-2">{t('analyticsReports')}</h1>
          <p className="text-textLight dark:text-gray-400">{t('detailedInsights')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* Project Filter */}
          <div className="relative min-w-[200px]">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 bg-background dark:bg-dark-card border border-border/20 rounded-lg text-textDark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              <option value="all">{t('allProjects')}</option>
              {data.projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-textLight dark:text-gray-400 pointer-events-none" />
          </div>

          <div className="bg-background dark:bg-dark-card border border-border/20 rounded-lg p-1 flex items-center overflow-x-auto">
            {['30d', '6m', '1y', 'all'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  timeRange === range 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-textLight dark:text-gray-400 hover:text-textDark dark:hover:text-white'
                }`}
              >
                {t(range === '30d' ? 'last30Days' : range === '6m' ? 'last6Months' : range === '1y' ? 'lastYear' : 'allTime')}
              </button>
            ))}
          </div>
          
          {/* Export Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              <Download size={16} />
              {t('export', 'Export')}
            </button>
            
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-dark-card rounded-lg shadow-xl border border-border/20 py-2 z-50">
                <button
                  onClick={() => { setIsReportModalOpen(true); setShowExportDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-textDark dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-2"
                >
                  📄 {t('generateReport', 'Generate PDF Report')}
                </button>
                <button
                  onClick={() => { exportToCSV(); setShowExportDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-textDark dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-2"
                >
                  📊 {t('exportCSV', 'Export as CSV')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: t('totalRevenue'), 
            value: formatCompact(processedData.metrics.totalRevenue),
            icon: DollarSign, 
            color: 'cyan', 
            trend: '+12%',
            trendColor: 'green' 
          },
          { 
            title: t('totalLeads'), 
            value: processedData.metrics.totalLeads,
            icon: Users, 
            color: 'purple', 
            trend: '+5%',
            trendColor: 'green'
          },
          { 
            title: t('conversionRate'), 
            value: `${processedData.metrics.conversionRate.toFixed(1)}%`,
            icon: RefreshCw, 
            color: 'pink', 
            trend: '-2%',
            trendColor: 'red'
          },
          { 
            title: t('avgTicket'), 
            value: formatCompact(processedData.metrics.avgTicket),
            icon: Home, 
            color: 'green', 
            trend: '+8%',
            trendColor: 'green'
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-6 border-l-4 border-l-${stat.color}-500 hover:scale-[1.02] transition-transform duration-300`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-textDark dark:text-white mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 bg-${stat.color}-500/10 rounded-lg text-${stat.color}-400`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div className={`flex items-center text-sm text-${stat.trendColor}-400`}>
                <TrendingUp size={14} className={`me-1 ${stat.trendColor === 'red' ? 'rotate-180' : ''}`} /> 
                {stat.trend}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-6">
            <h3 className="text-lg font-bold text-textDark dark:text-white mb-6 font-heading">{t('revenueGrowth')}</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedData.timelineData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{fill: 'var(--text-light)'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{fill: 'var(--text-light)'}} axisLine={false} tickLine={false} tickFormatter={(val) => formatCompact(val)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Property Distribution */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-6">
            <h3 className="text-lg font-bold text-textDark dark:text-white mb-6 font-heading">{t('propertyDistribution')}</h3>
            <div className="h-80 w-full flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processedData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {processedData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    formatter={(value, entry) => <span className="text-gray-300 ml-2">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

       {/* Secondary Charts */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Leads & Users Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6">
          <h3 className="text-lg font-bold text-textDark dark:text-white mb-6 font-heading">{t('growthAnalytics')}</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData.timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: 'var(--text-light)'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{fill: 'var(--text-light)'}} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="leads" name={t('leads')} fill="#7000FF" radius={[4, 4, 0, 0]} />
                {selectedProject === 'all' && (
                  <Bar dataKey="users" name={t('users')} fill="#FF0055" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        </motion.div>

        {/* Unit Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
         <Card className="p-6">
          <h3 className="text-lg font-bold text-textDark dark:text-white mb-6 font-heading">{t('unitStatus')}</h3>
          <div className="h-80 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processedData.statusPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                    return percent > 0 ? `${(percent * 100).toFixed(0)}%` : '';
                  }}
                  labelLine={false}
                >
                  {processedData.statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                 <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value, entry) => <span className="text-gray-300 ml-2">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        </motion.div>
       </div>

       {/* Generate Report Modal */}
       <AnimatePresence>
         {isReportModalOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
             >
               <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                 <div>
                   <h2 className="text-2xl font-bold text-gray-900">{t('generatedReport')}</h2>
                   <p className="text-gray-500 text-sm mt-1">Generated on {new Date().toLocaleDateString()}</p>
                 </div>
                 <div className="flex gap-2">
                   <Button variant="secondary" onClick={handlePrint}>
                     <Printer size={16} className="me-2" /> {t('print')}
                   </Button>
                   <button 
                     onClick={() => setIsReportModalOpen(false)}
                     className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                   >
                     <X size={20} />
                   </button>
                 </div>
               </div>

               <div className="p-8 overflow-y-auto bg-white text-gray-900" id="printable-report">
                 <div className="text-center mb-8">
                   <h1 className="text-3xl font-bold mb-2">Executive Summary</h1>
                   <p className="text-gray-500">Period: {t(timeRange)} | Project: {selectedProject === 'all' ? t('allAll') : data.projects.find(p=>p.id===parseInt(selectedProject))?.name}</p>
                 </div>

                 {/* Metrics Grid for Report */}
                 <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-4 bg-gray-50 rounded-lg border">
                     <p className="text-gray-500 text-sm uppercase tracking-wider">{t('totalRevenue')}</p>
                     <p className="text-3xl font-bold text-primary mt-1">${(processedData.metrics.totalRevenue).toLocaleString()}</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-lg border">
                     <p className="text-gray-500 text-sm uppercase tracking-wider">{t('totalLeads')}</p>
                     <p className="text-3xl font-bold text-purple-600 mt-1">{processedData.metrics.totalLeads}</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-lg border">
                     <p className="text-gray-500 text-sm uppercase tracking-wider">{t('conversionRate')}</p>
                     <p className="text-3xl font-bold text-pink-600 mt-1">{processedData.metrics.conversionRate.toFixed(1)}%</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-lg border">
                     <p className="text-gray-500 text-sm uppercase tracking-wider">{t('avgTicket')}</p>
                     <p className="text-3xl font-bold text-green-600 mt-1">${(processedData.metrics.avgTicket).toLocaleString()}</p>
                   </div>
                 </div>

                 {/* Detailed Tables */}
                 <h2 className="text-xl font-bold mb-4 border-b pb-2">Revenue & Growth Breakdown</h2>
                 <table className="w-full text-left mb-8 border-collapse">
                   <thead>
                     <tr className="bg-gray-100">
                       <th className="p-3 border">Period</th>
                       <th className="p-3 border">Revenue</th>
                       <th className="p-3 border">Leads</th>
                       <th className="p-3 border">New Users</th>
                     </tr>
                   </thead>
                   <tbody>
                     {processedData.timelineData.map((row, i) => (
                       <tr key={i} className="border-b">
                         <td className="p-3 border">{row.name}</td>
                         <td className="p-3 border text-right">${row.revenue.toLocaleString()}</td>
                         <td className="p-3 border text-right">{row.leads}</td>
                         <td className="p-3 border text-right">{row.users}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>

                 <h2 className="text-xl font-bold mb-4 border-b pb-2">Property Distribution</h2>
                 <table className="w-full text-left mb-8 border-collapse">
                   <thead>
                     <tr className="bg-gray-100">
                       <th className="p-3 border">Type</th>
                       <th className="p-3 border">Count</th>
                       <th className="p-3 border">Percentage</th>
                     </tr>
                   </thead>
                   <tbody>
                     {processedData.pieData.map((row, i) => (
                       <tr key={i} className="border-b">
                         <td className="p-3 border">{row.name}</td>
                         <td className="p-3 border text-right">{row.value}</td>
                         <td className="p-3 border text-right">
                           {((row.value / (processedData.pieData.reduce((a,b)=>a+b.value,0)||1)) * 100).toFixed(1)}%
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 
                 <div className="mt-8 pt-4 border-t text-sm text-gray-400 text-center">
                   <p>Generated by EstatePro Analytics Platform</p>
                 </div>
               </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>
    </div>
  );
};

export default Reports;
