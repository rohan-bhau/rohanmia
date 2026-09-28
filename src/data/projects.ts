export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: 'Full Stack' | 'Frontend' | 'Platform' | 'Open Source';
  featured: boolean;
  role: string;
  year: string;
  overview: string;
  problem: string;
  solution: string;
  architecture: {
    frontend: string[];
    backend: string[];
    database: string[];
    infrastructure: string[];
  };
  keyFeatures: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  githubUrl?: string;
  liveUrl?: string;
  previewImage: string;
  accentColor: string;
}

export const FEATURED_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'reserva',
    slug: 'reserva',
    title: 'Reserva',
    tagline: 'High-Throughput Facility Management & Booking Architecture',
    category: 'Full Stack',
    featured: true,
    role: 'Full Stack Engineer',
    year: '2026',
    overview: 'A full-stack facility reservation platform engineered with Next.js, Node.js, and MongoDB. Features atomic lock booking guards, secure JWT authentication, and an interactive slot calendar.',
    problem: 'Concurrent users booking facility slots during peak hours triggered race conditions, double bookings, and inconsistent payment states.',
    solution: 'Engineered an atomic booking pipeline with lock guards and optimistic UI updates, ensuring zero conflict bookings under high peak traffic.',
    architecture: {
      frontend: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript'],
      backend: ['Node.js', 'Express', 'JWT Authentication', 'REST API'],
      database: ['MongoDB', 'Mongoose'],
      infrastructure: ['Vercel', 'Cloudinary CDN']
    },
    keyFeatures: [
      'Conflict-free reservation scheduler with atomic lock guards',
      'Secure JWT authentication with HTTPOnly cookie verification',
      'Dynamic booking pricing calculation and time-slot management',
      'Interactive facility search with category and sport type filters'
    ],
    metrics: [
      { label: 'Booking Conflict Rate', value: '0.00%' },
      { label: 'Average Booking Time', value: '45s' },
      { label: 'Uptime Reliability', value: '99.9%' }
    ],
    githubUrl: 'https://github.com/rohan-bhau/Reserva',
    liveUrl: 'https://reservaa.vercel.app/',
    previewImage: 'https://res.cloudinary.com/dzni0yyle/image/upload/v1781183595/portfolio_cms/rypyw29cih7avv5bylmv.png',
    accentColor: '#0ea5e9'
  },
  {
    id: 'qurbaniya',
    slug: 'qurbaniya',
    title: 'Qurbaniya',
    tagline: 'Digital Livestock Marketplace & Automated Booking Engine',
    category: 'Full Stack',
    featured: true,
    role: 'Lead Full Stack Developer',
    year: '2026',
    overview: 'A full-stack livestock marketplace designed to simplify animal selection, verification, and transactional booking with Google OAuth, rich media galleries, and real-time status tracking.',
    problem: 'Traditional livestock purchasing involves manual bargaining, lack of verified seller specifications, and zero digital record tracking.',
    solution: 'Architected an end-to-end marketplace featuring category filtering, authenticated booking workflows, and responsive UI with instant toast notifications.',
    architecture: {
      frontend: ['Next.js', 'React', 'Tailwind CSS', 'Framer Motion'],
      backend: ['Node.js', 'Express', 'Google OAuth', 'REST API'],
      database: ['MongoDB', 'Mongoose'],
      infrastructure: ['Vercel', 'Cloudinary CDN']
    },
    keyFeatures: [
      'Secure authentication with Email/Password & Google OAuth',
      'Responsive marketplace with live category filtering',
      'Protected animal details view and instant booking system',
      'Comprehensive user profile and order tracking dashboard'
    ],
    metrics: [
      { label: 'Animal Discovery', value: '3x Faster' },
      { label: 'Booking Flow', value: '100% Protected' },
      { label: 'Lighthouse Score', value: '98/100' }
    ],
    githubUrl: 'https://github.com/rohan-bhau/Qurbaniya',
    liveUrl: 'https://qurbaniya-phi.vercel.app/',
    previewImage: 'https://res.cloudinary.com/dzni0yyle/image/upload/v1778272219/portfolio_cms/tgsss0gmlinrtnhoww6a.png',
    accentColor: '#10b981'
  },
  {
    id: 'keen-keeper',
    slug: 'keen-keeper',
    title: 'Keen-Keeper',
    tagline: 'Modern Relationship & Connection Intelligence Dashboard',
    category: 'Frontend',
    featured: true,
    role: 'Frontend Architect',
    year: '2026',
    overview: 'A relationship management web application built with Next.js App Router that helps users organize, track, and explore personal and professional networks with dynamic routing.',
    problem: 'Managing contact networks and tracking interaction history often feels cluttered and disorganized in standard contact applications.',
    solution: 'Designed an interactive card-based dashboard featuring structured relationship views, dynamic route handling, and high-framerate client navigation.',
    architecture: {
      frontend: ['Next.js (App Router)', 'React', 'TypeScript', 'Tailwind CSS', 'DaisyUI'],
      backend: ['Server Components', 'Local Data Engine'],
      database: ['JSON State Architecture'],
      infrastructure: ['Vercel Edge']
    },
    keyFeatures: [
      'Interactive friend management dashboard with structured card UI',
      'Dynamic routing system for unique detail pages via App Router',
      'Fully responsive design optimized for mobile, tablet, and desktop',
      'Smooth client-side navigation with zero server fetch latency'
    ],
    metrics: [
      { label: 'Client Navigation', value: '60 FPS' },
      { label: 'Bundle Size', value: 'Ultralight' },
      { label: 'Responsive Coverage', value: '100%' }
    ],
    githubUrl: 'https://github.com/rohan-bhau/keen-keeper2',
    liveUrl: 'https://keen-keeper2.vercel.app/',
    previewImage: 'https://res.cloudinary.com/dzni0yyle/image/upload/v1778325715/portfolio_cms/nadeoob12faqicrjlxpm.png',
    accentColor: '#8b5cf6'
  }
];
