export type AccentColor = 'cyan' | 'violet' | 'emerald' | 'rose' | 'amber' | 'mono';

export interface ThemeOption {
  id: AccentColor;
  name: string;
  primary: string;
  glow: string;
  contrastText: string;
  label: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'cyan',
    name: 'Electric Cyan',
    primary: '#0ea5e9',
    glow: 'rgba(14, 165, 233, 0.35)',
    contrastText: '#ffffff',
    label: 'Next-gen, crisp & visionary'
  },
  {
    id: 'violet',
    name: 'Cyber Violet',
    primary: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.35)',
    contrastText: '#ffffff',
    label: 'AI-infused creative luxury'
  },
  {
    id: 'emerald',
    name: 'Matrix Emerald',
    primary: '#10b981',
    glow: 'rgba(16, 185, 129, 0.35)',
    contrastText: '#ffffff',
    label: 'Algorithmic speed & clean code'
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    primary: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.35)',
    contrastText: '#ffffff',
    label: 'Bold, high-performance impact'
  },
  {
    id: 'amber',
    name: 'Solar Amber',
    primary: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.35)',
    contrastText: '#ffffff',
    label: 'Warm cyberpunk engineering'
  },
  {
    id: 'mono',
    name: 'Titanium White',
    primary: '#ffffff',
    glow: 'rgba(255, 255, 255, 0.3)',
    contrastText: '#000000',
    label: 'Linear & Apple minimalist purity'
  }
];
