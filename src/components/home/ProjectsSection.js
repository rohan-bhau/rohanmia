'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Globe, Code2, Database, Cpu } from 'lucide-react';
import { getIcon } from '@/lib/icons';

export default function ProjectsSection({ projects: initialProjects = [] }) {
  const displayProjects = initialProjects.length > 0 ? initialProjects : [
    {
      title: "FlatFlow - Management",
      description: "An online apartment management web application with full responsiveness.",
      features: ["Real-time booking", "Admin Dashboard", "Payment integration"],
      image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1000",
      tech: ['SiNextdotjs', 'SiTailwindcss', 'SiMongodb', 'SiStripe'],
      liveLink: "#",
      clientLink: "#",
      serverLink: "#"
    },
    {
      title: "MealMart - Restaurant",
      description: "Full-stack restaurant application for seamless ordering and management.",
      features: ["Live tracking", "User Auth", "Menu Management"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000",
      tech: ['SiReact', 'SiTailwindcss', 'SiNodedotjs', 'SiExpress'],
      liveLink: "#",
      clientLink: "#"
    },
    {
      title: "JobDrop - Career Portal",
      description: "High-performance job portal for talent and recruiter interaction.",
      features: ["Advanced Filtering", "Messaging System", "Resume Mgmt"],
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1000",
      tech: ['SiNextdotjs', 'SiTailwindcss', 'SiFirebase', 'SiPrisma'],
      liveLink: "#",
      clientLink: "#",
      serverLink: "#"
    }
  ];

  return (
    <section className="py-24 px-6 relative min-h-screen transition-colors duration-500">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px', opacity: 0.15 }} />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Cpu className="text-primary animate-pulse" size={24} />
              <div className="h-px w-12 bg-primary/30" />
            </div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-black text-foreground tracking-tighter uppercase italic"
            >
              Featured <span className="text-primary text-glow">Works</span>
            </motion.h2>
            <p className="text-muted-foreground max-w-xl font-medium italic">
              "A selection of engineered solutions that blend technical complexity with cinematic design."
            </p>
          </div>
          <Link href="/projects">
            <button className="px-10 py-4 rounded-full bg-muted/50 dark:bg-white/5 border border-border text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all duration-500 shadow-lg shadow-primary/10">
              View All Archive
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {displayProjects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className={`group relative ${index % 3 === 1 ? 'lg:mt-20' : index % 3 === 2 ? 'lg:mt-10' : ''}`}
            >
              {/* Interconnect Decoration */}
              <div className="absolute -left-4 top-1/2 w-4 h-px bg-primary/20 hidden lg:block" />
              
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
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 flex flex-col flex-1">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">
                      {project.title}
                    </h3>
                    <div className="space-y-2">
                      {(project.features || []).map((feature, i) => (
                        <div key={i} className="flex gap-2 text-muted-foreground text-[11px] leading-relaxed">
                          <span className="text-primary">•</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Badges */}
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-border mt-auto">
                    {(project.tech || []).map(t => {
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
        </div>
      </div>
    </section>
  );
}
