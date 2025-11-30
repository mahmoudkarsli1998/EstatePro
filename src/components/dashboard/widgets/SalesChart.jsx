import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 2000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
  { name: 'Jul', sales: 3490 },
  { name: 'Aug', sales: 4200 },
  { name: 'Sep', sales: 5100 },
  { name: 'Oct', sales: 6100 },
  { name: 'Nov', sales: 5800 },
  { name: 'Dec', sales: 7200 },
];

const SalesChart = () => {
  return (
    <div className="glass-panel p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white font-heading">Sales Overview</h3>
        <select className="bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 px-3 py-1 outline-none">
          <option>This Year</option>
          <option>Last Year</option>
        </select>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280" 
              tick={{fill: '#9ca3af', fontSize: 12}} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#6b7280" 
              tick={{fill: '#9ca3af', fontSize: 12}} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#050510', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#00F0FF' }}
            />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="#00F0FF" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSales)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
