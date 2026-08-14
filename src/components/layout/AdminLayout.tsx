import { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Award, Film, Image, Video, BookOpen,
  Mail, Settings, LogOut, Menu, X, ChevronDown, UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const navGroups = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: '/admin', icon: LayoutDashboard }],
  },
  {
    label: 'Organization',
    items: [
      { label: 'Members', path: '/admin/members', icon: Users },
      { label: 'Officers', path: '/admin/officers', icon: UserCheck },
      { label: 'Achievements', path: '/admin/achievements', icon: Award },
    ],
  },
  {
    label: 'Shows',
    items: [
      { label: 'Productions', path: '/admin/productions', icon: Film },
    ],
  },
  {
    label: 'Media',
    items: [
      { label: 'Photos', path: '/admin/photos', icon: Image },
      { label: 'Videos', path: '/admin/videos', icon: Video },
      { label: 'Press Reviews', path: '/admin/press', icon: BookOpen },
    ],
  },
  {
    label: 'Communication',
    items: [{ label: 'Messages', path: '/admin/messages', icon: Mail }],
  },
  {
    label: 'Configuration',
    items: [{ label: 'Site Settings', path: '/admin/settings', icon: Settings }],
  },
];

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay on Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#1a0d08] flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="px-4 py-4 border-b border-[#3d1f14] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#8B0000] rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">CDE</span>
            </div>
            <div>
              <p className="text-white text-xs font-semibold leading-tight">Círculo De</p>
              <p className="text-white text-xs font-semibold leading-tight">Entablado</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[#D2B48C]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <button
                className="w-full flex items-center justify-between text-[#A0522D] text-[10px] font-medium uppercase tracking-widest px-2 py-1 hover:text-[#D2B48C] transition-colors"
                onClick={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)}
              >
                {group.label}
                {group.items.length > 1 && <ChevronDown className={`h-3 w-3 transition-transform ${expandedGroup === group.label ? 'rotate-180' : ''}`} />}
              </button>
              {(group.items.length === 1 || expandedGroup !== group.label || expandedGroup === null) && (
                <div className="space-y-0.5 mt-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                        isActive(item.path)
                          ? 'bg-[#8B0000] text-white'
                          : 'text-[#D2B48C] hover:bg-[#3d1f14] hover:text-white'
                      }`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="px-3 py-4 border-t border-[#3d1f14]">
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="h-7 w-7 bg-[#8B0000] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">{user.email?.charAt(0).toUpperCase()}</span>
            </div>
            <p className="text-[#D2B48C] text-xs truncate flex-1">{user.email}</p>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[#D2B48C] hover:bg-[#3d1f14] hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Admin Dashboard</span>
          </div>
          <Link
            to="/"
            target="_blank"
            className="text-xs text-[#8B0000] hover:underline"
          >
            View Public Site →
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
