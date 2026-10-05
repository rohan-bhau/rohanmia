export interface AdminCustomLink {
  id: string;
  category: 'code' | 'connect' | 'direct';
  title: string;
  handle: string;
  href: string;
  iconName: string;
  isExternal: boolean;
  color?: string;
  active: boolean;
}

export interface CarouselSlideItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  alt?: string;
}
