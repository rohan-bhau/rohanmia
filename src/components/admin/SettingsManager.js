'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Layout, 
  Shield, 
  CloudUpload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon,
  Tag,
  Type,
  Mail,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { getSettings, updateSettings } from '@/actions/settings';
import { uploadImage } from '@/actions/upload';
import Image from 'next/image';

export default function SettingsManager() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    keywords: '',
    contactEmail: '',
    logoUrl: '',
    logoPublicId: '',
    footerText: '',
    maintenanceMode: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getSettings();
    if (data) {
      setSettings(data);
      setFormData({
        siteName: data.siteName || '',
        siteDescription: data.siteDescription || '',
        keywords: data.keywords || '',
        contactEmail: data.contactEmail || '',
        logoUrl: data.logoUrl || '',
        logoPublicId: data.logoPublicId || '',
        footerText: data.footerText || '',
        maintenanceMode: data.maintenanceMode || false
      });
    }
    setLoading(false);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    const result = await uploadImage(uploadData);
    setUploading(false);

    if (result.success) {
      setFormData(prev => ({
        ...prev,
        logoUrl: result.url,
        logoPublicId: result.public_id
      }));
      showToast('Logo Cataloged Successfully', 'success');
    } else {
      showToast('Logo Transmission Failed', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateSettings(formData);
    setSaving(false);

    if (res.success) {
      showToast('Core Configuration Optimized', 'success');
    } else {
      showToast('Optimization Failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4 opacity-20">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Site Core...</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Left Column: General & SEO */}
        <div className="xl:col-span-2 space-y-12">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="glass-premium p-10 rounded-[3rem] border border-white/5 bg-[#0a0f1a]/40 space-y-10">
              <div className="flex items-center gap-4 text-primary">
                <Globe size={24} />
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Global Identity</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 italic">
                    <Type size={14} className="text-primary" /> Site Designation
                  </label>
                  <input 
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => setFormData({...formData, siteName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white italic focus:border-primary transition-all outline-none"
                    placeholder="e.g. Antigravity"
                  />
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 italic">
                    <Mail size={14} className="text-primary" /> Core Contact
                  </label>
                  <input 
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white italic focus:border-primary transition-all outline-none"
                    placeholder="admin@domain.com"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 italic">
                  <Layout size={14} className="text-primary" /> Manifest Description
                </label>
                <textarea 
                  rows={3}
                  value={formData.siteDescription}
                  onChange={(e) => setFormData({...formData, siteDescription: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm text-white italic focus:border-primary transition-all outline-none resize-none"
                  placeholder="The vision behind the architecture..."
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 italic">
                  <Tag size={14} className="text-primary" /> Neural Keywords
                </label>
                <input 
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white italic focus:border-primary transition-all outline-none"
                  placeholder="Next.js, Fullstack, AI, Architecture..."
                />
              </div>
            </div>

            <div className="glass-premium p-10 rounded-[3rem] border border-white/5 bg-[#0a0f1a]/40 space-y-10">
              <div className="flex items-center gap-4 text-primary">
                <Shield size={24} />
                <h3 className="text-xl font-black italic uppercase tracking-tighter">System Protocol</h3>
              </div>

              <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white italic">Maintenance Mode</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">Restrict public access to the neural network</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, maintenanceMode: !formData.maintenanceMode})}
                  className={`w-14 h-8 rounded-full relative transition-colors duration-500 ${formData.maintenanceMode ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: formData.maintenanceMode ? 26 : 4 }}
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                  />
                </button>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 italic">
                  <Zap size={14} className="text-primary" /> Footer Chronicle
                </label>
                <input 
                  type="text"
                  value={formData.footerText}
                  onChange={(e) => setFormData({...formData, footerText: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white italic focus:border-primary transition-all outline-none"
                  placeholder="Built with passion..."
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full py-6 bg-primary text-white font-black uppercase tracking-[0.4em] italic rounded-[2.5rem] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <SettingsIcon size={20} />}
              Execute Core Optimization
            </button>
          </form>
        </div>

        {/* Right Column: Logo & Assets */}
        <div className="space-y-12">
          <div className="glass-premium p-10 rounded-[3rem] border border-white/5 bg-[#0a0f1a]/40 space-y-10 sticky top-12">
            <div className="flex items-center gap-4 text-primary">
              <ImageIcon size={24} />
              <h3 className="text-xl font-black italic uppercase tracking-tighter">Portfolio Visuals</h3>
            </div>

            <div className="space-y-8">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative aspect-square rounded-[3rem] border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/[0.05] transition-all overflow-hidden"
              >
                {formData.logoUrl ? (
                  <>
                    <Image 
                      src={formData.logoUrl} 
                      alt="Site Logo" 
                      fill 
                      className="object-contain p-12 transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <CloudUpload size={48} className="text-primary" />
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary group-hover:scale-110 transition-transform">
                      <CloudUpload size={32} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white italic">Upload Portfolio Logo</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/20 italic mt-1">PNG or SVG Recommended</p>
                    </div>
                  </div>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center">
                    <Loader2 size={40} className="animate-spin text-primary" />
                  </div>
                )}
              </div>
              
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                className="hidden"
                accept="image/*"
              />

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <Zap size={14} />
                  <p className="text-[10px] font-black uppercase tracking-widest italic">Live Preview</p>
                </div>
                <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-black/40 border border-white/5">
                  <div className="w-12 h-12 relative mx-auto">
                    {formData.logoUrl ? (
                      <Image src={formData.logoUrl} alt="Logo" fill className="object-contain" />
                    ) : (
                      <div className="w-full h-full rounded bg-primary/20 animate-pulse" />
                    )}
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || !formData.logoUrl}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary italic transition-all flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                  Sync Visual Node
                </button>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/20 italic leading-relaxed text-center">
                  Click the button above to synchronize the logo across all neural site nodes.
                </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
