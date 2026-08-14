import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function ContactPage() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.message.trim()) errs.message = 'Message is required';
    else if (form.message.trim().length < 10) errs.message = 'Message is too short';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setSubmitError('');
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        is_read: false,
      });
      if (error) throw error;
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (_err) {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((errs) => { const ne = { ...errs }; delete ne[name]; return ne; });
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <div className="bg-[#2C1810] py-16 px-4 text-center">
        <h1 className="font-playfair text-4xl md:text-5xl text-white mb-4">Contact Us</h1>
        <p className="text-[#D2B48C] max-w-xl mx-auto">We'd love to hear from you</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-12 bg-[#A0522D]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#D2B48C]" />
          <div className="h-px w-12 bg-[#A0522D]" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-playfair text-xl text-[#2C1810] mb-4">Get in Touch</h2>
              <p className="text-[#5C3D2E] text-sm leading-relaxed">
                Have questions about our productions, membership, or events? Send us a message and we'll get back to you.
              </p>
            </div>
            <div className="space-y-4">
              {settings.contact_email && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#8B0000]/10 rounded-lg flex-shrink-0">
                    <Mail className="h-4 w-4 text-[#8B0000]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#A0522D] uppercase tracking-wide mb-0.5">Email</p>
                    <a href={`mailto:${settings.contact_email}`}
                      className="text-sm text-[#2C1810] hover:text-[#8B0000] transition-colors">
                      {settings.contact_email}
                    </a>
                  </div>
                </div>
              )}
              {settings.contact_phone && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#8B0000]/10 rounded-lg flex-shrink-0">
                    <Phone className="h-4 w-4 text-[#8B0000]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#A0522D] uppercase tracking-wide mb-0.5">Phone</p>
                    <p className="text-sm text-[#2C1810]">{settings.contact_phone}</p>
                  </div>
                </div>
              )}
              {settings.contact_address && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#8B0000]/10 rounded-lg flex-shrink-0">
                    <MapPin className="h-4 w-4 text-[#8B0000]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#A0522D] uppercase tracking-wide mb-0.5">Location</p>
                    <p className="text-sm text-[#2C1810]">{settings.contact_address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-[#D2B48C]/20 p-6 md:p-8">
              {success ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#2C1810] mb-2">Message Sent!</h3>
                  <p className="text-[#5C3D2E] text-sm mb-6">
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2.5 bg-[#8B0000] text-white rounded hover:bg-[#6d0000] transition-colors text-sm"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#2C1810] mb-1.5">
                        Name <span className="text-[#8B0000]">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-4 py-2.5 text-sm text-[#2C1810] focus:outline-none transition-colors ${
                          errors.name ? 'border-red-400 bg-red-50' : 'border-[#D2B48C]/50 focus:border-[#8B0000]'
                        }`}
                        placeholder="Your full name"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2C1810] mb-1.5">
                        Email <span className="text-[#8B0000]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-4 py-2.5 text-sm text-[#2C1810] focus:outline-none transition-colors ${
                          errors.email ? 'border-red-400 bg-red-50' : 'border-[#D2B48C]/50 focus:border-[#8B0000]'
                        }`}
                        placeholder="your@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2C1810] mb-1.5">
                      Subject <span className="text-[#8B0000]">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm text-[#2C1810] focus:outline-none transition-colors ${
                        errors.subject ? 'border-red-400 bg-red-50' : 'border-[#D2B48C]/50 focus:border-[#8B0000]'
                      }`}
                      placeholder="Subject of your message"
                    />
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2C1810] mb-1.5">
                      Message <span className="text-[#8B0000]">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm text-[#2C1810] focus:outline-none transition-colors resize-none ${
                        errors.message ? 'border-red-400 bg-red-50' : 'border-[#D2B48C]/50 focus:border-[#8B0000]'
                      }`}
                      placeholder="Write your message here..."
                    />
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                  </div>
                  {submitError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-3">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {submitError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#8B0000] text-white rounded-lg font-medium hover:bg-[#6d0000] transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
