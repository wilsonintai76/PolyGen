
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAssistant } from '../services/aiService';
import ReactMarkdown from 'react-markdown';

export const PolyGenAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "Hello! I'm PolyGen Assistant. Paste your syllabus or topic text here, and I'll suggest appropriate CONSTRUCT (GS/SS) descriptions for your CIST." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAssistant(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] no-print">
      {isOpen ? (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-[32px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-black text-xs">PG</div>
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-tight">PolyGen Assistant</h3>
                <p className="text-blue-400 text-[8px] font-bold uppercase tracking-widest">OBE Expert Chatbot</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition text-2xl font-bold">&times;</button>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-200 shadow-sm'
                }`}>
                  <div className="markdown-body prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="relative">
              <textarea 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pr-12 outline-none focus:border-blue-400 transition text-xs font-medium resize-none h-20 custom-scrollbar"
                placeholder="Paste syllabus/topic text here..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-3 bottom-3 w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50 shadow-lg"
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-600 transition-all transform hover:scale-110 active:scale-95 group"
        >
          <span className="text-2xl group-hover:hidden">🤖</span>
          <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block">Chat</span>
        </button>
      )}
    </div>
  );
};
