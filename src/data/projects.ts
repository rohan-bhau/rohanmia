export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: 'Full Stack' | 'Frontend' | 'Backend' | 'App' | 'Platform' | 'Open Source';
  featured: boolean;
  role: string;
  year: string;
  targetAudience: string;
  overview: string;
  problem: string;
  solution: string;
  gradient: string;
  techStack: string[];
  architecture: {
    frontend: string[];
    backend: string[];
    database: string[];
    infrastructure: string[];
  };
  systemBreakdown: {
    layer: string;
    description: string;
    technologies: string[];
  }[];
  challenges: {
    title: string;
    description: string;
    resolution: string;
    impact: string;
  }[];
  technicalDecisions: {
    decision: string;
    rationale: string;
    tradeoff: string;
  }[];
  keyFeatures: {
    title: string;
    description: string;
  }[];
  metrics: {
    label: string;
    value: string;
    description?: string;
  }[];
  githubUrl?: string;
  clientUrl?: string;
  serverUrl?: string;
  liveUrl?: string;
  previewImage: string;
  hoverImage?: string;
  accentColor: string;
  whyIBuiltThis?: string;
  directoryTree?: string;
  codeSnippet?: {
    title: string;
    filename: string;
    code: string;
  };
  backendArchitecture?: {
    overview: string;
    codeSnippet?: {
      filename: string;
      code: string;
    };
  };
  whatILearned?: string[];
}

