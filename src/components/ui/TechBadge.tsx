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
  SiSocketdotio,
  SiZod,
  SiGoogle,
  SiPostman,
  SiGithub,
  SiLinux,
  SiVscodium,
  SiBun,
  SiGraphql,
  SiSass,
  SiVuedotjs,
  SiSvelte,
  SiPython,
  SiGo,
  SiRust,
  SiFirebase,
  SiVite,
  SiTurborepo,
  SiKubernetes,
  SiOpenai,
  SiPnpm,
  SiYarn,
  SiNginx,
  SiNpm,
  SiNestjs,
  SiFastapi,
  SiDjango,
  SiFlask,
  SiMysql,
  SiSqlite,
  SiDrizzle,
  SiClerk,
  SiShadcnui,
  SiWebpack,
  SiBabel,
  SiJest,
  SiCypress,
  SiVitest,
  SiMongoose,
  SiResend,
  SiPusher
} from 'react-icons/si';
import { FaAws } from 'react-icons/fa6';
import { Code2, Cpu, Database, Server, Laptop, Monitor } from 'lucide-react';

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
  'CSS3': { icon: SiCss, color: '#1572B6' },
  'Zod': { icon: SiZod, color: '#3E67B1' },
  'Google OAuth 2.0': { icon: SiGoogle, color: '#4285F4' },
  'Google Cloud': { icon: SiGoogle, color: '#4285F4' },
  'Postman': { icon: SiPostman, color: '#FF6C37' },
  'GitHub': { icon: SiGithub, color: '#ffffff' },
  'Linux': { icon: SiLinux, color: '#FCC624' },
  'VS Code & Antigravity IDE': { icon: SiVscodium, color: '#007ACC' },
  'Dual Display Workstation': { icon: Monitor, color: '#38BDF8' },
  'Bun': { icon: SiBun, color: '#FBF0DF' },
  'GraphQL': { icon: SiGraphql, color: '#E10098' },
  'Sass': { icon: SiSass, color: '#CC6699' },
  'Vue': { icon: SiVuedotjs, color: '#4FC08D' },
  'Vue.js': { icon: SiVuedotjs, color: '#4FC08D' },
  'Svelte': { icon: SiSvelte, color: '#FF3E00' },
  'Python': { icon: SiPython, color: '#3776AB' },
  'Go': { icon: SiGo, color: '#00ADD8' },
  'Golang': { icon: SiGo, color: '#00ADD8' },
  'Rust': { icon: SiRust, color: '#DEA584' },
  'Firebase': { icon: SiFirebase, color: '#FFCA28' },
  'Vite': { icon: SiVite, color: '#646CFF' },
  'Turborepo': { icon: SiTurborepo, color: '#EF4444' },
  'Kubernetes': { icon: SiKubernetes, color: '#326CE5' },
  'OpenAI': { icon: SiOpenai, color: '#10A37F' },
  'AI / LLM': { icon: SiOpenai, color: '#10A37F' },
  'pnpm': { icon: SiPnpm, color: '#F69220' },
  'Yarn': { icon: SiYarn, color: '#2C8EBB' },
  'Nginx': { icon: SiNginx, color: '#009639' },
  'npm': { icon: SiNpm, color: '#CB3837' },
  'NestJS': { icon: SiNestjs, color: '#E0234E' },
  'FastAPI': { icon: SiFastapi, color: '#009688' },
  'Django': { icon: SiDjango, color: '#092E20' },
  'Flask': { icon: SiFlask, color: '#ffffff' },
  'MySQL': { icon: SiMysql, color: '#4479A1' },
  'SQLite': { icon: SiSqlite, color: '#003B57' },
  'Drizzle': { icon: SiDrizzle, color: '#C5F74F' },
  'Drizzle ORM': { icon: SiDrizzle, color: '#C5F74F' },
  'Clerk': { icon: SiClerk, color: '#6C47FF' },
  'Shadcn': { icon: SiShadcnui, color: '#ffffff' },
  'Shadcn UI': { icon: SiShadcnui, color: '#ffffff' },
  'Webpack': { icon: SiWebpack, color: '#8DD6F9' },
  'Babel': { icon: SiBabel, color: '#F9DC3E' },
  'Jest': { icon: SiJest, color: '#C21325' },
  'Cypress': { icon: SiCypress, color: '#17202C' },
  'Vitest': { icon: SiVitest, color: '#FCC72B' },
  'Mongoose': { icon: SiMongoose, color: '#880000' },
  'Resend': { icon: SiResend, color: '#ffffff' },
  'Pusher': { icon: SiPusher, color: '#300D4F' },
  'AWS': { icon: FaAws, color: '#FF9900' },
};

