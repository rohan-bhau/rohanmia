'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Calendar, Trash2, Search, Loader2, Users } from 'lucide-react';
import { getLeads, deleteLead } from '@/actions/leads';
import { toast } from 'sonner';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    const data = await getLeads();
    setLeads(data);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    const res = await deleteLead(id);
    if (res.success) {
      setLeads(leads.filter(l => l._id !== id));
      toast.success('Lead deleted');
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Neural <span className="text-primary text-glow">Leads</span>
          </h1>
          <p className="text-gray-400 text-sm italic">Visitor intelligence captured by Aru</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search leads..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white text-sm focus:outline-none focus:border-primary/50 transition-all w-full md:w-[300px]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-[400px] flex flex-col items-center justify-center gap-4 bg-white/5 rounded-[2.5rem] border border-white/10">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="text-primary font-black uppercase italic tracking-widest text-xs">Accessing Neural Database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredLeads.map((lead, index) => (
              <motion.div
                key={lead._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white/5 border border-white/10 rounded-[1.5rem] p-6 hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <User size={30} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{lead.name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 font-medium italic">
                      <span className="flex items-center gap-2">
                        <Mail size={14} className="text-primary" />
                        {lead.email}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar size={14} className="text-primary" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a 
                    href={`mailto:${lead.email}`}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-black uppercase italic tracking-widest hover:bg-primary hover:text-white transition-all"
                  >
                    Contact
                  </a>
                  <button 
                    onClick={() => handleDelete(lead._id)}
                    className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredLeads.length === 0 && (
            <div className="h-[200px] flex flex-col items-center justify-center gap-4 bg-white/5 rounded-[2.5rem] border border-white/10 border-dashed">
              <Users size={32} className="text-gray-600" />
              <p className="text-gray-500 italic">No neural leads found in the current sector.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
