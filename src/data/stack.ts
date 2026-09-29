export interface TechItem {
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps & Cloud' | 'Architecture & Tools' | 'Hardware & Environment';
  description: string;
  proficiency: number; // 0 - 100
  isCore: boolean;
  useCase: string;
  docsUrl: string;
  version?: string;
  productionProject?: string;
  brandColor: string;
}

export interface StackCategory {
  number: string;
  /**
   * Title of the category.
   * STRICT LAYOUT CONSTRAINT FOR ADMIN PANEL:
   * - Max 48 characters (approx. 4 - 6 words).
   * - Layout allows max 2 lines at large serif display size before center divider.
   * - Example 1-line: "Frontend Architecture" (21 chars, 2 words)
   * - Example 2-line: "DevOps & Global Infrastructure" (30 chars, 4 words)
   */
  title: string;
  subtitle: string;
  description: string;
  philosophy: string;
  badge: string;
  items: TechItem[];
}

export const STACK_CATEGORIES: StackCategory[] = [
  {
    number: '01',
    title: 'Frontend Architecture',
    subtitle: 'Client Engines & Interactive Systems',
    description: 'Modern, GPU-accelerated client interfaces built for sub-100ms navigation, zero layout shifts, and cinematic responsiveness.',
    philosophy: 'Prioritize perceived performance, optimistic UI updates, and strict design token consistency.',
    badge: 'UI & CLIENT ENGINES',
    items: [
      {
        name: 'Next.js 16',
        category: 'Frontend',
        version: 'v16.0 (App Router)',
        description: 'App Router, Streaming SSR, Server Actions, Turbopack bundling, and Edge Route handlers.',
        proficiency: 98,
        isCore: true,
        useCase: 'Primary full-stack framework across all production platforms.',
        productionProject: 'Reserva & Keen-Keeper',
        docsUrl: 'https://nextjs.org/docs',
        brandColor: '#ffffff'
      },
      {
        name: 'React 19',
        category: 'Frontend',
        version: 'v19.0',
        description: 'Server Components, concurrent rendering, optimistic UI transitions, and custom hooks architecture.',
        proficiency: 96,
        isCore: true,
        useCase: 'Component logic, interactive booking calendars, and client state orchestration.',
        productionProject: 'Reserva & Qurbaniya',
        docsUrl: 'https://react.dev',
        brandColor: '#61DAFB'
      },
      {
        name: 'TypeScript',
        category: 'Frontend',
        version: 'v5.8 Strict',
        description: 'Strict typing, generic interfaces, template literal types, and compile-time contract safety across monorepos.',
        proficiency: 95,
        isCore: true,
        useCase: 'Used 100% across frontend, backend microservices, and shared data contracts.',
        productionProject: 'All Production Repos',
        docsUrl: 'https://www.typescriptlang.org/docs/',
        brandColor: '#3178C6'
      },
      {
        name: 'Tailwind CSS v4',
        category: 'Frontend',
        version: 'v4.0 Alpha/Stable',
        description: 'CSS variables theme engine, dynamic color tokens, glassmorphic filters, and fluid layouts.',
        proficiency: 100,
        isCore: true,
        useCase: 'Design system styling, custom multi-accent palettes, and responsive glass UI.',
        productionProject: 'Portfolio V2 & Reserva',
        docsUrl: 'https://tailwindcss.com/docs',
        brandColor: '#06B6D4'
      },
      {
        name: 'Framer Motion',
        category: 'Frontend',
        version: 'v12.0',
        description: 'Hardware-accelerated layout transitions, gesture physics, smooth crossfades, and scroll tracking.',
        proficiency: 92,
        isCore: true,
        useCase: 'Cinematic page transitions, sticky deck reveals, and interactive micro-interactions.',
        productionProject: 'Portfolio V2 & Reserva',
        docsUrl: 'https://motion.dev',
        brandColor: '#E10098'
      },
      {
        name: 'Redux Toolkit',
        category: 'Frontend',
        version: 'v2.2 (RTK Query)',
        description: 'Centralized immutable state management, RTK Query API caching, and optimistic mutations.',
        proficiency: 90,
        isCore: false,
        useCase: 'Complex multi-step checkout and dashboard state synchronization.',
        productionProject: 'Reserva Dashboard',
        docsUrl: 'https://redux-toolkit.js.org',
        brandColor: '#764ABC'
      }
    ]
  },
  {
    number: '02',
    title: 'Backend & APIs',
    subtitle: 'Services, Auth & Data Protocols',
    description: 'High-throughput microservices, hardened session authentication, and atomic transaction pipelines.',
    philosophy: 'Enforce idempotent mutation endpoints, rate-limited public APIs, and stateless JWT sessions.',
    badge: 'BUSINESS LOGIC & APIS',
    items: [
      {
        name: 'Node.js',
        category: 'Backend',
        version: 'v22 LTS',
        description: 'Non-blocking asynchronous runtime, event loops, buffer streaming, and worker threads.',
        proficiency: 94,
        isCore: true,
        useCase: 'Core runtime powering API microservices, background queues, and build pipelines.',
        productionProject: 'Reserva & Qurbaniya API',
        docsUrl: 'https://nodejs.org/docs',
        brandColor: '#339933'
      },
      {
        name: 'Express',
        category: 'Backend',
        version: 'v4.21',
        description: 'RESTful API architecture, middleware security pipelines, rate limiting, and CORS guards.',
        proficiency: 92,
        isCore: true,
        useCase: 'REST services, payment webhook listeners, and background reservation tasks.',
        productionProject: 'Reserva Backend',
        docsUrl: 'https://expressjs.com',
        brandColor: '#ffffff'
      },
      {
        name: 'Google OAuth 2.0',
        category: 'Backend',
        version: 'RFC 6749',
        description: 'Federated identity authentication, cryptographic state verification, and token exchange.',
        proficiency: 90,
        isCore: true,
        useCase: 'One-click authenticated access for digital marketplaces and customer portals.',
        productionProject: 'Qurbaniya & Reserva',
        docsUrl: 'https://developers.google.com/identity',
        brandColor: '#4285F4'
      },
      {
        name: 'JWT',
        category: 'Backend',
        version: 'RFC 7519',
        description: 'Stateless session tokens, HTTPOnly SameSite cookies, and cryptographic CSRF mitigation.',
        proficiency: 95,
        isCore: true,
        useCase: 'Secure session management without database lookup latency on every request.',
        productionProject: 'All Auth Pipelines',
        docsUrl: 'https://jwt.io/introduction',
        brandColor: '#d63aff'
      },
      {
        name: 'WebSocket',
        category: 'Backend',
        version: 'Socket.IO v4',
        description: 'Bi-directional real-time communication channels, socket rooms, and event distribution.',
        proficiency: 88,
        isCore: false,
        useCase: 'Live slot availability broadcasts and instant chat alerts.',
        productionProject: 'Reserva Live Slots',
        docsUrl: 'https://socket.io/docs/v4/',
        brandColor: '#010101'
      }
    ]
  },
  {
    number: '03',
    title: 'Data Persistence & Storage',
    subtitle: 'Document Stores & Relational Databases',
    description: 'Distributed document databases, relational data models, and caching layers engineered for zero race conditions.',
    philosophy: 'Index compound query paths early; use ACID transactions wherever inventory or money transitions.',
    badge: 'DATABASE ARCHITECTURE',
    items: [
      {
        name: 'MongoDB',
        category: 'Database',
        version: 'v7.0 Atlas',
        description: 'Document datastore, compound indexing, aggregation pipelines, and atomic findOneAndUpdate operators.',
        proficiency: 94,
        isCore: true,
        useCase: 'Primary datastore for dynamic schema platforms with polymorphic product listings.',
        productionProject: 'Reserva & Qurbaniya',
        docsUrl: 'https://www.mongodb.com/docs/',
        brandColor: '#47A248'
      },
      {
        name: 'PostgreSQL',
        category: 'Database',
        version: 'v16.2',
        description: 'ACID transactional guarantees, complex relations, JSONB indexing, and full-text search.',
        proficiency: 90,
        isCore: true,
        useCase: 'Relational data structures, billing ledgers, and multi-tenant ledger accounts.',
        productionProject: 'Keen-Keeper & Enterprise Clients',
        docsUrl: 'https://www.postgresql.org/docs/',
        brandColor: '#4169E1'
      },
      {
        name: 'Prisma',
        category: 'Database',
        version: 'v6.0',
        description: 'Type-safe object-relational mapping, automated schema migrations, and relational query batching.',
        proficiency: 92,
        isCore: true,
        useCase: 'Type-safe database client for PostgreSQL and MongoDB schema governance.',
        productionProject: 'Keen-Keeper',
        docsUrl: 'https://www.prisma.io/docs',
        brandColor: '#5a67d8'
      },
      {
        name: 'Redis',
        category: 'Database',
        version: 'v7.4 Cloud',
        description: 'In-memory key-value store, distributed mutex locks, TTL session caches, and rate limiting.',
        proficiency: 86,
        isCore: false,
        useCase: 'Ephemeral session caching, API response cache, and concurrency lock guards.',
        productionProject: 'Reserva Booking Locks',
        docsUrl: 'https://redis.io/docs/',
        brandColor: '#DC382D'
      }
    ]
  },
  {
    number: '04',
    title: 'DevOps & Global Infrastructure',
    subtitle: 'Containerization, Edge Routing & CI/CD',
    description: 'Containerized deployments, edge routing, automated CI/CD pipelines, and media optimization.',
    philosophy: 'Everything automated: reproducible container images, zero-downtime edge deployments, automated asset compression.',
    badge: 'INFRASTRUCTURE & CLOUD',
    items: [
      {
        name: 'Docker',
        category: 'DevOps & Cloud',
        version: 'v27.0',
        description: 'Multi-stage container builds, microservice orchestration, and environment parity.',
        proficiency: 88,
        isCore: true,
        useCase: 'Local development reproducibility and cloud production containers.',
        productionProject: 'Reserva Microservices',
        docsUrl: 'https://docs.docker.com',
        brandColor: '#2496ED'
      },
      {
        name: 'Vercel Edge',
        category: 'DevOps & Cloud',
        version: 'Serverless / Edge',
        description: 'Global CDN edge compute, serverless function invocation, and automatic SSL termination.',
        proficiency: 96,
        isCore: true,
        useCase: 'Deployments for Next.js web applications with sub-50ms edge delivery worldwide.',
        productionProject: 'Portfolio V2 & Keen-Keeper',
        docsUrl: 'https://vercel.com/docs',
        brandColor: '#ffffff'
      },
      {
        name: 'Cloudinary',
        category: 'DevOps & Cloud',
        version: 'API v2',
        description: 'Dynamic image transformation, format optimization (WebP/AVIF), and global CDN asset delivery.',
        proficiency: 94,
        isCore: true,
        useCase: 'Automated thumbnail generation and compressed project preview screenshots.',
        productionProject: 'Reserva & Qurbaniya Media',
        docsUrl: 'https://cloudinary.com/documentation',
        brandColor: '#3448C5'
      },
      {
        name: 'Git',
        category: 'DevOps & Cloud',
        version: 'GitHub Actions',
        description: 'Branch management, semantic commit conventions, rebase workflows, and GitHub Actions CI.',
        proficiency: 96,
        isCore: true,
        useCase: 'Version control, automated linting, test suites, and production build checks.',
        productionProject: 'All Repositories',
        docsUrl: 'https://git-scm.com/doc',
        brandColor: '#F05032'
      }
    ]
  },
  {
    number: '05',
    title: 'Development Workflow & Hardware',
    subtitle: 'Daily Studio Tools & Environment',
    description: 'The physical and digital craftsmanship environment used daily to build production software.',
    philosophy: 'Eliminate friction: split-screen terminal workflows, keyboard-centric navigation, and runtime data validation.',
    badge: 'USES & ENVIRONMENT',
    items: [
      {
        name: 'VS Code & Antigravity IDE',
        category: 'Architecture & Tools',
        version: 'Custom Pro Config',
        description: 'Curated dark theme, custom keybindings, Vim emulation, and agentic pairing workflows.',
        proficiency: 98,
        isCore: true,
        useCase: 'Primary code authoring environment for rapid full-stack engineering.',
        productionProject: 'Daily Driver',
        docsUrl: 'https://code.visualstudio.com/docs',
        brandColor: '#007ACC'
      },
      {
        name: 'Zod',
        category: 'Architecture & Tools',
        version: 'v3.24',
        description: 'Runtime TypeScript schema validation for form inputs, environment variables, and API contracts.',
        proficiency: 95,
        isCore: true,
        useCase: 'End-to-end type validation across boundaries ensuring zero runtime surprises.',
        productionProject: 'Reserva, Qurbaniya & Keen-Keeper',
        docsUrl: 'https://zod.dev',
        brandColor: '#3E67B1'
      },
      {
        name: 'Figma',
        category: 'Architecture & Tools',
        version: 'Desktop Studio',
        description: 'Design system prototyping, vector iconography, layout spacing tokens, and visual exploration.',
        proficiency: 88,
        isCore: false,
        useCase: 'Translating product concepts to pixel-perfect code with design token parity.',
        productionProject: 'Client Prototypes & UI Specs',
        docsUrl: 'https://help.figma.com',
        brandColor: '#F24E1E'
      },
      {
        name: 'Dual Display Workstation',
        category: 'Hardware & Environment',
        version: 'Ergonomic Desk Setup',
        description: 'High-resolution monitors with ergonomic monitor arms for side-by-side terminal, browser, and IDE inspection.',
        proficiency: 100,
        isCore: false,
        useCase: 'Daily productivity, multi-viewport responsiveness testing, and persistent log inspection.',
        productionProject: 'Physical Studio',
        docsUrl: 'https://github.com/rohan-mia',
        brandColor: '#38BDF8'
      }
    ]
  }
];
