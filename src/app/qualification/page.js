'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Award, Loader2 } from 'lucide-react';
import { getQualifications } from '@/actions/qualification';

export default function QualificationPage() {
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuals = async () => {
      const data = await getQualifications();
      setQualifications(data);
      setLoading(false);
    };
    fetchQuals();
  }, []);

  const groupedQualifications = {
    Education: qualifications.filter(q => q.type === 'Education'),
    Experience: qualifications.filter(q => q.type === 'Experience'),
    Certification: qualifications.filter(q => q.type === 'Certification')
  };

  const sectionIcons = {
    Education: GraduationCap,
    Experience: Briefcase,
    Certification: Award
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-sm font-black uppercase tracking-[0.4em] text-foreground/20 animate-pulse text-glow">Accessing Educational Matrix...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 bg-background min-h-screen">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-20 space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tighter uppercase italic leading-none"
          >
            My <span className="text-primary text-glow">Qualifications</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg font-medium italic"
          >
            "A comprehensive summary of my academic background and professional evolution."
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {['Education', 'Experience'].map((type) => {
            const Icon = sectionIcons[type];
            const items = groupedQualifications[type] || [];
            
            return (
              <div key={type} className="space-y-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 text-foreground"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                    <Icon size={24} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight uppercase italic">{type}</h2>
                </motion.div>

                <div className="space-y-8 relative pl-6 border-l border-border/50">
                  {items.map((item, iIndex) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: iIndex * 0.1 }}
                      className="relative"
                    >
                      {/* Bullet Point */}
                      <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-background shadow-[0_0_10px_rgba(14,165,233,0.5)] ${
                        item.accent === 'primary' ? 'bg-primary' : 'bg-purple-600'
                      }`} />
                      
                      <div className="bg-foreground/[0.02] border border-border/50 p-6 rounded-3xl hover:border-primary/20 transition-all duration-500 group backdrop-blur-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors uppercase italic tracking-tight">{item.title}</h3>
                            <p className="text-muted-foreground text-sm font-bold italic opacity-80">{item.subtitle}</p>
                          </div>
                          <span className="text-[9px] uppercase tracking-widest font-black text-muted-foreground bg-foreground/5 px-2 py-1 rounded-md">
                            {item.date}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed mt-4 font-medium italic">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-foreground/10 text-[10px] font-black uppercase tracking-widest italic py-8">Section Initializing...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Certifications & Achievements */}
        {groupedQualifications.Certification.length > 0 && (
          <div className="mt-24 space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">Accreditations & <span className="text-primary text-glow">Achievements</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedQualifications.Certification.map((cert, i) => (
                <motion.div
                  key={cert._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-foreground/[0.02] border border-border/50 p-6 rounded-[2rem] flex items-center gap-4 hover:border-primary/30 transition-all group backdrop-blur-sm"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                    <Award size={24} />
                  </div>
                  <div>
                    <h4 className="text-foreground font-black text-sm uppercase italic tracking-tight">{cert.title}</h4>
                    <p className="text-muted-foreground text-xs font-bold italic">{cert.subtitle} • {cert.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
