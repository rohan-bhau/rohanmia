'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Globe, Code2, Database, Github, Cpu } from 'lucide-react';
import { getIcon } from '@/lib/icons';

const categories = ["All", "Full Stack", "Frontend", "Backend", "Open Source"];

const projects = [
  {
    id: 1,
    title: "FlatFlow - Management",
    category: "Full Stack",
    features: [
      "Real-time apartment booking.",
      "Admin dashboard for property.",
      "Secure Stripe integration.",
      "Interactive map visualization."
    ],
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1000",
    tech: ["SiNextdotjs", "SiTailwindcss", "SiMongodb", "SiStripe"],
    liveLink: "#",
    clientLink: "#",
    serverLink: "#"
  },
  {
    id: 2,
    title: "MealMart - Restaurant",
    category: "Full Stack",
    features: [
      "Role-based access system.",
      "Email verification flow.",
      "Live order tracking.",
      "Menu management system."
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000",
    tech: ["SiReact", "SiNodedotjs", "SiExpress", "SiRedux"],
    liveLink: "#",
    clientLink: "#"
  },
  {
    id: 3,
    title: "JobDrop - Career Portal",
    category: "Full Stack",
    features: [
      "Job search multi-filtering.",
      "Recruiter portal & review.",
      "PDF resume management.",
      "Direct messaging system."
    ],
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1000",
    tech: ["SiNextdotjs", "SiTailwindcss", "SiFirebase", "SiPrisma"],
    liveLink: "#",
    clientLink: "#",
    serverLink: "#"
  },
  {
    id: 4,
    title: "EcoTrack - Sustenance",
    category: "Open Source",
    features: [
      "Carbon footprint calculator.",
      "Social sustainability feed.",
      "Energy API integration.",
      "Gamified environmental tasks."
    ],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000",
    tech: ["SiNodedotjs", "SiReact", "SiDocker", "SiGithubactions"]
  },
  {
    id: 5,
    title: "Nebula - Data Vis",
    category: "Frontend",
    features: [
      "Interactive 3D charts.",
      "WebSocket real-time sync.",
      "Custom widget engine.",
      "Dark-mode optimized UI."
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000",
    tech: ["SiReact", "SiFramer", "SiThreejs", "SiTailwindcss"]
  }
];

export default function ProjectsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredProjects = projects.filter(p => 
    (filter === "All" || p.category === filter) &&
    (p.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="pt-40 pb-20 px-6 min-h-screen relative overflow-hidden transition-colors duration-500">
      {/* Background Circuit Grid Decoration */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px', opacity: 0.2 }} />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col items-center mb-24 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-px w-12 bg-primary/50" />
              <Cpu className="text-primary animate-pulse" size={24} />
              <div className="h-px w-12 bg-primary/50" />
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter uppercase italic">
              Project <span className="text-primary text-glow">Archives</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium italic opacity-80">
              "A curated collection of architectural code and cinematic digital experiences."
            </p>
          </motion.div>

          {/* Search and Filter */}
          <div className="w-full max-w-5xl flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search the archives..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-muted/30 dark:bg-white/5 border border-border rounded-[2rem] py-5 pl-14 pr-6 text-foreground focus:outline-none focus:border-primary/50 transition-all backdrop-blur-xl"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-8 py-4 rounded-[2rem] whitespace-nowrap transition-all duration-500 font-bold text-xs uppercase tracking-widest border ${
                    filter === cat 
                    ? "bg-primary text-white border-primary shadow-[0_10px_30px_rgba(14,165,233,0.3)]" 
                    : "bg-muted/30 dark:bg-white/5 border-border text-muted-foreground hover:text-primary hover:border-primary/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dense 3-Column Staggered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
          <AnimatePresence mode='popLayout'>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative ${index % 3 === 1 ? 'xl:mt-24' : index % 3 === 2 ? 'xl:mt-12' : ''}`}
              >
                {/* Horizontal Interconnect Decoration */}
                <div className="absolute -left-4 top-1/2 w-4 h-px bg-primary/20 hidden xl:block" />
                <div className="absolute -right-4 top-1/2 w-4 h-px bg-primary/20 hidden xl:block" />

                <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-700 hover:border-primary/40 hover:shadow-[0_30px_80px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                  {/* Portrait Image */}
                  <div className="relative h-96 overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80 dark:opacity-100" />
                    <div className="absolute top-6 left-6">
                      <span className="bg-primary/10 dark:bg-primary/20 backdrop-blur-xl text-primary text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-primary/20 dark:border-primary/30">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-8 flex flex-col flex-1">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">
                        {project.title}
                      </h3>
                      <div className="space-y-3">
                        {project.features.map((feature, i) => (
                          <div key={i} className="flex gap-3 text-muted-foreground text-xs leading-relaxed">
                            <span className="text-primary mt-1">•</span>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-2 pt-6 border-t border-border mt-auto">
                      {project.tech.map(t => {
                        const Icon = getIcon(t);
                        return (
                          <div key={t} className="w-9 h-9 rounded-lg bg-muted/50 dark:bg-white/5 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group/icon">
                            <Icon size={16} className="group-hover/icon:scale-110 transition-transform" />
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-2">
                      {project.liveLink && (
                        <Link href={project.liveLink} className="w-full">
                          <button className="w-full py-3.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all">
                            <Globe size={12} />
                            Live Preview
                          </button>
                        </Link>
                      )}
                      <div className="flex gap-2">
                        {project.clientLink && (
                          <Link href={project.clientLink} className="flex-1">
                            <button className="w-full py-3.5 rounded-full bg-muted/50 dark:bg-white/5 border border-border text-foreground text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-primary/5 dark:hover:bg-white/10 transition-all">
                              <Code2 size={12} />
                              Client
                            </button>
                          </Link>
                        )}
                        {project.serverLink && (
                          <Link href={project.serverLink} className="flex-1">
                            <button className="w-full py-3.5 rounded-full bg-muted/50 dark:bg-white/5 border border-border text-foreground text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-primary/5 dark:hover:bg-white/10 transition-all">
                              <Database size={12} />
                              Server
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
