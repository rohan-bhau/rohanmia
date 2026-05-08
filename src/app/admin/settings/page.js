'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, Share2, Type, Layout } from 'lucide-react';
import { getSettings, updateSettings } from '@/actions/settings';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    const data = await getSettings();
    setSettings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateSettings(settings);
    setSaving(false);
    alert('Settings updated successfully!');
  };

  if (loading) return <p className="text-gray-400">Loading neural settings...</p>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Website Settings</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          {saving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
        </button>
      </div>

      <div className="space-y-8">
        {/* Hero Section CMS */}
        <div className="glass border-white/5 p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-3 text-primary">
            <Layout size={24} />
            <h3 className="text-xl font-bold">Hero & Branding</h3>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-500 font-medium">Hero Description</label>
              <textarea 
                className="w-full glass border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary h-32"
                value={settings.heroText}
                onChange={(e) => setSettings({ ...settings, heroText: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500 font-medium">Typewriter Titles (Comma separated)</label>
              <input 
                className="w-full glass border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary"
                value={settings.typewriterTitles?.join(', ')}
                onChange={(e) => setSettings({ ...settings, typewriterTitles: e.target.value.split(',').map(t => t.trim()) })}
              />
            </div>
          </div>
        </div>

        {/* Social Links CMS */}
        <div className="glass border-white/5 p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-3 text-accent">
            <Share2 size={24} />
            <h3 className="text-xl font-bold">Social Connections</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['github', 'linkedin', 'twitter', 'instagram'].map((platform) => (
              <div key={platform} className="space-y-2">
                <label className="text-sm text-gray-500 font-medium capitalize">{platform} URL</label>
                <input 
                  className="w-full glass border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent"
                  value={settings.socialLinks?.[platform] || ''}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    socialLinks: { ...settings.socialLinks, [platform]: e.target.value } 
                  })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SEO Settings CMS */}
        <div className="glass border-white/5 p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-3 text-green-500">
            <Globe size={24} />
            <h3 className="text-xl font-bold">SEO & Metadata</h3>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-500 font-medium">Meta Title</label>
              <input 
                className="w-full glass border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-green-500"
                value={settings.seo?.title || ''}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  seo: { ...settings.seo, title: e.target.value } 
                })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500 font-medium">Meta Description</label>
              <textarea 
                className="w-full glass border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-green-500 h-24"
                value={settings.seo?.description || ''}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  seo: { ...settings.seo, description: e.target.value } 
                })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
