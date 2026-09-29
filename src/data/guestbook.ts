export interface GuestbookEntry {
  id: string;
  name: string;
  role: string;
  badge: 'Recruiter' | 'Founder' | 'Engineer' | 'Visitor';
  message: string;
  createdAt: string;
  verified?: boolean;
}

export const INITIAL_GUESTBOOK_ENTRIES: GuestbookEntry[] = [
  {
    id: '1',
    name: 'David Hoffman',
    role: 'Head of Engineering @ CloudScale Dynamics',
    badge: 'Recruiter',
    message: 'Inspected the Reserva case study — the atomic lock concurrency model against MongoDB conditional operators is remarkably well-architected. Impressive engineering depth!',
    createdAt: 'Feb 26, 2026',
    verified: true
  },
  {
    id: '2',
    name: 'Elena Rostova',
    role: 'Technical Co-Founder @ Finflow',
    badge: 'Founder',
    message: 'Love the sub-100ms navigation speeds and the multi-accent theme engine. The attention to detail across typography and edge performance is world-class.',
    createdAt: 'Feb 22, 2026',
    verified: true
  },
  {
    id: '3',
    name: 'Tariq Rahman',
    role: 'Staff Infrastructure Architect',
    badge: 'Engineer',
    message: 'Great seeing senior engineers in Dhaka building distributed systems with real concurrency benchmarks instead of standard CRUD boilerplates. Keep setting the bar high!',
    createdAt: 'Feb 18, 2026',
    verified: true
  },
  {
    id: '4',
    name: 'Marcus Chen',
    role: 'Principal Recruiter @ Apex Ventures',
    badge: 'Recruiter',
    message: 'Bookmarked your portfolio for upcoming Senior Full Stack and Technical Lead openings across our portfolio companies. Exceptional case studies!',
    createdAt: 'Feb 12, 2026',
    verified: true
  },
  {
    id: '5',
    name: 'Aisha Al-Mansoor',
    role: 'Product Designer & Frontend Developer',
    badge: 'Engineer',
    message: 'The cursor-following discovery badge and the dual-screen mockup tilt are so satisfying to interact with. Beautiful synthesis of design and code.',
    createdAt: 'Feb 05, 2026',
    verified: true
  }
];
