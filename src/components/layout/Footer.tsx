import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const FacebookIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const TwitterIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 5.857zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function Footer() {
  const { settings } = useSiteSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2C1810] text-[#F5DEB3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="font-playfair text-xl text-white mb-3">
              Círculo De Entablado
            </h3>
            <p className="text-sm text-[#D2B48C] leading-relaxed mb-4">
              {settings.site_tagline || 'A theatre organization dedicated to the art of performance.'}
            </p>
            <div className="flex gap-3">
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer"
                  className="p-2 text-[#D2B48C] hover:text-white hover:bg-[#8B0000] rounded transition-colors">
                  <FacebookIcon />
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="p-2 text-[#D2B48C] hover:text-white hover:bg-[#8B0000] rounded transition-colors">
                  <InstagramIcon />
                </a>
              )}
              {settings.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer"
                  className="p-2 text-[#D2B48C] hover:text-white hover:bg-[#8B0000] rounded transition-colors">
                  <TwitterIcon />
                </a>
              )}
              {settings.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer"
                  className="p-2 text-[#D2B48C] hover:text-white hover:bg-[#8B0000] rounded transition-colors">
                  <YoutubeIcon />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium mb-4 uppercase tracking-wide text-xs">Explore</h4>
            <ul className="space-y-2">
              {[
                { label: 'Our Story', path: '/about/our-story' },
                { label: 'Current Season', path: '/shows/current' },
                { label: 'Coming Soon', path: '/shows/coming-soon' },
                { label: 'Photo Gallery', path: '/media/photos' },
                { label: 'Video Gallery', path: '/media/videos' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-[#D2B48C] hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white font-medium mb-4 uppercase tracking-wide text-xs">Organization</h4>
            <ul className="space-y-2">
              {[
                { label: 'Members', path: '/about/members' },
                { label: 'Officers', path: '/about/officers' },
                { label: 'Achievements', path: '/about/achievements' },
                { label: 'Press Reviews', path: '/media/press' },
                { label: 'Contact Us', path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-[#D2B48C] hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-medium mb-4 uppercase tracking-wide text-xs">Contact</h4>
            <ul className="space-y-3">
              {settings.contact_email && (
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-[#A0522D] mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${settings.contact_email}`}
                    className="text-sm text-[#D2B48C] hover:text-white transition-colors break-all">
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-[#A0522D] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[#D2B48C]">{settings.contact_phone}</span>
                </li>
              )}
              {settings.contact_address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#A0522D] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[#D2B48C]">{settings.contact_address}</span>
                </li>
              )}
              {!settings.contact_email && !settings.contact_phone && !settings.contact_address && (
                <li>
                  <Link to="/contact" className="text-sm text-[#D2B48C] hover:text-white transition-colors">
                    Get in touch →
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#5C3D2E] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#A0522D]">
            © {currentYear} Círculo De Entablado. All rights reserved.
          </p>
          <Link to="/admin" className="text-xs text-[#5C3D2E] hover:text-[#A0522D] transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
