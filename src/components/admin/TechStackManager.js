'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Star, Search, X, Check, 
  Cpu, Database, Terminal, Code2, Globe, Layout, Palette, Zap, Layers, RefreshCw
} from 'lucide-react';
import { getTechStacks, addTech, updateTech, deleteTech, toggleTopSkill, seedTechStack } from '@/actions/techstack';
import { getIcon } from '@/lib/icons';

const TECH_CATEGORIES_PRESETS = {
  Programming: [
    { name: 'JavaScript', id: 'SiJavascript' },
    { name: 'TypeScript', id: 'SiTypescript' },
    { name: 'Python', id: 'FaPython' },
    { name: 'Java', id: 'SiOpenjdk' },
    { name: 'C++', id: 'SiCplusplus' },
    { name: 'C#', id: 'SiCsharp' },
    { name: 'PHP', id: 'SiPhp' },
    { name: 'Ruby', id: 'SiRuby' },
    { name: 'Go', id: 'SiGo' },
    { name: 'Rust', id: 'SiRust' },
    { name: 'Kotlin', id: 'SiKotlin' },
    { name: 'Dart', id: 'SiDart' },
  ],
  Frontend: [
    { name: 'Next.js', id: 'TbBrandNextjs' },
    { name: 'React', id: 'FaReact' },
    { name: 'Vue.js', id: 'SiVuedotjs' },
    { name: 'Angular', id: 'SiAngular' },
    { name: 'Tailwind CSS', id: 'SiTailwindcss' },
    { name: 'Sass', id: 'SiSass' },
    { name: 'Three.js', id: 'SiThreedotjs' },
    { name: 'Framer Motion', id: 'SiFramer' },
    { name: 'GSAP', id: 'SiGreensock' },
  ],
  Backend: [
    { name: 'Node.js', id: 'FaNodeJs' },
    { name: 'Express.js', id: 'SiExpress' },
    { name: 'Django', id: 'SiDjango' },
    { name: 'Laravel', id: 'SiLaravel' },
    { name: 'Spring Boot', id: 'SiSpringboot' },
    { name: 'FastAPI', id: 'SiFastapi' },
  ],
  Mobile: [
    { name: 'Flutter', id: 'SiFlutter' },
    { name: 'React Native', id: 'SiReact' },
    { name: 'Swift', id: 'SiSwift' },
    { name: 'Ionic', id: 'SiIonic' },
    { name: 'Expo', id: 'SiExpo' },
  ],
  Database: [
    { name: 'MongoDB', id: 'SiMongodb' },
    { name: 'PostgreSQL', id: 'SiPostgresql' },
    { name: 'MySQL', id: 'SiMysql' },
    { name: 'Redis', id: 'SiRedis' },
    { name: 'Firebase', id: 'SiFirebase' },
    { name: 'Supabase', id: 'SiSupabase' },
    { name: 'Prisma', id: 'SiPrisma' },
  ],
  Design: [
    { name: 'Figma', id: 'SiFigma' },
    { name: 'Adobe Photoshop', id: 'SiAdobephotoshop' },
    { name: 'Adobe Illustrator', id: 'SiAdobeillustrator' },
    { name: 'Adobe XD', id: 'SiAdobexd' },
    { name: 'Adobe After Effects', id: 'SiAdobeaftereffects' },
    { name: 'Sketch', id: 'SiSketch' },
    { name: 'Canva', id: 'SiCanva' },
    { name: 'Blender', id: 'SiBlender' },
  ],
  "Coding Tools": [
    { name: 'VS Code', id: 'VscVscode' },
    { name: 'WebStorm', id: 'SiWebstorm' },
    { name: 'IntelliJ IDEA', id: 'SiIntellijidea' },
    { name: 'PyCharm', id: 'SiPycharm' },
    { name: 'Android Studio', id: 'SiAndroidstudio' },
    { name: 'Xcode', id: 'SiXcode' },
    { name: 'Sublime Text', id: 'SiSublimetext' },
    { name: 'Vim', id: 'SiVim' },
    { name: 'Postman', id: 'SiPostman' },
    { name: 'Docker', id: 'SiDocker' },
    { name: 'Git', id: 'SiGit' },
  ]
};

