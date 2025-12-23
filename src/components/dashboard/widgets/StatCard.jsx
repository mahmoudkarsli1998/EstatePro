import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatCard = ({ title, value, change, trend, icon: Icon, color }) => {
  return (
    <div className="glass-panel p-6 relative overflow-hidden group hover:bg-white/5 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-textLight dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-textDark dark:text-white">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} bg-opacity-10 shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon size={24} className="text-textDark dark:text-white" />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`flex items-center text-sm font-bold ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          {change}
        </span>
        <span className="text-textLight dark:text-gray-500 text-xs">vs last month</span>
      </div>
      
      {/* Decorative Glow */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${color}`}></div>
    </div>
  );
};

export default StatCard;
