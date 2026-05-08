'use client';

import { motion } from 'framer-motion';
import { 
  SiNextdotjs, SiReact, SiJavascript, SiTypescript, SiTailwindcss, SiFramer,
  SiNodedotjs, SiExpress, SiPython, SiGo,
  SiMongodb, SiPostgresql, SiPrisma, SiRedis,
  SiDocker, SiKubernetes, SiGithubactions, SiVercel,
  SiGooglecloud, SiFirebase, SiFigma, SiPostman,
  SiStripe, SiSupabase, SiGraphql, SiAppwrite,
  SiThreedotjs, SiGreensock, SiZod, SiRedux, SiVite
} from 'react-icons/si';
import { FaAws, FaNodeJs, FaReact, FaPython } from 'react-icons/fa6';
import { VscVscode } from 'react-icons/vsc';
import { TbBrandNextjs } from 'react-icons/tb';
import { Cpu, Zap, Database, ShieldCheck, Wrench, Terminal, Layers } from 'lucide-react';

const categories = [
  {
    title: "CORE-INTERFACE",
    subtitle: "High-performance frontend architecture and design systems.",
    icon: Cpu,
    skills: [
      { name: "Next.js", icon: TbBrandNextjs, color: "#ffffff", level: "95%" },
      { name: "React", icon: FaReact, color: "#61DAFB", level: "98%" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6", level: "92%" },
      { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4", level: "100%" },
      { name: "Three.js", icon: SiThreedotjs, color: "#ffffff", level: "85%" },
      { name: "GSAP", icon: SiGreensock, color: "#88CE02", level: "90%" },
      { name: "Framer Motion", icon: SiFramer, color: "#E10098", level: "94%" },
      { name: "Shadcn UI", icon: SiNextdotjs, color: "#ffffff", level: "96%" },
      { name: "Zustand", icon: SiRedux, color: "#443e38", level: "92%" },
      { name: "Zod", icon: SiZod, color: "#3068b7", level: "90%" },
    ]
  },
  {
    title: "ENGINEERING-CORE",
    subtitle: "Scalable backend services and distributed systems.",
    icon: Terminal,
    skills: [
      { name: "Node.js", icon: FaNodeJs, color: "#339933", level: "94%" },
      { name: "Express.js", icon: SiExpress, color: "#ffffff", level: "96%" },
      { name: "Python", icon: FaPython, color: "#3776AB", level: "88%" },
      { name: "Golang", icon: SiGo, color: "#00ADD8", level: "82%" },
    ]
  },
  {
    title: "PERSISTENCE-LAYER",
    subtitle: "Robust data modeling and storage optimization.",
    icon: Database,
    skills: [
      { name: "MongoDB", icon: SiMongodb, color: "#47A248", level: "95%" },
      { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1", level: "90%" },
      { name: "Prisma", icon: SiPrisma, color: "#5a67d8", level: "94%" },
      { name: "Redis", icon: SiRedis, color: "#DC382D", level: "85%" },
    ]
  },
  {
    title: "INFRASTRUCTURE",
    subtitle: "Cloud orchestration and deployment pipelines.",
    icon: ShieldCheck,
    skills: [
      { name: "Docker", icon: SiDocker, color: "#2496ED", level: "88%" },
      { name: "Kubernetes", icon: SiKubernetes, color: "#326CE5", level: "80%" },
      { name: "AWS", icon: FaAws, color: "#FF9900", level: "85%" },
      { name: "Vercel", icon: SiVercel, color: "#ffffff", level: "100%" },
      { name: "Supabase", icon: SiSupabase, color: "#3ECF8E", level: "92%" },
      { name: "Appwrite", icon: SiAppwrite, color: "#F02E65", level: "88%" },
    ]
  },
  {
    title: "TECHNICAL-TOOLS",
    subtitle: "Workflow automation and development utilities.",
    icon: Wrench,
    skills: [
      { name: "Figma", icon: SiFigma, color: "#F24E1E", level: "90%" },
      { name: "VS Code", icon: VscVscode, color: "#007ACC", level: "98%" },
      { name: "Postman", icon: SiPostman, color: "#FF6C37", level: "95%" },
      { name: "Stripe", icon: SiStripe, color: "#635BFF", level: "92%" },
    ]
  }
];

export default function TechStackPage() {
  return (
    <div className="pt-40 pb-20 px-6 min-h-screen transition-colors duration-500 overflow-hidden bg-background">
      {/* Background Circuit Grid Decoration */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1.5px, transparent 0)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-20 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-px w-12 bg-primary/30" />
              <Zap className="text-primary animate-pulse" size={24} />
              <div className="h-px w-12 bg-primary/30" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-foreground tracking-tighter uppercase italic">
              System <span className="text-primary text-glow">Stack</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium italic opacity-80">
              "A technical blueprint of the high-performance engines used to build world-class digital experiences."
            </p>
          </motion.div>
        </div>

        {/* Stack Sections */}
        <div className="space-y-10">
          {categories.map((category, catIndex) => (
            <div key={category.title} className="relative">
              {/* Vertical Connectivity Decoration */}
              <div className="absolute -left-12 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/5 to-transparent hidden xl:block" />
              <div className="absolute -left-14 top-2 w-4 h-4 rounded-full border border-primary/50 hidden xl:flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
              </div>

              <div className="flex flex-col xl:flex-row gap-12">
                {/* Category Info */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="xl:w-1/4 space-y-6"
                >
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <category.icon size={22} />
                    </div>
                    <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">
                      {category.title}
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed italic border-l-2 border-primary/20 pl-6">
                    {category.subtitle}
                  </p>
                </motion.div>

                {/* Skills Grid */}
                <div className="xl:w-3/4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {category.skills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -8 }}
                      className="group relative"
                    >
                      <div className="relative bg-card border border-border rounded-3xl p-6 h-full flex flex-col items-center justify-between gap-6 transition-all duration-500 hover:border-primary/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                        {/* Blueprint Decoration */}
                        <div className="absolute top-3 right-3 flex gap-1">
                          <div className="w-1 h-1 rounded-full bg-primary/20" />
                          <div className="w-1 h-1 rounded-full bg-primary/20" />
                        </div>
                        
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <skill.icon 
                            size={44} 
                            style={{ color: skill.color }} 
                            className="relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                          />
                          {/* Glow background */}
                          <div 
                            className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" 
                            style={{ backgroundColor: skill.color }}
                          />
                        </div>

                        <div className="w-full space-y-4">
                          <div className="text-center">
                            <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
                              {skill.name}
                            </span>
                          </div>
                          
                          {/* Tech Level Bar */}
                          <div className="h-1 w-full bg-muted/30 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: skill.level }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="h-full bg-primary/40 group-hover:bg-primary transition-colors"
                            />
                          </div>
                        </div>

                        {/* Status Bit */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                          System Active // {skill.level}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Section Gap Decoration */}
              {catIndex !== categories.length - 1 && (
                <div className="h-10 flex items-center justify-center opacity-10">
                  <div className="w-px h-full bg-gradient-to-b from-primary to-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
