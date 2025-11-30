import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Card from '../../components/shared/Card';
import { Download, Calendar } from 'lucide-react';

const Reports = () => {
  const monthlyRevenue = [
    { name: 'Jan', revenue: 45000 },
    { name: 'Feb', revenue: 52000 },
    { name: 'Mar', revenue: 48000 },
    { name: 'Apr', revenue: 61000 },
    { name: 'May', revenue: 55000 },
    { name: 'Jun', revenue: 67000 },
  ];

  const propertyTypes = [
    { name: 'Apartments', value: 45 },
    { name: 'Villas', value: 25 },
    { name: 'Penthouses', value: 20 },
    { name: 'Studios', value: 10 },
  ];

  const COLORS = ['#00F0FF', '#FF0055', '#7000FF', '#00D18B'];

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white mb-2">Analytics & Reports</h1>
          <p className="text-gray-400">Detailed insights into platform performance.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:bg-primary/90 transition-colors">
          <Download size={16} /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Revenue Growth</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar size={14} /> Last 6 Months
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{fill: '#9ca3af'}} />
                <YAxis stroke="#666" tick={{fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050510', borderColor: '#333', color: '#fff' }}
                  itemStyle={{ color: '#00F0FF' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#00F0FF" strokeWidth={3} dot={{fill: '#050510', stroke: '#00F0FF', strokeWidth: 2, r: 4}} activeDot={{r: 6, fill: '#00F0FF'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Property Distribution</h3>
          </div>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={propertyTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {propertyTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050510', borderColor: '#333', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {propertyTypes.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-sm text-gray-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-6 text-white">Performance Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 font-medium text-sm">
              <tr>
                <th className="px-6 py-4 rounded-l-lg">Metric</th>
                <th className="px-6 py-4">Current Value</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 rounded-r-lg">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { metric: 'User Acquisition', value: '1,240', target: '1,000', status: 'Exceeded', trend: '+24%' },
                { metric: 'Conversion Rate', value: '3.2%', target: '3.0%', status: 'On Track', trend: '+0.2%' },
                { metric: 'Avg. Session Duration', value: '4m 30s', target: '5m 00s', status: 'Behind', trend: '-10%' },
                { metric: 'Bounce Rate', value: '42%', target: '40%', status: 'At Risk', trend: '+2%' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{row.metric}</td>
                  <td className="px-6 py-4 text-gray-300">{row.value}</td>
                  <td className="px-6 py-4 text-gray-400">{row.target}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      row.status === 'Exceeded' ? 'bg-green-500/20 text-green-400' :
                      row.status === 'On Track' ? 'bg-blue-500/20 text-blue-400' :
                      row.status === 'Behind' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${row.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {row.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
