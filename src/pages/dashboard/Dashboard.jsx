import React, { useEffect, useState } from 'react';
import { Users, Building, Home, DollarSign, TrendingUp, Plus, UserPlus, FileText, Box, LayoutGrid } from 'lucide-react';
import { api } from '../../utils/api';
import StatCard from '../../components/dashboard/widgets/StatCard';
import SalesChart from '../../components/dashboard/widgets/SalesChart';
import TrafficChart from '../../components/dashboard/widgets/TrafficChart';
import ActivityFeed from '../../components/dashboard/widgets/ActivityFeed';
import Dashboard3D from '../../components/dashboard/Dashboard3D';

const Dashboard = () => {
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

  // Mock data for 3D Dashboard
  const salesData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
  ];

  const leadsData = [
    { name: 'Social', value: 35 },
    { name: 'Direct', value: 25 },
    { name: 'Referral', value: 20 },
    { name: 'Organic', value: 20 },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
           <div className="bg-dark-card border border-white/10 rounded-lg p-1 flex">
             <button 
               onClick={() => setViewMode('2D')}
               className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-all ${viewMode === '2D' ? 'bg-primary text-black font-bold shadow-lg' : 'text-gray-400 hover:text-white'}`}
             >
               <LayoutGrid size={16} /> 2D
             </button>
             <button 
               onClick={() => setViewMode('3D')}
               className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-all ${viewMode === '3D' ? 'bg-primary text-black font-bold shadow-lg' : 'text-gray-400 hover:text-white'}`}
             >
               <Box size={16} /> 3D
             </button>
           </div>
           
           <button 
             onClick={() => alert('Report exported successfully!')}
             className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-shadow"
           >
             Export Report
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Projects" 
          value={stats.totalProjects} 
          change="12%"
          trend="up"
          icon={Building} 
          color="from-blue-500 to-cyan-500" 
        />
        <StatCard 
          title="Total Units" 
          value={stats.totalUnits} 
          change="5%"
          trend="up"
          icon={Home} 
          color="from-purple-500 to-pink-500" 
        />
        <StatCard 
          title="Active Leads" 
          value={stats.totalLeads} 
          change="8%"
          trend="up"
          icon={Users} 
          color="from-pink-500 to-rose-500" 
        />
        <StatCard 
          title="Total Revenue" 
          value="$2.4M" 
          change="24%"
          trend="up"
          icon={DollarSign} 
          color="from-green-500 to-emerald-500" 
        />
      </div>

      {/* Main Content Grid */}
      {viewMode === '3D' ? (
        <Dashboard3D salesData={salesData} leadsData={leadsData} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
          <div className="lg:col-span-2 h-full">
            <SalesChart />
          </div>
          <div className="h-full">
            <TrafficChart />
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
            <h3 className="text-xl font-bold text-white mb-6 font-heading">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 rounded-xl bg-white/5 hover:bg-primary/20 hover:border-primary/50 border border-white/10 transition-all group flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Plus size={20} />
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white">Add Listing</span>
              </button>
              <button className="p-4 rounded-xl bg-white/5 hover:bg-purple-500/20 hover:border-purple-500/50 border border-white/10 transition-all group flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <UserPlus size={20} />
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white">New User</span>
              </button>
              <button className="p-4 rounded-xl bg-white/5 hover:bg-pink-500/20 hover:border-pink-500/50 border border-white/10 transition-all group flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white">Generate Report</span>
              </button>
              <button className="p-4 rounded-xl bg-white/5 hover:bg-green-500/20 hover:border-green-500/50 border border-white/10 transition-all group flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                  <DollarSign size={20} />
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white">Record Sale</span>
              </button>
            </div>
          </div>

          {/* Top Agents Mini Widget */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-4 text-white">Top Performers</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold border border-white/10 shadow-lg">
                    A{i}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Agent {i}</p>
                    <p className="text-xs text-primary">$1.{i}M Sales</p>
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
