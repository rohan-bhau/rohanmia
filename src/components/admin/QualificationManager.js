'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Briefcase, Award, Plus, Trash2, Edit2, Save, X, 
  ChevronUp, ChevronDown, RefreshCw, Calendar, FileText, Tag 
} from 'lucide-react';
import { getQualifications, addQualification, updateQualification, deleteQualification, seedQualifications } from '@/actions/qualification';
import { toast } from 'sonner';

export default function QualificationManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Education',
    title: '',
    subtitle: '',
    date: '',
    description: '',
    accent: 'primary',
    order: 0
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const data = await getQualifications();
    setItems(data);
    setLoading(false);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        type: item.type,
        title: item.title,
        subtitle: item.subtitle,
        date: item.date,
        description: item.description,
        accent: item.accent,
        order: item.order
      });
    } else {
      setEditingItem(null);
      setFormData({
        type: 'Education',
        title: '',
        subtitle: '',
        date: '',
        description: '',
        accent: 'primary',
        order: items.length
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let res;
    if (editingItem) {
      res = await updateQualification(editingItem._id, formData);
    } else {
      res = await addQualification(formData);
    }

    if (res.success) {
      toast.success(editingItem ? 'Milestone Updated' : 'Milestone Integrated');
      setModalOpen(false);
      fetchItems();
    } else {
      toast.error('Operation Failed');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Erase this technical milestone?')) {
      const res = await deleteQualification(id);
      if (res.success) {
        toast.success('Milestone Excised');
        fetchItems();
      }
    }
  };

  const handleSync = async () => {
    if (window.confirm('Sync default qualifications from the blueprint?')) {
      setLoading(true);
      const defaults = [
        { type: 'Education', title: 'B.Sc. in Computer Science', subtitle: 'State University of Engineering', date: '2018 - 2022', description: 'Specialized in Software Architecture and Data Science.', accent: 'primary', order: 0 },
        { type: 'Experience', title: 'Senior Full Stack Developer', subtitle: 'Digital Horizon Inc.', date: '2023 - Present', description: 'Architecting scalable cloud solutions.', accent: 'primary', order: 1 }
      ];
      await seedQualifications(defaults);
      fetchItems();
      setLoading(false);
    }
  };

  const groupedItems = {
    Education: items.filter(i => i.type === 'Education'),
    Experience: items.filter(i => i.type === 'Experience'),
    Certification: items.filter(i => i.type === 'Certification')
  };

  const typeIcons = {
    Education: <GraduationCap size={18} />,
    Experience: <Briefcase size={18} />,
    Certification: <Award size={18} />
  };

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Qualification <span className="text-primary">Hub</span></h2>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest italic opacity-60 pl-1">Educational & Professional Milestone Matrix</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleSync}
            className="flex-1 md:flex-none px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase italic tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
          >
            <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            Sync Blueprint
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex-1 md:flex-none px-6 py-3 bg-primary border border-primary/20 rounded-2xl text-white text-[10px] font-black uppercase italic tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] flex items-center justify-center gap-2"
          >
            <Plus size={14} strokeWidth={3} />
            Integrate Milestone
          </button>
        </div>
      </div>

      {/* Main Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {Object.entries(groupedItems).map(([type, typeItems]) => (
          <div key={type} className="space-y-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 border border-white/10">
                {typeIcons[type]}
              </div>
              <h3 className="text-sm font-black text-white uppercase italic tracking-[0.2em]">{type}</h3>
              <div className="ml-auto text-[10px] font-mono text-gray-500">{typeItems.length} Nodes</div>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {typeItems.map((item, idx) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative bg-[#0a0f1a]/40 border border-white/5 p-6 rounded-3xl hover:border-primary/30 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.accent === 'primary' ? 'bg-primary' : 'bg-accent'}`} />
                          <h4 className="text-lg font-black text-white uppercase italic tracking-tight group-hover:text-primary transition-colors">{item.title}</h4>
                        </div>
                        <p className="text-gray-400 text-xs font-bold italic pl-3.5 opacity-80">{item.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-primary hover:border-primary/40 transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item._id)}
                          className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-red-500 hover:border-red-500/40 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-[9px] font-mono text-gray-600 bg-white/[0.02] px-2 py-1 rounded flex items-center gap-2">
                        <Calendar size={10} className="text-primary" />
                        {item.date}
                      </div>
                      <div className="text-[8px] font-black uppercase text-gray-700 tracking-tighter">
                        Node_Active // Order_{item.order}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {typeItems.length === 0 && (
                <div className="h-24 flex flex-col items-center justify-center gap-2 bg-white/[0.02] border border-white/5 border-dashed rounded-3xl">
                  <RefreshCw size={20} className="text-gray-700" />
                  <p className="text-[10px] text-gray-600 font-bold uppercase italic tracking-widest">No Active Nodes</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Integration Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-[#0d121f] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                    {editingItem ? <Edit2 size={22} /> : <Plus size={24} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                      {editingItem ? 'Modify' : 'Integrate'} <span className="text-primary">Milestone</span>
                    </h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic pl-0.5">Configuration Interface // Section 0x1</p>
                  </div>
                </div>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-white hover:border-white/20 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Type Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <Tag size={12} className="text-primary" /> Sector Type
                    </label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Education" className="bg-[#0d121f] text-white">Academic (Education)</option>
                      <option value="Experience" className="bg-[#0d121f] text-white">Professional (Experience)</option>
                      <option value="Certification" className="bg-[#0d121f] text-white">Accreditation (Certification)</option>
                    </select>
                  </div>

                  {/* Accent Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <Tag size={12} className="text-primary" /> Visual Accent
                    </label>
                    <div className="flex gap-4 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, accent: 'primary'})}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all ${formData.accent === 'primary' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                      >
                        Primary
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, accent: 'accent'})}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all ${formData.accent === 'accent' ? 'bg-[#9333ea] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                      >
                        Accent
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Milestone Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. B.Sc. in Computer Science"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Entity / Institution</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Digital Horizon Inc."
                      value={formData.subtitle}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Temporal Duration</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 2023 - Present"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Sequence Order</label>
                    <input 
                      type="number" 
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Description / Core Achievement</label>
                  <textarea 
                    placeholder="Briefly describe your key responsibilities or academic focus..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-4 text-white text-sm font-medium focus:outline-none focus:border-primary/50 transition-all resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-8 py-5 bg-primary border border-primary/20 rounded-[1.5rem] text-white text-xs font-black uppercase italic tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_15px_30px_rgba(14,165,233,0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} strokeWidth={3} />}
                    {editingItem ? 'Synchronize Milestone' : 'Integrate Milestone'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-8 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] text-white text-xs font-black uppercase italic tracking-[0.2em] hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
