import { useState, useEffect, useRef } from 'react';
import { Save, Upload, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadImage, validateImageFile } from '../../utils/uploadImage';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

type SettingsForm = {
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
};

const FIELD_LABELS: Record<keyof SettingsForm, string> = {
  site_name: 'Site Name',
  site_tagline: 'Site Tagline',
  logo_url: 'Logo URL',
  hero_title: 'Hero Title',
  hero_subtitle: 'Hero Subtitle',
  hero_image: 'Hero Background Image URL',
  our_story: 'Our Story',
  mission: 'Mission',
  vision: 'Vision',
  contact_email: 'Contact Email',
  contact_phone: 'Contact Phone',
  contact_address: 'Contact Address',
  facebook_url: 'Facebook URL',
  instagram_url: 'Instagram URL',
  twitter_url: 'Twitter/X URL',
  youtube_url: 'YouTube URL',
};

export default function AdminSettings() {
  const { settings, refetch } = useSiteSettings();
  const [form, setForm] = useState<SettingsForm>({
    site_name: '', site_tagline: '', logo_url: '', hero_title: '',
    hero_subtitle: '', hero_image: '', our_story: '', mission: '', vision: '',
    contact_email: '', contact_phone: '', contact_address: '',
    facebook_url: '', instagram_url: '', twitter_url: '', youtube_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'content' | 'contact' | 'social'>('general');

  useEffect(() => {
    setForm({
      site_name: settings.site_name || '',
      site_tagline: settings.site_tagline || '',
      logo_url: settings.logo_url || '',
      hero_title: settings.hero_title || '',
      hero_subtitle: settings.hero_subtitle || '',
      hero_image: settings.hero_image || '',
      our_story: settings.our_story || '',
      mission: settings.mission || '',
      vision: settings.vision || '',
      contact_email: settings.contact_email || '',
      contact_phone: settings.contact_phone || '',
      contact_address: settings.contact_address || '',
      facebook_url: settings.facebook_url || '',
      instagram_url: settings.instagram_url || '',
      twitter_url: settings.twitter_url || '',
      youtube_url: settings.youtube_url || '',
    });
  }, [settings]);

  const handleLogoUpload = async (file: File) => {
    const err = validateImageFile(file);
    if (err) { toast.error(err); return; }
    setUploadingLogo(true);
    try {
      const result = await uploadImage(file, 'logos', 'logo');
      if (result) setForm((f) => ({ ...f, logo_url: result.url }));
    } catch (e: unknown) { toast.error((e as Error).message || 'Upload failed'); }
    finally { setUploadingLogo(false); }
  };

  const handleHeroUpload = async (file: File) => {
    const err = validateImageFile(file);
    if (err) { toast.error(err); return; }
    setUploadingHero(true);
    try {
      const result = await uploadImage(file, 'hero-images', 'hero');
      if (result) setForm((f) => ({ ...f, hero_image: result.url }));
    } catch (e: unknown) { toast.error((e as Error).message || 'Upload failed'); }
    finally { setUploadingHero(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(form).map(([key, value]) => ({
        key,
        value: value || null,
        updated_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({ key: update.key, value: update.value, updated_at: update.updated_at }, { onConflict: 'key' });
        if (error) throw error;
      }
      toast.success('Settings saved successfully!');
      refetch();
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'content', label: 'Content' },
    { id: 'contact', label: 'Contact' },
    { id: 'social', label: 'Social Media' },
  ] as const;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#8B0000]" />
            Site Settings
          </h1>
          <p className="text-gray-500 text-sm">Manage your website content and configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6d0000] text-sm disabled:opacity-60">
          {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-[#8B0000] text-[#8B0000]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Official Logo</label>
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-[#F5DEB3] flex-shrink-0 border border-[#D2B48C]/30">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="Logo" className="h-full w-full object-contain p-1"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#A0522D]/50 text-xs text-center p-2">No logo</div>
                  )}
                </div>
                <div className="flex-1">
                  <input type="file" ref={logoRef} accept="image/*" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]); e.target.value = ''; }} />
                  <button onClick={() => logoRef.current?.click()} disabled={uploadingLogo}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60 mb-2">
                    {uploadingLogo ? <LoadingSpinner size="sm" /> : <Upload className="h-4 w-4" />}
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </button>
                  <p className="text-xs text-gray-500">Recommended: PNG with transparent background. Max 5MB.</p>
                  {form.logo_url && (
                    <div className="mt-2">
                      <input type="text" value={form.logo_url} readOnly
                        className="w-full border border-gray-200 rounded px-3 py-1.5 text-xs text-gray-500 bg-gray-50" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Background Image</label>
              {form.hero_image && (
                <div className="mb-3 h-32 rounded-lg overflow-hidden bg-[#F5DEB3]">
                  <img src={form.hero_image} alt="Hero" className="w-full h-full object-cover" />
                </div>
              )}
              <input type="file" ref={heroRef} accept="image/*" className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleHeroUpload(e.target.files[0]); e.target.value = ''; }} />
              <button onClick={() => heroRef.current?.click()} disabled={uploadingHero}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60 mb-2">
                {uploadingHero ? <LoadingSpinner size="sm" /> : <Upload className="h-4 w-4" />}
                {uploadingHero ? 'Uploading...' : 'Upload Hero Image'}
              </button>
              <p className="text-xs text-gray-500">Used as the homepage hero background. Recommended: 1920x1080 or wider.</p>
            </div>

            {[
              { key: 'site_name', type: 'text', placeholder: 'Círculo De Entablado' },
              { key: 'site_tagline', type: 'text', placeholder: 'A Theatre Organization' },
              { key: 'hero_title', type: 'text', placeholder: 'Welcome to Círculo De Entablado' },
              { key: 'hero_subtitle', type: 'text', placeholder: 'Where stories come alive on stage' },
            ].map(({ key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {FIELD_LABELS[key as keyof SettingsForm]}
                </label>
                <input
                  type={type}
                  value={form[key as keyof SettingsForm]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]"
                />
              </div>
            ))}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Our Story</label>
              <p className="text-xs text-gray-500 mb-2">The history and background of Círculo De Entablado. This appears on the Our Story page.</p>
              <textarea
                value={form.our_story}
                onChange={(e) => setForm((f) => ({ ...f, our_story: e.target.value }))}
                rows={8}
                placeholder="Write the organization's history and background..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mission</label>
              <textarea
                value={form.mission}
                onChange={(e) => setForm((f) => ({ ...f, mission: e.target.value }))}
                rows={4}
                placeholder="Our mission statement..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vision</label>
              <textarea
                value={form.vision}
                onChange={(e) => setForm((f) => ({ ...f, vision: e.target.value }))}
                rows={4}
                placeholder="Our vision statement..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000] resize-none"
              />
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            {[
              { key: 'contact_email', type: 'email', placeholder: 'contact@circulodeentablado.org' },
              { key: 'contact_phone', type: 'text', placeholder: '+63 912 345 6789' },
              { key: 'contact_address', type: 'text', placeholder: 'City, Province, Philippines' },
            ].map(({ key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {FIELD_LABELS[key as keyof SettingsForm]}
                </label>
                <input
                  type={type}
                  value={form[key as keyof SettingsForm]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]"
                />
              </div>
            ))}
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            {[
              { key: 'facebook_url', placeholder: 'https://facebook.com/circulodeentablado' },
              { key: 'instagram_url', placeholder: 'https://instagram.com/circulodeentablado' },
              { key: 'twitter_url', placeholder: 'https://twitter.com/circulodeentablado' },
              { key: 'youtube_url', placeholder: 'https://youtube.com/@circulodeentablado' },
            ].map(({ key, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {FIELD_LABELS[key as keyof SettingsForm]}
                </label>
                <input
                  type="url"
                  value={form[key as keyof SettingsForm]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B0000]"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#8B0000] text-white rounded-lg hover:bg-[#6d0000] text-sm disabled:opacity-60">
          {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
