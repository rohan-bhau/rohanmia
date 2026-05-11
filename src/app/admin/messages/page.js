'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Trash2, 
  Mail, 
  User, 
  Calendar, 
  CheckCircle, 
  Search,
  RefreshCcw,
  X,
  Loader2,
  Inbox,
  Clock
} from 'lucide-react';
import { getMessages, deleteMessage, markMessageAsRead } from '@/actions/messages';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function MessagesManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = async () => {
    setRefreshing(true);
    const data = await getMessages();
    setMessages(data);
    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to erase this transmission from the archives?')) {
      const res = await deleteMessage(id);
      if (res.success) {
        toast.success('Transmission erased successfully');
        setMessages(messages.filter(m => m._id !== id));
        if (selectedMessage?._id === id) setSelectedMessage(null);
      } else {
        toast.error('Failed to erase transmission');
      }
    }
  };

  const handleMarkAsRead = async (id) => {
    const res = await markMessageAsRead(id);
    if (res.success) {
      setMessages(messages.map(m => m._id === id ? { ...m, status: 'read' } : m));
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-sm font-black uppercase tracking-[0.4em] text-white/20 animate-pulse text-glow">Decrypting Signals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Transmission Hub</p>
          </div>
          <h2 className="text-6xl md:text-8xl font-black italic text-white tracking-tighter uppercase">
            Signal <span className="text-glow">Center</span>
          </h2>
        </div>

        <div className="flex items-center gap-4">
            <div className="px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl flex items-center gap-3">
                <Inbox size={18} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                    {unreadCount} Unread Signals
                </span>
            </div>
            <button 
                onClick={fetchMessages}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-white/40 hover:text-primary hover:border-primary/20 transition-all"
            >
                <RefreshCcw size={20} className={refreshing ? "animate-spin" : ""} />
            </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-[700px]">
        
        {/* Sidebar / List */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={16} />
                <input 
                    type="text" 
                    placeholder="Search frequency..."
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white focus:outline-none focus:border-primary/50 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredMessages.map((msg) => (
                        <motion.div
                            key={msg._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onClick={() => {
                                setSelectedMessage(msg);
                                if (msg.status === 'unread') handleMarkAsRead(msg._id);
                            }}
                            className={cn(
                                "p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                                selectedMessage?._id === msg._id 
                                    ? "bg-primary/10 border-primary/30 shadow-[0_10px_30px_rgba(14,165,233,0.1)]" 
                                    : "bg-white/[0.02] border-white/5 hover:border-white/20"
                            )}
                        >
                            {msg.status === 'unread' && (
                                <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-2">
                                <h4 className={cn(
                                    "text-[10px] font-black uppercase tracking-widest italic truncate max-w-[150px]",
                                    msg.status === 'unread' ? "text-primary" : "text-white/60"
                                )}>
                                    {msg.name}
                                </h4>
                                <span className="text-[8px] font-black text-white/20 uppercase">
                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-[11px] text-white/40 italic line-clamp-1">
                                {msg.message}
                            </p>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {filteredMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 text-center space-y-4">
                        <Inbox size={48} />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">No Signals Found</p>
                    </div>
                )}
            </div>
        </div>

        {/* Message View */}
        <div className="lg:col-span-8 glass-premium border border-white/5 bg-[#0a0f1a]/40 rounded-[3rem] overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
                {selectedMessage ? (
                    <motion.div 
                        key={selectedMessage._id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="flex flex-col h-full"
                    >
                        {/* Message Header */}
                        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg">
                                    <User size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">{selectedMessage.name}</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
                                            <Mail size={12} className="text-primary" />
                                            {selectedMessage.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
                                            <Calendar size={12} className="text-primary" />
                                            {new Date(selectedMessage.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => handleDelete(selectedMessage._id)}
                                    className="p-4 rounded-2xl bg-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Message Content */}
                        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar relative">
                            {/* Watermark Decoration */}
                            <div className="absolute bottom-10 right-10 opacity-[0.02] pointer-events-none">
                                <MessageSquare size={300} />
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">Transmission Data</span>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                </div>

                                <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 shadow-2xl relative group">
                                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary blur-0 group-hover:scale-110 transition-transform">
                                        <CheckCircle size={20} />
                                    </div>
                                    <p className="text-lg md:text-xl font-medium italic text-white/80 leading-relaxed indent-8">
                                        {selectedMessage.message}
                                    </p>
                                </div>

                                <div className="flex flex-col items-center gap-6 pt-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 italic">Secure Protocol End // Transmitted via Web Interface</p>
                                    <a 
                                        href={`mailto:${selectedMessage.email}`}
                                        className="px-10 py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.3em] text-[10px] italic shadow-[0_15px_30px_rgba(14,165,233,0.3)] hover:shadow-[0_20px_40px_rgba(14,165,233,0.5)] hover:-translate-y-1 transition-all flex items-center gap-4"
                                    >
                                        Establish Reply Channel <Mail size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-8 opacity-20">
                        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                            <Clock size={40} />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-[12px] font-black uppercase tracking-[0.6em] italic">Awaiting Signal Selection</p>
                            <p className="text-[10px] font-medium italic">Choose a transmission from the buffer to begin decryption</p>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
