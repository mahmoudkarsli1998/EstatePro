import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, Plus, X, Loader, Clock, MapPin, Users, Trash } from 'lucide-react';
import { calendarService } from '../../services/calendarService';
import { crmService } from '../../services/crmService';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationsContext';
import Modal from '../../components/shared/Modal';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';

const Calendar = () => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const { createNotification } = useNotifications();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'meeting',
    startDate: '',
    endDate: '',
    location: '',
    assignedTo: [],
    notes: ''
  });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  // Fetch events for current month
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await calendarService.getMonthEvents(year, month);
      setEvents(data.map(e => ({ ...e, id: e.id || e._id })));
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      toast.error(t('failedToLoadEvents', 'Failed to load events'));
    } finally {
      setLoading(false);
    }
  }, [currentDate, toast, t]);

  // Load users (sales & agents) for assignment dropdown
  // Need to fetch from BOTH: Users (assignable) AND Agents collection
  // as agents may exist in Agents collection but not as Users
  const loadUsers = async () => {
    try {
      const [usersData, agentsData] = await Promise.all([
        crmService.getAssignableUsers().catch(() => []),
        crmService.getAgents().catch(() => [])
      ]);
      
      // Helper to get string ID from various formats
      const getStringId = (id) => {
        if (!id) return null;
        if (typeof id === 'string') return id;
        if (typeof id === 'object' && id._id) return getStringId(id._id); // Recursive for nested
        if (typeof id === 'object' && id.toString) return id.toString(); // ObjectId.toString()
        return null;
      };
      
      // Use Map to deduplicate by _id
      const userMap = new Map();
      
      // Add assignable users first (these have correct _id structure)
      (usersData || []).forEach(u => {
        const id = getStringId(u._id);
        if (id) {
          userMap.set(id, {
            _id: id,
            fullName: u.fullName || u.name,
            email: u.email,
            role: u.role || 'user'
          });
        }
      });
      
      // Add agents from Agents collection (may have userId linking to User, or own _id)
      (agentsData || []).forEach(a => {
        const agentId = getStringId(a.userId) || getStringId(a._id);
        if (agentId && !userMap.has(agentId)) {
          userMap.set(agentId, {
            _id: agentId,
            fullName: a.fullName || a.name || 'Agent',
            email: a.email,
            role: 'agent'
          });
        }
      });
      
      const merged = Array.from(userMap.values());
      console.log('[Calendar] Merged assignable users:', merged);
      setUsers(merged);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchEvents();
    loadUsers();
  }, [fetchEvents]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDayEvents = (day) => {
    return events.filter(e => {
      const eventDay = new Date(e.startDate).getDate();
      const eventMonth = new Date(e.startDate).getMonth();
      const eventYear = new Date(e.startDate).getFullYear();
      const matchesDay = eventDay === day && eventMonth === currentDate.getMonth() && eventYear === currentDate.getFullYear();
      const matchesFilter = selectedFilter === 'all' || e.type === selectedFilter;
      return matchesDay && matchesFilter;
    });
  };

  // Format time for display
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get event type styling
  const getEventStyle = (type) => {
    const styles = {
      meeting: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      viewing: 'bg-green-500/20 text-green-400 border-green-500/30',
      contract: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      follow_up: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      call: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      event: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return styles[type] || 'bg-primary/20 text-primary border-primary/20';
  };

  // Open modal to add event for a specific day
  const openAddModal = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().slice(0, 16);
    setFormData({
      title: '',
      type: 'meeting',
      startDate: dateStr,
      endDate: dateStr,
      location: '',
      assignedTo: [],
      notes: ''
    });
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  // Open modal to edit event
  const openEditModal = (event) => {
    // Handle assignedTo: could be array of objects or array of ID strings
    const assignedToIds = (event.assignedTo || []).map(u => {
      if (typeof u === 'string') return u; // Already an ID string
      return u._id || u.id; // Extract ID from object
    }).filter(id => id); // Remove any undefined
    
    setFormData({
      title: event.title || '',
      type: event.type || 'meeting',
      startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      location: event.location || '',
      assignedTo: assignedToIds,
      notes: event.notes || ''
    });
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error(t('titleRequired', 'Title is required'));
      return;
    }
    
    try {
      // Ensure assignedTo contains only string IDs (not objects)
      const assignedToIds = (formData.assignedTo || [])
        .map(item => typeof item === 'string' ? item : (item?._id || item?.id))
        .filter(id => id && typeof id === 'string');
      
      // Build clean payload - only include fields the backend expects
      const eventData = {
        title: formData.title,
        type: formData.type,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date(formData.startDate).toISOString(),
        location: formData.location || undefined,
        assignedTo: assignedToIds.length > 0 ? assignedToIds : undefined,
        notes: formData.notes || undefined
      };
      
      // Remove undefined fields
      Object.keys(eventData).forEach(key => {
        if (eventData[key] === undefined) delete eventData[key];
      });
      
      console.log('[Calendar] Saving event:', eventData);
      
      if (editingEvent) {
        // Use _id for MongoDB
        const eventId = editingEvent._id || editingEvent.id;
        await calendarService.updateEvent(eventId, eventData);
        toast.success(t('eventUpdated', 'Event updated successfully'));
      } else {
        await calendarService.createEvent(eventData);
        toast.success(t('eventCreated', 'Event created successfully'));
        
        // Create notification
        try {
          await createNotification({
            title: t('newCalendarEvent', 'New Calendar Event'),
            message: `Event "${formData.title}" scheduled`,
            type: 'CALENDAR_EVENT',
            metadata: { eventTitle: formData.title }
          });
        } catch (notifErr) {
          console.log('Notification failed (non-critical):', notifErr);
        }
      }
      
      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      // Show backend error message if available
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save event';
      toast.error(errorMsg);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!editingEvent) return;
    
    if (!window.confirm(t('confirmDeleteEvent', 'Are you sure you want to delete this event?'))) {
      return;
    }
    
    try {
      await calendarService.deleteEvent(editingEvent.id);
      toast.success(t('eventDeleted', 'Event deleted'));
      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(t('failedToDelete', 'Failed to delete event'));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-textDark dark:text-white mb-2">{t('calendar')}</h1>
          <p className="text-gray-400">{t('manageSchedule', 'Manage your schedule and events')}</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-panel px-4 py-2 flex items-center gap-2">
            <Filter size={16} className="text-primary" />
            <select 
              value={selectedFilter} 
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-transparent border-none text-textDark dark:text-white focus:outline-none text-sm"
            >
              <option value="all">{t('allEvents', 'All Events')}</option>
              <option value="meeting">{t('meetings', 'Meetings')}</option>
              <option value="viewing">{t('viewings', 'Viewings')}</option>
              <option value="contract">{t('contracts', 'Contracts')}</option>
              <option value="follow_up">{t('followUps', 'Follow-ups')}</option>
              <option value="call">{t('calls', 'Calls')}</option>
            </select>
          </div>
          <button 
            onClick={() => openAddModal(new Date().getDate())} 
            className="glass-button !py-2 flex items-center gap-2"
          >
            <Plus size={16} />
            {t('addEvent', 'Add Event')}
          </button>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-textDark dark:text-white font-heading">
            {currentDate.toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg text-textDark dark:text-white transition-colors">
              {i18n.dir() === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg text-textDark dark:text-white transition-colors">
              {i18n.dir() === 'rtl' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-4 mb-4">
              {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => (
                <div key={day} className="text-center text-gray-400 font-medium text-sm">
                  {t(day)}
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
                  <div 
                    key={day} 
                    className={`h-32 rounded-xl border border-white/10 p-3 relative group transition-all hover:border-primary/50 ${isToday ? 'bg-primary/10 border-primary/50' : 'bg-white/5'}`}
                  >
                    <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-gray-400'}`}>{day}</span>
                    <div className="mt-2 space-y-1 max-h-[70px] overflow-y-auto custom-scrollbar">
                      {dayEvents.map(event => (
                        <div 
                          key={event.id} 
                          onClick={() => openEditModal(event)}
                          className={`text-xs p-1.5 rounded border truncate cursor-pointer hover:opacity-80 ${getEventStyle(event.type)}`}
                        >
                          {formatTime(event.startDate)} - {event.title}
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => openAddModal(day)}
                      className="absolute bottom-2 end-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded text-textDark dark:text-white transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Event Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEvent ? t('editEvent', 'Edit Event') : t('addEvent', 'Add Event')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('title', 'Title')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t('type', 'Type')}</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-textDark dark:text-white"
            >
              <option value="meeting">{t('meeting', 'Meeting')}</option>
              <option value="viewing">{t('viewing', 'Viewing')}</option>
              <option value="contract">{t('contract', 'Contract')}</option>
              <option value="follow_up">{t('followUp', 'Follow-up')}</option>
              <option value="call">{t('call', 'Call')}</option>
              <option value="event">{t('event', 'Event')}</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('startDateTime', 'Start Date/Time')}
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label={t('endDateTime', 'End Date/Time')}
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
          
          <Input
            label={t('location', 'Location')}
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            icon={<MapPin size={16} />}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t('assignTo', 'Assign To')}</label>
            <select
              multiple
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: Array.from(e.target.selectedOptions, opt => opt.value) })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-textDark dark:text-white min-h-[80px]"
            >
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.fullName || user.name || user.email} ({user.role})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{t('holdCtrl', 'Hold Ctrl/Cmd to select multiple')}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t('notes', 'Notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-textDark dark:text-white min-h-[80px]"
            />
          </div>
          
          <div className="flex gap-3 justify-end pt-4">
            {editingEvent && (
              <Button type="button" variant="danger" onClick={handleDelete}>
                <Trash size={16} className="me-2" />
                {t('delete', 'Delete')}
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button type="submit" variant="primary">
              {editingEvent ? t('update', 'Update') : t('create', 'Create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Calendar;

