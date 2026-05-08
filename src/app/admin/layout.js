'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Wrench, 
  MessageSquare, 
  Image as ImageIcon, 
  Settings,
  LogOut,
  Bell,
  Users,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { name: 'Tech Stack', href: '/admin/tech-stack', icon: Database },
  { name: 'Skills', href: '/admin/skills', icon: Wrench },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Leads', href: '/admin/leads', icon: Users },
  { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

import { useState, useEffect } from 'react';
import { getHomeContent } from '@/actions/content';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [adminIdentity, setAdminIdentity] = useState(null);

  useEffect(() => {
    const fetchIdentity = async () => {
      const data = await getHomeContent('hero');
      setAdminIdentity(data);
    };
    fetchIdentity();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#080c14] text-white selection:bg-primary/30">
      {/* Dynamic Background Accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0f1a]/80 backdrop-blur-3xl fixed h-full z-50">
        <div className="p-8">
          <Link href="/admin" className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-black text-2xl shadow-[0_10px_25px_rgba(14,165,233,0.3)] group-hover:scale-110 transition-transform italic">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xs uppercase tracking-[0.4em] text-white/40 italic">Command</span>
              <span className="font-black text-sm uppercase tracking-[0.1em] text-white group-hover:text-primary transition-colors">Center</span>
            </div>
          </Link>
        </div>

        <nav className="mt-6 px-4 space-y-3">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  isActive 
                  ? "bg-white/[0.03] border border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.2)]" 
                  : "text-white/20 hover:text-white hover:bg-white/[0.02]"
                )}>
                  {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-full" />}
                  <item.icon size={18} className={cn(isActive ? "text-primary" : "group-hover:text-primary transition-colors")} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className="font-black text-[10px] uppercase tracking-[0.3em] italic">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-4">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-white/10 hover:bg-red-500/5 hover:text-red-500 transition-all duration-300 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-black text-[10px] uppercase tracking-[0.3em] italic">Deauthorize</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-12 relative z-10">
        <header className="flex justify-between items-center mb-16">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 italic">Intelligence Protocol</h2>
            </div>
            <h1 className="text-4xl font-black tracking-tight italic uppercase">
              Welcome back, <span className="text-primary text-glow">Admin</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-white/20 hover:text-primary hover:border-primary/20 transition-all group">
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            </button>
            <div className="flex items-center gap-4 p-1.5 pr-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-xl border border-white/10 overflow-hidden shadow-lg bg-black/40">
                <img 
                  src={adminIdentity?.bannerImage || "/profile.png"} 
                  alt="Admin" 
                  className="w-full h-full object-cover transition-all duration-500" 
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-white italic leading-none whitespace-nowrap">
                  {adminIdentity?.firstName || "Rohan"} {adminIdentity?.lastName || "Mia"}
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest text-primary italic">Clearance Level 5</span>
              </div>
            </div>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
