import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import SafeImage from '../ui/SafeImage';

const navItems = [
  { label: 'Home', path: '/' },
  {
    label: 'About',
    path: '/about',
    children: [
      { label: 'Our Story', path: '/about/our-story' },
      { label: 'Mission & Vision', path: '/about/mission-vision' },
      { label: 'Members', path: '/about/members' },
      { label: 'Officers', path: '/about/officers' },
      { label: 'Achievements', path: '/about/achievements' },
    ],
  },
  {
    label: 'Shows',
    path: '/shows',
    children: [
      { label: 'Current Season', path: '/shows/current' },
      { label: 'Coming Soon', path: '/shows/coming-soon' },
      { label: 'Past Performances', path: '/shows/past' },
      { label: 'Show Archives', path: '/shows/archives' },
    ],
  },
  {
    label: 'Media',
    path: '/media',
    children: [
      { label: 'Photo Gallery', path: '/media/photos' },
      { label: 'Video Gallery', path: '/media/videos' },
      { label: 'Press Reviews', path: '/media/press' },
    ],
  },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { settings } = useSiteSettings();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FFF5EE]/95 backdrop-blur-sm shadow-md border-b border-[#D2B48C]/30'
          : 'bg-[#FFF5EE]/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            {settings.logo_url ? (
              <SafeImage
                src={settings.logo_url}
                alt="Círculo De Entablado Logo"
                className="h-10 w-10 object-contain"
              />
            ) : (
              <div className="h-10 w-10 bg-[#8B0000] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">CDE</span>
              </div>
            )}
            <div className="hidden sm:block">
              <div className="text-[#8B0000] font-playfair font-semibold text-sm leading-tight">
                Círculo De
              </div>
              <div className="text-[#8B0000] font-playfair font-semibold text-sm leading-tight">
                Entablado
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.path}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-[#8B0000] bg-[#8B0000]/10'
                      : 'text-[#5C3D2E] hover:text-[#8B0000] hover:bg-[#8B0000]/5'
                  }`}
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-3.5 w-3.5" />}
                </Link>
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-[#D2B48C]/30 py-1 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          location.pathname === child.path
                            ? 'text-[#8B0000] bg-[#FFF5EE]'
                            : 'text-[#5C3D2E] hover:text-[#8B0000] hover:bg-[#FFF5EE]'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-[#8B0000] hover:bg-[#8B0000]/10 rounded transition-colors"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-[#FFF5EE] border-t border-[#D2B48C]/30 max-h-[80vh] overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.path}>
              <Link
                to={item.path}
                className={`block px-4 py-3 font-medium text-sm border-b border-[#D2B48C]/20 ${
                  isActive(item.path) ? 'text-[#8B0000] bg-[#8B0000]/5' : 'text-[#5C3D2E]'
                }`}
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="bg-[#F5DEB3]/30">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={`block px-8 py-2.5 text-sm border-b border-[#D2B48C]/10 ${
                        location.pathname === child.path
                          ? 'text-[#8B0000]'
                          : 'text-[#A0522D]'
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
