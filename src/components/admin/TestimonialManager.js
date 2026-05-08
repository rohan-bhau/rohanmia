'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquareQuote, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Plus, 
  Star, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  Clock,
  ExternalLink,
  User,
  Briefcase
} from 'lucide-react';
import { getTestimonials, updateTestimonialStatus, deleteTestimonial, addTestimonial } from '@/actions/testimonials';

export default function TestimonialManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'approved'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getTestimonials(false);
    setTestimonials(data);
    setLoading(false);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusUpdate = async (id, status) => {
    const res = await updateTestimonialStatus(id, status);
    if (res.success) {
      showToast(`Testimonial ${status === 'approved' ? 'Authorized' : 'Restricted'}`, 'success');
      fetchData();
    } else {
      showToast('Operation Failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently erase this testimonial archive?')) return;
    const res = await deleteTestimonial(id);
    if (res.success) {
      showToast('Archive Erased', 'success');
      fetchData();
    } else {
      showToast('Erasure Failed', 'error');
    }
  };

  const pendingTestimonials = testimonials.filter(t => t.status === 'pending');
  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4 opacity-20">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Scanning Testimonial Archives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-12 left-1/2 z-[1000000] px-8 py-4 rounded-2xl border backdrop-blur-xl flex items-center gap-4 shadow-2xl ${
              toast.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-[10px] font-black uppercase tracking-widest italic">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <h4 className="text-xl font-black italic uppercase tracking-tight text-white/80">Testimonial Repository</h4>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Moderate and manage client feedback protocols</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex p-1.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2 transition-all ${
                activeTab === 'pending' ? 'bg-primary text-white shadow-lg' : 'text-white/20 hover:text-white'
              }`}
            >
              <Clock size={14} /> Pending ({pendingTestimonials.length})
            </button>
            <button 
              onClick={() => setActiveTab('approved')}
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2 transition-all ${
                activeTab === 'approved' ? 'bg-primary text-white shadow-lg' : 'text-white/20 hover:text-white'
              }`}
            >
              <ShieldCheck size={14} /> Authorized ({approvedTestimonials.length})
            </button>
          </div>
          <button 
            onClick={() => window.open('/testimonials/submit', '_blank')}
            className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-white/40 hover:text-primary transition-all group"
            title="Public Submission Link"
          >
            <ExternalLink size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {(activeTab === 'pending' ? pendingTestimonials : approvedTestimonials).map((t) => (
          <motion.div 
            key={t._id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative glass-premium p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0f1a]/40 hover:border-primary/20 transition-all duration-500"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white italic tracking-tighter uppercase">{t.name}</h4>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase size={10} /> {t.role} {t.company ? `@ ${t.company}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    fill={i < t.rating ? "#0ea5e9" : "transparent"} 
                    className={i < t.rating ? "text-primary" : "text-white/10"} 
                  />
                ))}
              </div>
            </div>

            <p className="text-sm italic text-white/60 leading-relaxed mb-8 font-medium">
              "{t.content}"
            </p>

            <div className="flex justify-between items-center pt-6 border-t border-white/5">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/10 italic">
                Received: {new Date(t.createdAt).toLocaleDateString()}
              </span>
              <div className="flex gap-3">
                {activeTab === 'pending' ? (
                  <button 
                    onClick={() => handleStatusUpdate(t._id, 'approved')}
                    className="px-5 py-2.5 rounded-xl bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest italic hover:bg-green-500 hover:text-white transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Authorize
                  </button>
                ) : (
                  <button 
                    onClick={() => handleStatusUpdate(t._id, 'pending')}
                    className="px-5 py-2.5 rounded-xl bg-yellow-500/10 text-yellow-500 text-[9px] font-black uppercase tracking-widest italic hover:bg-yellow-500 hover:text-white transition-all flex items-center gap-2"
                  >
                    <XCircle size={14} /> Revoke
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(t._id)}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {(activeTab === 'pending' ? pendingTestimonials : approvedTestimonials).length === 0 && (
          <div className="col-span-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] space-y-4 opacity-40">
            <MessageSquareQuote size={32} className="text-white/20" />
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">
              No {activeTab} Feedback Established
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
