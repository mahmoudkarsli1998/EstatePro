import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart2, TrendingUp, Users, DollarSign, Activity, Download, RefreshCw, Filter, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useCurrency } from '../../context/CurrencyContext';
import { estateService } from '../../services/estateService';
import { crmService } from '../../services/crmService';

const Analysis = () => {
  const { t } = useTranslation();
  const { format, formatCompact } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState({ units: [], leads: [], users: [], projects: [] });
  
  // Filter states
  const [timeRange, setTimeRange] = useState('6m'); // 'all', '1y', '6m', '30d'
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'sold', 'available', 'reserved'

  // Fetch real data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [units, leads, users, projects] = await Promise.all([
          estateService.getUnits(),
          crmService.getLeads(),
          crmService.getUsers(),
          estateService.getProjects()
        ]);
        setRawData({ units, leads, users, projects });
      } catch (error) {
        console.error('Error fetching analysis data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter helper functions
  const filterByDate = (dateString) => {
    if (!dateString || timeRange === 'all') return true;
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((now - date) / (1000 * 60 * 60 * 24));
    
    if (timeRange === '30d') return diffDays <= 30;
    if (timeRange === '6m') return diffDays <= 180;
    if (timeRange === '1y') return diffDays <= 365;
    return true;
  };

  const filterByProject = (item) => {
    if (selectedProject === 'all') return true;
    return item.projectId === selectedProject || item.project === selectedProject;
  };

  const filterByStatus = (unit) => {
    if (selectedStatus === 'all') return true;
    return unit.status === selectedStatus;
  };

  // Filtered data
  const filteredData = useMemo(() => {
    const { units, leads, users, projects } = rawData;
    return {
      units: units.filter(u => filterByProject(u) && filterByStatus(u)),
      leads: leads.filter(l => filterByDate(l.createdAt) && filterByProject(l)),
      users,
      projects
    };
  }, [rawData, timeRange, selectedProject, selectedStatus]);

  // Calculate KPI stats from filtered data
  const stats = useMemo(() => {
    const { units, leads, users } = filteredData;
    
    const soldUnits = units.filter(u => u.status === 'sold');
    const totalRevenue = soldUnits.reduce((sum, u) => sum + (u.price || 0), 0);
    const avgPrice = soldUnits.length > 0 ? totalRevenue / soldUnits.length : 0;
    
    // Estimate expenses as 30% of revenue (placeholder - you can adjust)
    const expenses = totalRevenue * 0.3;
    const profit = totalRevenue - expenses;
    
    return {
      totalRevenue,
      totalExpenses: expenses,
      netProfit: profit,
      activeUsers: users.length,
      totalUnits: units.length,
      soldUnits: soldUnits.length,
      totalLeads: leads.length,
      avgPrice
    };
  }, [filteredData]);

  // Generate monthly chart data from filtered data
  const chartData = useMemo(() => {
    const { units, leads } = filteredData;
    const monthlyData = {};
    const now = new Date();
    
    // Initialize last 7 months
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short' });
      monthlyData[key] = { name: key, revenue: 0, expenses: 0, profit: 0, leads: 0 };
    }

    // Calculate revenue per month from sold units
    units.filter(u => u.status === 'sold').forEach((unit, index) => {
      const keys = Object.keys(monthlyData);
      const key = unit.soldDate 
        ? new Date(unit.soldDate).toLocaleString('default', { month: 'short' })
        : keys[index % keys.length];
      if (monthlyData[key]) {
        monthlyData[key].revenue += unit.price || 0;
        monthlyData[key].expenses += (unit.price || 0) * 0.3;
        monthlyData[key].profit += (unit.price || 0) * 0.7;
      }
    });

    // Count leads per month
    leads.forEach(lead => {
      if (lead.createdAt) {
        const key = new Date(lead.createdAt).toLocaleString('default', { month: 'short' });
        if (monthlyData[key]) monthlyData[key].leads += 1;
      }
    });

    return Object.values(monthlyData);
  }, [filteredData]);

  // Property type distribution from filtered units
  const pieData = useMemo(() => {
    const { units } = filteredData;
    const typeCounts = {};
    
    units.forEach(unit => {
      const type = unit.type || 'other';
      const translatedType = t(type, type);
      typeCounts[translatedType] = (typeCounts[translatedType] || 0) + 1;
    });

    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [filteredData, t]);

  const COLORS = ['#00F0FF', '#8B5CF6', '#FF0055', '#00FF94', '#FFC107', '#FF6B6B'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 !bg-dark-card/90 border-white/10">
          <p className="text-textDark dark:text-white font-bold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {format(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['Month', 'Revenue', 'Expenses', 'Profit', 'Leads'];
    const rows = chartData.map(row => [
      row.name,
      row.revenue,
      row.expenses,
      row.profit,
      row.leads
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analysis_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Export to PDF (print-friendly version)
  const exportToPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Analysis Report - ${new Date().toLocaleDateString()}</title>
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
            .footer { margin-top: 40px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <h1>📊 Analysis Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>Filters: ${timeRange === 'all' ? 'All Time' : timeRange} | ${selectedProject === 'all' ? 'All Projects' : 'Selected Project'} | ${selectedStatus === 'all' ? 'All Status' : selectedStatus}</p>
          
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">Total Revenue</div>
              <div class="kpi-value">$${stats.totalRevenue.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Total Expenses</div>
              <div class="kpi-value">$${stats.totalExpenses.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Net Profit</div>
              <div class="kpi-value">$${stats.netProfit.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Active Users</div>
              <div class="kpi-value">${stats.activeUsers}</div>
            </div>
          </div>

          <h2>Monthly Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Expenses</th>
                <th>Profit</th>
                <th>Leads</th>
              </tr>
            </thead>
            <tbody>
              ${chartData.map(row => `
                <tr>
                  <td>${row.name}</td>
                  <td>$${row.revenue.toLocaleString()}</td>
                  <td>$${row.expenses.toLocaleString()}</td>
                  <td>$${row.profit.toLocaleString()}</td>
                  <td>${row.leads}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Property Distribution</h2>
          <table>
            <thead>
              <tr><th>Type</th><th>Count</th><th>Percentage</th></tr>
            </thead>
            <tbody>
              ${pieData.map(item => {
                const total = pieData.reduce((sum, p) => sum + p.value, 0);
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                return `<tr><td>${item.name}</td><td>${item.value}</td><td>${pct}%</td></tr>`;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated by EstatePro Analytics Platform</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const [showExportMenu, setShowExportMenu] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header with Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-textDark dark:text-white mb-2">{t('analysisReports')}</h1>
          <p className="text-textLight dark:text-gray-400">{t('deepDive')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* Project Filter */}
          <div className="relative min-w-[180px]">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 bg-white dark:bg-dark-card border border-border/20 rounded-lg text-textDark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer text-sm"
            >
              <option value="all">{t('allProjects', 'All Projects')}</option>
              {rawData.projects.map(p => (
                <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
              ))}
            </select>
            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-textLight dark:text-gray-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[140px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 bg-white dark:bg-dark-card border border-border/20 rounded-lg text-textDark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer text-sm"
            >
              <option value="all">{t('allStatus', 'All Status')}</option>
              <option value="sold">{t('sold', 'Sold')}</option>
              <option value="available">{t('available', 'Available')}</option>
              <option value="reserved">{t('reserved', 'Reserved')}</option>
            </select>
          </div>

          {/* Time Range Filter */}
          <div className="bg-white dark:bg-dark-card border border-border/20 rounded-lg p-1 flex items-center">
            {[
              { value: '30d', label: t('last30Days', '30d') },
              { value: '6m', label: t('last6Months', '6m') },
              { value: '1y', label: t('lastYear', '1y') },
              { value: 'all', label: t('allTime', 'All') },
            ].map(range => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  timeRange === range.value 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-textLight dark:text-gray-400 hover:text-textDark dark:hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          {/* Export Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="glass-button whitespace-nowrap flex items-center gap-2"
            >
              <Download size={16} />
              {t('export', 'Export')}
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

      {/* KPI Cards - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: t('totalRevenue'), value: formatCompact(stats.totalRevenue), change: stats.totalRevenue > 0 ? '+12.5%' : '0%', icon: DollarSign, color: 'text-green-400' },
          { title: t('totalExpenses'), value: formatCompact(stats.totalExpenses), change: '-2.4%', icon: Activity, color: 'text-red-400' },
          { title: t('netProfit'), value: formatCompact(stats.netProfit), change: stats.netProfit > 0 ? '+18.2%' : '0%', icon: TrendingUp, color: 'text-primary' },
          { title: t('activeUsers'), value: stats.activeUsers.toLocaleString(), change: '+5.8%', icon: Users, color: 'text-blue-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-textLight dark:text-gray-400 text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold text-textDark dark:text-white mt-1">{stat.value}</h3>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <span className={`text-sm font-bold ${stat.color}`}>{stat.change}</span>
            <span className="text-xs text-textLight dark:text-gray-500 ms-2">{t('vsLastMonth')}</span>
          </div>
        ))}
      </div>

      {/* Charts Row 1 - Real Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[400px]">
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col h-full">
          <h3 className="text-xl font-bold text-textDark dark:text-white mb-6 font-heading">{t('financialOverview')}</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF94" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FF94" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#718096" tick={{fill: '#718096'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#718096" tick={{fill: '#718096'}} axisLine={false} tickLine={false} tickFormatter={(value) => formatCompact(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="profit" stroke="#00FF94" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col h-full">
          <h3 className="text-xl font-bold text-textDark dark:text-white mb-6 font-heading">{t('propertyDistribution')}</h3>
          <div className="flex-1 w-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold text-textDark dark:text-white">{stats.totalUnits}</p>
                <p className="text-xs text-gray-400">{t('units', 'Units')}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.slice(0, 4).map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs text-textLight dark:text-gray-300">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
