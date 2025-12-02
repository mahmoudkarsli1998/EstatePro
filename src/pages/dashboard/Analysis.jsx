import React from 'react';
import { BarChart2, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Analysis = () => {
  const data = [
    { name: 'Jan', revenue: 4000, expenses: 2400, profit: 2400 },
    { name: 'Feb', revenue: 3000, expenses: 1398, profit: 2210 },
    { name: 'Mar', revenue: 2000, expenses: 9800, profit: 2290 },
    { name: 'Apr', revenue: 2780, expenses: 3908, profit: 2000 },
    { name: 'May', revenue: 1890, expenses: 4800, profit: 2181 },
    { name: 'Jun', revenue: 2390, expenses: 3800, profit: 2500 },
    { name: 'Jul', revenue: 3490, expenses: 4300, profit: 2100 },
  ];

  const pieData = [
    { name: 'Residential', value: 400 },
    { name: 'Commercial', value: 300 },
    { name: 'Industrial', value: 300 },
    { name: 'Land', value: 200 },
  ];

  const COLORS = ['#00F0FF', '#8B5CF6', '#FF0055', '#00FF94'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 !bg-dark-card/90 border-white/10">
          <p className="text-white font-bold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white mb-2">Analysis & Reports</h1>
          <p className="text-gray-400">Deep dive into your business performance.</p>
        </div>
        <div className="flex gap-3">
          <button className="glass-button">Download PDF</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Revenue', value: '$128.5K', change: '+12.5%', icon: DollarSign, color: 'text-green-400' },
          { title: 'Total Expenses', value: '$42.8K', change: '-2.4%', icon: Activity, color: 'text-red-400' },
          { title: 'Net Profit', value: '$85.7K', change: '+18.2%', icon: TrendingUp, color: 'text-primary' },
          { title: 'Active Users', value: '2,450', change: '+5.8%', icon: Users, color: 'text-blue-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <span className={`text-sm font-bold ${stat.color}`}>{stat.change}</span>
            <span className="text-xs text-gray-500 ml-2">vs last month</span>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[400px]">
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6 font-heading">Financial Overview</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
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
                <YAxis stroke="#718096" tick={{fill: '#718096'}} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="profit" stroke="#00FF94" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6 font-heading">Property Distribution</h3>
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
                <p className="text-2xl font-bold text-white">1,200</p>
                <p className="text-xs text-gray-400">Total Units</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs text-gray-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
