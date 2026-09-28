export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  headline: string;
  quote: string;
  avatar?: string;
  tag: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Tariq Rahman',
    role: 'CTO',
    company: 'Fintech Scaleup',
    headline: 'Our Core Web Vitals went from red to 99 overnight',
    quote: 'We brought in Rohan to refactor our client portal on Next.js and TypeScript. His architectural discipline and understanding of server components completely transformed our bundle performance. Clean code, zero unnecessary dependencies, and delivered 4 days ahead of schedule.',
    tag: 'Architecture & Next.js'
  },
  {
    id: '2',
    name: 'Sarah Jenkins',
    role: 'Founder & CEO',
    company: 'SaaS Studio',
    headline: 'Finally an engineer who thinks like a product owner',
    quote: 'Rohan did not just build what was in the ticket — he spotted UI inconsistencies, identified race conditions in our booking flow, and suggested a cleaner data model. When you work with him, you get a senior partner, not just a pair of hands.',
    tag: 'Product Engineering'
  },
  {
    id: '3',
    name: 'Arif Chowdhury',
    role: 'Lead Architect',
    company: 'Digital Solutions Lab',
    headline: 'High technical rigor with pixel-perfect visual execution',
    quote: 'Finding developers who can write complex state machines with React Flow and Redux while simultaneously nailing 60fps micro-animations is exceptionally rare. Rohan’s work on complex web platforms is world-class.',
    tag: 'Full Stack & UI Engineering'
  }
];
