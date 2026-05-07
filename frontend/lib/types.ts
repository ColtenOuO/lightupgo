export type Card = {
  id: string;
  slug: string;
  page: string;
  section: string;
  order: number;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  icon: string | null;
  cta_text: string | null;
  cta_url: string | null;
  extras: Record<string, unknown>;
  visible: boolean;
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  slug: string;
  name: string;
  level: string;
  description: string | null;
  age_range: string | null;
  duration: string | null;
  schedule: string | null;
  price: string | null;
  image_url: string | null;
  features: string[];
  order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
};

export type Teacher = {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  rank: string | null;
  bio: string | null;
  avatar_url: string | null;
  achievements: string[];
  order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
};

export type GalleryItem = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  category: string | null;
  taken_at: string | null;
  order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  author: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteSettings = {
  site_name: string;
  tagline: string;
  hero_subtitle: string | null;
  phone: string | null;
  address: string | null;
  business_hours: string | null;
  register_form_url: string | null;
  register_form_note: string | null;
  meta_description: string | null;
  meta_keywords: string[];
  facebook_url: string | null;
  instagram_url: string | null;
  line_id: string | null;
  youtube_url: string | null;
  updated_at: string;
};
