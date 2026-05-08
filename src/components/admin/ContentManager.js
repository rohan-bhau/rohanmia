'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RefreshCcw, Layout, Type, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, Upload, User, Sparkles, GraduationCap, Globe } from 'lucide-react';
import { getHomeContent, updateHomeContent } from '@/actions/content';
import { uploadImage } from '@/actions/upload';
import Image from 'next/image';
import QualificationManager from '@/components/admin/QualificationManager';
import ContactManager from '@/components/admin/ContactManager';

export default function ContentManager() {
  const [activeSection, setActiveSection] = useState('hero');
  const [content, setContent] = useState(null);
  const [originalContent, setOriginalContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (activeSection !== 'qualifications') {
      fetchContent();
    } else {
      setLoading(false);
    }
  }, [activeSection]);

  const fetchContent = async () => {
    setLoading(true);
    const data = await getHomeContent(activeSection);
    setContent(data);
    setOriginalContent(data);
    setLoading(false);
  };

  const isChanged = JSON.stringify(content) !== JSON.stringify(originalContent);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadImage(formData);
      if (res.success) {
        const fieldToUpdate = activeSection === 'about' ? 'image' : 'bannerImage';
        setContent({ ...content, [fieldToUpdate]: res.url });
        showToast('Visual Node Updated Successfully', 'success');
      } else {
        showToast('Upload Failed: ' + res.error, 'error');
      }
    } catch (error) {
      showToast('Neural Link Interrupted', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await updateHomeContent(activeSection, content);
    setSaving(false);
    
    if (res.success) {
      setOriginalContent(content);
      showToast('Neural Archive Anchored Successfully', 'success');
    } else {
      showToast('Update Failed: Neural Link Interrupted', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading && activeSection !== 'qualifications') {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4 opacity-20">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Content Node...</p>
      </div>
    );
  }

  const sections = [
    { id: 'hero', icon: Layout },
    { id: 'about', icon: User },
    { id: 'qualifications', icon: GraduationCap },
    { id: 'contact', icon: Globe },
    { id: 'services', icon: Sparkles }
  ];

  return (
    <div className="space-y-12 relative">
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

      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">Content Core</h3>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Visual Studio Environment</p>
          </div>
        </div>
        {activeSection !== 'qualifications' && activeSection !== 'contact' && (
          <button 
            onClick={handleSave}
            disabled={saving || uploading || !isChanged}
            className="px-8 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] italic rounded-2xl shadow-[0_10px_30px_rgba(14,165,233,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-30 disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isChanged ? 'Anchor Changes' : 'No Changes Detected'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="space-y-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full p-6 rounded-3xl border transition-all flex items-center gap-4 group ${
                activeSection === section.id 
                  ? 'bg-primary/10 border-primary/40 text-primary shadow-[0_0_30px_rgba(14,165,233,0.1)]' 
                  : 'bg-white/[0.02] border-white/5 text-white/20 hover:border-white/20'
              }`}
            >
              <section.icon size={20} className={activeSection === section.id ? 'animate-pulse' : ''} />
              <span className="text-[11px] font-black uppercase tracking-widest italic">{section.id} Section</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 glass-premium p-10 rounded-[3rem] border border-white/5 bg-[#0a0f1a]/40 space-y-12">
          {activeSection === 'qualifications' ? (
            <QualificationManager />
          ) : activeSection === 'contact' ? (
            <ContactManager />
          ) : activeSection === 'hero' ? (
            <div className="space-y-12">
              {/* Visual Banner Preview */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <ImageIcon size={16} />
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-glow">Hero Banner Visual</label>
                </div>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-[500px] max-w-[400px] mx-auto rounded-[2.5rem] overflow-hidden border-2 border-dashed border-white/10 hover:border-primary/40 group cursor-pointer transition-all bg-black/40 shadow-2xl"
                >
                  {content?.bannerImage ? (
                    <>
                      <Image 
                        src={content.bannerImage} 
                        alt="Hero Banner" 
                        fill 
                        className="object-cover opacity-20 blur-2xl"
                      />
                      <Image 
                        src={content.bannerImage} 
                        alt="Hero Banner" 
                        fill 
                        priority
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-1000"
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-white/20">
                      <div className="p-6 rounded-full bg-white/5 animate-pulse">
                        <Upload size={32} strokeWidth={1} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Establish Visual Link</p>
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                      <Loader2 size={32} className="animate-spin text-primary" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Uploading Visual Payload...</p>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <div className="flex items-center gap-3 text-white">
                      <Sparkles size={16} className="text-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest italic underline decoration-primary decoration-2 underline-offset-4">Click to Change Visual</span>
                    </div>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <User size={16} />
                    <label className="text-[10px] font-black uppercase tracking-widest italic">Identity / Greeting</label>
                  </div>
                  <input 
                    type="text"
                    value={content?.greeting || ''}
                    onChange={(e) => setContent({...content, greeting: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60 italic focus:outline-none focus:border-primary transition-all"
                    placeholder="Hey, I'm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Type size={16} />
                      <label className="text-[10px] font-black uppercase tracking-widest italic">First Name</label>
                    </div>
                    <input 
                      type="text"
                      value={content?.firstName || ''}
                      onChange={(e) => setContent({...content, firstName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60 italic focus:outline-none focus:border-primary transition-all"
                      placeholder="Rohan"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Type size={16} />
                      <label className="text-[10px] font-black uppercase tracking-widest italic">Last Name</label>
                    </div>
                    <input 
                      type="text"
                      value={content?.lastName || ''}
                      onChange={(e) => setContent({...content, lastName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60 italic focus:outline-none focus:border-primary transition-all"
                      placeholder="Mia"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles size={16} />
                  <label className="text-[10px] font-black uppercase tracking-widest italic">Rotating Intelligence Nodes (Titles)</label>
                </div>
                <textarea 
                  value={content?.titles?.join(', ') || ''}
                  onChange={(e) => setContent({...content, titles: e.target.value.split(',').map(s => s.trim())})}
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60 italic focus:outline-none focus:border-primary transition-all resize-none"
                  placeholder="Frontend Architect, Creative Engineer..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Type size={16} />
                  <label className="text-[10px] font-black uppercase tracking-widest italic">Main Intro Description</label>
                </div>
                <textarea 
                  value={content?.description || ''}
                  onChange={(e) => setContent({...content, description: e.target.value})}
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-8 text-sm text-white/60 italic focus:outline-none focus:border-primary transition-all resize-none"
                  placeholder="The primary description of Rohan's world..."
                />
              </div>
            </div>
          ) : activeSection === 'about' ? (
            <div className="space-y-12">
              {/* About Visual Portal */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <ImageIcon size={16} />
                  <label className="text-[10px] font-black uppercase tracking-widest italic text-glow">Identity / Story Visual</label>
                </div>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-[500px] max-w-[400px] mx-auto rounded-[2.5rem] overflow-hidden border-2 border-dashed border-white/10 hover:border-primary/40 group cursor-pointer transition-all bg-black/40 shadow-2xl"
                >
                  {content?.image ? (
                    <>
                      <Image 
                        src={content.image} 
                        alt="Story Visual" 
                        fill 
                        className="object-cover opacity-20 blur-2xl"
                      />
                      <Image 
                        src={content.image} 
                        alt="Story Visual" 
                        fill 
                        priority
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-1000"
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-white/20">
                      <div className="p-6 rounded-full bg-white/5 animate-pulse">
                        <Upload size={32} strokeWidth={1} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Establish Story Link</p>
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                      <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              </div>

              {/* Story Title Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Type size={16} />
                    <label className="text-[10px] font-black uppercase tracking-widest italic">Title Part 1</label>
                  </div>
                  <input 
                    type="text"
                    value={content?.titlePart1 || ''}
                    onChange={(e) => setContent({...content, titlePart1: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60 italic focus:outline-none focus:border-primary transition-all"
                    placeholder="The Story Behind"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Type size={16} />
                    <label className="text-[10px] font-black uppercase tracking-widest italic">Title Part 2 (Glow)</label>
                  </div>
                  <input 
                    type="text"
                    value={content?.titlePart2 || ''}
                    onChange={(e) => setContent({...content, titlePart2: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60 italic focus:outline-none focus:border-primary transition-all"
                    placeholder="The Code"
                  />
                </div>
              </div>

              {/* Story Paragraphs */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Paragraph 1</label>
                  <textarea 
                    value={content?.p1 || ''}
                    onChange={(e) => setContent({...content, p1: e.target.value})}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60 italic focus:outline-none focus:border-primary transition-all resize-none"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Paragraph 2</label>
                  <textarea 
                    value={content?.p2 || ''}
                    onChange={(e) => setContent({...content, p2: e.target.value})}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60 italic focus:outline-none focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>

              {/* Extra Info Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Nationality</label>
                  <input 
                    type="text"
                    value={content?.nationality || ''}
                    onChange={(e) => setContent({...content, nationality: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60 italic"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Communication</label>
                  <input 
                    type="text"
                    value={content?.communication || ''}
                    onChange={(e) => setContent({...content, communication: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60 italic"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Live Status</label>
                  <input 
                    type="text"
                    value={content?.status || ''}
                    onChange={(e) => setContent({...content, status: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60 italic"
                  />
                </div>
              </div>

              {/* Evolution Node Manager */}
              <div className="space-y-8 pt-10 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-primary">
                    <RefreshCcw size={16} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] italic">Evolution Nodes</h4>
                  </div>
                  <button 
                    onClick={() => setContent({
                      ...content, 
                      journey: [...(content?.journey || []), { year: "2024", title: "New Milestone", company: "Company", description: "...", icon: "Briefcase" }]
                    })}
                    className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest italic rounded-lg hover:bg-primary/20 transition-all"
                  >
                    + Add New Node
                  </button>
                </div>

                <div className="space-y-6">
                  {(content?.journey || []).map((node, index) => (
                    <div key={index} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6 relative group">
                      <button 
                        onClick={() => {
                          const newJourney = [...content.journey];
                          newJourney.splice(index, 1);
                          setContent({ ...content, journey: newJourney });
                        }}
                        className="absolute top-6 right-6 p-2 text-white/10 hover:text-red-500 transition-colors"
                      >
                        <AlertCircle size={16} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">Year</label>
                          <input 
                            type="text"
                            value={node.year}
                            onChange={(e) => {
                              const newJourney = [...content.journey];
                              newJourney[index].year = e.target.value;
                              setContent({ ...content, journey: newJourney });
                            }}
                            className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-[10px] text-white/60 italic"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">Title</label>
                          <input 
                            type="text"
                            value={node.title}
                            onChange={(e) => {
                              const newJourney = [...content.journey];
                              newJourney[index].title = e.target.value;
                              setContent({ ...content, journey: newJourney });
                            }}
                            className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-[10px] text-white/60 italic"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">Icon Type</label>
                          <select 
                            value={node.icon}
                            onChange={(e) => {
                              const newJourney = [...content.journey];
                              newJourney[index].icon = e.target.value;
                              setContent({ ...content, journey: newJourney });
                            }}
                            className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-[10px] text-white/60 italic appearance-none outline-none"
                          >
                            <option value="Briefcase" className="bg-[#0d121f] text-white">Briefcase</option>
                            <option value="GraduationCap" className="bg-[#0d121f] text-white">Education</option>
                            <option value="Award" className="bg-[#0d121f] text-white">Award</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">Company / Entity</label>
                        <input 
                          type="text"
                          value={node.company}
                          onChange={(e) => {
                            const newJourney = [...content.journey];
                            newJourney[index].company = e.target.value;
                            setContent({ ...content, journey: newJourney });
                          }}
                          className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-[10px] text-white/60 italic"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">Narrative</label>
                        <textarea 
                          value={node.description}
                          onChange={(e) => {
                            const newJourney = [...content.journey];
                            newJourney[index].description = e.target.value;
                            setContent({ ...content, journey: newJourney });
                          }}
                          className="w-full h-24 bg-black/40 border border-white/5 rounded-xl p-4 text-[10px] text-white/60 italic resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center opacity-10">
              <p className="text-sm font-black uppercase tracking-[0.5em]">This node is being prepared for expansion.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
