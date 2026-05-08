'use client';

import { motion } from 'framer-motion';
import { Mail, Send, MapPin, Phone } from 'lucide-react';
import { FaGithub, FaLinkedin, FaXTwitter, FaFacebook, FaInstagram, FaYoutube, FaGlobe } from 'react-icons/fa6';
import { useState, useEffect } from 'react';
import Magnetic from '@/components/shared/Magnetic';
import { getContactData, sendMessage } from '@/actions/contact';
import { toast } from 'sonner';

const ICON_MAP = {
  Github: FaGithub,
  Linkedin: FaLinkedin,
  Twitter: FaXTwitter,
  Instagram: FaInstagram,
  Facebook: FaFacebook,
  Youtube: FaYoutube,
  Portfolio: FaGlobe
};

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle, loading, success
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      const data = await getContactData();
      if (data) setContactInfo(data);
    };
    fetchInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    const res = await sendMessage(formData);
    
    if (res.success) {
      setStatus('success');
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('idle');
      toast.error('Failed to send message. Please try again.');
    }
  };

  const contactItems = [
    { icon: Mail, label: "Email", value: contactInfo?.email || "rohan@example.com" },
    { icon: Phone, label: "Phone", value: contactInfo?.phone || "+880 1234 567890" },
    { icon: MapPin, label: "Location", value: contactInfo?.address || "Dhaka, Bangladesh" },
  ];

  return (
    <div className="pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Side: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
                Let&apos;s <span className="text-primary text-glow">Connect</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-md">
                Have a project in mind or just want to say hi? I&apos;m always open to discussing new ideas and opportunities.
              </p>
            </div>

            <div className="space-y-6">
              {contactItems.map((item, i) => (
                <div key={i} className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-2xl glass border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{item.label}</p>
                    <p className="text-white font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Follow Me</p>
              <div className="flex gap-4">
                {(contactInfo?.socials || [
                  { name: 'Github', url: '#' },
                  { name: 'Linkedin', url: '#' },
                  { name: 'Twitter', url: '#' },
                  { name: 'Facebook', url: '#' },
                  { name: 'Instagram', url: '#' }
                ]).map((social, i) => {
                  const Icon = ICON_MAP[social.name] || FaGlobe;
                  return (
                    <Magnetic key={i} strength={0.2}>
                      <a 
                        href={social.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl glass border-white/10 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/50 transition-all cursor-pointer"
                      >
                        <Icon size={20} />
                      </a>
                    </Magnetic>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right Side: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/5 blur-[100px] -z-10" />
            <div className="glass border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 ml-2">Name</label>
                    <input
                      required
                      type="text"
                      className="w-full glass border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 ml-2">Email</label>
                    <input
                      required
                      type="email"
                      className="w-full glass border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-2">Message</label>
                  <textarea
                    required
                    rows={6}
                    className="w-full glass border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all resize-none"
                    placeholder="Tell me about your project..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                
                <Magnetic>
                  <button
                    disabled={status === 'loading'}
                    type="submit"
                    className="group relative w-full md:w-auto px-12 py-4 bg-primary text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all flex items-center justify-center gap-3 overflow-hidden"
                  >
                    {status === 'loading' ? (
                      <span className="animate-pulse">Sending...</span>
                    ) : status === 'success' ? (
                      <span>Message Sent!</span>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </Magnetic>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