export function getIconForTech(name: string) {
  if (!name) return { icon: Code2, color: '#94a3b8' };
  if (ICON_MAP[name]) return ICON_MAP[name];

  const lower = name.toLowerCase().trim();
  if (lower.includes('next')) return ICON_MAP['Next.js'];
  if (lower.includes('react')) return ICON_MAP['React'];
  if (lower.includes('typescript') || lower === 'ts') return ICON_MAP['TypeScript'];
  if (lower.includes('javascript') || lower === 'js') return ICON_MAP['JavaScript'];
  if (lower.includes('tailwind')) return ICON_MAP['Tailwind CSS'];
  if (lower.includes('postgres') || lower.includes('pg')) return ICON_MAP['PostgreSQL'];
  if (lower.includes('mongo')) return ICON_MAP['MongoDB'];
  if (lower.includes('node')) return ICON_MAP['Node.js'];
  if (lower.includes('express')) return ICON_MAP['Express'];
  if (lower.includes('prisma')) return ICON_MAP['Prisma'];
  if (lower.includes('drizzle')) return ICON_MAP['Drizzle'];
  if (lower.includes('docker')) return ICON_MAP['Docker'];
  if (lower.includes('k8s') || lower.includes('kubernetes')) return ICON_MAP['Kubernetes'];
  if (lower.includes('redis')) return ICON_MAP['Redis'];
  if (lower.includes('stripe')) return ICON_MAP['Stripe'];
  if (lower.includes('redux')) return ICON_MAP['Redux Toolkit'];
  if (lower.includes('framer')) return ICON_MAP['Framer Motion'];
  if (lower.includes('cloudinary')) return ICON_MAP['Cloudinary'];
  if (lower.includes('socket') || lower.includes('realtime')) return ICON_MAP['WebSocket'];
  if (lower.includes('jwt') || lower.includes('auth')) return ICON_MAP['JWT'];
  if (lower.includes('clerk')) return ICON_MAP['Clerk'];
  if (lower.includes('zod')) return ICON_MAP['Zod'];
  if (lower.includes('google')) return ICON_MAP['Google OAuth 2.0'];
  if (lower.includes('aws') || lower.includes('amazon')) return ICON_MAP['AWS'];
  if (lower.includes('firebase')) return ICON_MAP['Firebase'];
  if (lower.includes('bun')) return ICON_MAP['Bun'];
  if (lower.includes('vite')) return ICON_MAP['Vite'];
  if (lower.includes('turborepo') || lower.includes('turbo')) return ICON_MAP['Turborepo'];
  if (lower.includes('graphql') || lower.includes('gql')) return ICON_MAP['GraphQL'];
  if (lower.includes('python') || lower.includes('py')) return ICON_MAP['Python'];
  if (lower.includes('golang') || lower === 'go') return ICON_MAP['Go'];
  if (lower.includes('rust')) return ICON_MAP['Rust'];
  if (lower.includes('vue')) return ICON_MAP['Vue'];
  if (lower.includes('svelte')) return ICON_MAP['Svelte'];
  if (lower.includes('sass') || lower.includes('scss')) return ICON_MAP['Sass'];
  if (lower.includes('mysql')) return ICON_MAP['MySQL'];
  if (lower.includes('sqlite')) return ICON_MAP['SQLite'];
  if (lower.includes('nest')) return ICON_MAP['NestJS'];
  if (lower.includes('fastapi')) return ICON_MAP['FastAPI'];
  if (lower.includes('django')) return ICON_MAP['Django'];
  if (lower.includes('flask')) return ICON_MAP['Flask'];
  if (lower.includes('resend')) return ICON_MAP['Resend'];
  if (lower.includes('pusher')) return ICON_MAP['Pusher'];
  if (lower.includes('shadcn')) return ICON_MAP['Shadcn UI'];
  if (lower.includes('openai') || lower.includes('ai') || lower.includes('gemini') || lower.includes('llm')) return ICON_MAP['OpenAI'];
  if (lower.includes('vscode') || lower.includes('ide') || lower.includes('editor')) return ICON_MAP['VS Code & Antigravity IDE'];
  if (lower.includes('monitor') || lower.includes('workstation') || lower.includes('display')) return ICON_MAP['Dual Display Workstation'];
  if (lower.includes('git')) return ICON_MAP['Git'];
  if (lower.includes('linux')) return ICON_MAP['Linux'];
  if (lower.includes('db') || lower.includes('data')) return { icon: Database, color: '#38bdf8' };
  if (lower.includes('api') || lower.includes('server')) return { icon: Server, color: '#a855f7' };

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
