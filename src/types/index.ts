export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface Member {
  id: string;
  full_name: string;
  profile_picture: string | null;
  year: number;
  role: string;
  biography: string | null;
  status: 'active' | 'inactive';
  date_joined: string | null;
  created_at: string;
  updated_at: string;
}

export interface Officer {
  id: string;
  full_name: string;
  position: string;
  profile_picture: string | null;
  year: number;
  biography: string | null;
  term: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string | null;
  year: number;
  date: string | null;
  award: string | null;
  organization: string | null;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface Production {
  id: string;
  title: string;
  poster: string | null;
  description: string | null;
  date: string | null;
  time: string | null;
  venue: string | null;
  director: string | null;
  ticket_info: string | null;
  status: 'current' | 'coming_soon' | 'past';
  category: string | null;
  year: number;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductionCast {
  id: string;
  production_id: string;
  actor_name: string;
  character_name: string | null;
  order_index: number;
  created_at: string;
}

export interface ProductionTeam {
  id: string;
  production_id: string;
  name: string;
  role: string;
  order_index: number;
  created_at: string;
}

export interface Photo {
  id: string;
  url: string;
  caption: string | null;
  category: string | null;
  production_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  video_url: string;
  production_id: string | null;
  year: number | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface PressReview {
  id: string;
  title: string;
  publication: string;
  author: string | null;
  date: string | null;
  description: string | null;
  article_url: string | null;
  featured_image: string | null;
  production_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
