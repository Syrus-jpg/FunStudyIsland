import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

const PetChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '嗨！我是你的智能学习伙伴。今天有什么我可以帮你的吗？' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            // Note: Backend endpoint /chat is currently at the root 'http://localhost:8000/chat' based on app/main.py
            const res = await axios.post('http://localhost:8000/chat', {
                message: userMsg
            }, {
                params: { message: userMsg } // The backend expect message as a query param or body? 
                // Re-checking app/main.py: @app.post("/chat") async def chat_with_pet(message: str, ...)
            });

            setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
        } catch (err) {
            console.error("Chat failed", err);
            setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，我现在有点开小差了，请稍后再试。' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Entry (The Egg) */}
            <motion.div
                drag
                dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                className="fixed bottom-12 right-12 z-50"
            >
                <motion.button
                    whileHover={{ y: -10, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-16 h-16 bg-white rounded-2xl shadow-xl border border-[#edeeef] flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-90' : ''}`}
                >
                    <span className="text-3xl">{isOpen ? <X className="w-8 h-8 text-gray-400" /> : '🥚'}</span>
                    {!isOpen && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></div>
                    )}
                </motion.button>
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-32 right-12 w-[380px] h-[550px] bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-[#edeeef] flex flex-col z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-[#f7f7f5] flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#f7f7f5] rounded-xl flex items-center justify-center text-2xl">🥚</div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#37352f]">智能助教</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">在线陪伴中</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-[#f7f7f5] rounded-full transition-colors opacity-40">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide bg-[#fcfcfb]">
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-[#37352f] text-white shadow-sm'
                                            : 'bg-white border border-[#edeeef] text-[#37352f] shadow-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-[#edeeef] p-3.5 rounded-2xl shadow-sm flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin opacity-40" />
                                        <span className="text-xs opacity-40 italic">正在思考中...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-[#f7f7f5]">
                            <div className="relative">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="问我任何关于英语学习的问题..."
                                    className="w-full bg-[#f7f7f5] border-none rounded-2xl py-3 pl-4 pr-12 text-sm focus:ring-1 focus:ring-blue-100 resize-none min-h-[50px] max-h-[120px]"
                                    rows={1}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading}
                                    className="absolute right-2 bottom-2 p-2 bg-[#37352f] text-white rounded-xl disabled:opacity-20 hover:bg-black transition-all active:scale-90"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="mt-2 flex items-center gap-2 opacity-30 px-1">
                                <Sparkles className="w-3 h-3" />
                                <span className="text-[10px] font-medium font-sans italic">由 Google Gemini 1.5 Pro 强力驱动</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PetChat;
