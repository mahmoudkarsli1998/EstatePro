import React from 'react';
import { motion } from 'framer-motion';
import { User, Home, DollarSign, Bell } from 'lucide-react';

const activities = [
  { id: 1, type: 'sale', user: 'John Doe', action: 'purchased', target: 'Sunset Villa #4', time: '2 min ago', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
  { id: 2, type: 'new_user', user: 'Sarah Smith', action: 'joined', target: 'the platform', time: '15 min ago', icon: User, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 3, type: 'listing', user: 'Admin', action: 'listed', target: 'Downtown Loft', time: '1 hour ago', icon: Home, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 4, type: 'alert', user: 'System', action: 'reported', target: 'Server Load High', time: '3 hours ago', icon: Bell, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 5, type: 'sale', user: 'Mike Ross', action: 'reserved', target: 'Ocean View Apt', time: '5 hours ago', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
];

const ActivityFeed = () => {
  return (
    <div className="glass-panel p-6 h-full">
      <h3 className="text-xl font-bold text-white mb-6 font-heading">Recent Activity</h3>
      <div className="space-y-6">
        {activities.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 group"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300">
                <span className="font-bold text-white">{item.user}</span> {item.action} <span className="text-primary">{item.target}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{item.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <button className="w-full mt-6 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
        View All Activity
      </button>
    </div>
  );
};

export default ActivityFeed;
