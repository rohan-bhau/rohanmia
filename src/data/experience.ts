export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  location: string;
  description: string;
  achievements: string[];
  skills: string[];
  isCurrent?: boolean;
}

export interface EngineeringPrinciple {
  title: string;
  tagline: string;
  description: string;
  iconName: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  focus: string;
  highlights: string[];
}

export const CAREER_EXPERIENCES: ExperienceItem[] = [
  {
    period: '2024 — Present',
    role: 'Senior Full Stack & Creative Engineer',
    company: 'Independent Contractor & Technical Lead',
    location: 'Remote // Global',
    description: 'Architecting enterprise full-stack web applications, distributed reservation platforms, and real-time interactive tools. Pioneering atomic database lock pipelines, sub-100ms UI navigations, and verified e-commerce marketplaces.',
    achievements: [
      'Engineered Reserva: High-throughput facility booking engine with verified 0.00% double-booking collision rate under concurrent stress simulations.',
      'Architected Qurbaniya: End-to-end verified livestock digital marketplace featuring Google OAuth, automated CDN media pipelines, and atomic transaction locks.',
      'Built Keen-Keeper: Modern relationship intelligence platform delivering sub-second dossier searches, contact cadence tracking, and dynamic health scores.'
    ],
    skills: ['Next.js 16', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'Framer Motion'],
    isCurrent: true
  },
  {
    period: '2022 — 2024',
    role: 'Full Stack Software Engineer',
    company: 'Client Solutions & Distributed Engineering',
    location: 'Remote',
    description: 'Spearheaded full-stack product development from wireframe prototypes to edge production deployments. Integrated hardened auth protocols, optimized MongoDB/PostgreSQL query aggregations, and engineered high-conversion landing systems.',
    achievements: [
      'Developed hardened REST API microservices with role-based access control (RBAC), HTTPOnly cookie sessions, and CSRF token defenses.',
      'Reduced initial page load latency by over 60% through Next.js hybrid server-side rendering, streaming SSR, and edge image caching.',
      'Constructed scalable design systems with reusable Tailwind tokens, fluid animations, and strict TypeScript types.'
    ],
    skills: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Prisma', 'REST APIs', 'JWT', 'Redis', 'Cloudinary']
  },
  {
    period: '2020 — 2022',
    role: 'Frontend Specialist & Web Engineer',
    company: 'Digital Product Studios',
    location: 'Dhaka, Bangladesh',
    description: 'Focused on core web fundamentals, pixel-perfect user interface engineering, and accessible design systems. Mastered modern JavaScript internals, state management paradigms, and cross-browser performance optimization.',
    achievements: [
      'Crafted 25+ modern responsive client web applications with zero cumulative layout shifts (CLS < 0.01).',
      'Conducted exhaustive performance profiling, consistently securing 95+ Google Lighthouse scores across accessibility and SEO.',
      'Championed modern CSS architectures, fluid micro-interactions, and component-driven engineering workflows.'
    ],
    skills: ['JavaScript (ES6+)', 'React', 'Tailwind CSS', 'Redux Toolkit', 'Git', 'HTML5/CSS3', 'Figma']
  }
];

export const ENGINEERING_PRINCIPLES: EngineeringPrinciple[] = [
  {
    title: 'Atomic Integrity & Zero Conflicts',
    tagline: 'Defensive concurrency by design',
    description: 'High-traffic applications fail at the margins of concurrency. I engineer systems with atomic database locks, optimistic UI state validation, and idempotent APIs to guarantee zero race conditions under peak rush loads.',
    iconName: 'ShieldCheck'
  },
  {
    title: 'Sub-100ms Perceived Performance',
    tagline: 'Speed is the fundamental feature',
    description: 'From Next.js App Router streaming and edge caching to lazy asset pipelines and zero-layout-shift typography, every byte sent over the wire is calibrated for instantaneous user feedback.',
    iconName: 'Zap'
  },
  {
    title: 'Type Safety from Data to UI',
    tagline: 'Eliminate runtime bugs at compile time',
    description: 'Strict TypeScript across shared monorepo packages, validated with Zod schemas at both client input and API boundaries, ensures seamless contracts between the client and server layers.',
    iconName: 'Code2'
  },
  {
    title: 'Cinematic Aesthetics & Ergonomics',
    tagline: 'Engineering meets creative artistry',
    description: 'Software should feel alive. I combine sleek dark-mode glassmorphism, dynamic multi-accent themes, and buttery GPU-accelerated micro-animations that turn mundane workflows into memorable moments.',
    iconName: 'Sparkles'
  }
];

export const EDUCATION_DATA: EducationItem[] = [
  {
    degree: 'B.Sc. in Computer Science & Engineering',
    institution: 'State University of Bangladesh',
    period: '2019 — 2023',
    focus: 'Software Engineering, Distributed Systems & Database Architecture',
    highlights: [
      'Graduated with strong foundations in data structures, algorithms, object-oriented design, and network protocols.',
      'Conducted research capstone in distributed web architectures and concurrent transaction management.'
    ]
  }
];

export const CORE_COMPETENCIES = [
  { category: 'Architecture', items: ['App Router SSR', 'Microservices', 'Distributed Locks', 'Event-Driven APIs', 'Monorepos'] },
  { category: 'Frontend', items: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Framer Motion'] },
  { category: 'Backend & DB', items: ['Node.js', 'Express', 'MongoDB / Mongoose', 'PostgreSQL', 'Prisma ORM'] },
  { category: 'DevOps & Cloud', items: ['Docker', 'Vercel Edge', 'Cloudinary CDN', 'Google OAuth 2.0', 'Git CI/CD'] }
];