const TECH_BRAND_COLORS = {
  "Next.js": "#ffffff",
  "React": "#61DAFB",
  "TypeScript": "#3178C6",
  "Tailwind CSS": "#06B6D4",
  "Three.js": "#ffffff",
  "GSAP": "#88CE02",
  "Framer Motion": "#E10098",
  "Node.js": "#339933",
  "Express.js": "#ffffff",
  "Python": "#3776AB",
  "Golang": "#00ADD8",
  "MongoDB": "#47A248",
  "PostgreSQL": "#4169E1",
  "Prisma": "#2D3748",
  "Redis": "#DC382D",
  "Docker": "#2496ED",
  "Kubernetes": "#326CE5",
  "AWS": "#FF9900",
  "Vercel": "#ffffff",
  "Supabase": "#3ECF8E",
  "Appwrite": "#F02E65",
  "Figma": "#F24E1E",
  "VS Code": "#007ACC",
  "Postman": "#FF6C37",
  "Stripe": "#635BFF",
  "JavaScript": "#F7DF1E",
  "Zod": "#3068b7",
  "Zustand": "#443e38",
  "Java": "#ED8B00",
  "C++": "#00599C",
  "C#": "#239120",
  "PHP": "#777BB4",
  "Ruby": "#CC342D",
  "Go": "#00ADD8",
  "Rust": "#000000",
  "Kotlin": "#7F52FF",
  "Dart": "#0175C2",
  "Angular": "#DD0031",
  "Vue.js": "#4FC08D",
  "Sass": "#CC6699",
  "Django": "#092E20",
  "Laravel": "#FF2D20",
  "Spring Boot": "#6DB33F",
  "FastAPI": "#05998B",
  "Flutter": "#02569B",
  "React Native": "#61DAFB",
  "Swift": "#F05138",
  "Ionic": "#3880FF",
  "Expo": "#000020",
  "MySQL": "#4479A1",
  "Firebase": "#FFCA28",
  "Adobe Photoshop": "#31A8FF",
  "Adobe Illustrator": "#FF9A00",
  "Adobe XD": "#FF61F6",
  "Adobe After Effects": "#CF96FD",
  "Sketch": "#F7B500",
  "Canva": "#00C4CC",
  "Blender": "#F5792A",
  "WebStorm": "#000000",
  "IntelliJ IDEA": "#000000",
  "PyCharm": "#000000",
  "Android Studio": "#3DDC84",
  "Xcode": "#147EFB",
  "Sublime Text": "#FF9800",
  "Vim": "#019733",
  "Git": "#F05032"
};

