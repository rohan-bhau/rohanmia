export type AIMode = 'visitor' | 'admin';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  miniProjectCard?: MiniProjectCardData;
  actionPrompt?: ActionPromptData;
}

export interface MiniProjectCardData {
  title: string;
  slug: string;
  tagline: string;
  previewImage?: string;
  hoverImage?: string;
  category: string;
  year: string;
  techStack: string[];
  liveUrl?: string;
}

export type ActionPromptType = 
  | 'meeting_redirect' 
  | 'upload_project_image' 
  | 'confirm_action'
  | 'form_add_skill'
  | 'form_add_project';

export interface ActionPromptData {
  type: ActionPromptType;
  title?: string;
  message?: string;
  destinationUrl?: string;
  stagedProjectId?: string;
  meta?: Record<string, unknown>;
}

export interface LeadCapturePayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  source?: string;
}

export interface GitHubRepoMetadata {
  owner: string;
  repo: string;
  fullName: string;
  description: string;
  defaultBranch: string;
  stars: number;
  topics: string[];
  readmeContent: string;
  packageJson?: {
    name?: string;
    description?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  fileTreeSample?: string[];
}

export interface SynthesizedCaseStudy {
  title: string;
  slug: string;
  tagline: string;
  category: string;
  year: string;
  role?: string;
  targetAudience?: string;
  whyIBuiltThis?: string;
  overview?: string;
  problem?: string;
  solution?: string;
  liveUrl?: string;
  githubUrl: string;
  clientUrl?: string;
  serverUrl?: string;
  previewImage?: string;
  hoverImage?: string;
  accentColor: string;
  gradient: string;
  techStack: string[];
  metrics: Array<{ label: string; value: string; description?: string }>;
  highlights: string[];
  keyFeatures?: Array<{ title: string; description: string }>;
  challenges: Array<{
    title: string;
    problem: string;
    solution: string;
    impact: string;
    tag: string;
  }>;
  technicalDecisions?: Array<{
    decision: string;
    rationale: string;
    tradeoff: string;
  }>;
  systemBreakdown?: Array<{
    layer: string;
    description: string;
    technologies: string[];
  }>;
  whatILearned?: string[];
  architectureTree?: string;
  backendArchitecture?: {
    overview: string;
    codeSnippet?: {
      filename: string;
      code: string;
    };
  };
  codeSnippet?: {
    title?: string;
    filename: string;
    code: string;
  };
  isFeatured?: boolean;
}

export interface AutonomousSkillPayload {
  name: string;
  category_id: string;
  category_name: string;
  brand_color: string;
  proficiency: number;
  description: string;
  docs_url: string;
  use_case: string;
  version?: string;
  is_core?: boolean;
}

export interface DailyBriefingData {
  visitorsCount: number;
  chatSessionsCount: number;
  recentLeads: Array<{
    name: string;
    email: string;
    company?: string;
    created_at: string;
  }>;
  recentGuestbook: Array<{
    name: string;
    message: string;
    badge: string;
    created_at: string;
  }>;
  timestamp: string;
}

export interface GroundedPortfolioContext {
  siteTitle: string;
  ownerName: string;
  bio: string;
  rotatingRoles: string[];
  stats: Array<{ label: string; value: string }>;
  projects: Array<{
    title: string;
    slug: string;
    tagline: string;
    category: string;
    year: string;
    techStack: string[];
    liveUrl?: string;
    githubUrl?: string;
  }>;
  categories: Array<{
    id: string;
    title: string;
    number: string;
    skills: string[];
  }>;
  socials: Record<string, string>;
  education?: Array<{
    institution: string;
    degree: string;
    period: string;
    location: string;
    tag?: string;
  }>;
  careerExperiences?: Array<{
    role: string;
    company: string;
    period: string;
    description: string;
    skills?: string[];
  }>;
  aboutBioParagraphs?: string[];
}
