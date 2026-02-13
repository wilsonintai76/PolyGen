
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { LatexRenderer } from '../common/LatexRenderer';

export const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'Hello! I am your PolyGen assistant. I can help you draft questions, suggest CLO mappings, or format LaTeX. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use a ref to persist the chat session across renders without triggering re-renders
  const chatSession = useRef<Chat | null>(null);

  useEffect(() => {
    // Initialize the chat session once
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSession.current = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: "You are PolyGen AI, an expert academic assistant for polytechnic lecturers. Your goal is to help them create high-quality assessment papers. You can suggest topics, help draft questions based on Bloom's Taxonomy, map questions to Course Learning Outcomes (CLOs), and provide LaTeX formatting for equations. Be concise, professional, and encouraging.",
            },
        });
    } catch (e) {
        console.error("Failed to initialize AI Chat", e);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      if (!chatSession.current) {
         // Fallback initialization if it failed initially or wasn't ready
         const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
         chatSession.current = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: "You are PolyGen AI, an expert academic assistant for polytechnic lecturers.",
            },
         });
      }
    
      const response = await chatSession.current.sendMessage({ message: userMsg });
      const text = response.text;
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error connecting to the server. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none print:hidden">
      {/* Chat Window */}
      <div className={`pointer-events-auto bg-white rounded-3xl shadow-2xl border border-slate-200 w-80 md:w-96 transition-all duration-300 origin-bottom-right overflow-hidden flex flex-col mb-4 ${isOpen ? 'scale-100 opacity-100 h-[500px]' : 'scale-75 opacity-0 h-0 w-0'}`}>
        {/* Header */}
        <div className="bg-slate-900 p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">🤖</div>
                <div>
                    <h3 className="font-bold text-white text-sm">PolyGen Assistant</h3>
                    <p className="text-[10px] text-blue-200 uppercase tracking-widest">Powered by Gemini</p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                    }`}>
                        <LatexRenderer text={msg.text} />
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <div className="flex gap-2">
                <input 
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-400 transition"
                    placeholder="Ask about topics, questions..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isLoading}
                />
                <button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-600 text-white w-9 h-9 rounded-xl flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${isOpen ? 'bg-slate-700 text-slate-300' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'}`}
      >
        {isOpen ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
             </svg>
        ) : (
             <span className="text-2xl">🤖</span>
        )}
      </button>
    </div>
  );
};
