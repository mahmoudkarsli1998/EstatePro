import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash, Search, Download, Filter, Phone, Mail, MessageSquare, UserPlus, LayoutGrid, List, MoreVertical, Calendar, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import Badge from '../../components/shared/Badge';
import { crmService } from '../../services/crmService';
import { estateService } from '../../services/estateService';
import { useDashboardCrud } from '../../hooks/useDashboardCrud';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationsContext';
import { users as staticUsers } from '../../data/mockData'; // Renamed to avoid usage

const Leads = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const { createNotification } = useNotifications();
    const [assignableStaff, setAssignableStaff] = useState([]);
    
    // Fetch assignable staff (Agents & Sales)
    useEffect(() => {
        const fetchStaff = async () => {
            try {
                // Fetch from /users/assignable - per API spec, this should return Agents & Sales
                const assignable = await crmService.getAssignableUsers();
                console.log("Assignable Users from /users/assignable:", JSON.stringify(assignable, null, 2));
                
                // Also fetch agent profiles to get their userId links
                const agentsRes = await crmService.getAgents().catch(e => { 
                    console.error("Agents fetch error:", e); 
                    return []; 
                });
                console.log("Agent Profiles from /agents:", JSON.stringify(agentsRes, null, 2));
                
                // Map assignable users (from /users/assignable)
                const usersStaff = assignable.map(u => ({
                    id: u.id || u._id,
                    name: u.name || u.fullName,
                    email: u.email,
                    avatar: u.avatar || u.image,
                    role: u.role || 'sales',
                    source: 'users/assignable'
                }));
                
                // Map agent profiles - IMPORTANT: use userId for assignment ID, but Agent's own data for display
                // The Agent's userId is their User account ID, which is what backend expects for assignment
                // But the Agent has their own name, email, avatar which should be displayed
                const agentsStaff = (Array.isArray(agentsRes) ? agentsRes : []).map(a => {
                    // Handle userId being a populated object or a string
                    let userIdValue = null;
                    if (a.userId) {
                        userIdValue = typeof a.userId === 'object' ? (a.userId._id || a.userId.id) : a.userId;
                    } else if (a.user) {
                        userIdValue = typeof a.user === 'object' ? (a.user._id || a.user.id) : a.user;
                    }
                    
                    return {
                        id: userIdValue || a.id || a._id, // Use userId for assignment
                        agentProfileId: a.id || a._id,
                        name: a.name, // Use Agent's own name (e.g. "MA")
                        email: a.email, // Use Agent's own email (e.g. "m@gmail.com")
                        avatar: a.avatar || a.image,
                        role: 'agent',
                        source: 'agents'
                    };
                });
                
                console.log("Mapped Agents (using userId):", agentsStaff);
                
                // Combine - agents first (if they have userId), then other users
                const combined = [...agentsStaff, ...usersStaff].filter(u => u.id);
                
                // Deduplicate by ID (agents with userId will take precedence if same user)
                const unique = Array.from(new Map(combined.map(item => [String(item.id), item])).values());
                
                console.log("Final Assignable Staff:", unique);
                setAssignableStaff(unique);
            } catch (error) {
                console.error("Failed to fetch assignable staff:", error);
                setAssignableStaff([]);
            }
        };
        fetchStaff();
    }, []);

    // Helper to resolve assigned agent (handles mixed keys and shows Agent profile data when applicable)
    const resolveAgent = (lead) => {
        // If assignedAgent is a populated object (User data from backend)
        if (lead.assignedAgent && typeof lead.assignedAgent === 'object' && (lead.assignedAgent._id || lead.assignedAgent.id)) {
            const assignedUserId = lead.assignedAgent._id || lead.assignedAgent.id;
            
            // Check if this User is linked to an Agent profile (reverse lookup)
            // If so, show the Agent's profile data instead of User data
            const linkedAgent = assignableStaff.find(s => 
                s.source === 'agents' && String(s.id) === String(assignedUserId)
            );
            
            if (linkedAgent) {
                // Return Agent profile data for display
                return {
                    ...linkedAgent,
                    fullName: linkedAgent.name,
                    _id: assignedUserId
                };
            }
            
            // No linked Agent, return User data as-is
            return lead.assignedAgent;
        }
        
        // Check all possible ID fields (including assignedAgent if it's just an ID string)
        const targetId = 
            (typeof lead.assignedAgent === 'string' ? lead.assignedAgent : null) ||
            lead.assignedAgentId || 
            lead.agentId || 
            lead.agent || 
            lead.assignedTo;
            
        if (!targetId) return null;
        
        const found = assignableStaff.find(s => String(s.id) === String(targetId));
        return found;
    };

    // Fetch Projects for dropdown
    const [projects, setProjects] = useState([]);
    const [units, setUnits] = useState([]);

    useEffect(() => {
        estateService.getProjects().then(setProjects).catch(console.error);
    }, []);



    const [viewMode, setViewMode] = useState('list');
    const [selectedLead, setSelectedLead] = useState(null);
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

    const { user: useAuthUser } = useAuth(); // Renamed to avoid name collision with useEffect logic? 
    // Actually Leads.jsx uses 'currentUser' from localStorage. I should switch to useAuth entirely if possible but let's just get the role.
    const isSales = useAuthUser?.role === 'sales';

    // Secure Fetcher
    const secureGetLeads = React.useCallback(async () => {
        if (isSales) {
            return await crmService.getLeads({ agentId: useAuthUser?.id });
        }
        return await crmService.getLeads();
    }, [isSales, useAuthUser?.id]);

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
        secureGetLeads,
        crmService.createLead,
        crmService.updateLead,
        crmService.deleteLead,
        { name: '', email: '', phone: '', message: '', status: 'new', source: 'website', interestedProject: '', interestedUnit: '' },
        (lead, term) =>  
            lead.name.toLowerCase().includes(term.toLowerCase()) || 
            lead.email.toLowerCase().includes(term.toLowerCase())
    );

    const openEditModal = (lead) => {
        // Normalize populated objects to IDs/Strings for the form
        // Force ID to ensure update logic triggers (fix for duplicate creation)
        const normalized = {
            ...lead,
            id: lead.id || lead._id, 
            interestedProject: lead.interestedProject?.id || lead.interestedProject?._id || (typeof lead.interestedProject === 'string' ? lead.interestedProject : '') || '',
            interestedUnit: lead.interestedUnit?.id || lead.interestedUnit?._id || (typeof lead.interestedUnit === 'string' ? lead.interestedUnit : '') || '',
            assignedAgentId: lead.assignedAgent?.id || lead.assignedAgent?._id || (typeof lead.assignedAgent === 'string' ? lead.assignedAgent : '') || lead.assignedAgentId || '', 
        };
        handleOpenModal(normalized);
    };

    // Fetch units when project changes in form
    useEffect(() => {
        if (formData.interestedProject) {
             console.log("Fetching units for project:", formData.interestedProject);
             estateService.getUnits({ projectId: formData.interestedProject })
                .then(res => {
                    console.log("Units fetch result:", res);
                    setUnits(res);
                })
                .catch(err => {
                    console.error("Units fetch error:", err);
                    setUnits([]);
                });
        } else {
            setUnits([]);
        }
    }, [formData.interestedProject]);

    // Debug Projects
    useEffect(() => {
        console.log("Projects available for dropdown:", projects);
    }, [projects]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // setActiveAssignId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Unified Assignment Handler (replaces handleAssign)
    const handleAssignAgent = async (agentId) => {
        if (!leadToAssign && !selectedLead) return;
        const lead = leadToAssign || selectedLead;
        
        try {
            const targetId = lead.id || lead._id;
            if (!targetId) throw new Error("Lead ID is missing for assignment");
            
            // Find the agent being assigned
            const agent = assignableStaff.find(s => s.id === agentId || s._id === agentId);
            const agentName = agent?.fullName || agent?.name || 'Agent';
            
            console.log(`[AssignAgent] Assigning agent ${agentId} to lead ${targetId}`);
            const result = await crmService.assignAgent(targetId, agentId);
            console.log(`[AssignAgent] Assignment result:`, result);
            
            // Create notification for the assigned agent
            try {
                await createNotification({
                    title: t('leadAssigned', 'New Lead Assigned'),
                    message: `You have been assigned lead: ${lead.name || 'Unknown'}`,
                    type: 'ASSIGNMENT',
                    userId: agentId,
                    metadata: { leadId: targetId, leadName: lead.name }
                });
            } catch (notifErr) {
                console.log('Notification creation failed (non-critical):', notifErr);
            }
            
            await refresh();
            console.log(`[AssignAgent] Refreshed leads list`);
            
            toast.success(t('leadAssignedSuccess', `Lead assigned to ${agentName}`));
            
            // Close assignments
            closeAssignModal();
        } catch (error) {
            console.error("[AssignAgent] Failed to assign agent:", error);
            toast.error(`Assignment failed: ${error.message || 'Unknown error'}`);
        }
    };

    // Kanban Drag and Drop Handlers
    const [draggedLead, setDraggedLead] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    const handleDragStart = (e, lead) => {
        setDraggedLead(lead);
        e.dataTransfer.effectAllowed = 'move';
        // Add some visual feedback
        e.target.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        setDraggedLead(null);
        setDragOverColumn(null);
        e.target.style.opacity = '1';
    };

    const handleDragOver = (e, status) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(status);
    };

    const handleDragLeave = (e) => {
        setDragOverColumn(null);
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        setDragOverColumn(null);
        
        if (!draggedLead || draggedLead.status === newStatus) {
            setDraggedLead(null);
            return;
        }
        
        try {
            const leadId = draggedLead.id || draggedLead._id;
            console.log(`[KanbanDrop] Updating lead ${leadId} status from ${draggedLead.status} to ${newStatus}`);
            
            await crmService.updateLeadStatus(leadId, newStatus);
            
            // Create notification for status change
            try {
                await createNotification({
                    title: t('leadStatusChanged', 'Lead Status Updated'),
                    message: `Lead "${draggedLead.name}" moved to ${newStatus}`,
                    type: 'STATUS_CHANGE',
                    metadata: { leadId, leadName: draggedLead.name, newStatus, oldStatus: draggedLead.status }
                });
            } catch (notifErr) {
                console.log('Notification creation failed (non-critical):', notifErr);
            }
            
            await refresh();
            toast.success(t('statusUpdated', `Status updated to ${newStatus}`));
            console.log(`[KanbanDrop] Status updated successfully`);
        } catch (error) {
            console.error('[KanbanDrop] Failed to update status:', error);
            toast.error(`Failed to update status: ${error.message || 'Unknown error'}`);
        }
        
        setDraggedLead(null);
    };

    const handleAddFollowUp = async (e) => {
        e.preventDefault();
        if (!followUpNote.trim() || !selectedLead) return;

        try {
            const leadId = selectedLead.id || selectedLead._id;
            if (!leadId) throw new Error("Lead ID is missing");
            
            // Include current user info for attribution
            await crmService.addFollowUp(leadId, { 
                note: followUpNote, 
                date: new Date().toISOString(),
                performedBy: currentUser?.id,
                performedByName: currentUser?.fullName || currentUser?.name || 'Unknown'
            });
            
            // Create notification for follow-up
            try {
                await createNotification({
                    title: t('followUpAdded', 'Follow-up Added'),
                    message: `Follow-up added for lead "${selectedLead.name}"`,
                    type: 'FOLLOW_UP',
                    metadata: { leadId, leadName: selectedLead.name, note: followUpNote.substring(0, 50) }
                });
            } catch (notifErr) {
                console.log('Notification creation failed (non-critical):', notifErr);
            }
            
            setFollowUpNote('');
            await refresh();
            toast.success(t('followUpAddedSuccess', 'Follow-up added successfully'));
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

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [leadToAssign, setLeadToAssign] = useState(null);
    const [activeAssignId, setActiveAssignId] = useState(null); // Added state for active assignment

    const openAssignModal = (lead) => {
        setLeadToAssign(lead);
        setActiveAssignId(lead.assignedAgent?.id || lead.assignedAgent?._id || null); // Initialize activeAssignId
        setIsAssignModalOpen(true);
    };

    const closeAssignModal = () => {
        setIsAssignModalOpen(false);
        setLeadToAssign(null);
        setActiveAssignId(null);
    };





    const closeFollowUpModal = () => {
        setIsFollowUpModalOpen(false);
        setSelectedLead(null);
        setFollowUpNote('');
    };

    return (
        <div className="pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 px-1 gap-4">
                <div>
                    <h1 className="text-3xl font-black font-heading text-textDark dark:text-white tracking-tight">{t('leads')}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-textLight text-sm font-medium">{t('manageLeads')}</p>
                        <div className="w-1 h-1 rounded-full bg-textLight/50"></div>
                        <span className="text-primary text-xs font-bold">{leads.length} {t('totalLeads', 'Total')}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex bg-background dark:bg-white/5 border border-border/20 dark:border-white/10 rounded-xl p-1.5 shadow-inner grow md:grow-0">
                        <button 
                            className={`flex-1 md:w-10 h-10 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary !text-white shadow-sm' : 'text-textLight hover:text-textDark dark:hover:text-white hover:bg-section dark:hover:bg-white/5'}`}
                            onClick={() => setViewMode('list')}
                            title={t('listView')}
                        >
                            <List size={18} />
                        </button>
                        <button 
                            className={`flex-1 md:w-10 h-10 flex items-center justify-center rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-primary !text-white shadow-sm' : 'text-textLight hover:text-textDark dark:hover:text-white hover:bg-section dark:hover:bg-white/5'}`}
                            onClick={() => setViewMode('kanban')}
                            title={t('kanbanView')}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                    <Button variant="outline" onClick={onExport} className="hidden sm:flex h-12 border-border/20 dark:border-white/10 bg-background dark:bg-white/5 hover:bg-section dark:hover:bg-white/10">
                        <Download size={18} className="me-2" /> {t('export')}
                    </Button>

                    {!isSales && (
                        <Button onClick={() => handleOpenModal()} className="h-12 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95 px-6 !text-white">
                            <Plus size={20} className="me-2" strokeWidth={3} /> {t('addLead')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 px-1">
                 <div className="relative max-w-md w-full group">
                    <Search size={18} className="absolute inset-y-0 start-4 my-auto text-textLight group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder={t('searchLeads')}
                        className="w-full ps-12 pe-4 py-3.5 rounded-2xl border border-border/20 bg-background dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/20 text-textDark dark:text-white placeholder-textLight/50 transition-all font-semibold shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 shrink-0">
                    <button className="h-14 px-5 rounded-2xl border border-border/20 bg-background dark:bg-white/5 text-textLight hover:text-textDark dark:hover:text-white hover:border-primary/20 transition-all flex items-center shadow-inner">
                        <Filter size={18} className="me-2" />
                        <span className="text-sm font-bold">{t('filter')}</span>
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500 animate-pulse font-bold">{t('loading')}...</div>
                    ) : leads.length === 0 ? (
                        <div className="text-center py-10 text-gray-600 font-bold">{t('noLeadsFound', 'No leads found')}</div>
                    ) : leads.map((lead) => {
                        const agent = resolveAgent(lead);
                        return (
                            <div key={lead.id} className="bg-white dark:bg-section border border-border/30 rounded-2xl p-4 shadow-lg">
                                {/* Header: Name + Status */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-textDark dark:text-white">{lead.name}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">{new Date(lead.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <Badge variant={lead.status === 'new' ? 'primary' : lead.status === 'closed' ? 'success' : lead.status === 'lost' ? 'danger' : 'warning'} className="px-3 py-1 font-bold text-xs">
                                        {t(lead.status) || lead.status}
                                    </Badge>
                                </div>
                                
                                {/* Contact Info */}
                                <div className="space-y-2 mb-3 text-sm">
                                    <div className="flex items-center text-textLight">
                                        <Mail size={14} className="me-2 text-primary" /> {lead.email}
                                    </div>
                                    <div className="flex items-center text-textLight">
                                        <Phone size={14} className="me-2 text-primary" /> {lead.phone}
                                    </div>
                                </div>
                                
                                {/* Interest */}
                                {(lead.interestedProject || lead.interestedUnit) && (
                                    <div className="bg-primary/5 rounded-xl p-3 mb-3">
                                        {lead.interestedProject && (
                                            <span className="text-sm font-bold text-primary">
                                                {lead.interestedProject.name || 'Project'}
                                            </span>
                                        )}
                                        {lead.interestedUnit && (
                                            <span className="text-xs text-textLight ml-2">
                                                Unit: {lead.interestedUnit.number || lead.interestedUnit}
                                            </span>
                                        )}
                                    </div>
                                )}
                                
                                {/* Assigned Agent */}
                                {!isSales && (
                                    <div className="flex items-center justify-between mb-3 py-2 border-t border-border/20">
                                        <span className="text-xs font-bold text-gray-500 uppercase">{t('assignedTo')}</span>
                                        <button 
                                            onClick={() => openAssignModal(lead)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${agent ? 'bg-gray-100 dark:bg-white/5' : 'bg-primary/10 text-primary'}`}
                                        >
                                            {agent ? (
                                                <>
                                                    <div className="w-6 h-6 rounded-full overflow-hidden">
                                                        <img src={agent.avatar || agent.image || 'https://via.placeholder.com/30'} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="text-sm font-bold">{agent.fullName || agent.name}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={14} />
                                                    <span className="text-sm font-bold">{t('assign')}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                                
                                {/* Follow Up */}
                                {lead.followUps?.length > 0 && (
                                    <div className="bg-emerald-500/5 rounded-xl p-3 mb-3">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 italic line-clamp-2">"{lead.followUps[lead.followUps.length - 1].note}"</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs text-gray-500">{new Date(lead.followUps[lead.followUps.length - 1].date).toLocaleDateString()}</span>
                                            {(lead.followUps[lead.followUps.length - 1].performedBy?.fullName || lead.followUps[lead.followUps.length - 1].performedByName) && (
                                                <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
                                                    {lead.followUps[lead.followUps.length - 1].performedBy?.fullName || lead.followUps[lead.followUps.length - 1].performedByName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t border-border/20">
                                    <button 
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-sm"
                                        onClick={() => openFollowUpModal(lead)}
                                    >
                                        <MessageSquare size={16} /> {t('followUp')}
                                    </button>
                                    <button 
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/10 text-blue-600 font-bold text-sm"
                                        onClick={() => openEditModal(lead)}
                                    >
                                        <Edit size={16} /> {t('edit')}
                                    </button>
                                    {!isSales && (
                                        <button 
                                            className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-red-500/10 text-red-600"
                                            onClick={() => handleDelete(lead.id)}
                                        >
                                            <Trash size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white/50 dark:bg-section border border-border/50 rounded-[2rem] shadow-xl overflow-hidden backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-section dark:bg-white/5 text-textLight font-bold text-[9px] uppercase tracking-[0.1em]">
                                <tr>
                                    <th className="px-3 py-4 text-start w-[18%]">{t('name')}</th>
                                    {!isSales && <th className="px-3 py-4 text-start w-[16%]">{t('contact')}</th>}
                                    <th className="px-3 py-4 text-start w-[10%]">{t('status')}</th>
                                    <th className="px-3 py-4 text-start w-[14%]">{t('interest')}</th>
                                    {!isSales && <th className="px-3 py-4 text-start w-[16%]">{t('assignedTo')}</th>}
                                    <th className="px-3 py-4 text-start w-[14%]">{t('latestFollowUp')}</th>
                                    <th className="px-3 py-4 text-end w-[12%]">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {loading ? (
                                    <tr><td colSpan="7" className="px-4 py-16 text-center text-gray-500 animate-pulse font-bold tracking-widest">{t('loading')}...</td></tr>
                                ) : leads.length === 0 ? (
                                    <tr><td colSpan="7" className="px-4 py-16 text-center text-gray-600 font-bold italic">{t('noLeadsFound', 'No leads found')}</td></tr>
                                ) : leads.map((lead) => {
                                    const agent = resolveAgent(lead);
                                    return (
                                    <tr key={lead.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-3 py-4">
                                            <div className="font-bold text-textDark dark:text-white text-sm group-hover:text-primary transition-colors leading-tight truncate">{lead.name}</div>
                                            <div className="text-[9px] text-textLight flex items-center mt-1 font-bold uppercase tracking-wide">
                                                <Calendar size={9} className="me-1 text-primary/60" />
                                                {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        </td>
                                        {!isSales && (
                                            <td className="px-3 py-4">
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center text-[10px] font-semibold text-textLight group-hover:text-textDark dark:group-hover:text-white transition-colors truncate">
                                                        <Mail size={10} className="me-1.5 text-textLight group-hover:text-primary transition-colors shrink-0" />
                                                        <span className="truncate">{lead.email}</span>
                                                    </div>
                                                    <div className="flex items-center text-[10px] font-semibold text-textLight group-hover:text-textDark dark:group-hover:text-white transition-colors">
                                                        <Phone size={10} className="me-1.5 text-textLight group-hover:text-primary transition-colors shrink-0" /> {lead.phone}
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-3 py-4">
                                            <Badge variant={lead.status === 'new' ? 'primary' : lead.status === 'closed' ? 'success' : lead.status === 'lost' ? 'danger' : 'warning'} className="px-2 py-1 font-black uppercase text-[8px] shadow-sm tracking-wide">
                                                {t(lead.status) || lead.status}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-4">
                                            {(lead.interestedProject || lead.interestedUnit) ? (
                                                <div className="flex flex-col items-start gap-0.5">
                                                    {lead.interestedProject && (
                                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                                                            <div className="w-1 h-1 rounded-full bg-primary"></div>
                                                            <span className="text-[9px] font-bold text-primary uppercase truncate max-w-[80px]">
                                                                {lead.interestedProject.name || (projects.find(p => p.id === lead.interestedProject || p._id === lead.interestedProject)?.name) || 'Project'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {lead.interestedUnit && (
                                                        <span className="text-[8px] font-bold text-textLight uppercase truncate">
                                                            {lead.interestedUnit.number || lead.interestedUnit}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[9px] text-gray-400 font-bold">-</span>
                                            )}
                                        </td>
                                        {!isSales && (
                                            <td className="px-3 py-4">
                                                <button 
                                                    onClick={() => openAssignModal(lead)}
                                                    className={`group/btn p-1 rounded-xl transition-all duration-300 ${agent ? 'bg-section dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm'}`}
                                                >
                                                    {agent ? (
                                                        <div className="flex items-center gap-2 pr-2">
                                                            <div className="w-7 h-7 rounded-lg border border-white/10 overflow-hidden">
                                                                <img src={agent.avatar || agent.image || 'https://via.placeholder.com/30'} alt="Agent" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="text-start">
                                                                <div className="text-[9px] font-bold text-textDark dark:text-white leading-none uppercase truncate max-w-[60px]">{agent.fullName || agent.name || 'Agent'}</div>
                                                                <div className="text-[7px] text-gray-500 font-bold truncate max-w-[60px]">{agent.email}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center px-2 py-1 text-[9px] font-bold uppercase">
                                                            <UserPlus size={12} strokeWidth={3} className="me-1" />
                                                            {t('assign')}
                                                        </div>
                                                    )}
                                                </button>
                                            </td>
                                        )}
                                        <td className="px-3 py-4">
                                            {lead.followUps?.length > 0 ? (
                                                <div>
                                                    <div className="text-[9px] text-gray-300 font-medium line-clamp-1 italic truncate max-w-[100px]">"{lead.followUps[lead.followUps.length - 1].note}"</div>
                                                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                                                        <span className="text-[8px] text-gray-500 font-bold">
                                                            {new Date(lead.followUps[lead.followUps.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                        {(lead.followUps[lead.followUps.length - 1].performedBy?.fullName || lead.followUps[lead.followUps.length - 1].performedByName) && (
                                                            <span className="text-[8px] text-primary font-bold bg-primary/10 px-1 rounded">
                                                                {lead.followUps[lead.followUps.length - 1].performedBy?.fullName || lead.followUps[lead.followUps.length - 1].performedByName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] text-gray-600 font-bold opacity-40">{t('noActivity', 'No Activity')}</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    title={t('followUp')}
                                                    className="w-8 h-8 flex items-center justify-center text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white rounded-lg transition-all"
                                                    onClick={() => openFollowUpModal(lead)}
                                                >
                                                    <MessageSquare size={14} strokeWidth={2.5} />
                                                </button>
                                                <button className="w-8 h-8 flex items-center justify-center text-blue-500 bg-blue-500/5 hover:bg-blue-500 hover:text-white rounded-lg transition-all" onClick={() => openEditModal(lead)}>
                                                    <Edit size={14} strokeWidth={2.5} />
                                                </button>
                                                {!isSales && (
                                                    <button className="w-8 h-8 flex items-center justify-center text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-lg transition-all" onClick={() => handleDelete(lead.id)}>
                                                        <Trash size={14} strokeWidth={2.5} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                </>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 px-1 pb-10">
                    {Object.entries(kanbanColumns).map(([status, config]) => (
                        <div 
                            key={status} 
                            className={`flex flex-col h-full min-h-[650px] transition-all duration-200 ${dragOverColumn === status ? 'bg-primary/5 rounded-3xl' : ''}`}
                            onDragOver={(e) => handleDragOver(e, status)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, status)}
                        >
                            <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full shadow-lg ${status === 'new' ? 'bg-blue-500 shadow-blue-500/20' : status === 'closed' ? 'bg-green-500 shadow-green-500/20' : 'bg-yellow-500 shadow-yellow-500/20'}`}></div>
                                    <span className="font-black text-[11px] tracking-[0.15em] text-textLight dark:text-gray-300 uppercase">{config.label}</span>
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
                                        className={`bg-background dark:bg-section backdrop-blur-sm shadow-sm hover:shadow-md p-5 rounded-3xl border border-border/20 hover:border-primary/20 transition-all cursor-grab active:cursor-grabbing group relative ${draggedLead?.id === lead.id ? 'opacity-50 scale-95' : ''}`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, lead)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-extrabold text-textDark dark:text-white text-base group-hover:text-primary transition-colors leading-tight mb-1">{lead.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-bold text-gray-500 border border-white/5 uppercase tracking-wider">{t(lead.source) || lead.source}</span>
                                                </div>
                                            </div>
                                            <button className="p-1 px-2 text-gray-600 hover:text-white bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all" onClick={() => openEditModal(lead)}>
                                                <Edit size={12} />
                                            </button>
                                        </div>

                                        {lead.followUps?.length > 0 && (
                                            <div className="mb-5 bg-black/20 p-3 rounded-2xl border border-white/5">
                                                <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                                    <span>{t('latestActivity')}</span>
                                                    <span className="text-gray-600 text-[8px]">{new Date(lead.followUps[lead.followUps.length - 1].date).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-[11px] text-textLight dark:text-gray-300 font-medium italic line-clamp-2 leading-relaxed">"{lead.followUps[lead.followUps.length - 1].note}"</p>
                                            </div>
                                        )}

                                        {/* Project Interest for Kanban */}
                                        {(lead.interestedProject || lead.interestedUnit) && (
                                            <div className="mb-4 flex items-center gap-2 flex-wrap">
                                                {lead.interestedProject && (
                                                    <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-primary uppercase tracking-wider">
                                                        {lead.interestedProject.name || (projects.find(p => p.id === lead.interestedProject || p._id === lead.interestedProject)?.name) || 'Project'}
                                                    </div>
                                                )}
                                                {lead.interestedUnit && (
                                                     <div className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold text-textLight uppercase tracking-wider">
                                                        Unit {lead.interestedUnit.number || lead.interestedUnit}
                                                     </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                             <div className="flex items-center">
                                                <div className="relative">
                                                     <button 
                                                        onClick={() => openAssignModal(lead)}
                                                        className="w-9 h-9 rounded-xl border-2 border-white/10 hover:border-primary overflow-hidden transition-all shadow-2xl active:scale-90 bg-white/5"
                                                     >
                                                         {resolveAgent(lead) ? (
                                                            <img src={resolveAgent(lead).avatar || resolveAgent(lead).image || 'https://via.placeholder.com/30'} alt="Agent" className="w-full h-full object-cover" />
                                                         ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-primary/60">
                                                                <UserPlus size={14} strokeWidth={3} />
                                                            </div>
                                                         )}
                                                     </button>
                                                </div>
                                                {resolveAgent(lead) && (
                                                    <span className="ms-2 text-[9px] font-bold text-gray-500 uppercase tracking-tighter max-w-[60px] truncate">{resolveAgent(lead).fullName || resolveAgent(lead).name}</span>
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
                    <Input label={t('name')} name="name" value={formData.name} onChange={handleInputChange} required className="bg-white dark:bg-background/50 border-border rounded-2xl h-14" disabled={isSales} />
                    {!isSales && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Input label={t('email')} type="email" name="email" value={formData.email} onChange={handleInputChange} required className="bg-white dark:bg-background/50 border-border rounded-2xl h-14" />
                            <Input label={t('phone')} name="phone" value={formData.phone} onChange={handleInputChange} className="bg-white dark:bg-background/50 border-border rounded-2xl h-14" />
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {!isSales && (
                            <div>
                                <label className="block text-[10px] font-black text-textLight mb-3 uppercase tracking-[0.2em] ps-1">{t('source')}</label>
                                <select className="w-full h-14 px-5 rounded-2xl border border-border bg-white dark:bg-background text-textDark dark:text-white outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer font-bold appearance-none shadow-sm" name="source" value={formData.source} onChange={handleInputChange}>
                                    <option value="website">🌐 {t('website')}</option>
                                    <option value="AI Chat">🤖 {t('aiChat', 'AI Chat')}</option>
                                    <option value="referral">🤝 {t('referral')}</option>
                                    <option value="social_media">📱 {t('socialMedia')}</option>
                                </select>
                            </div>
                        )}
                        <div className={isSales ? "col-span-2" : ""}>
                            <label className="block text-[10px] font-black text-textLight mb-3 uppercase tracking-[0.2em] ps-1">{t('status')}</label>
                            <select className="w-full h-14 px-5 rounded-2xl border border-border bg-white dark:bg-background text-textDark dark:text-white outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer font-bold appearance-none shadow-sm" name="status" value={formData.status} onChange={handleInputChange}>
                                {Object.entries(kanbanColumns).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    {/* Additional Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                         <div>
                            <label className="block text-[10px] font-black text-textLight mb-3 uppercase tracking-[0.2em] ps-1">{t('interestedProject', 'Project')}</label>
                            <select 
                                className="w-full h-14 px-5 rounded-2xl border border-border bg-white dark:bg-background text-textDark dark:text-white outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer font-bold appearance-none shadow-sm"
                                name="interestedProject"
                                value={formData.interestedProject || ''}
                                onChange={handleInputChange}
                            >
                                <option value="">{t('selectProject', 'Select Project...')}</option>
                                {projects.map(p => (
                                    <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                                ))}
                            </select>
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-textLight mb-3 uppercase tracking-[0.2em] ps-1">{t('interestedUnit', 'Unit')}</label>
                            <select 
                                className="w-full h-14 px-5 rounded-2xl border border-border bg-white dark:bg-background text-textDark dark:text-white outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer font-bold appearance-none shadow-sm"
                                name="interestedUnit"
                                value={formData.interestedUnit || ''}
                                onChange={handleInputChange}
                                disabled={!formData.interestedProject}
                            >
                                <option value="">{t('selectUnit', 'Select Unit...')}</option>
                                {units.map(u => (
                                    <option key={u.id || u._id} value={u.id || u._id}>{u.number} ({u.type})</option>
                                ))}
                            </select>
                         </div>
                    </div>
                    
                    <div className="mt-5">
                        <Input 
                            label={t('message', 'Message / Notes')} 
                            name="message" 
                            value={formData.message} 
                            onChange={handleInputChange} 
                            className="bg-white dark:bg-background/50 border-border rounded-2xl h-14" 
                        />
                    </div>
                    <div className="flex justify-end pt-6 gap-3">
                         <Button type="button" variant="ghost" onClick={handleCloseModal} className="h-12 px-8 rounded-2xl hover:bg-white/5 font-bold">{t('cancel')}</Button>
                         <Button type="submit" className="h-12 bg-primary px-10 rounded-2xl shadow-xl shadow-primary/20 font-black tracking-widest uppercase text-xs !text-white">{editingItem ? t('update') : t('create')}</Button>
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
                                    const performer = assignableStaff.find(a => a.id === fu.performedById) || { name: t('system'), avatar: null }; // Fallback to system if user not found in staff list
                                    return (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            key={fu.id} 
                                            className="relative ps-14 pb-10 last:pb-2 group"
                                        >
                                            <div className="absolute left-0 top-0 w-10 h-10 rounded-2xl bg-background border border-white/10 flex items-center justify-center z-10 group-hover:border-primary/50 transition-colors shadow-xl">
                                                {performer?.avatar ? (
                                                    <img src={performer.avatar} alt={performer.name} className="w-full h-full object-cover rounded-2xl p-0.5" />
                                                ) : (
                                                    <div className="w-full h-full rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                        {(performer?.name?.charAt(0) || 'U')}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="bg-background dark:bg-[#0f172a] p-5 rounded-[2rem] border border-border/20 dark:border-white/10 group-hover:border-primary/20 transition-all shadow-inner">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="text-xs font-black text-textDark dark:text-white uppercase tracking-tight mb-0.5 group-hover:text-primary transition-colors">{performer?.name || t('user')}</div>
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
                                                <p className="text-sm text-textLight dark:text-gray-300 leading-relaxed font-semibold italic">"{fu.note}"</p>
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

                    <form onSubmit={handleAddFollowUp} className="bg-white dark:bg-section p-6 rounded-[2.5rem] border border-border/50 space-y-5 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-10"></div>
                        
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
                                className="w-full px-6 py-5 rounded-[2rem] border border-border bg-background/50 text-textDark dark:text-white outline-none focus:ring-2 focus:ring-primary/40 min-h-[140px] font-bold placeholder-textLight/50 transition-all shadow-inner resize-none leading-relaxed"
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

            {/* Assign Agent Modal */}
            {/* Assign Agent Modal (Inlined to avoid re-creation loops) */}
            <AnimatePresence>
                {isAssignModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={closeAssignModal}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-md bg-background dark:bg-[#0f172a] border border-border/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-20"
                        >
                            <div className="p-8 pb-0">
                                <h2 className="text-2xl font-black text-textDark dark:text-white mb-2">{t('assignAgent')}</h2>
                                <p className="text-sm text-textLight font-medium">
                                    {t('selectAgentToAssign', { name: leadToAssign?.name })}
                                </p>
                            </div>
                            
                            <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar my-4 space-y-1">
                                {assignableStaff.map(agent => (
                                    <button
                                        key={agent.id}
                                        onClick={() => setActiveAssignId(agent.id)}
                                        className="w-full flex items-center p-3 rounded-2xl hover:bg-section dark:hover:bg-white/5 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-border/20 dark:border-white/5 group-hover:border-primary/50 overflow-hidden shrink-0">
                                            <img src={agent.avatar || 'https://via.placeholder.com/40'} alt={agent.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="ml-4 flex-1 text-left min-w-0">
                                            <div className="text-sm font-bold text-textDark dark:text-white group-hover:text-primary transition-colors truncate">{agent.name}</div>
                                            <div className="text-xs text-textLight truncate mt-0.5">{agent.email}</div>
                                        </div>
                                        {(activeAssignId === agent.id) && (
                                            <CheckCircle2 size={18} className="text-primary ml-2 shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="p-4 border-t border-border flex justify-end gap-3 sticky bottom-0 bg-surface/95 backdrop-blur-sm z-10 w-full rounded-b-3xl">
                                 <Button variant="secondary" onClick={closeAssignModal}>{t('cancel')}</Button>
                                 <Button onClick={() => {
                                     if(activeAssignId) handleAssignAgent(activeAssignId);
                                 }} disabled={!activeAssignId}>{t('confirmAssignment')}</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Leads;
