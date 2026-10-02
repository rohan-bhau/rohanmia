export type GuestbookTheme = 
  | 'violet' 
  | 'emerald' 
  | 'crimson' 
  | 'sapphire' 
  | 'amber' 
  | 'teal' 
  | 'rose' 
  | 'slate';

export interface GuestbookEntry {
  id: string;
  name: string;
  email: string;
  message: string;
  avatar: string;
  provider?: string;
  theme: GuestbookTheme;
  createdAt: string;
  verified?: boolean;
  /** Resolved server-side from the verified session */
  isOwner?: boolean;
}