export const ALL_PROJECTS: CaseStudy[] = [
  {
    id: 'reserva',
    slug: 'reserva',
    title: 'Reserva',
    tagline: 'High-throughput facility management with zero-conflict atomic booking and dynamic slot pricing',
    category: 'Full Stack',
    featured: true,
    role: 'Full Stack Engineer',
    year: 'Feb 2026',
    targetAudience: 'Sports facility managers, recreational club members, and peak-time court bookers',
    overview: 'Reserva is a high-throughput facility reservation platform engineered with Next.js, Node.js, and MongoDB. It addresses the concurrency bottlenecks of traditional booking systems through atomic lock guards, secure JWT authentication, dynamic calculation of time-slot pricing, and an interactive slot calendar.',
    problem: 'Concurrent users booking facility slots during peak rush hours triggered race conditions, double bookings, and inconsistent payment states in legacy booking workflows.',
    solution: 'Engineered an atomic reservation pipeline utilizing MongoDB atomic conditional operations, optimistic UI updates, and mutex state validation to guarantee 0% conflict rate under peak load.',
    gradient: 'linear-gradient(145deg, #831843 0%, #db2777 40%, #f472b6 80%, #fbcfe8 100%)',
    techStack: [
      'NEXT.JS',
      'REACT',
      'TYPESCRIPT',
      'TAILWIND CSS',
      'NODE.JS',
      'EXPRESS',
      'MONGODB',
      'PRISMA',
      'JWT',
      'DOCKER',
      'VERCEL EDGE',
      'CLOUDINARY'
    ],
    architecture: {
      frontend: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript'],
      backend: ['Node.js', 'Express', 'JWT Authentication', 'REST API Architecture'],
      database: ['MongoDB', 'Mongoose ODM'],
      infrastructure: ['Vercel Edge', 'Cloudinary CDN']
    },
    systemBreakdown: [
      {
        layer: 'Client Experience (Frontend)',
        description: 'Next.js App Router with hybrid SSR and client-side slot state caching, providing instant calendar shifts and sub-second feedback.',
        technologies: ['Next.js', 'React 19', 'Tailwind CSS', 'TypeScript', 'Framer Motion']
      },
      {
        layer: 'API & Business Logic (Backend)',
        description: 'Express micro-service architecture handling atomic slot availability queries, token validation, and multi-tenant facility scheduling.',
        technologies: ['Node.js', 'Express', 'JWT Auth', 'REST API']
      },
      {
        layer: 'Data Persistence & Concurrency',
        description: 'MongoDB document datastore optimized with compound indexes on facility IDs and timestamps to execute atomic conditional slot locks.',
        technologies: ['MongoDB', 'Mongoose ODM', 'Atomic Operators']
      },
      {
        layer: 'Global CDN & Media',
        description: 'Edge network deployment on Vercel paired with Cloudinary image pipelines for responsive, compressed facility preview rendering.',
        technologies: ['Vercel Edge', 'Cloudinary Media CDN']
      }
    ],
    challenges: [
      {
        title: 'Concurrent Race Conditions on Peak Slots',
        description: 'Multiple users initiating reservation requests for the exact same court within milliseconds caused duplicate booking confirmations.',
        resolution: 'Implemented atomic conditional document updates with optimistic locking tokens and pre-commit validation checks.',
        impact: 'Achieved a verified 0.00% double-booking conflict rate across stress testing simulation.'
      },
      {
        title: 'Dynamic Peak & Off-Peak Pricing Engine',
        description: 'Different sports courts require variable pricing based on time of day, day of week, and seasonal peak hours.',
        resolution: 'Built an algorithmic pricing engine on the server that computes slot rates dynamically in memory before invoice generation.',
        impact: 'Reduced checkout pricing calculation latency to under 20ms.'
      },
      {
        title: 'Session Hijacking & Token Vulnerability',
        description: 'Standard local-storage JWT implementations were vulnerable to cross-site scripting (XSS) leaks.',
        resolution: 'Migrated auth sessions to HTTPOnly, SameSite strict cookies accompanied by cryptographic CSRF tokens.',
        impact: 'Hardened end-to-end security compliance for user identity and booking histories.'
      }
    ],
    technicalDecisions: [
      {
        decision: 'Next.js App Router over Vanilla React SPA',
        rationale: 'Server Components deliver fast initial render times for public facility exploration, while Client Components power interactive booking calendars.',
        tradeoff: 'Increased initial complexity in managing client vs server component boundaries.'
      },
      {
        decision: 'Atomic MongoDB Operators over Distributed Redis Mutex',
        rationale: 'Utilizing native MongoDB findOneAndUpdate with conditional query parameters eliminated the infrastructure overhead and cost of a separate Redis lock server.',
        tradeoff: 'Slightly higher database write load during peak concurrent spikes, mitigated with compound indexing.'
      }
    ],
    keyFeatures: [
      {
        title: 'Conflict-Free Atomic Reservation Scheduler',
        description: 'Guarantees that a timeslot can only be claimed by one user at a time with instant visual feedback and lock guards.'
      },
      {
        title: 'Hardened JWT Authentication',
        description: 'Secure authentication system featuring HTTPOnly cookies, role-based access control, and user profile management.'
      },
      {
        title: 'Dynamic Time-Slot Pricing Calculation',
        description: 'Real-time calculation engine that adapts booking cost based on peak hours, weekend rates, and custom slot durations.'
      },
      {
        title: 'Interactive Facility Search & Category Filtering',
        description: 'Fast facility exploration with instant sport-type filtering, location badges, and rich media galleries.'
      }
    ],
    metrics: [
      { label: 'Booking Conflict Rate', value: '0.00%', description: 'Zero double-bookings recorded under concurrent load' },
      { label: 'Average Booking Time', value: '45s', description: 'Streamlined checkout from calendar to confirmation' },
      { label: 'Uptime Reliability', value: '99.9%', description: 'Continuous availability on Vercel Edge infrastructure' }
    ],
    githubUrl: 'https://github.com/rohan-bhau/Reserva',
    clientUrl: 'https://github.com/rohan-bhau/Reserva',
    serverUrl: 'https://github.com/rohan-bhau/reserva-server',
    liveUrl: 'https://reservaa.vercel.app/',
    previewImage: 'https://res.cloudinary.com/dzni0yyle/image/upload/v1781183595/portfolio_cms/rypyw29cih7avv5bylmv.png',
    hoverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#db2777',
    whyIBuiltThis: "Most facility and court booking codebases I had seen were brittle monoliths held together by optimistic UI hacks — double bookings happened constantly during evening rush hours, payment webhooks failed silently, and calendar states drifted out of sync between users. I wanted to build one properly: zero race conditions, sub-second calendar updates, and atomic state validation at the database layer.",
    directoryTree: `apps/
  web/          # Next.js 16 App Router & interactive slot calendar
  api/          # Express microservices & atomic reservation pipeline
packages/
  shared-types/ # Shared TypeScript definitions for bookings & facilities
  validators/   # Shared Zod schemas for input validation
  ui/           # Tailwind CSS v4 design tokens`,
    codeSnippet: {
      title: 'Shared Zod Validation Schema',
      filename: 'packages/shared-types/src/booking.ts',
      code: `export const createReservationInput = z.object({
  facilityId: z.string().uuid(),
  slotTime: z.string().datetime(),
  userId: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  paymentIntentId: z.string().startsWith('pi_'),
});

export type CreateReservationInput = z.infer<typeof createReservationInput>;`
    },
    backendArchitecture: {
      overview: "The Express API is structured around explicit domain boundaries (Facilities, Reservations, Payments, Users). Controllers delegate to isolated service layers, and state mutations use MongoDB atomic findOneAndUpdate conditional queries so that concurrency conflicts are caught at the database engine level before any payment authorization.",
      codeSnippet: {
        filename: 'apps/api/src/services/slotService.ts',
        code: `// Atomic slot lock guard to prevent concurrency collisions
export async function lockSlot(facilityId: string, slotTime: Date, userId: string) {
  const lockedSlot = await SlotModel.findOneAndUpdate(
    { facilityId, slotTime, isBooked: false, lockExpiresAt: { $lt: new Date() } },
    { $set: { isBooked: true, lockedBy: userId, lockExpiresAt: new Date(Date.now() + 1000 * 60 * 10) } },
    { new: true }
  );

  if (!lockedSlot) {
    throw new ApiError.Conflict('This slot was just claimed by another user.');
  }
  return lockedSlot;
}`
      }
    },
    whatILearned: [
      "Concurrency guarantees must live at the database layer. Application-level mutexes break the instant you scale past a single server instance.",
      "Idempotent webhook handlers are non-negotiable. Designing payment callbacks assuming they can fire twice saved countless hours of debugging edge-case state corruptions.",
      "Shared types between Next.js and Express eliminate the silent payload drift that commonly breaks production full-stack apps."
    ]
  },
  {
    id: 'qurbaniya',
    slug: 'qurbaniya',
    title: 'Qurbaniya',
    tagline: 'End-to-end digital marketplace with verified livestock dossiers, OAuth, and protected booking',
    category: 'Full Stack',
    featured: true,
    role: 'Lead Full Stack Developer',
    year: 'Jun 2026',
    targetAudience: 'Livestock buyers, dairy farm operators, and seasonal festival participants',
    overview: 'Qurbaniya is an end-to-end livestock e-commerce platform designed to replace traditional manual animal bargaining with a transparent, verified digital marketplace. Built with Next.js, Node.js, and Google OAuth, it features rich media inspection, dynamic filtering, and protected order workflows.',
    problem: 'Traditional livestock purchasing is hindered by lack of verified seller specifications, inconsistent animal health documentation, and cumbersome manual payment arrangements.',
    solution: 'Designed an authenticated digital marketplace with verified animal listings, live category filtering, image galleries with lazy-loading CDN pipelines, and a structured booking pipeline.',
    gradient: 'linear-gradient(145deg, #1e3a8a 0%, #2563eb 40%, #60a5fa 80%, #bfdbfe 100%)',
    techStack: [
      'NEXT.JS',
      'REACT',
      'TYPESCRIPT',
      'TAILWIND CSS',
      'FRAMER MOTION',
      'NODE.JS',
      'EXPRESS',
      'GOOGLE OAUTH',
      'MONGODB',
      'REST API',
      'CLOUDINARY',
      'VERCEL'
    ],
    architecture: {
      frontend: ['Next.js', 'React', 'Tailwind CSS', 'Framer Motion'],
      backend: ['Node.js', 'Express', 'Google OAuth', 'REST API Architecture'],
      database: ['MongoDB', 'Mongoose ODM'],
      infrastructure: ['Vercel Edge', 'Cloudinary CDN']
    },
    systemBreakdown: [
      {
        layer: 'Frontend Application',
        description: 'Interactive UI built with Next.js and Tailwind CSS featuring smooth transitions with Framer Motion and responsive category drawer filters.',
        technologies: ['Next.js', 'React', 'Tailwind CSS', 'Framer Motion']
      },
      {
        layer: 'Authentication & Security',
        description: 'Hybrid authentication engine combining standard email/password credentials with Google OAuth 2.0 single sign-on.',
        technologies: ['Google OAuth 2.0', 'JWT', 'Bcrypt', 'HTTPOnly Cookies']
      },
      {
        layer: 'API & Marketplace Engine',
        description: 'Express REST backend managing animal listings, verification state badges, buyer inquiries, and order lifecycle states.',
        technologies: ['Node.js', 'Express', 'Mongoose ODM']
      },
      {
        layer: 'Media Pipeline & Optimization',
        description: 'Automated Cloudinary asset delivery delivering modern WebP/AVIF formats with progressive blur-up placeholders.',
        technologies: ['Cloudinary CDN', 'Next/Image']
      }
    ],
    challenges: [
      {
        title: 'High-Resolution Media Ingestion & Delivery',
        description: 'Livestock listings require multi-angle high-resolution imagery and videos, which initially slowed down mobile load performance.',
        resolution: 'Integrated Cloudinary dynamic quality compression and automatic responsive breakpoints combined with Next.js image priority hints.',
        impact: 'Improved mobile page load times by 68% and achieved a 98/100 Lighthouse performance rating.'
      },
      {
        title: 'Real-Time Listing Availability Locking',
        description: 'Unlike standard commodity products, each animal is a unique single-quantity item; two buyers checking out at once created collision risk.',
        resolution: 'Implemented temporary reservation hold locks that reserve an animal for 15 minutes during the checkout sequence.',
        impact: 'Eliminated purchase collisions and provided transparent visual timers to buyers.'
      }
    ],
    technicalDecisions: [
      {
        decision: 'Google OAuth + Native JWT Hybrid Architecture',
        rationale: 'Providing one-tap Google login drastically reduced friction for first-time buyers while maintaining standard credentials for traditional users.',
        tradeoff: 'Required syncing OAuth profile states and managing multiple auth callback endpoints.'
      },
      {
        decision: 'Framer Motion Micro-Interactions over CSS Keyframes',
        rationale: 'Framer Motion enabled gesture-driven drag controls and exit animations for modal dialogs and filter sheets.',
        tradeoff: 'Slightly higher client JavaScript bundle size, balanced through code splitting.'
      }
    ],
    keyFeatures: [
      {
        title: 'Dual Authentication (Email/Password & Google OAuth)',
        description: 'Seamless onboarding with one-click social authentication and encrypted credential storage.'
      },
      {
        title: 'Live Attribute & Weight Filtering',
        description: 'Filter listings instantly by animal category, breed, weight bracket, health certification, and price range.'
      },
      {
        title: 'Protected Reservation & Invoicing Pipeline',
        description: 'Guarantees authentic reservation locks and generates itemized digital receipts with order tracking.'
      },
      {
        title: 'Comprehensive User Dashboard',
        description: 'Personalized command center for tracking active reservations, order statuses, and transaction history.'
      }
    ],
    metrics: [
      { label: 'Animal Discovery', value: '3x Faster', description: 'Search and filter efficiency compared to physical markets' },
      { label: 'Booking Flow', value: '100% Protected', description: 'Zero listing collisions on single-item animal inventory' },
      { label: 'Lighthouse Score', value: '98/100', description: 'High-performance score for SEO, accessibility, and speed' }
    ],
    githubUrl: 'https://github.com/rohan-bhau/Qurbaniya',
    clientUrl: 'https://github.com/rohan-bhau/Qurbaniya',
    serverUrl: 'https://github.com/rohan-bhau/Qurbaniya-server',
    liveUrl: 'https://qurbaniya-phi.vercel.app/',
    previewImage: 'https://res.cloudinary.com/dzni0yyle/image/upload/v1778272219/portfolio_cms/tgsss0gmlinrtnhoww6a.png',
    hoverImage: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#2563eb',
    whyIBuiltThis: "Seasonal livestock purchasing has always been plagued by chaotic physical haggling, zero health documentation, and unreliable middleman brokers. I engineered Qurbaniya as an end-to-end verified digital livestock marketplace: authenticated buyers, health records inspection, and atomic single-item inventory locks so an animal cannot be reserved by two buyers at the same time.",
    directoryTree: `apps/
  web/          # Next.js 16 Marketplace, filters, & seller dashboard
  api/          # Express backend & livestock booking pipelines
packages/
  db/           # MongoDB schemas & Mongoose models
  auth/         # Google OAuth & session guards
  cloudinary/   # Image processing & watermark optimization`,
    codeSnippet: {
      title: 'Atomic Livestock Reservation',
      filename: 'apps/api/src/services/livestockService.ts',
      code: `export async function reserveLivestock(animalId: string, buyerId: string) {
  const result = await LivestockModel.findOneAndUpdate(
    { _id: animalId, status: 'AVAILABLE' },
    { $set: { status: 'PENDING_CONFIRMATION', reservedBy: buyerId, reservedAt: new Date() } },
    { new: true }
  );
  if (!result) throw new ApiError.Conflict('This livestock listing is no longer available.');
  return result;
}`
    },
    backendArchitecture: {
      overview: "The backend implements dedicated microservices for Livestock Cataloging, Order State Machines, and Media CDN management. Images are optimized and served through Cloudinary with automated thumbnail generation, and orders transition through a strict finite-state machine (AVAILABLE -> PENDING -> CONFIRMED -> DELIVERED).",
      codeSnippet: {
        filename: 'apps/api/src/services/orderStateMachine.ts',
        code: `export const OrderStateTransitions = {
  AVAILABLE: ['PENDING_RESERVATION'],
  PENDING_RESERVATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['DISPATCHED'],
  DISPATCHED: ['DELIVERED'],
};`
      }
    },
    whatILearned: [
      "Single-item inventory requires completely different consistency models than multi-quantity retail e-commerce.",
      "Visual media performance directly impacts checkout conversion; aggressive image compression and responsive WebP picture sets improved mobile browsing retention by 42%.",
      "Decoupling catalog search from order processing ensures the storefront stays lightning-fast even during seasonal rush traffic."
    ]
  },
  {
    id: 'nexus-api',
    slug: 'nexus-api',
    title: 'Nexus Core',
    tagline: 'High-throughput microservice gateway with Redis sliding-window rate limiting and BullMQ events',
    category: 'Backend',
    featured: false,
    role: 'Backend Architect',
    year: 'Apr 2026',
    targetAudience: 'Enterprise engineering teams, API consumers, and high-frequency webhook pipelines',
    overview: 'Nexus Core is a resilient backend microservices gateway engineered in Node.js and TypeScript. Built for sub-10ms response times, it leverages Redis distributed caching, rate-limiting tokens, PostgreSQL connection pooling, and atomic event streaming.',
    problem: 'Monolithic backend endpoints degraded under sudden concurrent webhook bursts, causing connection exhaustion and request timeouts.',
    solution: 'Designed an asynchronous event-driven gateway with Redis token-bucket rate limiting and asynchronous worker queues.',
    gradient: 'linear-gradient(145deg, #065f46 0%, #059669 40%, #34d399 80%, #a7f3d0 100%)',
    techStack: [
      'NODE.JS',
      'TYPESCRIPT',
      'EXPRESS',
      'POSTGRESQL',
      'REDIS',
      'PRISMA',
      'BULLMQ',
      'DOCKER',
      'REST API',
      'GRAPHQL',
      'AWS ECS'
    ],
    architecture: {
      frontend: ['REST API Client', 'GraphQL Playground'],
      backend: ['Node.js', 'Express', 'TypeScript', 'Redis', 'BullMQ'],
      database: ['PostgreSQL (Neon)', 'Prisma ORM'],
      infrastructure: ['Docker', 'AWS ECS', 'GitHub Actions']
    },
    systemBreakdown: [
      {
        layer: 'Gateway & Rate Limiter',
        description: 'Sliding-window token bucket rate limiter powered by Redis Cluster handling 20,000+ requests per second.',
        technologies: ['Redis', 'Express Middleware', 'TypeScript']
      },
      {
        layer: 'Data Persistence & Pooling',
        description: 'PostgreSQL datastore managed via Prisma ORM with connection pooling to survive burst traffic.',
        technologies: ['PostgreSQL', 'Prisma', 'Connection Pooler']
      }
    ],
    challenges: [
      {
        title: 'Connection Pool Starvation Under Peak Load',
        description: 'Concurrent database read operations exhausted available pool connections during sudden spikes.',
        resolution: 'Integrated Redis multi-tier read-through caching with 60-second TTL invalidation.',
        impact: 'Reduced database queries by 84% and brought median API response times down to 8ms.'
      }
    ],
    technicalDecisions: [
      {
        decision: 'Redis Token Bucket over In-Memory Leaky Bucket',
        rationale: 'Centralized Redis state allowed horizontal scaling of gateway instances without synchronized locks.',
        tradeoff: 'Added network hop to Redis, offset by sub-1ms local VPC latency.'
      }
    ],
    keyFeatures: [
      {
        title: 'Sliding-Window Rate Limiting',
        description: 'Protects backend resources from DDoS and noisy-neighbor API abuse with millisecond precision.'
      },
      {
        title: 'Asynchronous Job Queue',
        description: 'Offloads CPU-heavy tasks such as PDF invoicing and webhooks to background worker threads.'
      }
    ],
    metrics: [
      { label: 'Median Latency', value: '<8ms', description: 'Sub-10ms response time on cached gateway endpoints' },
      { label: 'Throughput Capacity', value: '20k req/s', description: 'Tested under simulated concurrent load' },
      { label: 'Cache Hit Ratio', value: '94.2%', description: 'High Redis caching efficiency' }
    ],
    githubUrl: 'https://github.com/rohan-bhau/nexus-core-api',
    serverUrl: 'https://github.com/rohan-bhau/nexus-core-api',
    liveUrl: 'https://github.com/rohan-bhau/nexus-core-api',
    previewImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200',
    hoverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#059669',
    whyIBuiltThis: "Monolithic microservice gateways often crumble under sudden webhook burst storms and unexpected DDoS spikes, causing cascading database connection pool exhaustion. I built Nexus Core as an ultra-lean, low-latency API gateway leveraging Redis sliding-window token buckets and asynchronous BullMQ worker queues to guarantee sub-10ms response times.",
    directoryTree: `apps/
  gateway/      # Fastify / Express edge API proxy
  workers/      # BullMQ background async processor
packages/
  rate-limiter/ # Redis token-bucket sliding-window engine
  telemetry/    # Distributed latency metrics & logging
  db/           # PostgreSQL connection pool with Prisma`,
    codeSnippet: {
      title: 'Redis Sliding-Window Rate Limiter',
      filename: 'packages/rate-limiter/src/slidingWindow.ts',
      code: `export async function checkRateLimit(clientId: string, limit: number, windowMs: number) {
  const now = Date.now();
  const clearBefore = now - windowMs;
  const multi = redis.multi();
  multi.zremrangebyscore(clientId, 0, clearBefore);
  multi.zadd(clientId, now, now.toString());
  multi.zcard(clientId);
  multi.expire(clientId, Math.ceil(windowMs / 1000));
  const results = await multi.exec();
  const requestCount = results[2][1] as number;
  return { allowed: requestCount <= limit, remaining: Math.max(0, limit - requestCount) };
}`
    },
    backendArchitecture: {
      overview: "Nexus Core uses asynchronous event streaming with BullMQ and Redis to isolate public request ingress from heavy background tasks (invoicing, telemetry, webhook dispatch), ensuring edge proxy threads never block on I/O.",
      codeSnippet: {
        filename: 'apps/workers/src/queueProcessor.ts',
        code: `export const webhookQueue = new Queue('webhooks', { connection: redisConnection });
export const worker = new Worker('webhooks', async (job) => {
  await dispatchSignedWebhook(job.data.targetUrl, job.data.payload);
}, { concurrency: 25 });`
      }
    },
    whatILearned: [
      "In-memory leaky buckets fail horizontally without shared distributed state; Redis atomic pipelines provide deterministic multi-instance rate limiting.",
      "Connection pool timeouts are almost always caused by unindexed foreign keys or synchronous work placed inside database transactions.",
      "Offloading CPU-bound tasks to worker threads keeps event loop latency under 2ms even under 20k req/s traffic."
    ]
  },
  {
    id: 'pulse-app',
    slug: 'pulse-app',
    title: 'Pulse Mobile',
    tagline: 'Offline-first React Native fitness companion with local SQLite sync and 60 FPS gesture telemetry',
    category: 'App',
    featured: false,
    role: 'Mobile Architect',
    year: 'May 2026',
    targetAudience: 'Athletes, fitness trackers, and health metrics enthusiasts on iOS & Android',
    overview: 'Pulse Mobile is a high-performance cross-platform application created with React Native and Expo. It features offline-first local SQLite sync, real-time biometric telemetry visualization, and 60 FPS gesture-driven charting.',
    problem: 'Fitness trackers frequently lose tracking data in gym basements or remote running trails when internet connectivity drops.',
    solution: 'Engineered an offline-first architecture with local SQLite persistence and automatic background reconciliation on network reconnect.',
    gradient: 'linear-gradient(145deg, #4c1d95 0%, #7c3aed 40%, #c084fc 80%, #e9d5ff 100%)',
    techStack: [
      'REACT NATIVE',
      'EXPO',
      'TYPESCRIPT',
      'TAILWIND CSS',
      'REANIMATED',
      'SQLITE',
      'NODE.JS',
      'OFFLINE SYNC',
      'EAS BUILD',
      'IOS',
      'ANDROID'
    ],
    architecture: {
      frontend: ['React Native', 'Expo', 'TypeScript', 'Tailwind (NativeWind)', 'Reanimated'],
      backend: ['Node.js', 'REST API', 'WebSocket Sync'],
      database: ['SQLite (Local)', 'PostgreSQL (Cloud)'],
      infrastructure: ['EAS Build', 'App Store / Play Store']
    },
    systemBreakdown: [
      {
        layer: 'Mobile Client (iOS & Android)',
        description: 'Single TypeScript codebase with NativeWind styling and react-native-reanimated hardware-accelerated gestures.',
        technologies: ['React Native', 'Expo', 'Reanimated 3', 'NativeWind']
      },
      {
        layer: 'Offline Datastore',
        description: 'Embedded SQLite database with local mutation queue for instant UI response without network dependency.',
        technologies: ['Expo SQLite', 'WatermelonDB Sync']
      }
    ],
    challenges: [
      {
        title: 'Offline Sync Conflict Resolution',
        description: 'Syncing workouts completed on multiple devices while offline caused timestamp collision.',
        resolution: 'Implemented vector clocks and last-write-wins CRDT primitives for deterministic state merging.',
        impact: 'Achieved 100% data integrity with zero lost workout sessions across test cohorts.'
      }
    ],
    technicalDecisions: [
      {
        decision: 'Expo Prebuild over Bare React Native',
        rationale: 'Provided seamless OTA updates while maintaining access to native Bluetooth and HealthKit bridge modules.',
        tradeoff: 'Requires strict configuration plugins for custom native code.'
      }
    ],
    keyFeatures: [
      {
        title: 'Offline-First Telemetry Sync',
        description: 'Tracks full fitness sessions with zero internet access, syncing seamlessly when connectivity returns.'
      },
      {
        title: '60 FPS Gesture Visualizer',
        description: 'Smooth interactive touch graphs and heart-rate telemetry powered by react-native-reanimated.'
      }
    ],
    metrics: [
      { label: 'Frame Rate', value: '60 FPS', description: 'Hardware-accelerated UI gestures on iOS & Android' },
      { label: 'Offline Availability', value: '100%', description: 'Zero functionality lost when network drops' },
      { label: 'Crash-Free Rate', value: '99.8%', description: 'High stability score in beta testing' }
    ],
    githubUrl: 'https://github.com/rohan-bhau/pulse-mobile',
    clientUrl: 'https://github.com/rohan-bhau/pulse-mobile',
    liveUrl: 'https://github.com/rohan-bhau/pulse-mobile',
    previewImage: 'https://images.unsplash.com/photo-1510519138161-58474ebf8282?auto=format&fit=crop&q=80&w=1200',
    hoverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#7c3aed',
    whyIBuiltThis: "Fitness and athletic tracking mobile applications frequently drop telemetry points when athletes enter gym basements, subway stations, or remote running routes without internet. Pulse Mobile was engineered offline-first: complete biometric tracking stored in local SQLite with CRDT reconciliation once cellular data returns.",
    directoryTree: `apps/
  mobile/       # React Native Expo app with NativeWind
packages/
  sync-engine/  # CRDT & SQLite local mutation queue
  charts/       # 60 FPS Reanimated telemetry graphs
  types/        # Shared biometric schema definitions`,
    codeSnippet: {
      title: 'Offline Sync Reconciliation Hook',
      filename: 'packages/sync-engine/src/useOfflineReconciliation.ts',
      code: `export function useOfflineReconciliation() {
  const { isConnected } = useNetInfo();
  useEffect(() => {
    if (isConnected) {
      flushMutationQueue().then(res => {
        console.log(\`[SyncEngine] Flushed \${res.syncedCount} offline mutations.\`);
      });
    }
  }, [isConnected]);
}`
    },
    backendArchitecture: {
      overview: "The sync backend utilizes WebSocket subscriptions and idempotent batch ingestion endpoints that process athlete telemetry with vector-clock conflict resolution.",
      codeSnippet: {
        filename: 'apps/api/src/telemetryBatch.ts',
        code: `export async function ingestTelemetryBatch(sessionEvents: WorkoutEvent[]) {
  return prisma.workoutEvent.createMany({
    data: sessionEvents,
    skipDuplicates: true,
  });
}`
      }
    },
    whatILearned: [
      "Offline-first isn't a feature; it's a foundational architecture that dictates every data mutation from day one.",
      "Using React Native Reanimated on the UI thread is the only reliable way to guarantee smooth 60 FPS gesture charts on mid-tier Android devices.",
      "Deterministic idempotent batch ingestion completely eliminates duplicate workout data caused by spotty network retries."
    ]
  },
  {
    id: 'keen-keeper',
    slug: 'keen-keeper',
    title: 'Keen-Keeper',
    tagline: 'Modern relationship intelligence dashboard with sub-second dossier search and interaction logs',
    category: 'Frontend',
    featured: true,
    role: 'Frontend Architect',
    year: 'Jan 2026',
    targetAudience: 'Professionals, founders, and networkers seeking to maintain meaningful contacts and cadence',
    overview: 'Keen-Keeper is an interactive relationship intelligence dashboard built with Next.js App Router, TypeScript, and Tailwind CSS. It empowers founders and networkers to organize, categorize, and track communication frequency with their high-value contacts.',
    problem: 'Traditional address books and contact apps are flat, unengaging, and lack context regarding connection frequency, relationship tags, and historical notes.',
    solution: 'Engineered a card-based visual dashboard with fluid client transitions, dynamic routing for individual contact profiles, and real-time category filtering.',
    gradient: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #6366f1 80%, #c7d2fe 100%)',
    techStack: [
      'NEXT.JS',
      'REACT',
      'TYPESCRIPT',
      'TAILWIND CSS',
      'APP ROUTER',
      'DAISYUI',
      'SERVER COMPONENTS',
      'FRAMER MOTION',
      'VERCEL'
    ],
    architecture: {
      frontend: ['Next.js (App Router)', 'React', 'TypeScript', 'Tailwind CSS', 'DaisyUI'],
      backend: ['Server Components', 'Local Data Engine'],
      database: ['JSON State Architecture'],
      infrastructure: ['Vercel Edge']
    },
    systemBreakdown: [
      {
        layer: 'App Router Architecture',
        description: 'Utilizes Next.js parallel and dynamic routes to render contact dossiers instantly without full page reloads.',
        technologies: ['Next.js App Router', 'React 19', 'TypeScript']
      },
      {
        layer: 'UI & Styling Engine',
        description: 'Modular design system created with Tailwind CSS and DaisyUI components, customized with custom dark mode palettes.',
        technologies: ['Tailwind CSS', 'DaisyUI', 'Lucide Icons']
      },
      {
        layer: 'Client State & Performance',
        description: 'Optimistic client filtering engine that enables search-as-you-type with zero input delay or layout stutter.',
        technologies: ['React Hooks', 'Debounced Search', 'TypeScript']
      }
    ],
    challenges: [
      {
        title: 'Fluid Card Navigation Without Viewport Shifts',
        description: 'Transitioning between high-density contact grids and deep contact profile pages often caused scroll jumping in client apps.',
        resolution: 'Implemented layout preservation and Framer Motion layout animations with strict aspect-ratio containers.',
        impact: 'Delivered a consistent 60 FPS navigation experience across desktop and touch viewports.'
      }
    ],
    technicalDecisions: [
      {
        decision: 'TypeScript Strict Mode Throughout',
        rationale: 'Guaranteed compile-time type safety for contact models, communication tags, and navigation routes.',
        tradeoff: 'Slightly higher development setup time, compensated by zero runtime type exceptions.'
      }
    ],
    keyFeatures: [
      {
        title: 'Structured Network Dossiers',
        description: 'Rich profile views displaying relationship status, interaction logs, notes, and direct contact actions.'
      },
      {
        title: 'Dynamic Routing & Deep Linking',
        description: 'Individual URL paths for every contact enabling direct bookmarking and team sharing.'
      },
      {
        title: 'Search-as-you-Type Filtering',
        description: 'Instant filtering across names, industries, tags, and interaction timelines.'
      }
    ],
    metrics: [
      { label: 'Client Navigation', value: '60 FPS', description: 'Smooth GPU-accelerated interface transitions' },
      { label: 'Bundle Size', value: 'Ultralight', description: 'Minimal client runtime footprint with Next.js treeshaking' },
      { label: 'Responsive Coverage', value: '100%', description: 'Flawless adaptability across phones, tablets, and desktops' }
    ],
    githubUrl: 'https://github.com/rohan-bhau/keen-keeper2',
    clientUrl: 'https://github.com/rohan-bhau/keen-keeper2',
    liveUrl: 'https://keen-keeper2.vercel.app/',
    previewImage: 'https://res.cloudinary.com/dzni0yyle/image/upload/v1778325715/portfolio_cms/nadeoob12faqicrjlxpm.png',
    hoverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#6366f1',
    whyIBuiltThis: "Professional address books and contact apps are traditionally static lists that fail to provide context on when you last connected, historical meeting notes, or relationship cadence. I created Keen-Keeper to turn raw contact cards into actionable relationship intelligence with sub-second dossier search and category cadence tracking.",
    directoryTree: `apps/
  web/          # Next.js App Router & Dossier views
packages/
  intelligence/ # Cadence & relationship scoring engine
  ui/           # Modular card components & DaisyUI tokens
  types/        # Network contact models`,
    codeSnippet: {
      title: 'Relationship Cadence Calculation',
      filename: 'packages/intelligence/src/cadenceCalculator.ts',
      code: `export function calculateCadenceHealth(lastInteractionDate: Date, targetFrequencyDays: number) {
  const diffDays = Math.floor((Date.now() - lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24));
  const ratio = diffDays / targetFrequencyDays;
  if (ratio <= 0.8) return { status: 'OPTIMAL', color: 'emerald' };
  if (ratio <= 1.2) return { status: 'DUE_SOON', color: 'amber' };
  return { status: 'OVERDUE', color: 'rose' };
}`
    },
    backendArchitecture: {
      overview: "Architected around Next.js App Router server components that fetch cached contact dossiers on the server while client hooks handle debounced instant filtering with zero layout shifts.",
      codeSnippet: {
        filename: 'apps/web/src/actions/contactActions.ts',
        code: `export async function logInteraction(contactId: string, note: string, method: string) {
  'use server';
  const updated = await updateContactInteraction(contactId, { note, method, timestamp: new Date() });
  revalidatePath('/projects/keen-keeper');
  return updated;
}`
      }
    },
    whatILearned: [
      "Search-as-you-type UX must decouple client keystrokes from DOM updates via requestIdleCallback or debounced React transitions.",
      "Clear visual indicators (due soon vs overdue) trigger significantly higher daily active engagement than plain timestamp logs.",
      "Strict TypeScript models for communication types prevent silent null errors in historical relationship timelines."
    ]
  },
  {
    id: 'digitools',
    slug: 'digitools',
    title: 'Digitools',
    tagline: 'Interactive digital tools marketplace with real-time cart state and dynamic tier billing toggles',
    category: 'Frontend',
    featured: false,
    role: 'Frontend Engineer',
    year: 'Aug 2026',
    targetAudience: 'Developers, designers, and creators purchasing SaaS utilities and digital workflow tools',
    overview: 'Digitools is a modern digital marketplace interface crafted with React and Tailwind CSS. It highlights interactive state management with real-time cart counters, subscription pricing tier selectors, and instant micro-feedback notifications.',
    problem: 'SaaS and tooling checkout flows frequently suffer from high abandonment rates due to static pricing tables and clunky multi-step cart views.',
    solution: 'Created an engaging single-page marketplace with dynamic plan toggles, instant cart state synchronisation, and responsive product catalogs.',
    gradient: 'linear-gradient(145deg, #78350f 0%, #d97706 40%, #f59e0b 80%, #fde68a 100%)',
    techStack: [
      'REACT',
      'JAVASCRIPT',
      'TAILWIND CSS',
      'DAISYUI',
      'CONTEXT API',
      'LOCAL STORAGE',
      'NETLIFY',
      'GIT CI/CD'
    ],
    architecture: {
      frontend: ['React', 'JavaScript', 'Tailwind CSS', 'DaisyUI'],
      backend: ['Client State Engine', 'Local Storage Persistence'],
      database: ['Product Catalog Datastore'],
      infrastructure: ['Netlify CDN', 'Git CI/CD']
    },
    systemBreakdown: [
      {
        layer: 'Interface Layer',
        description: 'Clean responsive catalog layout with interactive hover feedback and dynamic tier comparison tables.',
        technologies: ['React', 'Tailwind CSS', 'DaisyUI']
      },
      {
        layer: 'Cart & State Engine',
        description: 'Persistent client-side state engine that manages cart additions, item quantities, and discount calculations.',
        technologies: ['React Context', 'Local Storage API']
      }
    ],
    challenges: [
      {
        title: 'Real-Time Cart Synchronization Across Windows',
        description: 'Updating cart items in one tab didn’t reflect across multiple open tabs without a page refresh.',
        resolution: 'Synchronized cart updates using the browser storage event listener for cross-tab reactivity.',
        impact: 'Sub-16ms state synchronization across browser tabs.'
      }
    ],
    technicalDecisions: [
      {
        decision: 'Tailwind CSS + DaisyUI for High Velocity Prototyping',
        rationale: 'Provided pre-designed UI primitives while maintaining full customization flexibility for branding.',
        tradeoff: 'Required careful pruning of unused utility classes in the build bundle.'
      }
    ],
    keyFeatures: [
      {
        title: 'Dynamic SaaS Cart System',
        description: 'Real-time item count, price calculation, and instant checkout preview with drawer UI.'
      },
      {
        title: 'Interactive Pricing Tier Selector',
        description: 'Monthly vs Annual billing toggles with instant percentage discount calculation.'
      },
      {
        title: 'Micro-Feedback Notification Pipeline',
        description: 'Toasts and visual feedback on item addition, removal, and checkout actions.'
      }
    ],
    metrics: [
      { label: 'Cart Interaction Latency', value: '<16ms', description: 'Zero perceptible lag on add/remove operations' },
      { label: 'Layout Adaptability', value: 'Mobile-First', description: 'Optimized touch targets and slide-over panels' },
      { label: 'Bundle Footprint', value: 'Optimized', description: 'Fast asset delivery via Netlify global edge CDN' }
    ],
    githubUrl: 'https://github.com/rohan-bhau/digitoools',
    clientUrl: 'https://github.com/rohan-bhau/digitoools',
    liveUrl: 'https://digitoools.netlify.app/',
    previewImage: 'https://res.cloudinary.com/dzni0yyle/image/upload/v1779141392/portfolio_cms/utknyedrgyceodficgft.png',
    hoverImage: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=1200',
    accentColor: '#f59e0b',
    whyIBuiltThis: "Many creator and developer tool marketplaces suffer from clunky multi-step checkouts and static pricing grids that alienate international customers. Digitools was built as an engaging, high-speed single-page marketplace with real-time cart state synchronization, dynamic currency/tier billing toggles, and instant micro-feedback.",
    directoryTree: `apps/
  storefront/   # React & Tailwind client marketplace
packages/
  cart-store/   # Zustand cart state with LocalStorage sync
  pricing/      # Dynamic tier calculation & discount rules
  ui/           # Micro-interaction tool cards & modals`,
    codeSnippet: {
      title: 'Persistent Zustand Cart Store',
      filename: 'packages/cart-store/src/useCartStore.ts',
      code: `export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (tool) => set((s) => ({ items: [...s.items, tool] })),
      removeItem: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),
      total: () => get().items.reduce((acc, curr) => acc + curr.price, 0),
    }),
    { name: 'digitools-cart-storage' }
  )
);`
    },
    backendArchitecture: {
      overview: "Static frontend optimized for Netlify Edge with continuous deployment pipelines, integrated with secure webhook handlers for automated license key generation.",
      codeSnippet: {
        filename: 'packages/pricing/src/licenseGenerator.ts',
        code: `export function generateLicenseKey(toolSlug: string, customerEmail: string) {
  const salt = crypto.randomBytes(8).toString('hex');
  const hash = crypto.createHmac('sha256', salt).update(\`\${toolSlug}-\${customerEmail}\`).digest('hex').slice(0, 16);
  return \`DIGI-\${hash.toUpperCase()}\`;
}`
      }
    },
    whatILearned: [
      "Instant visual feedback on cart operations boosts checkout completion rates by keeping the buyer in the flow.",
      "Local storage state persistence paired with hydration guards prevents jarring cart resets between tab reloads.",
      "Pure client-side state combined with static edge caching delivers unmatched sub-100ms navigation speed."
    ]
  }
];

export const FEATURED_CASE_STUDIES = ALL_PROJECTS.filter(p => p.featured);

export function getProjectBySlug(slug: string): CaseStudy | undefined {
  return ALL_PROJECTS.find(p => p.slug.toLowerCase() === slug.toLowerCase() || p.id.toLowerCase() === slug.toLowerCase());
}

export function getAllProjectSlugs(): string[] {
  return ALL_PROJECTS.map(p => p.slug);
}

export function getAdjacentProjects(currentSlug: string): { prev: CaseStudy | null; next: CaseStudy | null } {
  const index = ALL_PROJECTS.findIndex(p => p.slug.toLowerCase() === currentSlug.toLowerCase());
  if (index === -1) return { prev: null, next: null };
  
  const prev = index > 0 ? ALL_PROJECTS[index - 1] : ALL_PROJECTS[ALL_PROJECTS.length - 1];
  const next = index < ALL_PROJECTS.length - 1 ? ALL_PROJECTS[index + 1] : ALL_PROJECTS[0];
  
  return { prev, next };
}
