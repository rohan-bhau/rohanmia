'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { chatWithAru } from '@/actions/ai';
import { saveLead } from '@/actions/leads';
import { usePathname } from 'next/navigation';
import Tooltip from '../shared/Tooltip';
import Link from 'next/link';

export default function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello! I'm Aru. I'm here to represent Rohan and help you explore his work. How's your day going?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIdentified, setIsIdentified] = useState(false);
  const [visitorInfo, setVisitorInfo] = useState({ name: '', email: '' });
  const scrollRef = useRef(null);

  const parseMessage = (text) => {
    if (!text) return "";
    const parts = text.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <Link 
            key={i} 
            href={match[2]} 
            className="inline-flex items-center gap-1 text-primary hover:underline font-black uppercase tracking-tighter decoration-2 underline-offset-4 mx-1 animate-pulse"
          >
            {match[1]}
          </Link>
        );
      }
      return part;
    });
  };

  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const scrollTarget = useRef(0);
  const animationFrame = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const container = containerRef.current;
    if (!wrapper || !container || !isOpen) return;

    // Initialize scrollTarget to current position
    scrollTarget.current = container.scrollTop;

    const smoothScroll = () => {
      const current = container.scrollTop;
      const target = scrollTarget.current;
      // Lerp coefficient for that "liquid" feel
      const diff = target - current;
      const step = diff * 0.15; // Adjusted for smoothness

      if (Math.abs(diff) > 0.5) {
        container.scrollTop += step;
        animationFrame.current = requestAnimationFrame(smoothScroll);
      }
    };

    const handleWheel = (e) => {
      // Capture the wheel input and update our target
      scrollTarget.current += e.deltaY;
      
      // Clamp the target so we don't scroll into infinity
      const maxScroll = container.scrollHeight - container.clientHeight;
      scrollTarget.current = Math.max(0, Math.min(scrollTarget.current, maxScroll));

      // Start the animation loop if not already running
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = requestAnimationFrame(smoothScroll);
      
      // Lock the background page
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    };

    wrapper.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      wrapper.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animationFrame.current);
    };
  }, [isOpen, messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (pathname?.startsWith('/admin')) return null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentMessage = input;
    const userMessage = { role: 'user', content: currentMessage };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const visitorId = localStorage.getItem('visitor_id');
      const updatedHistory = [...messages, userMessage];
      const result = await chatWithAru(updatedHistory, currentMessage, visitorId);
      
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: result.content 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "I'm experiencing a small neural glitch. Let's try that again in a moment!" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (visitorInfo.name && visitorInfo.email) {
      const vid = localStorage.getItem('visitor_id');
      await saveLead({ ...visitorInfo, visitorId: vid });
      setIsIdentified(true);
      setMessages([{ role: 'bot', content: `It's great to meet you, ${visitorInfo.name}! I'm happy to help you with anything related to Rohan's portfolio. What would you like to see first?` }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[4000000] chatbot-container pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={wrapperRef}
            initial={{ opacity: 0, y: 20, scale: 0.8, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-20 right-0 w-[calc(100vw-32px)] sm:w-[380px] md:w-[400px] h-[550px] md:h-[600px] glass-premium border border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden backdrop-blur-3xl bg-black/60 pointer-events-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 shadow-[0_0_15px_rgba(14,165,233,0.3)] bg-background/50">
                    <img src="/aru-avatar.png?v=2" alt="Aru" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse shadow-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight italic">Aru</h3>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Online Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors cursor-pointer z-50">
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div 
              ref={containerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 relative z-[100] pointer-events-auto touch-pan-y"
            >
              {!isIdentified ? (
                /* Welcome & Lead Form */
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 py-4"
                >
                  <div className="space-y-3">
                    <h4 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-tight">
                      Greetings, <br />
                      <span className="text-primary text-glow">Collaborator.</span>
                    </h4>
                    <p className="text-sm text-white/60 italic font-medium">
                      "I'm Aru, Rohan's personal digital representative. Before we dive into the portfolio, may I know who I'm talking to?"
                    </p>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Identity / Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Ex: John Doe"
                        value={visitorInfo.name}
                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-primary transition-colors italic"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Comm Channel / Email</label>
                      <input 
                        required
                        type="email" 
                        placeholder="Ex: john@nexus.com"
                        value={visitorInfo.email}
                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-primary transition-colors italic"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={!visitorInfo.name || !visitorInfo.email}
                      className="w-full py-4 bg-primary text-white font-black uppercase italic tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(14,165,233,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 cursor-pointer"
                    >
                      Initialize Session
                    </button>
                  </form>
                </motion.div>
              ) : (
                /* Chat Messages */
                <div className="space-y-6 pb-2 w-full max-w-full overflow-x-hidden">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm italic font-medium whitespace-pre-wrap break-words ${
                        msg.role === 'user' 
                          ? 'bg-primary text-white rounded-tr-none shadow-[0_10px_30px_rgba(14,165,233,0.2)]' 
                          : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none shadow-xl'
                      }`}>
                        {parseMessage(msg.content)}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center gap-2 italic text-white/40 text-[10px] uppercase font-black tracking-widest">
                        <Loader2 size={14} className="animate-spin text-primary" />
                        Neural Link Active <span className="animate-pulse">...</span>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} className="h-2 w-full" />
                </div>
              )}
            </div>

            {/* Input - Only show if visitor identified */}
            {isIdentified && (
              <div className="p-6 border-t border-white/10">
                <form onSubmit={handleSendMessage} className="relative group">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-14 text-white text-sm focus:outline-none focus:border-primary/50 transition-all italic font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-30 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <Tooltip text="Chat with Aru" position="left">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-[0_0_30px_rgba(14,165,233,0.4)] relative group overflow-hidden"
        >
          <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20 group-hover:opacity-40" />
          {isOpen ? (
            <X size={28} className="relative z-10" />
          ) : (
            <div className="relative w-full h-full p-1">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <img 
                  src="/aru-avatar.png?v=2" 
                  alt="Aru AI" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </motion.button>
      </Tooltip>
    </div>
  );
}
