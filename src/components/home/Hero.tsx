'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  Layers, 
  FileText,
  Camera,
  Pencil
} from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { HeroData } from '@/lib/constants/homepage';
import { saveHeroData } from '@/actions/adminHero';
import EditableElement from '@/components/admin/ui/EditableElement';
import ImageCropModal from '@/components/admin/ui/ImageCropModal';
import { useToast } from '@/components/admin/ui/Toast';

interface HeroProps {
  initialData?: HeroData;
  isAdmin?: boolean;
  compactTop?: boolean;
}

const emptyHeroData: HeroData = {
  greeting: '',
  name: '',
  surname: '',
  bio: '',
  profile_image: '',
  resume_url: '',
  rotating_roles: [],
  projects_cta_text: 'View Projects',
  resume_cta_text: 'View Resume'
};

export default function Hero({ initialData, isAdmin = false, compactTop = false }: HeroProps) {
  const { currentTheme } = useThemeAccent();
  const toastContext = useToast();
  const showToast = toastContext?.showToast || ((_msg: string, _type?: any) => {});

  const [data, setData] = useState<HeroData>(initialData || emptyHeroData);
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  // Sync if initialData changes
  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  // Roles typewriter effect
  const roles = data.rotating_roles && data.rotating_roles.length > 0 ? data.rotating_roles : [];

  useEffect(() => {
    if (roles.length === 0) return;
    let timeout: NodeJS.Timeout;
    const current = roles[roleIndex % roles.length];

    if (!isDeleting && displayText === current) {
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayText === '') {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      }, 400);
    } else {
      const speed = isDeleting ? 28 : 60;
      timeout = setTimeout(() => {
        setDisplayText(current.substring(0, isDeleting ? displayText.length - 1 : displayText.length + 1));
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, roleIndex, roles]);

  const handleSaveField = async (field: keyof HeroData, value: any) => {
    const updated = { ...data, [field]: value };
    setData(updated);
    const res = await saveHeroData({ [field]: value });
    if (res.success) {
      showToast('Updated successfully', 'success');
      return { success: true };
    } else {
      showToast(res.error || 'Failed to update', 'error');
      return { success: false, error: res.error };
    }
  };

  return (
    <section className={`relative ${compactTop ? 'pt-2 md:pt-4' : (isAdmin ? 'pt-4 md:pt-6' : 'pt-32 md:pt-40')} pb-20 px-6 overflow-hidden`}>
      {/* Horizon Accent Beam */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 max-w-5xl h-px opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, ${currentTheme.primary}, transparent)`,
          }}
        />

        <div 
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] opacity-25 blur-[120px] transition-all duration-1000"
          style={{
            background: `radial-gradient(50% 50% at 50% 25%, ${currentTheme.primary} 0%, transparent 80%)`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#08090a]" />
      </div>

      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Big Name, Title, Bio, Action Buttons */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

            {/* Name and Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <EditableElement
                  isAdmin={isAdmin}
                  label="Greeting"
                  value={data.greeting}
                  onSave={(val) => handleSaveField('greeting', val)}
                >
                  <span className="text-sm sm:text-base font-mono text-muted-foreground block font-normal tracking-wide">
                    {data.greeting}
                  </span>
                </EditableElement>

                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif font-normal tracking-tight text-foreground leading-[1.02]">
                  <EditableElement
                    isAdmin={isAdmin}
                    label="First Name"
                    value={data.name}
                    onSave={(val) => handleSaveField('name', val)}
                  >
                    <span>{data.name}</span>
                  </EditableElement>{' '}
                  
                  <EditableElement
                    isAdmin={isAdmin}
                    label="Surname"
                    value={data.surname}
                    onSave={(val) => handleSaveField('surname', val)}
                  >
                    <span 
                      className="relative inline-block font-serif italic text-transparent bg-clip-text transition-all duration-700"
                      style={{
                        backgroundImage: `linear-gradient(135deg, #ffffff 35%, ${currentTheme.primary} 100%)`,
                      }}
                    >
                      {data.surname}
                      <span 
                        className="absolute -bottom-1 left-0 right-0 h-[2.5px] rounded-full opacity-60 transition-colors duration-500"
                        style={{
                          background: `linear-gradient(90deg, ${currentTheme.primary}, transparent)`
                        }}
                      />
                    </span>
                  </EditableElement>
                </h1>
              </div>

              {/* Dynamic Rotating Role */}
              <div className="h-8 flex items-center justify-center lg:justify-start pt-1">
                <EditableElement
                  isAdmin={isAdmin}
                  label="Rotating Roles"
                  value={data.rotating_roles.join(', ')}
                  type="tags"
                  onSave={(val) => {
                    const rolesArray = val.split(',').map(s => s.trim()).filter(Boolean);
                    return handleSaveField('rotating_roles', rolesArray);
                  }}
                >
                  <div className="flex items-center text-sm sm:text-base font-mono tracking-tight font-medium">
                    <span 
                      className="font-bold mr-2 select-none text-base transition-colors duration-500"
                      style={{ color: currentTheme.primary }}
                    >
                      ~&gt;
                    </span>
                    <span 
                      className="font-semibold tracking-tight transition-all duration-500 text-transparent bg-clip-text"
                      style={{
                        backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`,
                      }}
                    >
                      {displayText}
                    </span>
                    <motion.span 
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-[2px] h-4 sm:h-5 ml-1.5 inline-block rounded-full"
                      style={{ 
                        backgroundColor: currentTheme.primary,
                        boxShadow: `0 0 8px ${currentTheme.glow}`
                      }}
                    />
                  </div>
                </EditableElement>
              </div>
            </motion.div>

            {/* Authentic Bio */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <EditableElement
                isAdmin={isAdmin}
                label="Bio Description"
                value={data.bio}
                type="textarea"
                onSave={(val) => handleSaveField('bio', val)}
                className="w-full"
              >
                <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed mx-auto lg:mx-0 font-normal">
                  {data.bio}
                </p>
              </EditableElement>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5"
            >
              {/* Primary View Projects CTA */}
              <EditableElement
                isAdmin={isAdmin}
                label="Primary Button Text"
                value={data.projects_cta_text}
                onSave={(val) => handleSaveField('projects_cta_text', val)}
              >
                <Link
                  href="#projects"
                  className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
                  style={{
                    backgroundColor: currentTheme.primary,
                    color: currentTheme.contrastText,
                    boxShadow: `0 0 25px ${currentTheme.glow}`,
                  }}
                >
                  <Layers size={15} />
                  <span>{data.projects_cta_text}</span>
                  <ArrowUpRight size={14} />
                </Link>
              </EditableElement>

              {/* View Resume Button */}
              <EditableElement
                isAdmin={isAdmin}
                label="Resume Button Text"
                value={data.resume_cta_text}
                onSave={(val) => handleSaveField('resume_cta_text', val)}
              >
                <a
                  href={data.resume_url || "/api/download"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/15 text-xs sm:text-sm font-mono text-muted-foreground hover:text-foreground flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
                >
                  <FileText size={15} style={{ color: currentTheme.primary }} />
                  <span>{data.resume_cta_text}</span>
                </a>
              </EditableElement>
            </motion.div>

          </div>

          {/* Right Column: Clean, Elegant Portrait Showcase with Square Crop Upload */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center relative"
          >
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 0.3, 0, -0.3, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
              className="relative w-full max-w-sm sm:max-w-md group"
            >
              {/* Soft Ambient Halo */}
              <div 
                className="absolute -inset-2 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
                style={{ backgroundColor: currentTheme.primary }}
              />

              {/* Portrait Container Frame */}
              <div 
                onClick={isAdmin ? () => setCropModalOpen(true) : undefined}
                className={`relative rounded-[2.5rem] bg-[#0d0f14] border border-white/[0.12] group-hover:border-white/30 p-3 sm:p-4 shadow-2xl backdrop-blur-xl transition-all duration-500 ${
                  isAdmin ? 'cursor-pointer' : ''
                }`}
              >
                <div className="relative h-[400px] sm:h-[460px] w-full rounded-[2rem] overflow-hidden bg-[#08090a]">
                  {data.profile_image ? (
                    <Image
                      src={data.profile_image}
                      alt={`${data.name} ${data.surname}`.trim() || 'Profile'}
                      fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      priority
                      sizes="(max-width: 768px) 100vw, 450px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-mono text-zinc-600">
                      No Profile Image
                    </div>
                  )}
                  
                  {/* Subtle bottom vignette gradient for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090a]/75 via-transparent to-transparent opacity-60" />

                  {/* Admin Upload Prompt Overlay */}
                  {isAdmin && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-xs">
                      <div 
                        className="p-3.5 rounded-full bg-white/10 border border-white/20 text-white shadow-2xl scale-90 group-hover:scale-100 transition-transform"
                        style={{ backgroundColor: `${currentTheme.primary}40` }}
                      >
                        <Camera size={22} className="text-white" />
                      </div>
                      <span className="text-xs font-mono text-white font-medium bg-black/60 px-3 py-1 rounded-full border border-white/10">
                        Click to Square Crop &amp; Upload
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Hero Image Crop Modal */}
      {isAdmin && (
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          onSuccess={async (newUrl) => {
            setData((prev: HeroData) => ({ ...prev, profile_image: newUrl }));
            await saveHeroData({ profile_image: newUrl });
            showToast('Hero portrait updated successfully', 'success');
          }}
        />
      )}
    </section>
  );
}