export default function TechStackManager() {
  const [techList, setTechList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [isHoveringForm, setIsHoveringForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [techSearch, setTechSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    category: 'Frontend',
    proficiency: 90,
    isTopSkill: false,
    color: '#0ea5e9'
  });

  useEffect(() => {
    fetchTech();
  }, []);

  useEffect(() => {
    if (showModal && isHoveringForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showModal, isHoveringForm]);

  const fetchTech = async () => {
    const data = await getTechStacks();
    setTechList(data);
    setLoading(false);
  };

  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (tech = null) => {
    if (tech) {
      setEditingTech(tech);
      setFormData({
        name: tech.name,
        icon: tech.icon,
        category: tech.category,
        proficiency: tech.proficiency || 90,
        isTopSkill: tech.isTopSkill || false,
        color: tech.color || '#0ea5e9'
      });
    } else {
      setEditingTech(null);
      setFormData({
        name: '',
        icon: '',
        category: 'Frontend',
        proficiency: 90,
        isTopSkill: false,
        color: '#0ea5e9'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = editingTech 
      ? await updateTech(editingTech._id, formData)
      : await addTech(formData);

    if (result.success) {
      showNotification(`Tech ${editingTech ? 'Updated' : 'Integrated'} Successfully`);
      setShowModal(false);
      fetchTech();
    } else {
      showNotification(result.error, 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Decommission this technology permanently?')) {
      const result = await deleteTech(id);
      if (result.success) {
        showNotification('Tech Decommissioned');
        fetchTech();
      }
    }
  };

  const handleToggleTop = async (id) => {
    const result = await toggleTopSkill(id);
    if (result.success) {
      showNotification(result.isTopSkill ? 'Promoted to Top Skill' : 'Removed from Top Skills');
      fetchTech();
    }
  };

  const handleSync = async () => {
    if (window.confirm('CRITICAL: This will RE-INITIALIZE your entire Technical Matrix with vibrant brand colors and cinematic iconography. Proceed?')) {
      setLoading(true);
      try {
        // Clear all existing tech first to ensure absolute parity
        for (const tech of techList) {
          await deleteTech(tech._id);
        }

        const seedData = [
          {
            title: "CORE-INTERFACE",
            skills: [
              { name: "Next.js", iconName: "TbBrandNextjs", color: "#ffffff", level: "95%", isTopSkill: true },
              { name: "React", iconName: "FaReact", color: "#61DAFB", level: "98%", isTopSkill: true },
              { name: "TypeScript", iconName: "SiTypescript", color: "#3178C6", level: "92%", isTopSkill: true },
              { name: "Tailwind CSS", iconName: "SiTailwindcss", color: "#06B6D4", level: "100%", isTopSkill: true },
              { name: "Three.js", iconName: "SiThreedotjs", color: "#ffffff", level: "85%" },
              { name: "GSAP", iconName: "SiGreensock", color: "#88CE02", level: "90%" },
              { name: "Framer Motion", iconName: "SiFramer", color: "#E10098", level: "94%" },
              { name: "Shadcn UI", iconName: "SiNextdotjs", color: "#ffffff", level: "96%" },
              { name: "Zustand", iconName: "SiRedux", color: "#764ABC", level: "92%" },
              { name: "Zod", iconName: "SiZod", color: "#3068b7", level: "90%" },
            ]
          },
          {
            title: "ENGINEERING-CORE",
            skills: [
              { name: "Node.js", iconName: "FaNodeJs", color: "#339933", level: "94%" },
              { name: "Express.js", iconName: "SiExpress", color: "#ffffff", level: "96%" },
              { name: "Python", iconName: "FaPython", color: "#3776AB", level: "88%" },
              { name: "Golang", iconName: "SiGo", color: "#00ADD8", level: "82%" },
            ]
          },
          {
            title: "PERSISTENCE-LAYER",
            skills: [
              { name: "MongoDB", iconName: "SiMongodb", color: "#47A248", level: "95%" },
              { name: "PostgreSQL", iconName: "SiPostgresql", color: "#4169E1", level: "90%" },
              { name: "Prisma", iconName: "SiPrisma", color: "#2D3748", level: "94%" },
              { name: "Redis", iconName: "SiRedis", color: "#DC382D", level: "85%" },
            ]
          },
          {
            title: "INFRASTRUCTURE",
            skills: [
              { name: "Docker", iconName: "SiDocker", color: "#2496ED", level: "88%" },
              { name: "Kubernetes", iconName: "SiKubernetes", color: "#326CE5", level: "80%" },
              { name: "AWS", iconName: "FaAws", color: "#FF9900", level: "85%" },
              { name: "Vercel", iconName: "SiVercel", color: "#ffffff", level: "100%" },
              { name: "Supabase", iconName: "SiSupabase", color: "#3ECF8E", level: "92%" },
              { name: "Appwrite", iconName: "SiAppwrite", color: "#F02E65", level: "88%" },
            ]
          },
          {
            title: "TECHNICAL-TOOLS",
            skills: [
              { name: "Figma", iconName: "SiFigma", color: "#F24E1E", level: "90%" },
              { name: "VS Code", iconName: "VscVscode", color: "#007ACC", level: "98%" },
              { name: "Postman", iconName: "SiPostman", color: "#FF6C37", level: "95%" },
              { name: "Stripe", iconName: "SiStripe", color: "#635BFF", level: "92%" },
            ]
          }
        ];

        for (const cat of seedData) {
          await seedTechStack(cat.skills, cat.title);
        }
        
        await fetchTech();
        showNotification("Technical Matrix Re-Initialized // All Nodes Operational");
      } catch (error) {
        showNotification("Neural Sync Failure", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const groupedTech = techList.reduce((acc, tech) => {
    if (!acc[tech.category]) acc[tech.category] = [];
    acc[tech.category].push(tech);
    return acc;
  }, {});

  if (loading && techList.length === 0) return (
    <div className="flex items-center justify-center py-20 text-primary">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="relative space-y-12">
      {/* Background Circuit Grid Decoration - Subtle Integration */}
      <div className="fixed inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none z-0">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1.5px, transparent 0)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Standardized Admin Header */}
      <div className="relative z-10 flex justify-between items-end mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 italic">Technical Protocol</h2>
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase text-white leading-none">
            Tech <span className="text-primary text-glow">Intelligence</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSync}
            disabled={loading}
            className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-white/30 hover:text-primary hover:border-primary/20 transition-all text-[10px] font-black uppercase tracking-widest italic"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
            Sync Repository
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-primary text-white hover:shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all text-[10px] font-black uppercase tracking-widest italic hover:-translate-y-1 active:translate-y-0"
          >
            <Plus size={16} strokeWidth={3} />
            Integrate Node
          </button>
        </div>
      </div>

      {/* System Stack Layout - Refined for Admin */}
      <div className="relative z-10 space-y-10">
        {Object.entries(groupedTech).map(([category, techs], catIndex) => (
          <div key={category} className="relative">
            {/* Vertical Connectivity Line */}
            <div className="absolute -left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/5 to-transparent hidden 2xl:block" />
            <div className="absolute -left-9.5 top-1.5 w-3 h-3 rounded-full border border-primary/40 hidden 2xl:flex items-center justify-center">
              <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
              {/* Category Sidebar */}
              <div className="lg:w-1/5 space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-primary group-hover:border-primary/30 transition-all duration-500">
                    <Layers size={18} />
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none group-hover:text-primary transition-colors">
                    {category}
                  </h2>
                </div>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest leading-relaxed border-l border-primary/20 pl-4">
                  Technical Architecture // {techs.length} Active Nodes
                </p>
              </div>

              {/* Skills Matrix */}
              <div className="lg:w-4/5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {techs.map((tech, index) => {
                  const Icon = getIcon(tech.icon);
                  const brandColor = TECH_BRAND_COLORS[tech.name] || tech.color || '#0ea5e9';
                  
                  return (
                    <motion.div
                      key={tech._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group relative"
                    >
                      <div className="relative bg-[#0a0f1a]/40 border border-white/5 rounded-2xl p-5 h-full flex flex-col items-center justify-between gap-6 transition-all duration-500 hover:border-primary/40 hover:bg-[#0a0f1a]/80 group-hover:scale-[1.02]">
                        {/* Blueprint Corner Accents */}
                        <div className="absolute top-3 right-3 flex gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                          <div className="w-1 h-1 rounded-full bg-primary" />
                          <div className="w-1 h-1 rounded-full bg-primary" />
                        </div>

                        {/* Administrative Ghost Overlay */}
                        <div className="absolute inset-0 z-[100] flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/80 backdrop-blur-sm rounded-2xl">
                          <button 
                            onClick={() => handleToggleTop(tech._id)}
                            className={`w-9 h-9 rounded-xl border transition-all flex items-center justify-center ${tech.isTopSkill ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-white/5 border-white/10 text-white/30 hover:text-yellow-500 hover:border-yellow-500/40'}`}
                          >
                            <Star size={16} fill={tech.isTopSkill ? "currentColor" : "none"} />
                          </button>
                          <button 
                            onClick={() => handleOpenModal(tech)}
                            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/30 hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(tech._id)}
                            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/30 hover:text-red-500 hover:border-red-500/40 transition-all flex items-center justify-center"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          {Icon && (
                            <Icon 
                              size={44} 
                              style={{ color: brandColor }} 
                              className="relative z-10 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                            />
                          )}
                          <div 
                            className="absolute inset-0 blur-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-700 rounded-full" 
                            style={{ backgroundColor: brandColor }}
                          />
                        </div>

                        <div className="w-full space-y-4">
                          <div className="text-center">
                            <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em] group-hover:text-primary transition-colors italic">
                              {tech.name}
                            </span>
                          </div>
                          
                          {/* Progress Indicator */}
                          <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${tech.proficiency}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="h-full bg-primary/40 group-hover:bg-primary transition-colors"
                            />
                          </div>
                        </div>

                        {/* Technical Meta Tag */}
                        <div className="text-[7px] font-mono text-white/10 uppercase tracking-tighter group-hover:text-white/30 transition-colors">
                          Status_Active // {tech.isTopSkill ? 'PRIORITY' : tech.proficiency + '%'}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Layout Interconnector */}
            {catIndex !== Object.entries(groupedTech).length - 1 && (
              <div className="h-10 flex items-center justify-center opacity-5">
                <div className="w-px h-full bg-gradient-to-b from-primary to-transparent" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Integration Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 pointer-events-none">
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
                    {editingTech ? 'Update Node' : 'Integrate Node'}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-primary/50" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Technical Specification</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Technical Name</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-primary transition-all italic font-medium"
                      placeholder="e.g., Next.js"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Category Tier</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-primary transition-all italic [color-scheme:dark]"
                    >
                      {['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Tools'].map(c => (
                        <option key={c} value={c} className="bg-[#0a0f1a]">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Proficiency ({formData.proficiency}%)</label>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={formData.proficiency}
                      onChange={(e) => setFormData({...formData, proficiency: parseInt(e.target.value)})}
                      className="w-full accent-primary bg-white/5 h-2 rounded-full cursor-pointer mt-4"
                    />
                  </div>
                  <div className="space-y-4 flex flex-col justify-end">
                    <label className="flex items-center gap-4 cursor-pointer group bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-primary/40 transition-all">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${formData.isTopSkill ? 'bg-primary/20 border-primary text-primary' : 'bg-black/40 border-white/10 text-white/20'}`}>
                        {formData.isTopSkill ? <Check size={18} /> : <Star size={18} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white italic">Promote to Top Skills</p>
                        <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-0.5 italic">Manifest on homepage core expertise</p>
                      </div>
                      <input 
                        type="checkbox"
                        className="hidden"
                        checked={formData.isTopSkill}
                        onChange={(e) => setFormData({...formData, isTopSkill: e.target.checked})}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Holographic Glow Color</label>
                  <div className="flex gap-4">
                    <input 
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-20 h-14 bg-white/5 border border-white/10 rounded-2xl p-2 cursor-pointer"
                    />
                    <input 
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-primary transition-all font-mono"
                      placeholder="#0ea5e9"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Universal Icon Matrix</label>
                    <div className="relative max-w-xs w-full">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={12} />
                      <input 
                        type="text"
                        placeholder="Search Matrix..."
                        onChange={(e) => setTechSearch(e.target.value.toLowerCase())}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[10px] text-white focus:border-primary transition-all italic"
                      />
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto pr-4 space-y-10 custom-scrollbar">
                    {Object.entries(TECH_CATEGORIES_PRESETS).map(([cat, techs]) => {
                      const filtered = techs.filter(t => t.name.toLowerCase().includes(techSearch));
                      if (filtered.length === 0) return null;
                      return (
                        <div key={cat} className="space-y-4">
                          <h4 className="text-[9px] font-black uppercase tracking-widest text-white/20 italic ml-2">{cat}</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {filtered.map(t => (
                              <button
                                type="button"
                                key={t.id}
                                onClick={() => setFormData({...formData, icon: t.id, name: t.name})}
                                className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                                  formData.icon === t.id
                                    ? 'bg-primary/20 border-primary text-primary'
                                    : 'bg-white/5 border-white/5 text-white/20 hover:border-white/10'
                                }`}
                              >
                                {getIcon(t.id)({ size: 16 })}
                                <span className="text-[9px] font-black uppercase tracking-widest italic">{t.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 rounded-[2rem] bg-primary text-white text-xs font-black uppercase tracking-[0.3em] italic flex items-center justify-center gap-4 hover:shadow-[0_20px_50px_rgba(14,165,233,0.4)] transition-all active:scale-[0.98]"
                >
                  <Check size={20} /> Establish Global Integration
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
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
