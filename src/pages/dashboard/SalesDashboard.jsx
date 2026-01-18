import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { Building, Users, Home, Bell, CheckCircle, Clock, TrendingUp, ArrowRight, RefreshCw, UserPlus, FileText, DollarSign, Calendar as CalendarIcon, MapPin, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { crmService } from '../../services/crmService';
import { calendarService } from '../../services/calendarService';
import { useNotifications } from '../../context/NotificationsContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';

// Real-time polling interval (30 seconds)
const POLL_INTERVAL = 30000;

const SalesDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotifications();
  const { format } = useCurrency();
  const toast = useToast();
  
  // Export State
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Export to CSV
  const exportToCSV = () => {
    // Defines headers for My Leads export
    const headers = ['Name', 'Status', 'Phone', 'Email', 'Source', 'Date'];
    const rows = myLeads.map(lead => [
        `"${lead.name}"`,
        lead.status,
        lead.phone || '',
        lead.email || '',
        lead.source || 'website',
        new Date(lead.createdAt).toLocaleDateString()
    ]);
    
    // Add Summary Stats at the top
    const summary = [
        ['Total Leads', stats.total],
        ['New', stats.newLeads],
        ['Contacted', stats.contactedLeads],
        ['Converted', stats.convertedLeads],
        ['Conversion Rate', `${stats.total ? Math.round((stats.convertedLeads / stats.total) * 100) : 0}%`],
        [] // Empty row
    ];

    const csvContent = [
      ...summary.map(row => row.join(',')),
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('CSV exported successfully!');
  };

  // Export to PDF
  const exportToPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Sales Report - ${new Date().toLocaleDateString()}</title>
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
            .badge { padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
            .badge-new { background: #e3f2fd; color: #1976d2; }
            .badge-contacted { background: #fff3e0; color: #f57c00; }
            .badge-qualified { background: #f3e5f5; color: #7b1fa2; }
            .badge-converted { background: #e8f5e9; color: #388e3c; }
            .badge-lost { background: #ffebee; color: #d32f2f; }
          </style>
        </head>
        <body>
          <h1>📈 Sales Dashboard Report</h1>
          <p>Generated: ${new Date().toLocaleString()} for ${user?.name || 'Sales Agent'}</p>
          
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">Total Assigned</div>
              <div class="kpi-value">${stats.total}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">New Leads</div>
              <div class="kpi-value">${stats.newLeads}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Contacted</div>
              <div class="kpi-value">${stats.contactedLeads}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Converted</div>
              <div class="kpi-value">${stats.convertedLeads}</div>
            </div>
          </div>

          <h2>My Recent Leads</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${myLeads.slice(0, 15).map(lead => `
                <tr>
                  <td>${lead.name}</td>
                  <td><span class="badge badge-${lead.status}">${lead.status}</span></td>
                  <td>${lead.phone || lead.email}</td>
                  <td>${new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Real Estate CRM Platform • Confidential Report</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    toast.success('Report generated!');
  };
  
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    newLeads: 0,
    contactedLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    newPercent: 0,
    contactedPercent: 0
  });
  const [myLeads, setMyLeads] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data
  const loadData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch leads, activities, and calendar events
      const [leadsForMe, activitiesData, calendarData] = await Promise.all([
        crmService.getLeads({ agentId: user.id || user._id }),
        crmService.getActivities(1, 5).catch(() => ({ items: [] })),
        calendarService.getEvents({ limit: 5 }).catch(() => [])
      ]);
      
      setMyLeads(leadsForMe);
      setActivities(Array.isArray(activitiesData) ? activitiesData : (activitiesData?.items || []));
      
      // Set upcoming events (sorted by date, only future events)
      const now = new Date();
      const upcoming = (Array.isArray(calendarData) ? calendarData : (calendarData?.items || []))
        .filter(e => new Date(e.startDate) >= now)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 5);
      setUpcomingEvents(upcoming);
      
      const total = leadsForMe.length;
      const newL = leadsForMe.filter(l => l.status === 'new').length;
      const contacted = leadsForMe.filter(l => l.status === 'contacted').length;
      const qualified = leadsForMe.filter(l => l.status === 'qualified').length;
      const converted = leadsForMe.filter(l => l.status === 'converted').length;
      
      setStats({
        total,
        newLeads: newL,
        contactedLeads: contacted,
        qualifiedLeads: qualified,
        convertedLeads: converted,
        newPercent: total ? Math.round((newL / total) * 100) : 0,
        contactedPercent: total ? Math.round((contacted / total) * 100) : 0
      });
    } catch (error) {
      console.error("Error loading sales dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time polling - auto refresh every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user) {
        loadData();
        fetchNotifications();
      }
    }, POLL_INTERVAL);

    return () => clearInterval(intervalId);
  }, [loadData, fetchNotifications, user]);

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), fetchNotifications()]);
    setRefreshing(false);
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id || notification._id);
    
    // Navigate based on notification type
    if (notification.type === 'ASSIGNMENT' || notification.type === 'NEW_LEAD') {
      navigate('/dashboard/leads');
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow', 'Just now');
    if (diffMins < 60) return `${diffMins}m ${t('ago', 'ago')}`;
    if (diffHours < 24) return `${diffHours}h ${t('ago', 'ago')}`;
    if (diffDays < 7) return `${diffDays}d ${t('ago', 'ago')}`;
    return date.toLocaleDateString();
  };

  // Combined activity feed (notifications + activities)
  const combinedFeed = useMemo(() => {
    const notificationItems = (notifications || []).slice(0, 5).map(n => ({
      ...n,
      id: `notif-${n.id || n._id}`,
      _isNotification: true,
      _timestamp: new Date(n.createdAt).getTime()
    }));

    const activityItems = (activities || []).map((a, index) => ({
      ...a,
      id: `activity-${a.id || a._id || index}`,
      _isNotification: false,
      _timestamp: a.createdAt ? new Date(a.createdAt).getTime() : Date.now()
    }));

    return [...notificationItems, ...activityItems]
      .sort((a, b) => b._timestamp - a._timestamp)
      .slice(0, 6);
  }, [notifications, activities]);

  // Get icon for activity type
  const getActivityIcon = (type) => {
    const iconMap = {
      ASSIGNMENT: { Icon: UserPlus, color: 'text-orange-400', bg: 'bg-orange-500/10' },
      NEW_LEAD: { Icon: Users, color: 'text-green-400', bg: 'bg-green-500/10' },
      STATUS_CHANGE: { Icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
      FOLLOW_UP: { Icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10' },
      sale: { Icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
      lead: { Icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    };
    return iconMap[type] || { Icon: Bell, color: 'text-gray-400', bg: 'bg-gray-500/10' };
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusMap = {
      new: 'bg-blue-500/10 text-blue-500',
      contacted: 'bg-yellow-500/10 text-yellow-500',
      qualified: 'bg-purple-500/10 text-purple-500',
      converted: 'bg-green-500/10 text-green-500',
      lost: 'bg-red-500/10 text-red-500'
    };
    return statusMap[status] || 'bg-gray-100 dark:bg-white/10 text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-white">
            {t('welcomeBack')}, {user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Sales'}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1">
            {t('salesDashboardOverview', 'Here\'s your sales overview for today')}
          </p>
        </div>
        
        <div className="flex gap-2">
            <div className="relative">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                >
                  <Download size={16} />
                  {t('export', 'Export')}
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <button 
                      onClick={() => { exportToPDF(); setShowExportMenu(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-sm"
                    >
                      {t('exportPDF', 'Export as PDF')}
                    </button>
                    <button 
                      onClick={() => { exportToCSV(); setShowExportMenu(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-sm"
                    >
                      {t('exportCSV', 'Export as CSV')}
                    </button>
                  </div>
                )}
            </div>

            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {t('refresh', 'Refresh')}
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Assigned Leads */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-gray-200">{t('totalAssignedLeads', 'Assigned Leads')}</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {loading ? '...' : stats.total}
          </p>
          <p className="text-sm text-slate-500">{t('leadsAssignedToYou', 'Leads assigned to you')}</p>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{t('new', 'New')} ({stats.newLeads})</span>
              <span>{stats.newPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${stats.newPercent}%` }} />
            </div>
            
            <div className="flex justify-between text-xs text-slate-500">
              <span>{t('contacted', 'Contacted')} ({stats.contactedLeads})</span>
              <span>{stats.contactedPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${stats.contactedPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Conversion Stats */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-gray-200">{t('conversions', 'Conversions')}</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {loading ? '...' : stats.convertedLeads}
          </p>
          <p className="text-sm text-slate-500">{t('leadsConverted', 'Leads converted')}</p>
          
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 bg-slate-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-green-500" 
                style={{ width: `${stats.total ? (stats.convertedLeads / stats.total) * 100 : 0}%` }} 
              />
            </div>
            <span className="text-xs text-green-500 font-bold">
              {stats.total ? Math.round((stats.convertedLeads / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Quick Actions - Units */}
        <Link to="/dashboard/units" className="group bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-4">
              <Home size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('manageUnits', 'View Units')}</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">{t('addEditYourListings', 'Browse available properties')}</p>
          </div>
          <div className="flex items-center text-blue-500 text-sm font-bold">
            {t('viewAll', 'View All')} <ArrowRight size={16} className="ms-2" />
          </div>
        </Link>

        {/* Notifications Widget */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-700 dark:text-gray-200">{t('notifications', 'Notifications')}</h3>
            </div>
          </div>
          
          {notifications.slice(0, 5).length === 0 ? (
            <div className="text-center py-4 text-slate-400 text-sm">
              {t('noNotifications', 'No notifications')}
            </div>
          ) : (
            <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar">
              {notifications.slice(0, 5).map(notification => (
                <div 
                  key={notification.id || notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    notification.isRead 
                      ? 'hover:bg-slate-50 dark:hover:bg-white/5' 
                      : 'bg-primary/5 hover:bg-primary/10'
                  }`}
                >
                  <p className="text-xs font-medium text-slate-700 dark:text-gray-300 truncate">
                    {notification.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{notification.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon size={18} className="text-primary" />
            {t('upcomingEvents', 'Upcoming Events')}
          </h3>
          <Link to="/dashboard/calendar" className="text-sm text-primary hover:underline">
            {t('viewCalendar', 'View Calendar')} →
          </Link>
        </div>
        
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <CalendarIcon size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('noUpcomingEvents', 'No upcoming events')}</p>
            <Link to="/dashboard/calendar" className="text-primary text-sm hover:underline mt-2 inline-block">
              {t('scheduleEvent', 'Schedule an event')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map(event => {
              const eventDate = new Date(event.startDate);
              const isToday = eventDate.toDateString() === new Date().toDateString();
              const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
              
              let dateLabel;
              if (isToday) dateLabel = t('today', 'Today');
              else if (isTomorrow) dateLabel = t('tomorrow', 'Tomorrow');
              else dateLabel = eventDate.toLocaleDateString();
              
              const typeColors = {
                meeting: 'bg-blue-500',
                viewing: 'bg-green-500',
                contract: 'bg-purple-500',
                follow_up: 'bg-yellow-500',
                call: 'bg-cyan-500',
                event: 'bg-orange-500'
              };
              
              return (
                <div 
                  key={event._id || event.id}
                  onClick={() => navigate('/dashboard/calendar')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <div className={`w-1 h-12 rounded-full ${typeColors[event.type] || 'bg-primary'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-white truncate">{event.title}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Clock size={12} />
                      <span>{dateLabel} • {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <MapPin size={10} />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${typeColors[event.type] || 'bg-primary'} text-white`}>
                    {t(event.type, event.type)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Leads Table */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {t('myLeads', 'My Leads')}
          </h3>
          <Link to="/dashboard/leads" className="text-sm text-primary hover:underline">
            {t('viewAll', 'View All')} →
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5">
                <th className="py-3 px-2">{t('name', 'Name')}</th>
                <th className="py-3 px-2">{t('status', 'Status')}</th>
                <th className="py-3 px-2">{t('contact', 'Contact')}</th>
                <th className="py-3 px-2">{t('source', 'Source')}</th>
                <th className="py-3 px-2">{t('date', 'Date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
                    {t('loading', 'Loading...')}
                  </td>
                </tr>
              ) : myLeads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400 italic">
                    {t('noLeadsAssignedYet', 'No leads assigned yet.')}
                  </td>
                </tr>
              ) : (
                myLeads.slice(0, 10).map(lead => (
                  <tr key={lead.id || lead._id} className="text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="py-3 px-2 font-bold max-w-[140px] truncate" title={lead.name}>{lead.name}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono text-xs">{lead.phone || lead.email || '-'}</td>
                    <td className="py-3 px-2 text-xs capitalize opacity-70">{lead.source || '-'}</td>
                    <td className="py-3 px-2 text-xs opacity-70">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {t('recentActivity', 'Recent Activity')}
          </h3>
          {combinedFeed.filter(item => item._isNotification && !item.isRead).length > 0 && (
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
              {combinedFeed.filter(item => item._isNotification && !item.isRead).length} {t('new', 'new')}
            </span>
          )}
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
          {combinedFeed.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Bell size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('noRecentActivity', 'No recent activity')}</p>
            </div>
          ) : (
            combinedFeed.map((item, index) => {
              const { Icon, color, bg } = getActivityIcon(item.type);
              
              return (
                <div 
                  key={item.id}
                  onClick={() => item._isNotification && handleNotificationClick(item)}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                    item._isNotification && !item.isRead 
                      ? 'bg-primary/5 hover:bg-primary/10' 
                      : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg} ${color} relative`}>
                    <Icon size={18} />
                    {item._isNotification && !item.isRead && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-gray-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                      {item._isNotification ? item.title : (item.action || 'Activity')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
                      {item._isNotification ? item.message : (item.description || `${item.user?.name || 'User'} performed an action`)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {formatTimeAgo(item.createdAt || item._timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl p-6 border border-primary/20">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <CheckCircle size={20} className="text-primary" />
          {t('salesRestrictionsNotice', 'Your Sales Dashboard')}
        </h2>
        <p className="text-slate-600 dark:text-gray-400 text-sm">
          {t('salesRoleDescription', 'As a Sales representative, you can view your assigned leads, manage your pipeline, and browse available units. Contact your manager for additional access.')}
        </p>
      </div>
    </div>
  );
};

export default SalesDashboard;

