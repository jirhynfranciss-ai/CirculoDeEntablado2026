import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gpzxuyngkxkjhazfusnt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwenh1eW5na3hramhhemZ1c250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTI5NjQsImV4cCI6MjEwMjI2ODk2NH0.B_KMOHvmAfLwsUrklbwwr9absxKqDS0k1M6tkeXjXIY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string | null;
          updated_at?: string;
        };
      };
      members: {
        Row: {
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
        };
      };
      officers: {
        Row: {
          id: string;
          full_name: string;
          position: string;
          profile_picture: string | null;
          year: number;
          biography: string | null;
          term: string;
          created_at: string;
          updated_at: string;
        };
      };
      achievements: {
        Row: {
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
        };
      };
      productions: {
        Row: {
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
        };
      };
      production_cast: {
        Row: {
          id: string;
          production_id: string;
          actor_name: string;
          character_name: string | null;
          order_index: number;
          created_at: string;
        };
      };
      production_team: {
        Row: {
          id: string;
          production_id: string;
          name: string;
          role: string;
          order_index: number;
          created_at: string;
        };
      };
      photos: {
        Row: {
          id: string;
          url: string;
          caption: string | null;
          category: string | null;
          production_id: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      videos: {
        Row: {
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
        };
      };
      press_reviews: {
        Row: {
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
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
      };
    };
  };
};
