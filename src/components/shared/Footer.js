'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, ArrowUpRight, Send, Globe, Cpu } from 'lucide-react';
import { 
  FaGithub, 
  FaLinkedin, 
  FaXTwitter, 
  FaFacebook, 
  FaInstagram, 
  FaYoutube, 
  FaWhatsapp, 
  FaTelegram, 
  FaDiscord, 
  FaTiktok, 
  FaSnapchat, 
  FaPinterest, 
  FaReddit, 
  FaDribbble, 
  FaBehance, 
  FaGlobe 
} from 'react-icons/fa6';
import Magnetic from './Magnetic';
import Tooltip from './Tooltip';

const ICON_MAP = {
  Github: FaGithub,
  Linkedin: FaLinkedin,
  Twitter: FaXTwitter,
  Instagram: FaInstagram,
  Facebook: FaFacebook,
  Youtube: FaYoutube,
  Portfolio: FaGlobe,
  WhatsApp: FaWhatsapp,
  Telegram: FaTelegram,
  Discord: FaDiscord,
  TikTok: FaTiktok,
  Snapchat: FaSnapchat,
  Pinterest: FaPinterest,
  Reddit: FaReddit,
  Dribbble: FaDribbble,
  Behance: FaBehance
};

const footerLinks = [
  {
    title: "Navigation",
    links: [
      { name: "Home", href: "/" },
      { name: "Tech Stack", href: "/tech-stack" },
      { name: "Projects", href: "/projects" },
      { name: "About Me", href: "/about" },
    ]
  },
  {
    title: "Services",
    links: [
      { name: "Web Architecture", href: "#" },
      { name: "UI/UX Engineering", href: "#" },
      { name: "Consultation", href: "#" },
      { name: "Full Stack Development", href: "#" },
    ]
  },
  {
    title: "Resources",
    links: [
      { name: "Gallery", href: "/gallery" },
      { name: "Skills", href: "/skills" },
      { name: "Qualification", href: "/qualification" },
      { name: "Testimonials", href: "/testimonials" },
    ]
  }
];

export default function Footer({ contactData }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-40 border-t border-border bg-background overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-6 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-24">
          {/* Left Side: Brand & CTA */}
          <div className="space-y-12">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Cpu size={20} />
                </div>
                <span className="text-2xl font-black text-foreground tracking-tighter uppercase italic">
                  Rohan <span className="text-primary">Mia</span>
                </span>
              </motion.div>
              <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter uppercase italic leading-[0.9]">
                Ready to build <br />
                <span className="text-primary text-glow italic">the future?</span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-6">
              <Magnetic strength={0.2}>
                <Link
                  href="/contact"
                  className="px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase italic tracking-widest text-sm flex items-center gap-3 group shadow-[0_20px_40px_rgba(14,165,233,0.3)] transition-transform hover:scale-105 active:scale-95"
                >
                  Start Project <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </Magnetic>
              <div className="flex items-center gap-4">
                {(contactData?.socials || [
                  { name: "Github", url: "https://github.com" },
                  { name: "Linkedin", url: "https://linkedin.com" },
                  { name: "Twitter", url: "https://twitter.com" },
                ])
                .filter(social => ['linkedin', 'twitter', 'github'].includes(social.name.toLowerCase()))
                .map((social, i) => {
                  const Icon = ICON_MAP[social.name] || FaGlobe;
                  return (
                    <Magnetic key={i} strength={0.3}>
                      <Tooltip text={`View ${social.name}`} position="top">
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-14 h-14 rounded-2xl glass border border-border flex items-center justify-center text-foreground/40 hover:text-foreground hover:border-primary/50 transition-all"
                        >
                          <Icon size={22} />
                        </a>
                      </Tooltip>
                    </Magnetic>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side: Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            {footerLinks.map((section, i) => (
              <div key={section.title} className="space-y-8">
                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] opacity-60">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium flex items-center gap-2 group"
                      >
                        {link.name}
                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: System Status */}
        <div className="pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-tighter uppercase">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System_Online // {currentYear}
            </div>
            <div className="hidden md:block w-px h-3 bg-border" />
            <div className="text-[10px] font-mono tracking-tighter uppercase">
              LATENCY: 24MS
            </div>
            <div className="hidden md:block w-px h-3 bg-border" />
            <div className="text-[10px] font-mono tracking-tighter uppercase">
              Uptime: 99.9%
            </div>
          </div>

          <div className="text-[10px] font-mono tracking-tighter uppercase">
            &copy; {currentYear} Designed & Engineered by Bhau. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
