export interface HeroData {
  greeting: string;
  name: string;
  surname: string;
  bio: string;
  profile_image: string;
  resume_url: string;
  rotating_roles: string[];
  projects_cta_text: string;
  resume_cta_text: string;
}

export interface BentoCardsData {
  badge: string;
  title_prefix: string;
  title_suffix: string;
  card1: {
    tag: string;
    headline: string;
    description: string;
    points: string[];
  };
  card2: {
    tag: string;
    project_title: string;
    description: string;
    link_url: string;
    tech_stack: string[];
  };
  card4: {
    tag: string;
    title: string;
    description: string;
    tools: string[];
  };
  card5: {
    tag: string;
    location: string;
    description: string;
    timezone: string;
  };
}
