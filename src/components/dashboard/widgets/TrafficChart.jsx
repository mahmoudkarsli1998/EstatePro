import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Mon', visits: 4000 },
  { name: 'Tue', visits: 3000 },
  { name: 'Wed', visits: 2000 },
  { name: 'Thu', visits: 2780 },
  { name: 'Fri', visits: 1890 },
  { name: 'Sat', visits: 2390 },
  { name: 'Sun', visits: 3490 },
];

const TrafficChart = () => {
  return (
    <div className="glass-panel p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white font-heading">Weekly Traffic</h3>
        <button className="text-primary text-sm hover:underline">View Report</button>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280" 
              tick={{fill: '#9ca3af', fontSize: 12}} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              cursor={{fill: 'rgba(255,255,255,0.05)'}}
              contentStyle={{ backgroundColor: '#050510', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
            />
            <Bar dataKey="visits" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#7000FF' : '#5a00cc'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrafficChart;
