import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash, Search, Download, Filter, Phone, Mail, MessageSquare, UserPlus, LayoutGrid, List, MoreVertical, Calendar, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import Badge from '../../components/shared/Badge';
import { api } from '../../utils/api';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';
import { agents } from '../../data/mockData';

const Leads = () => {
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState('list');
    const [selectedLead, setSelectedLead] = useState(null);
    const [activeAssignId, setActiveAssignId] = useState(null);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
    const [followUpNote, setFollowUpNote] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            setCurrentUser(JSON.parse(user));
        }
    }, []);

    const {
        filteredItems: leads,
        loading,
        isModalOpen,
        editingItem,
        formData,
        searchTerm,
        setSearchTerm,
        handleOpenModal,
        handleCloseModal,
        handleInputChange,
        handleSubmit,
        handleDelete,
        handleExport,
        refresh
    } = useDashboardCrud(
        api.getLeads,
        api.createLead,
        api.updateLead,
        api.deleteLead,
        { name: '', email: '', phone: '', message: '', status: 'new', source: 'website' },
        (lead, term) => 
            lead.name.toLowerCase().includes(term.toLowerCase()) || 
            lead.email.toLowerCase().includes(term.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveAssignId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAssign = async (leadId, agentId) => {
        await api.updateLead(leadId, { assignedAgentId: agentId, status: 'contacted' });
        await refresh();
        setActiveAssignId(null);
    };

    const handleAddFollowUp = async (e) => {
        e.preventDefault();
        if (!followUpNote.trim() || !selectedLead) return;

        // Use assigned agent ID if available, otherwise fallback to current user info (mapped to agent or user id)
        const agentForAttribution = agents.find(a => a.userId === currentUser?.id);
        const performedById = selectedLead.assignedAgentId || agentForAttribution?.id || currentUser?.id || 1;

        try {
            await api.addFollowUp(selectedLead.id, { note: followUpNote }, performedById);
            setFollowUpNote('');
            await refresh();
        } catch (error) {
            console.error('Error adding follow-up:', error);
        }
    };

    const openFollowUpModal = (lead) => {
        setSelectedLead(lead);
        setIsFollowUpModalOpen(true);
    };

    const kanbanColumns = {
        new: { label: t('new'), color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        contacted: { label: t('contacted'), color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
        qualified: { label: t('qualified'), color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
        closed: { label: t('closed'), color: 'bg-green-500/10 text-green-400 border-green-500/20' },
        lost: { label: t('lost'), color: 'bg-red-500/10 text-red-400 border-red-500/20' }
    };

    const onExport = () => {
        handleExport(
            "leads_export.csv",
            ["ID", "Name", "Email", "Phone", "Status", "Source", "Date"],
            l => [l.id, `"${l.name}"`, l.email, l.phone, l.status, l.source, l.createdAt].join(",")
        );
    };

    const AssignDropdown = ({ leadId }) => (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-72 bg-slate-950 border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
            ref={dropdownRef}
        >
            <div className="p-4 border-b border-white/5 bg-white/5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{t('assignAgent')}</span>
            </div>
            <div className="max-h-72 overflow-y-auto p-2 custom-scrollbar">
                {agents.map(agent => (
                    <button
                        key={agent.id}
                        className="w-full flex items-center p-3 rounded-xl hover:bg-white/5 transition-all text-start group mb-1 last:mb-0"
                        onClick={() => handleAssign(leadId, agent.id)}
                    >
                        <div className="relative w-10 h-10 rounded-full border-2 border-white/5 group-hover:border-primary/50 overflow-hidden transition-all shadow-inner">
                            <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="ms-3 flex-1 min-w-0">
                            <div className="font-bold text-white text-sm truncate group-hover:text-primary transition-colors">{agent.name}</div>
                            <div className="text-[10px] text-gray-500 truncate mt-0.5">{agent.email}</div>
                        </div>
                    </button>
                ))}
            </div>
        </motion.div>
    );

    return (
        <div className="pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 px-1 gap-4">
                <div>
                    <h1 className="text-3xl font-black font-heading text-gray-900 dark:text-white tracking-tight">{t('leads')}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500 text-sm font-medium">{t('manageLeads')}</p>
                        <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                        <span className="text-primary text-xs font-bold">{leads.length} {t('totalLeads', 'Total')}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1.5 shadow-inner grow md:grow-0">
                        <button 
                            className={`flex-1 md:w-10 h-10 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            onClick={() => setViewMode('list')}
                            title={t('listView')}
                        >
                            <List size={18} />
                        </button>
                        <button 
                            className={`flex-1 md:w-10 h-10 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            onClick={() => setViewMode('kanban')}
                            title={t('kanbanView')}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                    <Button variant="outline" onClick={onExport} className="hidden sm:flex h-12 border-white/10 bg-white/5 hover:bg-white/10">
                        <Download size={18} className="me-2" /> {t('export')}
                    </Button>
                    <Button onClick={() => handleOpenModal()} className="h-12 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95 px-6">
                        <Plus size={20} className="me-2" strokeWidth={3} /> {t('addLead')}
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 px-1">
                 <div className="relative max-w-md w-full group">
                    <Search size={18} className="absolute inset-y-0 start-4 my-auto text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder={t('searchLeads')}
                        className="w-full ps-12 pe-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/20 text-white placeholder-gray-600 transition-all font-semibold shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 shrink-0">
                    <button className="h-14 px-5 rounded-2xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center shadow-inner">
                        <Filter size={18} className="me-2" />
                        <span className="text-sm font-bold">{t('filter')}</span>
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="bg-dark-card border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0f172a]/50 text-gray-500 font-bold text-[10px] uppercase tracking-[0.15em]">
                                <tr>
                                    <th className="px-8 py-6 text-start">{t('name')}</th>
                                    <th className="px-8 py-6 text-start">{t('contact')}</th>
                                    <th className="px-8 py-6 text-start">{t('status')}</th>
                                    <th className="px-8 py-6 text-start">{t('assignedTo')}</th>
                                    <th className="px-8 py-6 text-start">{t('latestFollowUp')}</th>
                                    <th className="px-8 py-6 text-end">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan="6" className="px-8 py-20 text-center text-gray-500 animate-pulse font-bold tracking-widest">{t('loading')}...</td></tr>
                                ) : leads.length === 0 ? (
                                    <tr><td colSpan="6" className="px-8 py-20 text-center text-gray-600 font-bold italic">{t('noLeadsFound', 'No leads found')}</td></tr>
                                ) : leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-white/[0.03] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="font-extrabold text-white text-base group-hover:text-primary transition-colors leading-tight">{lead.name}</div>
                                            <div className="text-[10px] text-gray-500 flex items-center mt-1.5 font-bold uppercase tracking-wider">
                                                <Calendar size={10} className="me-1.5 text-primary/60" />
                                                {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex items-center text-xs font-semibold text-gray-400 group-hover:text-gray-300 transition-colors">
                                                    <Mail size={12} className="me-2.5 text-gray-600 group-hover:text-primary transition-colors" /> {lead.email}
                                                </div>
                                                <div className="flex items-center text-xs font-semibold text-gray-400 group-hover:text-gray-300 transition-colors">
                                                    <Phone size={12} className="me-2.5 text-gray-600 group-hover:text-primary transition-colors" /> {lead.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge variant={lead.status === 'new' ? 'primary' : lead.status === 'closed' ? 'success' : lead.status === 'lost' ? 'danger' : 'warning'} className="px-4 py-1.5 font-black uppercase text-[9px] shadow-sm tracking-widest">
                                                {t(lead.status) || lead.status}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setActiveAssignId(activeAssignId === lead.id ? null : lead.id)}
                                                    className={`group/btn p-1 rounded-2xl transition-all duration-300 ${lead.assignedAgentId ? 'bg-white/5 hover:bg-white/10' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm'}`}
                                                >
                                                    {lead.assignedAgentId ? (
                                                        <div className="flex items-center gap-3 pr-4">
                                                            <div className="w-10 h-10 rounded-xl border-2 border-white/10 group-hover/btn:border-primary/50 overflow-hidden shadow-2xl transition-all">
                                                                <img src={agents.find(a => a.id === lead.assignedAgentId)?.avatar || 'https://via.placeholder.com/30'} alt="Agent" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="text-start">
                                                                <div className="text-[11px] font-black text-white leading-none mb-1 uppercase tracking-tight">{agents.find(a => a.id === lead.assignedAgentId)?.name}</div>
                                                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest opacity-60">{t('agent')}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em]">
                                                            <UserPlus size={14} strokeWidth={3} className="me-2" />
                                                            {t('assign')}
                                                        </div>
                                                    )}
                                                </button>
                                                
                                                <AnimatePresence>
                                                    {activeAssignId === lead.id && <AssignDropdown leadId={lead.id} />}
                                                </AnimatePresence>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {lead.followUps?.length > 0 ? (
                                                <div className="max-w-[200px]">
                                                    <div className="text-[11px] text-gray-300 font-semibold line-clamp-1 italic">"{lead.followUps[lead.followUps.length - 1].note}"</div>
                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                        </div>
                                                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                                                            {new Date(lead.followUps[lead.followUps.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter opacity-40">{t('noActivity', 'No Activity')}</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    title={t('followUp')}
                                                    className="w-10 h-10 flex items-center justify-center text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
                                                    onClick={() => openFollowUpModal(lead)}
                                                >
                                                    <MessageSquare size={18} strokeWidth={2.5} />
                                                </button>
                                                <div className="w-px h-6 bg-white/5 mx-1"></div>
                                                <button className="w-10 h-10 flex items-center justify-center text-blue-500 bg-blue-500/5 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm" onClick={() => handleOpenModal(lead)}>
                                                    <Edit size={18} strokeWidth={2.5} />
                                                </button>
                                                <button className="w-10 h-10 flex items-center justify-center text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm" onClick={() => handleDelete(lead.id)}>
                                                    <Trash size={18} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 px-1 pb-10">
                    {Object.entries(kanbanColumns).map(([status, config]) => (
                        <div key={status} className="flex flex-col h-full min-h-[650px]">
                            <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full shadow-lg ${status === 'new' ? 'bg-blue-500 shadow-blue-500/20' : status === 'closed' ? 'bg-green-500 shadow-green-500/20' : 'bg-yellow-500 shadow-yellow-500/20'}`}></div>
                                    <span className="font-black text-[11px] tracking-[0.15em] text-gray-300 uppercase">{config.label}</span>
                                </div>
                                <span className="bg-white/5 px-2.5 py-1 rounded-lg text-[10px] font-black text-gray-500 border border-white/5">
                                    {leads.filter(l => l.status === status).length}
                                </span>
                            </div>
                            <div className="flex-1 space-y-5 overflow-y-auto max-h-[750px] scrollbar-hide pr-1">
                                {leads.filter(l => l.status === status).map(lead => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key={lead.id} 
                                        className="bg-slate-900/50 backdrop-blur-md shadow-lg p-5 rounded-3xl border border-white/10 hover:border-primary/20 transition-all cursor-move group relative"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-extrabold text-white text-base group-hover:text-primary transition-colors leading-tight mb-1">{lead.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-bold text-gray-500 border border-white/5 uppercase tracking-wider">{t(lead.source) || lead.source}</span>
                                                </div>
                                            </div>
                                            <button className="p-1 px-2 text-gray-600 hover:text-white bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleOpenModal(lead)}>
                                                <Edit size={12} />
                                            </button>
                                        </div>

                                        {lead.followUps?.length > 0 && (
                                            <div className="mb-5 bg-black/20 p-3 rounded-2xl border border-white/5">
                                                <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                                    <span>{t('latestActivity')}</span>
                                                    <span className="text-gray-600 text-[8px]">{new Date(lead.followUps[lead.followUps.length - 1].date).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-[11px] text-gray-300 font-medium italic line-clamp-2 leading-relaxed">"{lead.followUps[lead.followUps.length - 1].note}"</p>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                             <div className="flex items-center">
                                                <div className="relative">
                                                     <button 
                                                        onClick={() => setActiveAssignId(activeAssignId === lead.id ? null : lead.id)}
                                                        className="w-9 h-9 rounded-xl border-2 border-white/10 hover:border-primary overflow-hidden transition-all shadow-2xl active:scale-90 bg-white/5"
                                                     >
                                                         {lead.assignedAgentId ? (
                                                            <img src={agents.find(a => a.id === lead.assignedAgentId)?.avatar} alt="Agent" className="w-full h-full object-cover" />
                                                         ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-primary/60">
                                                                <UserPlus size={14} strokeWidth={3} />
                                                            </div>
                                                         )}
                                                     </button>
                                                     <AnimatePresence>
                                                        {activeAssignId === lead.id && <AssignDropdown leadId={lead.id} />}
                                                     </AnimatePresence>
                                                </div>
                                                {lead.assignedAgentId && (
                                                    <span className="ms-2 text-[9px] font-bold text-gray-500 uppercase tracking-tighter max-w-[60px] truncate">{agents.find(a => a.id === lead.assignedAgentId)?.name}</span>
                                                )}
                                             </div>
                                             
                                             <button 
                                                onClick={() => openFollowUpModal(lead)}
                                                className="h-9 px-4 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 transition-all hover:text-white shadow-sm group/follow"
                                                title={t('followUp')}
                                             >
                                                <MessageSquare size={14} strokeWidth={2.5} className="me-2 transition-transform group-hover/follow:scale-110" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">{t('notes')}</span>
                                             </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingItem ? t('editLead', 'Edit Lead') : t('addLead')}
            >
                <form onSubmit={handleSubmit} className="space-y-6 p-2">
                    <Input label={t('name')} name="name" value={formData.name} onChange={handleInputChange} required className="bg-white/5 border-white/10 rounded-2xl h-14" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Input label={t('email')} type="email" name="email" value={formData.email} onChange={handleInputChange} required className="bg-white/5 border-white/10 rounded-2xl h-14" />
                        <Input label={t('phone')} name="phone" value={formData.phone} onChange={handleInputChange} className="bg-white/5 border-white/10 rounded-2xl h-14" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em] ps-1">{t('source')}</label>
                            <select className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-[#0f172a] text-white outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer font-bold appearance-none shadow-inner" name="source" value={formData.source} onChange={handleInputChange}>
                                <option value="website">🌐 {t('website')}</option>
                                <option value="referral">🤝 {t('referral')}</option>
                                <option value="social_media">📱 {t('socialMedia')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em] ps-1">{t('status')}</label>
                            <select className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-[#0f172a] text-white outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer font-bold appearance-none shadow-inner" name="status" value={formData.status} onChange={handleInputChange}>
                                {Object.entries(kanbanColumns).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-6 gap-3">
                         <Button type="button" variant="ghost" onClick={handleCloseModal} className="h-12 px-8 rounded-2xl hover:bg-white/5 font-bold">{t('cancel')}</Button>
                         <Button type="submit" className="h-12 bg-primary px-10 rounded-2xl shadow-xl shadow-primary/20 font-black tracking-widest uppercase text-xs">{editingItem ? t('update') : t('create')}</Button>
                    </div>
                </form>
            </Modal>

            {/* Follow Up Modal */}
            <Modal
                isOpen={isFollowUpModalOpen}
                onClose={() => setIsFollowUpModalOpen(false)}
                title={t('followUpWith', { name: selectedLead?.name })}
                maxWidth="max-w-2xl"
            >
                <div className="space-y-8 p-1">
                    {/* History */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] shrink-0">{t('interactionHistory', 'Interaction History')}</span>
                            <div className="flex-1 h-px bg-white/5"></div>
                        </div>
                        
                        <div className="space-y-0 relative before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                            {selectedLead?.followUps?.length > 0 ? (
                                selectedLead.followUps.slice().reverse().map((fu, idx) => {
                                    const performer = agents.find(a => a.id === fu.performedById);
                                    return (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            key={fu.id} 
                                            className="relative ps-14 pb-10 last:pb-2 group"
                                        >
                                            <div className="absolute left-0 top-0 w-10 h-10 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center z-10 group-hover:border-primary/50 transition-colors shadow-xl">
                                                {performer?.avatar ? (
                                                    <img src={performer.avatar} alt={performer.name} className="w-full h-full object-cover rounded-2xl p-0.5" />
                                                ) : (
                                                    <div className="w-full h-full rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                        {(performer?.name?.charAt(0) || 'U')}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="bg-[#0f172a] p-5 rounded-[2rem] border border-white/10 group-hover:border-white/20 transition-all shadow-inner">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="text-xs font-black text-white uppercase tracking-tight mb-0.5 group-hover:text-primary transition-colors">{performer?.name || t('user')}</div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                                                {new Date(fu.date).toLocaleString(undefined, { 
                                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">{t('logged')}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-300 leading-relaxed font-semibold italic">"{fu.note}"</p>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                        <MessageSquare size={20} className="text-gray-600" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-500 italic">{t('noInteractionRecords', 'No interaction records yet')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleAddFollowUp} className="bg-slate-950/50 p-6 rounded-[2.5rem] border border-white/10 space-y-5 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-20"></div>
                        
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] ps-1">{t('addNotes')}</label>
                                {currentUser && (
                                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                        <img src={currentUser.avatar} className="w-4 h-4 rounded-full object-cover" />
                                        <span className="text-[8px] font-bold text-gray-400 uppercase">{currentUser.name}</span>
                                    </div>
                                )}
                            </div>
                            <textarea 
                                className="w-full px-6 py-5 rounded-[2rem] border border-white/10 bg-[#070b14] text-white outline-none focus:ring-2 focus:ring-primary/40 min-h-[140px] font-bold placeholder-gray-700 transition-all shadow-inner resize-none leading-relaxed"
                                placeholder={t('enterFollowUpNotes', 'Start typing the interaction details here...')}
                                value={followUpNote}
                                onChange={(e) => setFollowUpNote(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3 relative z-10">
                            <Button type="button" variant="ghost" onClick={() => setIsFollowUpModalOpen(false)} className="h-12 rounded-2xl font-bold">{t('cancel')}</Button>
                            <Button type="submit" className="h-12 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md px-10 rounded-2xl font-black tracking-widest uppercase text-xs">
                                <MessageSquare size={16} strokeWidth={3} className="me-2" /> {t('saveNote')}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default Leads;
