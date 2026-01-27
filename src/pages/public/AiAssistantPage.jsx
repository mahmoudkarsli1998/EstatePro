import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, Sparkles, X, RotateCcw, Home as HomeIcon, Target, Zap, MessageSquare, Trash2, Plus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { sendChatMessage, getSessions, getSessionHistory, deleteSession } from '../../services/chatService';
import AiResultCard from '../../components/public/AiResultCard';
import { tracker } from '../../services/trackingService';

const AiAssistantPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    // Session state
    const [sessionId, setSessionId] = useState(() => localStorage.getItem('current_chat_session') || null);
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    
    // Chat state - Note: initial message set in useEffect to use t() properly
    const [messages, setMessages] = useState([]);

    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [enableRag, setEnableRag] = useState(true);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Load sessions on mount
    useEffect(() => {
        loadSessions();
        // Initialize with greeting message
        if (messages.length === 0) {
            setMessages([{
                id: 1,
                text: t('aiGreeting'),
                sender: 'ai',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isArabic: false
            }]);
        }
    }, []);

    // Load session history if sessionId exists
    useEffect(() => {
        if (sessionId) {
            loadSessionHistory(sessionId);
        }
    }, []);

    // Auto-grow textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputValue]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadSessions = async () => {
        setLoadingSessions(true);
        try {
            const result = await getSessions(20, 0);
            setSessions(result.sessions || []);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        } finally {
            setLoadingSessions(false);
        }
    };

    const loadSessionHistory = async (sessId) => {
        try {
            const result = await getSessionHistory(sessId);
            if (result.messages && result.messages.length > 0) {
                const formattedMessages = result.messages.map((msg, index) => ({
                    id: index + 1,
                    text: msg.content,
                    sender: msg.role === 'user' ? 'user' : 'ai',
                    data: msg.metadata?.data || [],
                    suggestions: msg.metadata?.suggestions || [],
                    target: msg.metadata?.target,
                    time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isArabic: containsArabic(msg.content)
                }));
                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error('Failed to load session history:', error);
        }
    };

    const containsArabic = (text) => /[\u0600-\u06FF]/.test(text || '');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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
            // Use the new multi-turn chat API
            const response = await sendChatMessage(userMsgText, sessionId, enableRag);
            
            // Store the session ID for future messages
            if (response.sessionId) {
                setSessionId(response.sessionId);
                localStorage.setItem('current_chat_session', response.sessionId);
                
                // Refresh sessions list if this is a new session
                if (response.isNewSession) {
                    loadSessions();
                }
            }
            
            const aiMessageText = response.message || response.explanation || t('aiFoundResults');
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

            // Track AI query
            tracker.aiQuerySent(aiTarget, aiData.length > 0 || aiSuggestions.length > 0);

        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: t('aiErrorMessage'),
                sender: 'ai',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isArabic: false
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const startNewChat = () => {
        setSessionId(null);
        localStorage.removeItem('current_chat_session');
        setMessages([
            { 
                id: Date.now(), 
                text: t('aiGreeting'), 
                sender: 'ai', 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isArabic: false
            }
        ]);
    };

    const handleSessionClick = async (sessId) => {
        if (sessId === sessionId) return;
        setSessionId(sessId);
        localStorage.setItem('current_chat_session', sessId);
        await loadSessionHistory(sessId);
    };

    const handleDeleteSession = async (e, sessId) => {
        e.stopPropagation();
        if (!window.confirm(t('deleteConversation'))) return;
        
        try {
            await deleteSession(sessId);
            setSessions(prev => prev.filter(s => s.sessionId !== sessId));
            
            // If deleting current session, start new chat
            if (sessId === sessionId) {
                startNewChat();
            }
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    const clearHistory = () => {
        if (window.confirm(t('startNewChatConfirm'))) {
            startNewChat();
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

    return (
        <div className="flex h-screen w-screen bg-gray-50 dark:bg-black text-textDark dark:text-white overflow-hidden font-sans">
            {/* Sidebar - Desktop Only */}
            <div className="hidden lg:flex w-80 border-r border-border/10 flex-col bg-white dark:bg-gray-900 shadow-xl z-30">
                <div className="p-8">
                    <Link to="/" className="text-2xl font-bold flex items-center gap-3 mb-10 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-white text-xl font-black">E</span>
                        </div>
                        <span>Estate<span className="text-primary">Pro</span></span>
                    </Link>

                    <button 
                        onClick={startNewChat}
                        className="w-full py-4 px-6 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-wider"
                    >
                        <Plus size={20} /> {t('newChat')}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-2 space-y-2 custom-scrollbar">
                    <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 px-2">
                        {t('recentConversations')}
                    </div>
                    
                    {loadingSessions ? (
                        <div className="text-center py-4 text-gray-400 text-sm">{t('loading')}</div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 text-sm">{t('noConversationsYet')}</div>
                    ) : (
                        sessions.map((session) => (
                            <div 
                                key={session.sessionId}
                                onClick={() => handleSessionClick(session.sessionId)}
                                className={`p-4 rounded-2xl cursor-pointer group transition-all flex items-start justify-between gap-2 ${
                                    session.sessionId === sessionId 
                                        ? 'bg-primary/5 dark:bg-primary/10 border-2 border-primary/20' 
                                        : 'hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-bold truncate ${
                                        session.sessionId === sessionId ? 'text-primary' : 'text-gray-600 dark:text-gray-300'
                                    }`}>
                                        {session.title || t('newChat')}
                                    </div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                        <MessageSquare size={10} />
                                        {session.messageCount || 0} {t('messagesCount')}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteSession(e, session.sessionId)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                >
                                    <Trash2 size={14} className="text-red-500" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-8 border-t border-border/10 space-y-4">
                    <button 
                        onClick={() => navigate('/')} 
                        className="w-full py-4 px-6 flex items-center justify-center gap-3 text-sm font-black text-gray-500 hover:text-primary transition-all bg-gray-100 dark:bg-white/5 rounded-2xl hover:bg-white dark:hover:bg-primary/10 border border-transparent hover:border-primary/10 shadow-sm hover:shadow-md"
                    >
                        <HomeIcon size={18} /> {t('backToWebsite')}
                    </button>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-widest opacity-60">
                         <span>{t('privacy')}</span>
                         <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                         <span>{t('help')}</span>
                    </div>
                </div>
            </div>

            {/* Main Chat Interface */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50/30 dark:bg-black/40 relative">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-border/10 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary text-white rounded-[22px] flex items-center justify-center shadow-2xl shadow-primary/20">
                            <Bot size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="font-black text-xl md:text-2xl text-textDark dark:text-white tracking-tight">{t('aiAdvisor')}</h1>
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tighter rounded-full border border-primary/20">{t('alphaVersion')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-green-500 font-bold mt-1">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                {t('aiIntelligenceActive')}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                         {/* RAG Toggle */}
                         <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 bg-gray-100 dark:bg-white/5 rounded-2xl border border-border/10">
                            <label className="flex items-center gap-3 cursor-pointer group">
                              <div className="flex items-center gap-2">
                                {enableRag ? (
                                  <Sparkles size={16} className="text-primary animate-pulse" />
                                ) : (
                                  <Target size={16} className="text-gray-400" />
                                )}
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                  {enableRag ? t('smartMode') : t('exactMode')}
                                </span>
                              </div>
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={enableRag}
                                  onChange={(e) => setEnableRag(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-purple-600 shadow-inner"></div>
                              </div>
                            </label>
                          </div>

                         <button 
                            onClick={clearHistory} 
                            className="bg-gray-100 dark:bg-white/5 p-3 md:px-5 md:py-3 text-gray-500 hover:text-red-500 transition-all rounded-[20px] hover:bg-white dark:hover:bg-red-900/10 flex items-center gap-2 border border-transparent hover:border-red-100 dark:hover:border-red-900/20"
                            title="New Chat"
                        >
                            <Plus size={20} />
                            <span className="hidden md:inline text-xs font-black uppercase tracking-widest">{t('newChat')}</span>
                        </button>
                        <button 
                            onClick={() => navigate('/')} 
                            className="lg:hidden p-3 bg-primary text-white rounded-[20px]"
                            title="Home"
                        >
                            <HomeIcon size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-10 scrollbar-none">
                    <div className="max-w-4xl mx-auto w-full space-y-12 pb-10">
                        {messages.length === 1 && (
                            <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-top-4 duration-1000">
                                <div className="w-24 h-24 bg-primary/5 dark:bg-primary/20 rounded-[40px] flex items-center justify-center mb-8 rotate-3 shadow-inner">
                                    <Sparkles size={48} className="text-primary animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-black text-textDark dark:text-white mb-4 tracking-tighter">{t('howCanIAssist')}</h2>
                                <p className="text-gray-500 max-w-md text-sm md:text-base font-medium leading-relaxed">{t('aiAssistDescription')}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-2xl px-4">
                                     {[t('suggestVillasNewCairo'), t('suggestInvestmentAreas'), t('suggestUnitsNearAUC'), t('suggestPriceFrom3M')].map((pref, i) => (
                                         <button 
                                            key={i} 
                                            onClick={() => { setInputValue(pref); }}
                                            className="p-5 bg-white dark:bg-gray-800 rounded-3xl border border-border/10 text-left text-sm font-bold text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
                                         >
                                            "{pref}"
                                         </button>
                                     ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[90%] md:max-w-[80%]`}>
                                    <div 
                                        className={`rounded-[32px] px-8 py-5 text-sm md:text-base relative ${
                                            msg.sender === 'user' 
                                            ? 'bg-primary text-white rounded-br-none' 
                                            : 'bg-gray-100 dark:bg-gray-800 text-textDark dark:text-gray-100 rounded-bl-none border border-border/5'
                                        }`}
                                        dir={msg.isArabic ? 'rtl' : 'ltr'}
                                    >
                                        <div className="leading-relaxed">
                                            {msg.text}
                                        </div>
                                        <div className={`text-[10px] mt-4 font-black uppercase tracking-[0.1em] opacity-50 ${
                                            msg.sender === 'user' ? 'text-right' : 'text-left'
                                        }`}>
                                            {msg.time}
                                        </div>
                                    </div>

                                    {/* Data Visuals */}
                                    {(msg.data?.length > 0 || msg.suggestions?.length > 0) && (
                                        <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {msg.data?.map((item, index) => (
                                                <AiResultCard 
                                                    key={item._id || index} 
                                                    item={item} 
                                                    target={msg.target} 
                                                    onClick={() => handleCardClick(item, msg.target)}
                                                />
                                            ))}

                                            {msg.suggestions?.length > 0 && (
                                                <div className="col-span-full pt-8 animate-in fade-in duration-1000 delay-300">
                                                    <div className="flex items-center gap-4 mb-6 px-2">
                                                        <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.3em]">{t('insightsAndSuggestions')}</span>
                                                        <div className="h-[2px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent"></div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100/80 dark:bg-gray-800/80 rounded-[24px] rounded-bl-none px-6 py-4 flex items-center gap-4 border border-border/5 backdrop-blur-xl">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-xs md:text-sm text-gray-500 font-black uppercase tracking-[0.1em]">{t('aiAnalyzingData')}</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area - Truly Floating */}
                <div className="px-6 pb-6 pt-2 md:px-12 md:pb-10 bg-transparent z-40">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                        className="max-w-4xl mx-auto flex items-end gap-4 bg-white dark:bg-gray-800 rounded-[30px] p-3 pr-4 shadow-xl border border-border/10 dark:border-white/5 group transition-all duration-500"
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
                            placeholder={t('askMeAnything')}
                            rows="1"
                            className="flex-1 bg-transparent border-none px-6 py-3 text-base md:text-lg focus:outline-none text-textDark dark:text-white placeholder:text-gray-400 font-medium resize-none max-h-[50vh] custom-scrollbar"
                            style={{ minHeight: '44px' }}
                        />
                        <button 
                            type="submit" 
                            disabled={!inputValue.trim() || isTyping}
                            className="w-12 h-12 bg-primary text-white rounded-full disabled:opacity-30 hover:scale-105 active:scale-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center flex-shrink-0 mb-1"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                    <p className="text-center mt-6 text-[10px] text-gray-400 uppercase font-black tracking-[0.4em] opacity-30 select-none">
                        {t('privateSecureChat')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AiAssistantPage;
