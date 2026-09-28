import React from 'react';
import { 
  SiNextdotjs, 
  SiReact, 
  SiTypescript, 
  SiTailwindcss, 
  SiPostgresql, 
  SiMongodb, 
  SiNodedotjs, 
  SiExpress, 
  SiPrisma, 
  SiGit, 
  SiDocker, 
  SiRedux, 
  SiFramer,
  SiJavascript,
  SiHtml5,
  SiCss,
  SiVercel,
  SiSupabase,
  SiFigma,
  SiRedis,
  SiStripe,
  SiCloudinary,
  SiJsonwebtokens,
  SiSocketdotio
} from 'react-icons/si';
import { Code2, Cpu, Database, Server } from 'lucide-react';

interface TechBadgeProps {
  name: string;
  size?: 'sm' | 'md';
  className?: string;
}

const ICON_MAP: Record<string, { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>; color: string }> = {
  'Next.js': { icon: SiNextdotjs, color: '#ffffff' },
  'Next.js 16': { icon: SiNextdotjs, color: '#ffffff' },
  'Next.js 16 (App Router)': { icon: SiNextdotjs, color: '#ffffff' },
  'React': { icon: SiReact, color: '#61DAFB' },
  'React 19': { icon: SiReact, color: '#61DAFB' },
  'React Flow': { icon: SiReact, color: '#61DAFB' },
  'TypeScript': { icon: SiTypescript, color: '#3178C6' },
  'JavaScript': { icon: SiJavascript, color: '#F7DF1E' },
  'Tailwind CSS': { icon: SiTailwindcss, color: '#06B6D4' },
  'Tailwind CSS v4': { icon: SiTailwindcss, color: '#06B6D4' },
  'Tailwind v4': { icon: SiTailwindcss, color: '#06B6D4' },
  'PostgreSQL': { icon: SiPostgresql, color: '#4169E1' },
  'MongoDB': { icon: SiMongodb, color: '#47A248' },
  'Node.js': { icon: SiNodedotjs, color: '#339933' },
  'Express': { icon: SiExpress, color: '#ffffff' },
  'Express.js': { icon: SiExpress, color: '#ffffff' },
  'Prisma': { icon: SiPrisma, color: '#5a67d8' },
  'Git': { icon: SiGit, color: '#F05032' },
  'Docker': { icon: SiDocker, color: '#2496ED' },
  'Redux Toolkit': { icon: SiRedux, color: '#764ABC' },
  'Redux Toolkit / RTK Query': { icon: SiRedux, color: '#764ABC' },
  'RTK Query': { icon: SiRedux, color: '#764ABC' },
  'Framer Motion': { icon: SiFramer, color: '#E10098' },
  'Vercel': { icon: SiVercel, color: '#ffffff' },
  'Vercel Edge': { icon: SiVercel, color: '#ffffff' },
  'Vercel Deployment': { icon: SiVercel, color: '#ffffff' },
  'Supabase': { icon: SiSupabase, color: '#3ECF8E' },
  'Figma': { icon: SiFigma, color: '#F24E1E' },
  'Redis': { icon: SiRedis, color: '#DC382D' },
  'Stripe': { icon: SiStripe, color: '#635BFF' },
  'Cloudinary': { icon: SiCloudinary, color: '#3448C5' },
  'JWT': { icon: SiJsonwebtokens, color: '#ffffff' },
  'WebSocket': { icon: SiSocketdotio, color: '#ffffff' },
  'HTML5': { icon: SiHtml5, color: '#E34F26' },
  'CSS3': { icon: SiCss, color: '#1572B6' }
};

function getIconForTech(name: string) {
  if (ICON_MAP[name]) return ICON_MAP[name];

  const lower = name.toLowerCase();
  if (lower.includes('next')) return ICON_MAP['Next.js'];
  if (lower.includes('react')) return ICON_MAP['React'];
  if (lower.includes('typescript') || lower === 'ts') return ICON_MAP['TypeScript'];
  if (lower.includes('javascript') || lower === 'js') return ICON_MAP['JavaScript'];
  if (lower.includes('tailwind')) return ICON_MAP['Tailwind CSS'];
  if (lower.includes('postgres') || lower.includes('sql')) return ICON_MAP['PostgreSQL'];
  if (lower.includes('mongo')) return ICON_MAP['MongoDB'];
  if (lower.includes('node')) return ICON_MAP['Node.js'];
  if (lower.includes('express')) return ICON_MAP['Express'];
  if (lower.includes('prisma')) return ICON_MAP['Prisma'];
  if (lower.includes('docker')) return ICON_MAP['Docker'];
  if (lower.includes('redis')) return ICON_MAP['Redis'];
  if (lower.includes('stripe')) return ICON_MAP['Stripe'];
  if (lower.includes('redux')) return ICON_MAP['Redux Toolkit'];
  if (lower.includes('framer')) return ICON_MAP['Framer Motion'];
  if (lower.includes('cloudinary')) return ICON_MAP['Cloudinary'];
  if (lower.includes('socket') || lower.includes('realtime')) return ICON_MAP['WebSocket'];
  if (lower.includes('jwt') || lower.includes('auth')) return ICON_MAP['JWT'];
  if (lower.includes('db') || lower.includes('data')) return { icon: Database, color: '#38bdf8' };
  if (lower.includes('api') || lower.includes('server')) return { icon: Server, color: '#a855f7' };
  if (lower.includes('ai') || lower.includes('gemini')) return { icon: Cpu, color: '#ec4899' };

  return { icon: Code2, color: '#94a3b8' };
}

export default function TechBadge({ name, size = 'sm', className = '' }: TechBadgeProps) {
  const match = getIconForTech(name);
  const Icon = match.icon;
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg bg-[#12141c]/90 hover:bg-[#181a24] border border-white/[0.09] hover:border-white/20 transition-all text-neutral-300 font-mono font-medium uppercase tracking-wider whitespace-nowrap shadow-sm ${
        isSmall ? 'px-2.5 py-1 text-[10px] sm:text-[11px]' : 'px-3 py-1.5 text-xs'
      } ${className}`}
    >
      <Icon 
        size={isSmall ? 12 : 14} 
        style={{ color: match.color }}
        className="flex-shrink-0"
      />
      <span>{name}</span>
    </span>
  );
}
