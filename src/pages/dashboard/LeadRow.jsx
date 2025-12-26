import React from 'react';
import { Mail, Phone, Calendar, UserPlus, MessageSquare, Edit, Trash, CheckCircle2 } from 'lucide-react';
import Badge from '../../components/shared/Badge';

const LeadRow = ({ index, style, data }) => {
    const { leads, t, agents, openAssignModal, openFollowUpModal, handleOpenModal, handleDelete } = data;
    const lead = leads[index];

    // Grid columns configuration used in header as well:
    // grid-cols-[2fr_2fr_1fr_1.5fr_1.5fr_minmax(100px,1fr)] representing:
    // Name, Contact, Status, AssignedTo, LatestFollowUp, Actions

    if (!lead) return null;

    return (
        <div style={style} className="flex items-center hover:bg-primary/5 transition-colors group border-b border-border/20">
            <div className="grid grid-cols-[2fr_2fr_1fr_1.5fr_1.5fr_1fr] w-full items-center px-4">
                
                {/* Name */}
                <div className="px-2">
                    <div className="font-extrabold text-textDark dark:text-white text-base group-hover:text-primary transition-colors leading-tight truncate">{lead.name}</div>
                    <div className="text-[10px] text-textLight flex items-center mt-1.5 font-bold uppercase tracking-wider">
                        <Calendar size={10} className="me-1.5 text-primary/60" />
                        {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>

                {/* Contact */}
                <div className="px-2">
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center text-xs font-semibold text-textLight group-hover:text-textDark dark:group-hover:text-white transition-colors truncate">
                            <Mail size={12} className="me-2.5 text-textLight group-hover:text-primary transition-colors shrink-0" /> <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex items-center text-xs font-semibold text-textLight group-hover:text-textDark dark:group-hover:text-white transition-colors truncate">
                            <Phone size={12} className="me-2.5 text-textLight group-hover:text-primary transition-colors shrink-0" /> <span className="truncate">{lead.phone}</span>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="px-2">
                    <Badge variant={lead.status === 'new' ? 'primary' : lead.status === 'closed' ? 'success' : lead.status === 'lost' ? 'danger' : 'warning'} className="px-4 py-1.5 font-black uppercase text-[9px] shadow-sm tracking-widest whitespace-nowrap">
                        {t(lead.status) || lead.status}
                    </Badge>
                </div>

                {/* Assigned To */}
                <div className="px-2">
                     <button 
                        onClick={() => openAssignModal(lead)}
                        className={`group/btn p-1 rounded-2xl transition-all duration-300 w-full text-left ${lead.assignedAgentId ? 'bg-section dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm'}`}
                    >
                        {lead.assignedAgentId ? (
                            <div className="flex items-center gap-3 pr-4">
                                <div className="w-8 h-8 rounded-xl border-2 border-white/10 group-hover/btn:border-primary/50 overflow-hidden shadow-2xl transition-all shrink-0">
                                    <img src={agents.find(a => a.id === lead.assignedAgentId)?.avatar || 'https://via.placeholder.com/30'} alt="Agent" className="w-full h-full object-cover" loading="lazy" />
                                </div>
                                <div className="text-start min-w-0">
                                    <div className="text-[11px] font-black text-textDark dark:text-white leading-none mb-1 uppercase tracking-tight truncate">
                                        {agents.find(a => a.id === lead.assignedAgentId)?.name}
                                    </div>
                                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest opacity-60 truncate">{t('agent')}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em]">
                                <UserPlus size={14} strokeWidth={3} className="me-2 shrink-0" />
                                <span className="truncate">{t('assign')}</span>
                            </div>
                        )}
                    </button>
                </div>

                {/* Latest Follow Up */}
                <div className="px-2">
                    {lead.followUps?.length > 0 ? (
                        <div className="max-w-[200px]">
                            <div className="text-[11px] text-gray-300 font-semibold line-clamp-1 italic">"{lead.followUps[lead.followUps.length - 1].note}"</div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                </div>
                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest truncate">
                                    {new Date(lead.followUps[lead.followUps.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter opacity-40">{t('noActivity', 'No Activity')}</span>
                    )}
                </div>

                {/* Actions */}
                <div className="px-2 flex justify-end gap-2">
                    <button 
                        title={t('followUp')}
                        className="w-8 h-8 flex items-center justify-center text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm shrink-0"
                        onClick={() => openFollowUpModal(lead)}
                    >
                        <MessageSquare size={16} strokeWidth={2.5} />
                    </button>
                    <div className="w-px h-6 bg-white/5 mx-1 shrink-0"></div>
                    <button className="w-8 h-8 flex items-center justify-center text-blue-500 bg-blue-500/5 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm shrink-0" onClick={() => handleOpenModal(lead)}>
                        <Edit size={16} strokeWidth={2.5} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm shrink-0" onClick={() => handleDelete(lead.id)}>
                        <Trash size={16} strokeWidth={2.5} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LeadRow;
