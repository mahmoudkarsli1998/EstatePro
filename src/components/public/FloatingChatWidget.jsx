import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Bot, X, Send, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../shared/Button';

const FloatingChatWidget = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! Needs help finding your dream property? Ask me anything!", sender: 'ai', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponses = [
                "I can certainly help with that! Could you specify your preferred location?",
                "We have several units matching your criteria. Would you like to see 3D tours?",
                "That's a great choice! Let me pull up the latest pricing for you.",
                "Our agents are also available on WhatsApp if you prefer direct contact."
            ];
            const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
            
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: randomResponse,
                sender: 'ai',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setIsTyping(false);
        }, 1500);
    };

    const toggleChat = () => {
       setIsOpen(!isOpen);
    };

    const openWhatsApp = () => {
       window.open('https://wa.me/1234567890', '_blank'); // Replace with actual number
    };

    return (
        <div className="fixed bottom-6 z-50 flex flex-col items-end gap-4 right-6 pointer-events-none">
            
            {/* Chat Window */}
            {isOpen && (
                <div className="pointer-events-auto w-[350px] max-w-[calc(100vw-48px)] h-[500px] max-h-[60vh] bg-background dark:bg-dark-card border border-border/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right mb-2">
                    {/* Header */}
                    <div className="p-4 bg-primary text-white flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-full">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">AI Assistant</h3>
                                <span className="flex items-center gap-1 text-[10px] opacity-90">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                                </span>
                            </div>
                        </div>
                        <button onClick={toggleChat} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-section/30 dark:bg-black/20 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm relative group ${
                                    msg.sender === 'user' 
                                    ? 'bg-primary text-white rounded-br-none' 
                                    : 'bg-white dark:bg-gray-800 text-textDark dark:text-gray-100 rounded-bl-none border border-border/10'
                                }`}>
                                    {msg.text}
                                    <span className={`text-[9px] block mt-1 ${
                                        msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                                    }`}>
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 text-gray-500 rounded-2xl rounded-bl-none px-4 py-3 text-sm border border-border/10 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-background dark:bg-dark-card border-t border-border/10">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-section/50 dark:bg-white/5 border border-border/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-textDark dark:text-white placeholder:text-gray-400"
                            />
                            <button 
                                type="submit" 
                                disabled={!inputValue.trim()}
                                className="p-2 bg-primary text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center aspect-square"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Buttons */}
            <div className="flex flex-col gap-3 pointer-events-auto items-end">
                {/* AI Chat Button */}
                <button
                    onClick={toggleChat}
                    className={`group relative flex items-center justify-center w-16 h-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 z-50 animate-[bounce_2s_infinite] delay-700 ${
                        isOpen ? 'bg-background dark:bg-dark-card text-textDark dark:text-white rotate-90' : 'bg-primary text-white hover:scale-110'
                    }`}
                    title="Chat with AI"
                >
                    {isOpen ? <X size={28} /> : <Sparkles size={28} className={isOpen ? '' : 'animate-pulse'} />}
                    {/* Tooltip/Label */}
                     {!isOpen && (
                        <span className="absolute right-full mr-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold px-4 py-2 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            AI Assistant
                        </span>
                     )}
                </button>

                {/* WhatsApp Button */}
                <button
                    onClick={openWhatsApp}
                    className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-[#25D366] text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 z-50 animate-[bounce_2s_infinite]"
                    title="Chat on WhatsApp"
                >
                    <svg viewBox="0 0 24 24" className="w-9 h-9 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    {/* Tooltip/Label */}
                     <span className="absolute right-full mr-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold px-4 py-2 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        WhatsApp Us
                    </span>
                </button>
            </div>
        </div>
    );
};

export default FloatingChatWidget;
