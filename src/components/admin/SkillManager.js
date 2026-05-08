'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Layout, Palette, Code2, Sparkles, 
  Zap, Globe, Search, X, Check, ArrowRight, Layers
} from 'lucide-react';
import { getSkillCategories, addSkillCategory, updateSkillCategory, deleteSkillCategory } from '@/actions/skills';
import { getIcon } from '@/lib/icons';
import * as LucideIcons from 'lucide-react';

// Common Lucide icons for categories
const CATEGORY_ICONS = [
  { name: 'Layout', icon: Layout },
  { name: 'Palette', icon: Palette },
  { name: 'Code2', icon: Code2 },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Zap', icon: Zap },
  { name: 'Globe', icon: Globe },
  { name: 'Layers', icon: Layers },
  { name: 'Cpu', icon: LucideIcons.Cpu },
  { name: 'Database', icon: LucideIcons.Database },
  { name: 'Terminal', icon: LucideIcons.Terminal }
];

export default function SkillManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isHoveringForm, setIsHoveringForm] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    icon: 'Layout',
    skills: []
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (showModal && isHoveringForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showModal, isHoveringForm]);

  const fetchCategories = async () => {
    const data = await getSkillCategories();
    setCategories(data);
    setLoading(false);
  };

  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        title: cat.title,
        icon: cat.icon,
        skills: [...cat.skills]
      });
    } else {
      setEditingCategory(null);
      setFormData({
        title: '',
        icon: 'Layout',
        skills: [{ name: '', level: 80, icon: 'SiNextdotjs' }]
      });
    }
    setShowModal(true);
  };

  const handleAddSkillField = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, { name: '', level: 80, icon: 'SiReact' }]
    });
  };

  const handleRemoveSkillField = (index) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  const handleSkillChange = (index, field, value) => {
    const newSkills = [...formData.skills];
    newSkills[index][field] = value;
    setFormData({ ...formData, skills: newSkills });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = editingCategory 
      ? await updateSkillCategory(editingCategory._id, formData)
      : await addSkillCategory(formData);

    if (result.success) {
      showNotification(`Category ${editingCategory ? 'Updated' : 'Created'} Successfully`);
      setShowModal(false);
      fetchCategories();
    } else {
      showNotification(result.error, 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Erase this technical tier permanently?')) {
      const result = await deleteSkillCategory(id);
      if (result.success) {
        showNotification('Category Erased');
        fetchCategories();
      }
    }
  };

  if (loading && categories.length === 0) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Active Repositories</h2>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{categories.length} Tiers Defined</p>
          </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-8 py-4 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:shadow-[0_10px_30px_rgba(14,165,233,0.3)] transition-all active:scale-95"
        >
          <Plus size={16} /> Establish New Tier
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {categories.map((cat, i) => {
          const CatIcon = LucideIcons[cat.icon] || Layout;
          return (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card/30 border border-border rounded-[3.5rem] p-12 backdrop-blur-xl relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <CatIcon size={140} />
              </div>

              {/* Admin Overlay */}
              <div className="absolute top-8 right-8 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-500">
                <button 
                  onClick={() => handleOpenModal(cat)}
                  className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/40 hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(cat._id)}
                  className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/40 hover:text-red-500 hover:border-red-500/40 transition-all flex items-center justify-center"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="relative z-10 space-y-12">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <CatIcon size={32} />
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">{cat.title}</h2>
                </div>

                <div className="space-y-10">
                  {cat.skills.map((skill) => {
                    const SkillIcon = getIcon(skill.icon);
                    return (
                      <div key={skill.name} className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            {SkillIcon && <SkillIcon className="text-primary" size={20} />}
                            <span className="text-sm font-black text-white uppercase tracking-widest italic">{skill.name}</span>
                          </div>
                          <span className="text-xs font-mono text-primary font-bold">{skill.level}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.level}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary/50 to-primary relative"
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-[shimmer_2s_infinite]" />
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Skill Category Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-2xl pointer-events-auto"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              onMouseEnter={() => setIsHoveringForm(true)}
              onMouseLeave={() => setIsHoveringForm(false)}
              onWheel={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0f1a] border border-white/10 rounded-[3.5rem] p-12 shadow-2xl pointer-events-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="space-y-2">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                    {editingCategory ? 'Edit Tier' : 'Establish Tier'}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-primary/50" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Technical Repository</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                {/* Category Basics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Tier Title</label>
                    <input 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-primary transition-all italic font-medium"
                      placeholder="e.g., Framework Architecture"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Tier Icon (Lucide)</label>
                    <select 
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-primary transition-all italic [color-scheme:dark]"
                    >
                      {CATEGORY_ICONS.map(i => (
                        <option key={i.name} value={i.name} className="bg-[#0a0f1a]">{i.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Skills Management */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Technical Components</label>
                    <button 
                      type="button"
                      onClick={handleAddSkillField}
                      className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:bg-primary/10 px-4 py-2 rounded-full transition-all border border-primary/20"
                    >
                      <Plus size={12} /> Append Component
                    </button>
                  </div>

                  <div className="space-y-6">
                    {formData.skills.map((skill, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/5 border border-white/10 p-8 rounded-[2rem] relative group/item"
                      >
                        <button 
                          type="button"
                          onClick={() => handleRemoveSkillField(index)}
                          className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">Component Name</label>
                            <input 
                              required
                              value={skill.name}
                              onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-xs text-white focus:border-primary transition-all italic"
                              placeholder="Next.js"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">Proficiency ({skill.level}%)</label>
                            <input 
                              type="range"
                              min="0"
                              max="100"
                              value={skill.level}
                              onChange={(e) => handleSkillChange(index, 'level', parseInt(e.target.value))}
                              className="w-full accent-primary bg-white/5 h-2 rounded-full cursor-pointer mt-4"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">Icon (Si ID)</label>
                            <input 
                              required
                              value={skill.icon}
                              onChange={(e) => handleSkillChange(index, 'icon', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-xs text-white focus:border-primary transition-all italic"
                              placeholder="SiNextdotjs"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="submit"
                    className="flex-1 py-6 rounded-[2rem] bg-primary text-white text-xs font-black uppercase tracking-[0.3em] italic flex items-center justify-center gap-4 hover:shadow-[0_20px_50px_rgba(14,165,233,0.4)] transition-all active:scale-[0.98]"
                  >
                    <Check size={20} /> Establish Global Nexus
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-12 left-1/2 -translate-x-1/2 px-10 py-5 rounded-[2rem] backdrop-blur-2xl border flex items-center gap-4 z-[11000] shadow-2xl ${
              toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-primary/10 border-primary/20 text-primary'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              toast.type === 'error' ? 'bg-red-500/20' : 'bg-primary/20'
            }`}>
              {toast.type === 'error' ? <X size={20} /> : <Check size={20} />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
