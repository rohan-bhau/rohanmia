export interface TechItem {
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps & Cloud' | 'Architecture & Tools' | 'Hardware & Environment';
  description: string;
  proficiency: number; // 0 - 100
  isCore: boolean;
  useCase: string;
  docsUrl?: string;
}

export interface StackCategory {
  title: string;
  description: string;
  badge: string;
  items: TechItem[];
}

export const STACK_CATEGORIES: StackCategory[] = [
  {
    title: 'Frontend Architecture',
    description: 'Modern, GPU-accelerated client interfaces built for sub-100ms navigation and zero layout shifts.',
    badge: 'UI & CLIENT ENGINES',
    items: [
      {
        name: 'Next.js 16',
        category: 'Frontend',
        description: 'App Router, Streaming SSR, Server Actions, Turbopack bundling, and Edge Route handlers.',
        proficiency: 98,
        isCore: true,
        useCase: 'Primary full-stack framework across all production platforms.'
      },
      {
        name: 'React 19',
        category: 'Frontend',
        description: 'Server Components, concurrent rendering, optimistic UI transitions, and custom hooks.',
        proficiency: 96,
        isCore: true,
        useCase: 'Component logic, interactive booking calendars, and client state.'
      },
      {
        name: 'TypeScript',
        category: 'Frontend',
        description: 'Strict typing, generic interfaces, template literal types, and compile-time contract safety.',
        proficiency: 95,
        isCore: true,
        useCase: 'Used 100% across frontend, backend microservices, and shared monorepo packages.'
      },
      {
        name: 'Tailwind CSS v4',
        category: 'Frontend',
        description: 'CSS variables theme engine, dynamic color tokens, glassmorphic filters, and fluid layouts.',
        proficiency: 100,
        isCore: true,
        useCase: 'Design system styling, custom multi-accent palettes, and responsive UI.'
      },
      {
        name: 'Framer Motion',
        category: 'Frontend',
        description: 'Hardware-accelerated layout transitions, gesture physics, smooth crossfades, and scroll tracking.',
        proficiency: 92,
        isCore: true,
        useCase: 'Cinematic page transitions, sticky deck reveals, and interactive cards.'
      },
      {
        name: 'Redux Toolkit',
        category: 'Frontend',
        description: 'Centralized immutable state management, RTK Query API caching, and optimistic mutations.',
        proficiency: 90,
        isCore: false,
        useCase: 'Complex multi-step checkout and dashboard state management.'
      }
    ]
  },
  {
    title: 'Backend & APIs',
    description: 'High-throughput microservices, hardened session authentication, and atomic transaction pipelines.',
    badge: 'BUSINESS LOGIC & APIS',
    items: [
      {
        name: 'Node.js',
        category: 'Backend',
        description: 'Non-blocking asynchronous runtime, event loops, buffer streaming, and worker threads.',
        proficiency: 94,
        isCore: true,
        useCase: 'Core runtime powering API microservices and build pipelines.'
      },
      {
        name: 'Express',
        category: 'Backend',
        description: 'RESTful API architecture, middleware security pipelines, rate limiting, and CORS guards.',
        proficiency: 92,
        isCore: true,
        useCase: 'REST services, payment webhook listeners, and background reservation tasks.'
      },
      {
        name: 'Google OAuth 2.0',
        category: 'Backend',
        description: 'Federated identity authentication, cryptographic state verification, and token exchange.',
        proficiency: 90,
        isCore: true,
        useCase: 'One-click authenticated access for digital marketplaces.'
      },
      {
        name: 'JWT',
        category: 'Backend',
        description: 'Stateless session tokens, HTTPOnly SameSite cookies, and cryptographic CSRF mitigation.',
        proficiency: 95,
        isCore: true,
        useCase: 'Secure session management without database lookup latency on every request.'
      },
      {
        name: 'WebSocket',
        category: 'Backend',
        description: 'Bi-directional real-time communication channels, socket rooms, and event distribution.',
        proficiency: 88,
        isCore: false,
        useCase: 'Live slot availability broadcasts and instant chat alerts.'
      }
    ]
  },
  {
    title: 'Data Persistence & Storage',
    description: 'Distributed document databases, relational data models, and caching layers engineered for zero race conditions.',
    badge: 'DATABASE ARCHITECTURE',
    items: [
      {
        name: 'MongoDB',
        category: 'Database',
        description: 'Document datastore, compound indexing, aggregation pipelines, and atomic findOneAndUpdate operators.',
        proficiency: 94,
        isCore: true,
        useCase: 'Primary datastore for dynamic schema platforms (Reserva, Qurbaniya).'
      },
      {
        name: 'PostgreSQL',
        category: 'Database',
        description: 'ACID transactional guarantees, complex relations, JSONB indexing, and full-text search.',
        proficiency: 90,
        isCore: true,
        useCase: 'Relational data structures, billing ledgers, and multi-tenant systems.'
      },
      {
        name: 'Prisma',
        category: 'Database',
        description: 'Type-safe object-relational mapping, automated schema migrations, and relational query batching.',
        proficiency: 92,
        isCore: true,
        useCase: 'Type-safe database client for PostgreSQL and MongoDB.'
      },
      {
        name: 'Redis',
        category: 'Database',
        description: 'In-memory key-value store, distributed mutex locks, TTL session caches, and rate limiting.',
        proficiency: 86,
        isCore: false,
        useCase: 'Ephemeral session caching and concurrency lock guards.'
      }
    ]
  },
  {
    title: 'DevOps & Global Infrastructure',
    description: 'Containerized deployments, edge routing, automated CI/CD pipelines, and media optimization.',
    badge: 'INFRASTRUCTURE & CLOUD',
    items: [
      {
        name: 'Docker',
        category: 'DevOps & Cloud',
        description: 'Multi-stage container builds, microservice orchestration, and environment parity.',
        proficiency: 88,
        isCore: true,
        useCase: 'Local development reproducibility and cloud production containers.'
      },
      {
        name: 'Vercel Edge',
        category: 'DevOps & Cloud',
        description: 'Global CDN edge compute, serverless function invocation, and automatic SSL termination.',
        proficiency: 96,
        isCore: true,
        useCase: 'Deployments for Next.js web applications with sub-50ms edge delivery.'
      },
      {
        name: 'Cloudinary',
        category: 'DevOps & Cloud',
        description: 'Dynamic image transformation, format optimization (WebP/AVIF), and global CDN asset delivery.',
        proficiency: 94,
        isCore: true,
        useCase: 'Automated thumbnail generation and compressed project preview screenshots.'
      },
      {
        name: 'Git',
        category: 'DevOps & Cloud',
        description: 'Branch management, semantic commit conventions, rebase workflows, and GitHub Actions CI.',
        proficiency: 96,
        isCore: true,
        useCase: 'Version control and automated production build checks.'
      }
    ]
  },
  {
    title: 'Development Workflow & Hardware',
    description: 'The physical and digital environment used daily to build production software.',
    badge: 'USES & ENVIRONMENT',
    items: [
      {
        name: 'VS Code & Antigravity IDE',
        category: 'Architecture & Tools',
        description: 'Curated dark theme, custom keybindings, Vim emulation, and agentic pairing workflows.',
        proficiency: 98,
        isCore: true,
        useCase: 'Primary code authoring environment.'
      },
      {
        name: 'Figma',
        category: 'Architecture & Tools',
        description: 'Design system prototyping, vector iconography, and layout spacing systems.',
        proficiency: 88,
        isCore: false,
        useCase: 'Translating product concepts to pixel-perfect code.'
      },
      {
        name: 'Zod',
        category: 'Architecture & Tools',
        description: 'Runtime TypeScript schema validation for form inputs, environment variables, and API contracts.',
        proficiency: 95,
        isCore: true,
        useCase: 'End-to-end data validation contracts.'
      },
      {
        name: 'Dual Display Workstation',
        category: 'Hardware & Environment',
        description: 'High-resolution monitors with ergonomic monitor arms for side-by-side terminal, browser, and IDE inspection.',
        proficiency: 100,
        isCore: false,
        useCase: 'Daily productivity and multi-viewport debugging.'
      }
    ]
  }
];
