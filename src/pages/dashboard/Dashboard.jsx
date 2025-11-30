import React, { useEffect, useState } from 'react';
import { Users, Building, Home, DollarSign, TrendingUp, Activity } from 'lucide-react';
import Card from '../../components/shared/Card';
import { api } from '../../utils/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalUnits: 0,
    totalLeads: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock data for charts
  const salesData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ];

  const leadsData = [
    { name: 'Mon', leads: 24 },
    { name: 'Tue', leads: 13 },
    { name: 'Wed', leads: 98 },
    { name: 'Thu', leads: 39 },
    { name: 'Fri', leads: 48 },
    { name: 'Sat', leads: 38 },
    { name: 'Sun', leads: 43 },
  ];

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

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        <Icon size={100} />
      </div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
          <div className="flex items-center text-green-400 text-xs font-medium">
            <TrendingUp size={14} className="mr-1" />
            <span>+12.5% from last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-dark-card border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-colors">Last 7 Days</button>
           <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm shadow-[0_0_15px_rgba(0,240,255,0.3)]">Export Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Projects" 
          value={stats.totalProjects} 
          icon={Building} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Total Units" 
          value={stats.totalUnits} 
          icon={Home} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Active Leads" 
          value={stats.totalLeads} 
          icon={Users} 
          color="bg-pink-500" 
        />
        <StatCard 
          title="Total Revenue" 
          value="$2.4M" 
          icon={DollarSign} 
          color="bg-green-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-primary" /> Sales Overview
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{fill: '#9ca3af'}} />
                <YAxis stroke="#666" tick={{fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050510', borderColor: '#333', color: '#fff' }}
                  itemStyle={{ color: '#00F0FF' }}
                />
                <Area type="monotone" dataKey="value" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-white">Weekly Leads</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{fill: '#9ca3af'}} />
                <YAxis stroke="#666" tick={{fill: '#9ca3af'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#050510', borderColor: '#333', color: '#fff' }}
                />
                <Bar dataKey="leads" fill="#FF0055" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold mb-4 text-white">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center p-3 hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0">
                <div className="w-2 h-2 rounded-full bg-primary mr-4 shadow-[0_0_8px_rgba(0,240,255,0.5)]"></div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">New lead registered for Sunset Towers</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
                <button className="text-xs text-primary hover:text-white transition-colors">View</button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-white">Top Agents</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold border border-white/10">
                  A{i}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Agent Name</p>
                  <p className="text-xs text-gray-400">$1.2M Sales</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
