'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  RefreshCcw, 
  Trash2, 
  ArrowRight,
  Clock,
  User,
  Shield,
  Search,
  ChevronRight,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Layout
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { getDashboardData } from '@/actions/analytics';
import { deleteAIChatLog } from '@/actions/ai';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import ContentManager from '@/components/admin/ContentManager';

const iconMap = {
  users: Users,
  eye: Eye,
  message: MessageSquare,
  trending: TrendingUp
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' or 'content'

  const fetchData = async () => {
    setRefreshing(true);
    const result = await getDashboardData();
    if (result) {
      setData(result);
    }
    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-sm font-black uppercase tracking-[0.4em] text-white/20 animate-pulse">Syncing Neural Data...</p>
      </div>
    );
  }

  if (!data) return <div>Failed to load dashboard data.</div>;

  return (
    <div className="space-y-12 pb-20">
      {/* Header with Navigation Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Neural Network Active</p>
          </div>
          <h2 className="text-6xl md:text-8xl font-black italic text-white tracking-tighter uppercase">
            Admin <span className="text-glow">Nexus</span>
          </h2>
        </div>

        <div className="flex items-center p-2 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic transition-all flex items-center gap-3",
              activeTab === 'analytics' ? "bg-primary text-white shadow-lg" : "text-white/20 hover:text-white"
            )}
          >
            <TrendingUp size={16} />
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            className={cn(
              "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic transition-all flex items-center gap-3",
              activeTab === 'content' ? "bg-primary text-white shadow-lg" : "text-white/20 hover:text-white"
            )}
          >
            <Layout size={16} />
            Content
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'analytics' ? (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-20"
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {data.stats.map((stat, i) => {
                const Icon = iconMap[stat.icon] || TrendingUp;
                return (
                  <div key={stat.label} className="group relative">
                    <div className="absolute inset-0 bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
                    <div className="relative glass-premium p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0f1a]/40 backdrop-blur-3xl space-y-6 hover:border-primary/20 transition-all duration-500">
                      <div className="flex justify-between items-start">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                          <Icon size={28} strokeWidth={1.5} />
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] italic ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                          {stat.change}
                          <ArrowUpRight size={14} className={stat.positive ? '' : 'rotate-90'} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">{stat.label}</p>
                        <h3 className="text-4xl font-black tracking-tight italic">{stat.value}</h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Middle Deck: Chart & Signals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 glass-premium p-10 rounded-[3rem] border border-white/5 bg-[#0a0f1a]/40 space-y-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black italic uppercase tracking-tight">Visitor Analytics</h3>
                  <button onClick={fetchData} className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-primary transition-all">
                    <RefreshCcw size={18} className={refreshing ? "animate-spin" : ""} />
                  </button>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.chartData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff10" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff10" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0a0f1a', border: '1px solid #ffffff10', borderRadius: '16px' }} />
                      <Area type="monotone" dataKey="views" stroke="#0ea5e9" strokeWidth={4} fill="url(#colorViews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-premium p-10 rounded-[3rem] border border-white/5 bg-[#0a0f1a]/40 flex flex-col space-y-8">
                <h3 className="text-2xl font-black italic uppercase tracking-tight">Recent Signals</h3>
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  {data.recentMessages.map((msg) => (
                    <div key={msg._id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-primary italic">{msg.name}</span>
                        <span className="text-[8px] text-white/20 uppercase font-black">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                      </div>
                      <p className="text-[11px] text-white/40 italic line-clamp-2">"{msg.message}"</p>
                    </div>
                  ))}
                  {data.recentMessages.length === 0 && <div className="h-full flex items-center justify-center text-[10px] uppercase font-black text-white/10 italic">No Signals Detected</div>}
                </div>
              </div>
            </div>

            {/* Lower Deck: Neural Archives */}
            <div className="space-y-10">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">Neural Archives</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">AI Cognitive Interaction Logs</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.aiLogs.map((log) => (
                  <div key={log._id} className="group/log relative p-8 rounded-[2.5rem] glass-premium border border-white/5 hover:border-accent/40 bg-white/[0.02] transition-all duration-500">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent ring-1 ring-accent/20">
                          <User size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white italic tracking-tight">{log.name}</h4>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{log.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={async () => { if(confirm('Erase Archive?')) { await deleteAIChatLog(log._id); fetchData(); } }}
                        className="p-3 rounded-xl hover:bg-red-500/10 text-white/10 hover:text-red-500 transition-all opacity-0 group-hover/log:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-black/40 border border-white/5 italic text-[11px] text-white/60 line-clamp-2 leading-relaxed">
                        "{log.messages[log.messages.length - 1]?.content}"
                      </div>
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="w-full py-4 rounded-xl bg-accent/10 text-accent text-[9px] font-black uppercase tracking-[0.2em] italic hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        Decipher Transcript <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ContentManager />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-6 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLog(null)} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-4xl h-[80vh] glass-premium border border-white/10 rounded-[3rem] flex flex-col overflow-hidden bg-[#0a0f1a]">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Shield className="text-accent" size={24} />
                  <div>
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">{selectedLog.name}</h2>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{selectedLog.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedLog(null)} className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-6">
                {selectedLog.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-5 rounded-2xl text-xs italic font-medium ${msg.role === 'user' ? 'bg-primary/20 text-primary rounded-tr-none' : 'bg-white/5 text-white/80 rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
