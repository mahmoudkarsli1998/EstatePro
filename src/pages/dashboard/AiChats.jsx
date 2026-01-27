import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Calendar, User, Search, Eye, Filter } from 'lucide-react';
import { aiService } from '../../services/aiService';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';

const AiChats = () => {
    const { t } = useTranslation();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Details Modal State
    const [selectedSession, setSelectedSession] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadSessions();
        
        // Auto-refresh every 30 seconds for real-time feel
        const interval = setInterval(loadSessions, 30000);
        return () => clearInterval(interval);
    }, [page]);

    const loadSessions = async () => {
        try {
            const data = await aiService.getAllSessions(20, (page - 1) * 20);
            console.log('[AiChats DEBUG] API Response:', data);
            if (data && data.data) {
                setSessions(data.data);
                setTotalPages(data.totalPages || 1);
            } else {
                console.warn('[AiChats DEBUG] Unexpected response format:', data);
            }
        } catch (error) {
            console.error("Failed to load AI sessions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (session) => {
        setSelectedSession(session); // Set basic info immediately
        setIsModalOpen(true);
        setDetailLoading(true);
        try {
            // Fetch full history which might generally be restricted to owner, 
            // but we need an Admin Endpoint for getting details of ANY session.
            // Note: The current backend 'getSession' is restricted to visitorId. 
            // We might need to handle this if the backend enforces checking visitorId.
            // If the Backend 'getSession' endpoint checks for visitorId matching the cookie, 
            // then Admin won't be able to see it unless we add an Admin Text endpoint or modify getSession.
            // *Self-Correction*: I implemented 'getAllSessions' for admin. 
            // I probably need 'getSessionDetails' for admin too if 'getSession' is locked.
            // Let's rely on the list data first, or try to fetch.
            // If it fails, I'll update the plan to include admin-specific getSession.
            
            // Actually, for now, let's assume we can rely on the list view info 
            // OR that the User acts as a "Super User".
            // However, the `getSession` in `AiController` uses `getOrCreateVisitorId` and checks ownership.
            // It effectively BLOCKS seeing other people's chats.
            // I should update `AiController` to allow admins to view any session.
            // For now, I'll just show the session metadata in the modal as a placeholder 
            // until I fix the backend to allow admin detailed view.
            
            // Wait, looking at my plan: "Implement Admin Chat View".
            // I should assume I need to fetch the messages.
            
            // Let's attempt to fetch. If it fails (403/404), we handle it.
            // BUT, I can just update the backend right now to be safe. 
            // I will update the backend `getSession` to bypass specific visitor check if Admin.
            // OR add `admin/sessions/:id`.
            
            // Use admin-specific endpoint that bypasses ownership check
            const fullDetails = await aiService.getSessionAsAdmin(session.sessionId);
            setSelectedSession(fullDetails);
        } catch (err) {
            console.warn("Could not fetch full details (access restriction?)", err);
        } finally {
            setDetailLoading(false);
        }
    };

    const filteredSessions = sessions.filter(s => 
        (s.title && s.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.leadName && s.leadName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold font-heading text-textDark dark:text-white flex items-center gap-2">
                    <MessageSquare className="text-primary" /> {t('aiChats')}
                </h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadSessions} size="sm">{t('refresh')}</Button>
                </div>
            </div>

            <div className="bg-background dark:bg-dark-card border border-border/20 rounded-xl shadow-sm overflow-hidden">
                 <div className="p-4 border-b border-border/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative max-w-md w-full">
                        <Search size={18} className="absolute inset-y-0 start-3 my-auto text-gray-400" />
                        <input 
                        type="text" 
                        placeholder={t('searchChats')}
                        className="w-full ps-10 pe-4 py-2 rounded-lg border border-border/20 dark:border-white/10 bg-background dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-textDark dark:text-white placeholder-textLight"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-400">{t('loadingChats')}</div>
                ) : filteredSessions.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">{t('noChatsFound')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/5 text-textLight dark:text-gray-400 text-sm border-b border-border/20 dark:border-white/10">
                                    <th className="p-4 font-medium">{t('topicQuestion')}</th>
                                    <th className="p-4 font-medium">{t('leadUser')}</th>
                                    <th className="p-4 font-medium text-center">{t('messagesCount')}</th>
                                    <th className="p-4 font-medium">{t('lastActive')}</th>
                                    <th className="p-4 font-medium text-end">{t('action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20 dark:divide-white/5">
                                {filteredSessions.map((session) => (
                                    <tr key={session.sessionId} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="p-4 max-w-xs">
                                            <div className="font-bold text-textDark dark:text-white truncate" title={session.title}>{session.title || t('untitledSession')}</div>
                                            <div className="text-xs text-textLight dark:text-gray-500 truncate">{session.lastMessage}</div>
                                        </td>
                                        <td className="p-4">
                                            {session.leadName ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">L</div>
                                                    <div>
                                                        <div className="text-sm font-medium text-textDark dark:text-white">{session.leadName}</div>
                                                        <div className="text-xs text-textLight">{session.leadPhone}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                 <div className="flex items-center gap-2 text-gray-400">
                                                    <User size={14} /> <span className="text-sm">{t('anonymous')}</span>
                                                 </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                {session.messageCount}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-textLight dark:text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(session.updatedAt || session.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-end">
                                             <Button variant="ghost" size="sm" onClick={() => handleViewDetails(session)}>
                                                <Eye size={16} className="text-primary" />
                                             </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Pagination (Simple) */}
                <div className="p-4 border-t border-border/20 flex justify-between items-center">
                    <span className="text-sm text-gray-500">{t('pageOf', { page, total: totalPages })}</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t('prev')}</Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>{t('next')}</Button>
                    </div>
                </div>
            </div>

            {/* Chat Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedSession ? t('chatWith', { name: selectedSession.leadName || 'Visitor' }) : t('chatDetails')}
                maxWidth="max-w-4xl"
            >
                <div className="h-[60vh] flex flex-col">
                     {detailLoading ? (
                         <div className="flex-1 flex items-center justify-center">{t('loadingMessages')}</div>
                     ) : selectedSession && selectedSession.messages ? (
                         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/20 rounded-lg">
                             {selectedSession.messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className="max-w-[80%] space-y-2">
                                            <div className={`p-3 rounded-lg ${
                                                msg.role === 'user' 
                                                ? 'bg-primary text-white rounded-br-none' 
                                                : 'bg-white dark:bg-dark-card border border-border/10 text-textDark dark:text-white rounded-bl-none'
                                            }`}>
                                                <p className="text-sm">{msg.content}</p>
                                            </div>
                                            
                                                {msg.metadata && msg.metadata.data && msg.metadata.data.length > 0 && (
                                                <div className="text-xs bg-gray-100 dark:bg-white/5 p-2 rounded border border-border/20">
                                                    <div className="font-bold mb-1 opacity-70 flex items-center gap-1 uppercase tracking-wider">
                                                        <Search size={10} />
                                                        {msg.metadata.target || t('results')} ({msg.metadata.data.length})
                                                    </div>
                                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                                        {msg.metadata.data.map((item, i) => (
                                                            <div key={i} className="min-w-[120px] max-w-[120px] bg-white dark:bg-black/40 p-2 rounded border border-border/10 flex-shrink-0">
                                                                {item.image && (
                                                                    <img src={item.image.startsWith('blob:') || item.image.startsWith('http') ? item.image : `/uploads/${item.image}`} alt={item.name} className="w-full h-16 object-cover rounded mb-1 bg-gray-200" />
                                                                )}
                                                                <div className="truncate font-bold text-textDark dark:text-white" title={item.name}>
                                                                    {item.name || item.title}
                                                                </div>
                                                                {item.priceRange && (
                                                                    <div className="text-[10px] text-green-600 dark:text-green-400">
                                                                        {item.priceRange.min ? `${(item.priceRange.min / 1000000).toFixed(1)}M` : t('priceOnRequest')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className={`text-[10px] opacity-70 ${msg.role === 'user' ? 'text-end text-gray-500' : 'text-gray-500'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                             ))}
                             {selectedSession.messages.length === 0 && (
                                 <div className="text-center text-gray-400 italic">{t('noMessagesRecorded')}</div>
                             )}
                         </div>
                     ) : (
                         <div className="flex-1 flex items-center justify-center text-red-400">
                             {t('failedToAccessChat')}
                         </div>
                     )}
                </div>
            </Modal>
        </div>
    );
};

export default AiChats;
