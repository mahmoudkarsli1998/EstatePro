import React, { useState } from 'react';
import { Plus, Edit, Trash, Search, Download, Filter, Phone, Mail, MessageSquare, UserPlus, LayoutGrid, List } from 'lucide-react';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import Badge from '../../components/shared/Badge';
import { api } from '../../utils/api'; // Ensure this matches your path
import { useDashboardCrud } from '../../hooks/useDashboardCrud';
import { agents } from '../../data/mockData'; // Need agents for assignment

const Leads = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

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

    const handleAssign = async (agentId) => {
        if (!selectedLead) return;
        await api.updateLead(selectedLead.id, { assignedAgentId: agentId, status: 'contacted' });
        await refresh();
        setIsAssignModalOpen(false);
        setSelectedLead(null);
    };

    const openAssignModal = (lead) => {
        setSelectedLead(lead);
        setIsAssignModalOpen(true);
    };

    const kanbanColumns = {
        new: { label: 'New', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        contacted: { label: 'Contacted', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
        qualified: { label: 'Qualified', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
        closed: { label: 'Closed', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
        lost: { label: 'Lost', color: 'bg-red-500/10 text-red-500 border-red-500/20' }
    };

    const onExport = () => {
        handleExport(
            "leads_export.csv",
            ["ID", "Name", "Email", "Phone", "Status", "Source", "Date"],
            l => [l.id, `"${l.name}"`, l.email, l.phone, l.status, l.source, l.createdAt].join(",")
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Leads</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage and track potential clients</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
                        <button 
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} />
                        </button>
                        <button 
                            className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                            onClick={() => setViewMode('kanban')}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                    <Button variant="outline" onClick={onExport}>
                        <Download size={18} className="mr-2" /> Export
                    </Button>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus size={20} className="mr-2" /> Add Lead
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="mb-6 flex gap-4">
                 <div className="relative max-w-md w-full">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search leads..." 
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="bg-dark-card border border-white/10 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 font-medium text-sm">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Source</th>
                                    <th className="px-6 py-4">Assigned To</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
                                ) : leads.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-4 text-center">No leads found</td></tr>
                                ) : leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{lead.name}</div>
                                            <div className="text-xs text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center text-sm text-gray-300">
                                                    <Mail size={12} className="mr-2 text-gray-500" /> {lead.email}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-300">
                                                    <Phone size={12} className="mr-2 text-gray-500" /> {lead.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={lead.status === 'new' ? 'primary' : lead.status === 'closed' ? 'success' : 'warning'}>
                                                {lead.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 text-sm capitalize">{lead.source?.replace('_', ' ')}</td>
                                        <td className="px-6 py-4">
                                             {lead.assignedAgentId ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                                                        <img src={agents.find(a => a.id === lead.assignedAgentId)?.avatar || 'https://via.placeholder.com/30'} alt="Agent" className="w-full h-full object-cover" />
                                                    </div>
                                                </div>
                                             ) : (
                                                 <button 
                                                    onClick={() => openAssignModal(lead)}
                                                    className="text-xs text-primary hover:underline flex items-center"
                                                >
                                                    <UserPlus size={12} className="mr-1" /> Assign
                                                </button>
                                             )}
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button className="p-1 text-blue-400 hover:text-blue-300 transition-colors" onClick={() => handleOpenModal(lead)}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-1 text-red-500 hover:text-red-400 transition-colors" onClick={() => handleDelete(lead.id)}>
                                                <Trash size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Object.entries(kanbanColumns).map(([status, config]) => (
                        <div key={status} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-full min-h-[500px]">
                            <div className={`flex items-center justify-between pb-3 border-b border-white/10 mb-3 ${config.text}`}>
                                <span className="font-medium">{config.label}</span>
                                <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{leads.filter(l => l.status === status).length}</span>
                            </div>
                            <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] scrollbar-hide">
                                {leads.filter(l => l.status === status).map(lead => (
                                    <div key={lead.id} className="bg-dark-card p-3 rounded-lg border border-white/5 hover:border-primary/50 transition-colors cursor-move group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-white truncate">{lead.name}</h4>
                                            <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleOpenModal(lead)}>
                                                <Edit size={14} />
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-400 mb-2 truncate">{lead.email}</div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                                             <div className="text-xs text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</div>
                                             {lead.assignedAgentId && (
                                                 <div className="w-5 h-5 rounded-full bg-gray-700 overflow-hidden" title="Assigned Agent">
                                                     <img src={agents.find(a => a.id === lead.assignedAgentId)?.avatar} alt="Agent" className="w-full h-full object-cover" />
                                                 </div>
                                             )}
                                        </div>
                                    </div>
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
                title={editingItem ? "Edit Lead" : "Add Lead"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Name" name="name" value={formData.name} onChange={handleInputChange} required />
                    <Input label="Email" type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                    <Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Source</label>
                        <select className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white outline-none" name="source" value={formData.source} onChange={handleInputChange}>
                            <option value="website">Website</option>
                            <option value="referral">Referral</option>
                            <option value="social_media">Social Media</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                        <select className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white outline-none" name="status" value={formData.status} onChange={handleInputChange}>
                            {Object.entries(kanbanColumns).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end pt-4 space-x-3">
                         <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancel</Button>
                         <Button type="submit">{editingItem ? "Update" : "Create"}</Button>
                    </div>
                </form>
            </Modal>

            {/* Assign Modal */}
             {isAssignModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="bg-dark-card border border-white/10 rounded-xl p-6 w-full max-w-md">
                    <h2 className="text-xl font-bold text-white mb-4">Assign Agent</h2>
                    <p className="text-gray-400 mb-4">Select an agent to assign to <strong>{selectedLead?.name}</strong>.</p>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                      {agents.map(agent => (
                        <button
                          key={agent.id}
                          className="w-full flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors text-left border border-transparent hover:border-primary/30"
                          onClick={() => handleAssign(agent.id)}
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-700 mr-3 overflow-hidden">
                            <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{agent.name}</div>
                            <div className="text-xs text-gray-400">{agent.email}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
                    </div>
                  </div>
                </div>
              )}
        </div>
    );
};

export default Leads;
