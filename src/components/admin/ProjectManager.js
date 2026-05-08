'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Star, Edit2, Trash2, Globe, Code2, 
  Database, Image as ImageIcon, X, Upload, Loader2, CheckCircle2, 
  AlertCircle, ChevronDown, Layout, ExternalLink, RefreshCcw
} from 'lucide-react';
import { getProjects, addProject, updateProject, deleteProject, toggleFeaturedProject } from '@/actions/projects';
import { uploadImage } from '@/actions/upload';
import { getIcon } from '@/lib/icons';
import Image from 'next/image';

const CATEGORIES = ['All', 'Fullstack', 'Frontend', 'Backend', 'Open Source'];
const TECH_CATEGORIES = {
  Frontend: [
    { name: 'Next.js', id: 'SiNextdotjs' },
    { name: 'React', id: 'SiReact' },
    { name: 'Tailwind', id: 'SiTailwindcss' },
    { name: 'TypeScript', id: 'SiTypescript' },
    { name: 'JavaScript', id: 'SiJavascript' },
    { name: 'Vue.js', id: 'SiVuedotjs' },
    { name: 'Angular', id: 'SiAngular' },
    { name: 'Svelte', id: 'SiSvelte' },
    { name: 'Redux', id: 'SiRedux' },
    { name: 'Zustand', id: 'SiZustand' },
    { name: 'Framer Motion', id: 'SiFramermotion' },
    { name: 'Three.js', id: 'SiThreedotjs' },
    { name: 'GSAP', id: 'SiGsap' },
    { name: 'Sass', id: 'SiSass' },
    { name: 'MUI', id: 'SiMui' },
    { name: 'Shadcn UI', id: 'SiShadcnui' },
  ],
  Backend: [
    { name: 'Node.js', id: 'SiNodedotjs' },
    { name: 'Express', id: 'SiExpress' },
    { name: 'NestJS', id: 'SiNestjs' },
    { name: 'Python', id: 'SiPython' },
    { name: 'Django', id: 'SiDjango' },
    { name: 'Flask', id: 'SiFlask' },
    { name: 'Go', id: 'SiGo' },
    { name: 'Rust', id: 'SiRust' },
    { name: 'Java', id: 'SiOpenjdk' },
    { name: 'Spring', id: 'SiSpring' },
    { name: 'PHP', id: 'SiPhp' },
    { name: 'Laravel', id: 'SiLaravel' },
    { name: 'GraphQL', id: 'SiGraphql' },
    { name: 'Apollo', id: 'SiApollographql' },
  ],
  Database: [
    { name: 'MongoDB', id: 'SiMongodb' },
    { name: 'PostgreSQL', id: 'SiPostgresql' },
    { name: 'MySQL', id: 'SiMysql' },
    { name: 'Redis', id: 'SiRedis' },
    { name: 'Firebase', id: 'SiFirebase' },
    { name: 'Supabase', id: 'SiSupabase' },
    { name: 'Prisma', id: 'SiPrisma' },
    { name: 'Drizzle', id: 'SiDrizzle' },
    { name: 'Appwrite', id: 'SiAppwrite' },
    { name: 'PlanetScale', id: 'SiPlanetscale' },
  ],
  DevOps: [
    { name: 'Docker', id: 'SiDocker' },
    { name: 'Kubernetes', id: 'SiKubernetes' },
    { name: 'AWS', id: 'SiAmazons3' },
    { name: 'GCP', id: 'SiGooglecloud' },
    { name: 'Azure', id: 'SiMicrosoftazure' },
    { name: 'Vercel', id: 'SiVercel' },
    { name: 'Netlify', id: 'SiNetlify' },
    { name: 'DigitalOcean', id: 'SiDigitalocean' },
    { name: 'Git', id: 'SiGit' },
    { name: 'GitHub Actions', id: 'SiGithubactions' },
    { name: 'Linux', id: 'SiLinux' },
    { name: 'Nginx', id: 'SiNginx' },
  ]
};

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [techSearch, setTechSearch] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    category: 'Fullstack',
    techStack: [],
    liveLink: '',
    clientLink: '',
    serverLink: '',
    featured: false
  });

  const fileInputRef = useRef(null);

  const [isHoveringForm, setIsHoveringForm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (showModal && isHoveringForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showModal, isHoveringForm]);

  const fetchProjects = async () => {
    const data = await getProjects();
    setProjects(data);
    setLoading(false);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData(project);
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        image: '',
        category: 'Fullstack',
        techStack: [],
        liveLink: '',
        clientLink: '',
        serverLink: '',
        featured: false
      });
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);

    const res = await uploadImage(fd);
    setUploading(false);

    if (res.success) {
      setFormData({ ...formData, image: res.url });
      showToast('Visual Asset Uploaded', 'success');
    } else {
      showToast('Upload Failed', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    let res;
    if (editingProject) {
      res = await updateProject(editingProject._id, formData);
    } else {
      res = await addProject(formData);
    }

    setSaving(false);
    if (res.success) {
      setShowModal(false);
      fetchProjects();
      showToast(editingProject ? 'Project Updated' : 'Project Launched', 'success');
    } else {
      showToast('Neural Error: ' + res.error, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this project node forever?')) {
      const res = await deleteProject(id);
      if (res.success) {
        fetchProjects();
        showToast('Project Deleted', 'success');
      }
    }
  };

  const handleToggleFeatured = async (id) => {
    const res = await toggleFeaturedProject(id);
    if (res.success) {
      fetchProjects();
      showToast(res.featured ? 'Featured Activated' : 'Featured Removed', 'success');
    }
  };

  const filteredProjects = projects.filter(p => activeTab === 'All' || p.category === activeTab);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4 opacity-20">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Project Nodes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-12 left-1/2 z-[1000] px-8 py-4 rounded-2xl border backdrop-blur-xl flex items-center gap-4 shadow-2xl ${
              toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-[10px] font-black uppercase tracking-widest italic">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-12">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <Layout className="text-primary animate-pulse" size={20} />
            <h3 className="text-sm font-black uppercase tracking-[0.5em] text-white/20 italic">Project Architecture</h3>
          </div>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
            Manage <span className="text-primary text-glow">Ecosystems</span>
          </h2>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-10 py-5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] italic rounded-2xl shadow-[0_10px_30px_rgba(14,165,233,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus size={16} />
          Launch New Project
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all border ${
              activeTab === cat 
                ? 'bg-primary/10 border-primary/40 text-primary shadow-lg shadow-primary/5' 
                : 'bg-white/[0.02] border-white/5 text-white/20 hover:border-white/20 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {filteredProjects.map((project, i) => (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`group relative bg-card border border-border rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-700 hover:border-primary/40 hover:shadow-[0_30px_80px_rgba(0,0,0,0.5)] ${i % 3 === 1 ? 'lg:mt-20' : i % 3 === 2 ? 'lg:mt-10' : ''}`}
          >
            {/* Interconnect Decoration */}
            <div className="absolute -left-4 top-1/2 w-4 h-px bg-primary/20 hidden lg:block" />
            {/* Admin Control Bar - Floating Overlay */}
            <div className="absolute top-6 right-6 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-500">
              <button 
                onClick={(e) => { e.stopPropagation(); handleToggleFeatured(project._id); }}
                className={`w-10 h-10 rounded-xl backdrop-blur-xl border transition-all flex items-center justify-center ${project.featured ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500' : 'bg-white/5 border-white/10 text-white/40 hover:text-yellow-500'}`}
                title="Toggle Featured Status"
              >
                <Star size={16} fill={project.featured ? "currentColor" : "none"} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleOpenModal(project); }}
                className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/40 hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center"
                title="Edit Project"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}
                className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/40 hover:text-red-500 hover:border-red-500/40 transition-all flex items-center justify-center"
                title="Delete Project"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Cinematic Image Cover */}
            <div className="relative h-96 overflow-hidden">
              <Image 
                src={project.image} 
                alt={project.title} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-transparent opacity-100" />
            </div>

            {/* Card Intelligence Content */}
            <div className="p-8 space-y-8 flex flex-col flex-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary italic px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    {project.category}
                  </span>
                  {project.featured && (
                    <div className="flex items-center gap-2 text-yellow-500 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-[9px] font-black uppercase tracking-widest italic animate-pulse">
                      <Star size={12} fill="currentColor" /> Featured Node
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic group-hover:text-primary transition-colors duration-500">
                  {project.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed font-medium italic line-clamp-3">
                  {project.description}
                </p>
              </div>

              {/* Tech Stack Matrix */}
              <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5 mt-auto">
                {project.techStack.map(t => {
                  const Icon = getIcon(t);
                  return (
                    <div key={t} title={t} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-primary hover:bg-primary/5 transition-all group/icon">
                      <Icon size={16} className="group-hover/icon:scale-110 transition-transform" />
                    </div>
                  );
                })}
              </div>

              {/* Action Pulse Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="w-full py-3.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 opacity-60">
                  <Globe size={12} /> Live Link Active
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 py-3.5 rounded-full bg-white/5 border border-white/10 text-white/20 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <Code2 size={12} /> Client
                  </div>
                  {project.serverLink && (
                    <div className="flex-1 py-3.5 rounded-full bg-white/5 border border-white/10 text-white/20 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                      <Database size={12} /> Server
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Launch Portal (Modal) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
            />
            
            {/* Scrollable Form Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              onMouseEnter={() => setIsHoveringForm(true)}
              onMouseLeave={() => setIsHoveringForm(false)}
              onWheel={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0f1a] border border-white/10 rounded-[3rem] p-10 shadow-2xl pointer-events-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">
                    {editingProject ? 'Edit Protocol' : 'Mission Briefing'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Project Parameters</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                {/* Visual Uplink */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest italic">
                    <ImageIcon size={16} /> Asset Visualization
                  </div>
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="relative h-64 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-black/40 hover:border-primary/40 cursor-pointer transition-all overflow-hidden"
                  >
                    {formData.image ? (
                      <>
                        <Image src={formData.image} alt="Preview" fill className="object-cover opacity-60" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                          <RefreshCcw className="text-white/40 animate-pulse" />
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Click to Swap Visual</p>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-white/20">
                        <Upload size={40} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic text-center px-10">Upload Deployment Visual or Enter URL Below</p>
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="animate-spin text-primary" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Uploading Visual Payload...</p>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  <input 
                    type="text" 
                    placeholder="Direct Image URL (Alternative to upload)"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-[11px] text-white/60 italic"
                  />
                </div>

                {/* Core Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Project Identity</label>
                    <input 
                      required
                      type="text"
                      placeholder="FlatFlow - Management"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-primary transition-all italic"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Category Node</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-primary transition-all italic appearance-none cursor-pointer [color-scheme:dark]"
                    >
                      {CATEGORIES.slice(1).map(c => (
                        <option key={c} value={c} className="bg-[#0a0f1a] text-white py-4">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Mission Objectives (Short Description)</label>
                  <textarea 
                    required
                    placeholder="Briefly describe the purpose of this architecture..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-8 text-sm text-white focus:border-primary transition-all italic resize-none"
                  />
                </div>

                {/* Tech Stack Matrix with Search */}
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Tech Stack Matrix</label>
                    <div className="relative max-w-xs w-full">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={12} />
                      <input 
                        type="text"
                        placeholder="Search Tech..."
                        onChange={(e) => setTechSearch(e.target.value.toLowerCase())}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[10px] text-white focus:border-primary transition-all italic"
                      />
                    </div>
                  </div>

                  <div className="space-y-12 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    {Object.entries(TECH_CATEGORIES).map(([category, techs]) => {
                      const filteredTechs = techs.filter(t => t.name.toLowerCase().includes(techSearch || ''));
                      if (filteredTechs.length === 0) return null;

                      return (
                        <div key={category} className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-white/5" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic">{category}</span>
                            <div className="h-px flex-1 bg-white/5" />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {filteredTechs.map(tech => (
                              <button
                                type="button"
                                key={tech.id}
                                onClick={() => {
                                  const exists = formData.techStack.includes(tech.id);
                                  setFormData({
                                    ...formData,
                                    techStack: exists 
                                      ? formData.techStack.filter(id => id !== tech.id)
                                      : [...formData.techStack, tech.id]
                                  });
                                }}
                                className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                                  formData.techStack.includes(tech.id)
                                    ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10'
                                    : 'bg-white/5 border-white/5 text-white/20 hover:border-white/20'
                                }`}
                              >
                                {getIcon(tech.id)({ size: 16 })}
                                <span className="text-[10px] font-black uppercase tracking-widest italic">{tech.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Communication Links */}
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Communication Links</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white/20 mb-2">
                        <Globe size={12} /> <span className="text-[9px] font-black uppercase tracking-widest">Live Link *</span>
                      </div>
                      <input 
                        required
                        type="url"
                        placeholder="https://flatflow.live"
                        value={formData.liveLink}
                        onChange={(e) => setFormData({...formData, liveLink: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-5 text-[11px] text-white italic"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white/20 mb-2">
                        <Code2 size={12} /> <span className="text-[9px] font-black uppercase tracking-widest">Client Repository *</span>
                      </div>
                      <input 
                        required
                        type="url"
                        placeholder="https://github.com/client"
                        value={formData.clientLink}
                        onChange={(e) => setFormData({...formData, clientLink: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-5 text-[11px] text-white italic"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white/20 mb-2">
                        <Database size={12} /> <span className="text-[9px] font-black uppercase tracking-widest">Server Repository</span>
                      </div>
                      <input 
                        type="url"
                        placeholder="https://github.com/server"
                        value={formData.serverLink}
                        onChange={(e) => setFormData({...formData, serverLink: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-5 text-[11px] text-white italic"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-6 bg-primary text-white text-[11px] font-black uppercase tracking-[0.3em] italic rounded-[2rem] shadow-[0_15px_40px_rgba(14,165,233,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Star size={18} />}
                    {editingProject ? 'Execute Update Protocol' : 'Establish Global Link'}
                  </button>
                  <div className="flex items-center gap-4 px-8 border-l border-white/10">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, featured: !formData.featured})}
                      className={`p-5 rounded-[1.5rem] border transition-all ${
                        formData.featured ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-white/5 border-white/10 text-white/20'
                      }`}
                    >
                      <Star size={20} fill={formData.featured ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
