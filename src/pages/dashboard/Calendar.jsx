import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState('all');

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const events = [
    { id: 1, day: 5, title: 'Client Meeting', type: 'meeting', time: '10:00 AM' },
    { id: 2, day: 12, title: 'Property Viewing', type: 'viewing', time: '2:00 PM' },
    { id: 3, day: 15, title: 'Contract Signing', type: 'contract', time: '11:00 AM' },
    { id: 4, day: 24, title: 'Open House', type: 'event', time: '9:00 AM - 5:00 PM' },
  ];

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDayEvents = (day) => {
    return events.filter(e => e.day === day && (selectedFilter === 'all' || e.type === selectedFilter));
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white mb-2">Calendar</h1>
          <p className="text-gray-400">Manage your schedule and upcoming events.</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-panel px-4 py-2 flex items-center gap-2">
            <Filter size={16} className="text-primary" />
            <select 
              value={selectedFilter} 
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none text-sm"
            >
              <option value="all">All Events</option>
              <option value="meeting">Meetings</option>
              <option value="viewing">Viewings</option>
              <option value="contract">Contracts</option>
            </select>
          </div>
          <button className="glass-button !py-2">Add Event</button>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white font-heading">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-gray-400 font-medium text-sm">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-32 rounded-xl bg-white/5 opacity-50"></div>
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getDayEvents(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

            return (
              <div key={day} className={`h-32 rounded-xl border border-white/10 p-3 relative group transition-all hover:border-primary/50 ${isToday ? 'bg-primary/10 border-primary/50' : 'bg-white/5'}`}>
                <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-gray-400'}`}>{day}</span>
                <div className="mt-2 space-y-1">
                  {dayEvents.map(event => (
                    <div key={event.id} className="text-xs p-1.5 rounded bg-primary/20 text-primary truncate border border-primary/20">
                      {event.time} - {event.title}
                    </div>
                  ))}
                </div>
                <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded text-white transition-all">
                  <Plus size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper icon
const Plus = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default Calendar;
