import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  logo_url: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  our_story: string;
  mission: string;
  vision: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
  featured_production_id: string;
}

const defaultSettings: SiteSettings = {
  site_name: 'Círculo De Entablado',
  site_tagline: 'A Theatre Organization',
  logo_url: '',
  hero_title: 'Welcome to Círculo De Entablado',
  hero_subtitle: 'Where stories come alive on stage',
  hero_image: '',
  our_story: '',
  mission: '',
  vision: '',
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  facebook_url: '',
  instagram_url: '',
  twitter_url: '',
  youtube_url: '',
  featured_production_id: '',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      if (data) {
        const settingsMap: Partial<SiteSettings> = {};
        data.forEach((row: { key: string; value: string | null }) => {
          if (row.value !== null) {
            (settingsMap as Record<string, string>)[row.key] = row.value;
          }
        });
        setSettings({ ...defaultSettings, ...settingsMap });
      }
    } catch (_err) {
      // Use defaults on error
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refetch: fetchSettings };
}
