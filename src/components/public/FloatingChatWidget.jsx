import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Bot, X, Send, Sparkles, Building, MapPin, ArrowRight, Trash2, RotateCcw, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Button from '../shared/Button';
import { sendChatMessage, getSessions, getSessionHistory, deleteSession } from '../../services/chatService';
import AiResultCard from './AiResultCard';
import SessionSidebar from './SessionSidebar';
import LeadCaptureForm from './LeadCaptureForm';
import { Maximize2 } from 'lucide-react';



// ResultCard removed as it's now a shared component AiResultCard


const FloatingChatWidget = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    
    // Lead capture state
    const [showLeadForm, setShowLeadForm] = useState(() => !localStorage.getItem('lead_info'));
    const [leadInfo, setLeadInfo] = useState(() => {
        const saved = localStorage.getItem('lead_info');
        return saved ? JSON.parse(saved) : null;
    });
    
    // Session ID - shared with AiAssistantPage via localStorage
    const [sessionId, setSessionId] = useState(() => localStorage.getItem('current_chat_session') || null);
    
    // Load initial messages from localStorage or use default
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('ai_chat_history');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to load chat history", e);
            }
        }
        return [
            { 
                id: 1, 
                text: "Hello! I am your EstatePro AI. How can I help you today?", 
                sender: 'ai', 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isArabic: false
            }
        ];
    });

    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('ai_chat_history', JSON.stringify(messages));
    }, [messages]);

    const containsArabic = (text) => /[\u0600-\u06FF]/.test(text || '');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-grow textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputValue, isOpen]);

    const startNewChat = () => {
        setSessionId(null);
        localStorage.removeItem('current_chat_session');
        const initialMsg = [
            { 
                id: Date.now(), 
                text: "Hello! I am your EstatePro AI. How can I help you today?", 
                sender: 'ai', 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isArabic: false
            }
        ];
        setMessages(initialMsg);
    };

    const clearHistory = () => {
        if (window.confirm("Are you sure you want to start a new chat?")) {
            startNewChat();
        }
    };

    // Load sessions when widget opens
    const loadSessions = async () => {
        setSessionsLoading(true);
        try {
            const response = await getSessions(50, 0);
            setSessions(response.sessions || []);
        } catch (err) {
            console.error('Failed to load sessions:', err);
        } finally {
            setSessionsLoading(false);
        }
    };

    // Load session history when selecting from sidebar
    const loadSessionHistory = async (id) => {
        try {
            setSessionsLoading(true);
            const session = await getSessionHistory(id);
            setSessionId(id);
            localStorage.setItem('current_chat_session', id);
            
            // Convert API messages to widget format
            const loadedMessages = (session.messages || []).map((m, idx) => ({
                id: Date.now() + idx,
                text: m.content,
                sender: m.role === 'user' ? 'user' : 'ai',
                data: m.metadata?.data,
                suggestions: m.metadata?.suggestions,
                target: m.metadata?.target,
                time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isArabic: containsArabic(m.content)
            }));
            
            setMessages(loadedMessages.length > 0 ? loadedMessages : [
                { 
                    id: Date.now(), 
                    text: "Hello! I am your EstatePro AI. How can I help you today?", 
                    sender: 'ai', 
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isArabic: false
                }
            ]);
            setShowSidebar(false);
        } catch (err) {
            console.error('Failed to load session:', err);
        } finally {
            setSessionsLoading(false);
        }
    };

    // Delete a session
    const handleDeleteSession = async (id) => {
        if (!window.confirm('Delete this conversation?')) return;
        try {
            await deleteSession(id);
            loadSessions();
            if (sessionId === id) {
                startNewChat();
            }
        } catch (err) {
            console.error('Failed to delete session:', err);
        }
    };

    // Load sessions when widget opens
    useEffect(() => {
        if (isOpen) {
            loadSessions();
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const userMsgText = inputValue;
        const userMsg = {
            id: Date.now(),
            text: userMsgText,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isArabic: containsArabic(userMsgText)
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        try {
            // Pass leadInfo only on first message of new session
            // Add source to identify leads from AI Chat
            const leadToSend = !sessionId && leadInfo ? { ...leadInfo, source: 'AI Chat' } : null;
            console.log('🚀 [Chat] Sending message with leadInfo:', {
                question: userMsgText,
                sessionId,
                leadInfo: leadToSend
            });
            
            const response = await sendChatMessage(
                userMsgText, 
                sessionId, 
                true,
                leadToSend
            );
            
            console.log('✅ [Chat] Response received:', {
                sessionId: response.sessionId,
                leadId: response.leadId,
                isNewSession: response.isNewSession
            });
            
            // Store the session ID for conversation continuity
            if (response.sessionId) {
                setSessionId(response.sessionId);
                localStorage.setItem('current_chat_session', response.sessionId);
            }
            
            const aiMessageText = response.message || response.explanation || "I found some results for you.";
            const aiData = response.data || [];
            const aiSuggestions = response.suggestions || [];
            const aiTarget = response.target;

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: aiMessageText,
                sender: 'ai',
                data: aiData,
                suggestions: aiSuggestions,
                target: aiTarget,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isArabic: containsArabic(aiMessageText)
            }]);

        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "I apologize, but I'm having trouble connecting to the server right now. Please try again later.",
                sender: 'ai',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isArabic: false
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleCardClick = (item, msgTarget) => {
        // Determine if item is a project or unit regardless of what the backend predicted as 'target'
        const isItemProject = item.type === 'project' || (item.priceRange && !item.price) || (item.slug && !item.projectId && !item.project);
        
        if (isItemProject || msgTarget === 'projects') {
             navigate(`/projects/${item.slug || item.id || item._id}`);
        } else {
             const unitId = item._id || item.id;
             navigate(`/units/${unitId}`);
        }
    };

    const toggleChat = () => setIsOpen(!isOpen);
    const openWhatsApp = () => window.open('https://wa.me/1234567890', '_blank');

    // Handle lead form submission
    const handleLeadSubmit = (formData) => {
        console.log('🎯 [Lead Capture] Form submitted:', formData);
        setLeadInfo(formData);
        localStorage.setItem('lead_info', JSON.stringify(formData));
        
        // IMPORTANT: Clear existing session so leadInfo is sent with first new message
        setSessionId(null);
        localStorage.removeItem('current_chat_session');
        
        // Reset messages to start fresh
        const initialMsg = [{ 
            id: Date.now(), 
            text: `مرحباً ${formData.name.split(' ')[0]}! أنا مساعدك العقاري. كيف يمكنني مساعدتك؟`, 
            sender: 'ai', 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isArabic: true
        }];
        setMessages(initialMsg);
        
        setShowLeadForm(false);
        console.log('✅ [Lead Capture] Session cleared, ready to capture lead on first message');
    };

    // Reset lead form (for testing or updating info)
    const resetLeadForm = () => {
        console.log('🔄 [Lead Capture] Resetting form');
        localStorage.removeItem('lead_info');
        localStorage.removeItem('current_chat_session');
        setLeadInfo(null);
        setSessionId(null);
        setShowLeadForm(true);
    };

    return (
        <div className="fixed bottom-6 z-[10000] flex flex-col items-end gap-4 right-6 pointer-events-none">
            
            {/* Chat Window */}
            {isOpen && (
                <div className="pointer-events-auto w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[70vh] bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500 origin-bottom-right mb-2">
                    
                    {/* Show Lead Capture Form First */}
                    {showLeadForm ? (
                        <LeadCaptureForm onSubmit={handleLeadSubmit} loading={isTyping} />
                    ) : (
                        <>
                    {/* Header */}
                    <div className="p-5 bg-white dark:bg-gray-800 flex justify-between items-center border-bottom border-border/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <Bot size={22} className="text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-textDark dark:text-white">
                                    {leadInfo?.name ? `مرحباً ${leadInfo.name.split(' ')[0]} 👋` : 'AI Assistant'}
                                </h4>
                                <button 
                                    onClick={resetLeadForm}
                                    className="text-[10px] text-primary hover:underline font-medium"
                                >
                                    تغيير البيانات
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setShowSidebar(!showSidebar)} 
                                title="Chat History"
                                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors ${showSidebar ? 'text-primary bg-gray-100 dark:bg-gray-800' : 'text-gray-400'}`}
                            >
                                <Menu size={18} />
                            </button>
                            <button 
                                onClick={clearHistory} 
                                title="New Chat"
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-green-500"
                            >
                                <RotateCcw size={18} />
                            </button>
                            <button 
                                onClick={() => navigate('/ai-assistant')} 
                                title="Full Screen"
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-primary"
                            >
                                <Maximize2 size={18} />
                            </button>
                            <button onClick={toggleChat} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Session Sidebar */}
                    {showSidebar && (
                        <SessionSidebar
                            sessions={sessions}
                            activeId={sessionId}
                            onSelect={loadSessionHistory}
                            onDelete={handleDeleteSession}
                            onClose={() => setShowSidebar(false)}
                            isLoading={sessionsLoading}
                        />
                    )}

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 dark:bg-black/20 scrollbar-none">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div 
                                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm whitespace-pre-wrap ${
                                        msg.sender === 'user' 
                                        ? 'bg-primary text-white rounded-br-none' 
                                        : 'bg-gray-100 dark:bg-gray-800 text-textDark dark:text-gray-100 rounded-bl-none border border-border/5'
                                    }`}
                                    dir={msg.isArabic ? 'rtl' : 'ltr'}
                                >
                                    {msg.text}
                                    <span className={`text-[9px] block mt-1.5 ${
                                        msg.sender === 'user' ? 'text-white/70 text-right' : 'text-gray-400'
                                    }`}>
                                        {msg.time}
                                    </span>
                                </div>

                                {/* Combined Results & Suggestions */}
                                {(msg.data?.length > 0 || msg.suggestions?.length > 0) && (
                                    <div className="mt-3 w-full max-w-[90%] space-y-3">
                                        {/* Main Results */}
                                        {msg.data?.map((item, index) => (
                                            <AiResultCard 
                                                key={item._id || index} 
                                                item={item} 
                                                target={msg.target} 
                                                onClick={() => handleCardClick(item, msg.target)}
                                            />
                                        ))}


                                        {/* Suggestions Separator */}
                                        {msg.suggestions?.length > 0 && (
                                            <div className="pt-2">
                                                <div className="flex items-center gap-2 mb-2 px-1">
                                                    <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-tighter">Recommended Alternatives</span>
                                                    <div className="h-px flex-1 bg-amber-200/50 dark:bg-amber-900/30"></div>
                                                </div>
                                                <div className="space-y-2">
                                                    {msg.suggestions.map((item, index) => (
                                                        <AiResultCard 
                                                            key={`sug-${item._id || index}`} 
                                                            item={item} 
                                                            target={msg.target} 
                                                            isSuggestion={true}
                                                            onClick={() => handleCardClick(item, msg.target)}
                                                        />
                                                    ))}
                                                </div>

                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-none px-4 py-3 border border-border/5 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-gray-900 border-t border-border/5">
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                            className="flex items-end gap-2 bg-gray-100 dark:bg-white/5 rounded-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-primary/20"
                        >
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Ask me anything..."
                                rows="1"
                                className="flex-1 bg-transparent border-none px-4 py-2 text-sm focus:outline-none text-textDark dark:text-white placeholder:text-gray-400 font-medium resize-none max-h-32 custom-scrollbar"
                                style={{ minHeight: '40px' }}
                            />
                            <button 
                                type="submit" 
                                disabled={!inputValue.trim() || isTyping}
                                className="w-10 h-10 bg-primary text-white rounded-xl disabled:opacity-50 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center flex-shrink-0 mb-0.5"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                        </>
                    )}
                </div>
            )}

            {/* Floating FAB */}
            <div className="flex flex-col gap-3 pointer-events-auto items-end">
                <button
                    onClick={toggleChat}
                    className={`group relative flex items-center justify-center shadow-xl transition-all duration-500 z-50 ${
                        isOpen 
                        ? 'w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 text-textDark dark:text-white border border-border/10' 
                        : 'w-16 h-16 rounded-[24px] bg-primary text-white hover:scale-105 hover:-translate-y-1'
                    }`}
                >
                    {isOpen ? <X size={24} /> : (
                        <>
                            <Sparkles size={28} className="animate-pulse" />
                            <span className="absolute right-full mr-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl border border-border/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Ask AI Assistant
                            </span>
                        </>
                    )}
                </button>

                {!isOpen && (
                    <button
                        onClick={openWhatsApp}
                        className="group relative flex items-center justify-center w-14 h-14 rounded-[20px] bg-[#25D366] text-white shadow-lg hover:scale-105 transition-all duration-300"
                    >
                        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default FloatingChatWidget;
