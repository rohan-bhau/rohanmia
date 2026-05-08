'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Plus, Trash2, Globe, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getContactData, updateContactData } from '@/actions/contact';

const SOCIAL_OPTIONS = [
  { name: 'Github', icon: 'Github' },
  { name: 'Linkedin', icon: 'Linkedin' },
  { name: 'Twitter', icon: 'Twitter' },
  { name: 'Instagram', icon: 'Instagram' },
  { name: 'Facebook', icon: 'Facebook' },
  { name: 'Youtube', icon: 'Youtube' },
  { name: 'Portfolio', icon: 'Globe' },
  { name: 'WhatsApp', icon: 'MessageCircle' },
  { name: 'Telegram', icon: 'Send' },
  { name: 'Discord', icon: 'MessageSquare' },
  { name: 'TikTok', icon: 'Video' },
  { name: 'Snapchat', icon: 'Ghost' },
  { name: 'Pinterest', icon: 'Pin' },
  { name: 'Reddit', icon: 'Activity' },
  { name: 'Dribbble', icon: 'Dribbble' },
  { name: 'Behance', icon: 'Behance' }
];

export default function ContactManager() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const result = await getContactData();
    if (result) {
      setData(result);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await updateContactData(data);
    setSaving(false);
    if (res.success) {
      showToast('Contact Intelligence Synchronized', 'success');
    } else {
      showToast('Synchronization Failed', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addSocial = () => {
    // Find available options that haven't been added yet
    const usedNames = data.socials.map(s => s.name);
    const availableOption = SOCIAL_OPTIONS.find(opt => !usedNames.includes(opt.name));
    
    if (availableOption) {
      setData({
        ...data,
        socials: [...data.socials, { name: availableOption.name, url: '' }]
      });
    } else {
      showToast('All available social protocols established', 'error');
    }
  };

  const removeSocial = (index) => {
    const newSocials = [...data.socials];
    newSocials.splice(index, 1);
    setData({ ...data, socials: newSocials });
  };

  const updateSocial = (index, field, value) => {
    const newSocials = [...data.socials];
    newSocials[index][field] = value;
    setData({ ...data, socials: newSocials });
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4 opacity-20">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Accessing Contact Node...</p>
      </div>
    );
  }

  const usedNames = data?.socials?.map(s => s.name) || [];

  return (
    <div className="space-y-12">
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

      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h4 className="text-xl font-black italic uppercase tracking-tight text-white/80">Communication Hub</h4>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Manage your digital presence and contact details</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] italic rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Anchor Contact Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Mail size={16} />
              <label className="text-[10px] font-black uppercase tracking-widest italic">Email Address</label>
            </div>
            <input 
              type="email"
              value={data?.email || ''}
              onChange={(e) => setData({...data, email: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60 italic focus:outline-none focus:border-primary transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Phone size={16} />
              <label className="text-[10px] font-black uppercase tracking-widest italic">Phone Number</label>
            </div>
            <input 
              type="text"
              value={data?.phone || ''}
              onChange={(e) => setData({...data, phone: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60 italic focus:outline-none focus:border-primary transition-all"
              placeholder="+880 1234 567890"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <MapPin size={16} />
              <label className="text-[10px] font-black uppercase tracking-widest italic">Physical Location</label>
            </div>
            <input 
              type="text"
              value={data?.address || ''}
              onChange={(e) => setData({...data, address: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60 italic focus:outline-none focus:border-primary transition-all"
              placeholder="City, Country"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-primary">
              <Globe size={16} />
              <label className="text-[10px] font-black uppercase tracking-widest italic">Social Protocols</label>
            </div>
            <button 
              onClick={addSocial}
              disabled={usedNames.length >= SOCIAL_OPTIONS.length}
              className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>

          <div 
            data-lenis-prevent
            className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar overscroll-contain"
          >
            {data?.socials?.map((social, index) => (
              <div key={index} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 relative group">
                <button 
                  onClick={() => removeSocial(index)}
                  className="absolute top-4 right-4 p-2 text-white/10 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">Platform</label>
                    <select 
                      value={social.name}
                      onChange={(e) => updateSocial(index, 'name', e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[10px] text-white/60 italic appearance-none outline-none"
                    >
                      {SOCIAL_OPTIONS.map(opt => {
                        const isUsed = usedNames.includes(opt.name) && opt.name !== social.name;
                        return (
                          <option 
                            key={opt.name} 
                            value={opt.name} 
                            disabled={isUsed}
                            className={`${isUsed ? 'hidden' : 'bg-[#0d121f] text-white'}`}
                          >
                            {opt.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">URL Link</label>
                    <input 
                      type="text"
                      value={social.url}
                      onChange={(e) => updateSocial(index, 'url', e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[10px] text-white/60 italic"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            ))}
            {data?.socials?.length === 0 && (
              <div className="h-32 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/10 italic">
                No Social Links Established
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
