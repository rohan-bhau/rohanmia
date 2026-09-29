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
    role: 'Full-Stack Developer & Software Builder',
    company: 'Independent Project Based',
    location: 'Dhaka, Bangladesh · Remote',
    description: 'Building modern full-stack web applications, exploring distributed system architectures, and engineering clean, accessible user experiences. Focused on atomic transactional integrity, responsive UI engineering, and API design.',
    achievements: [
      'Engineered Reserva: Full-stack facility booking platform with atomic database operations preventing concurrent double-booking collisions.',
      'Architected Qurbaniya: Livestock digital marketplace featuring Google OAuth, automated media pipelines, and role-based access control.',
      'Built Keen-Keeper: Personal relationship intelligence application delivering instant searches, cadence tracking, and interaction logs.'
    ],
    skills: ['Next.js 16', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'Framer Motion'],
    isCurrent: true
  },
  {
    period: '2023 — 2024',
    role: 'Frontend & Web Developer',
    company: 'Web Projects & Freelance',
    location: 'Remote',
    description: 'Focused on core web standards, component architecture, and responsive design systems. Mastered modern JavaScript, React ecosystem, and clean REST API integrations.',
    achievements: [
      'Crafted responsive, accessible client web applications with zero cumulative layout shifts and optimized rendering.',
      'Integrated RESTful APIs, JWT authentication routines, and asynchronous data fetching with optimistic feedback.',
      'Maintained consistent UI design systems with reusable Tailwind CSS utility classes and modern animations.'
    ],
    skills: ['JavaScript', 'React', 'Tailwind CSS', 'Redux Toolkit', 'Node.js', 'Git', 'HTML5', 'Figma']
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
