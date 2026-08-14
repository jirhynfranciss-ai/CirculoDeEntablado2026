import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Film, Award, Image, Video, Mail, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Stats {
  members: number;
  officers: number;
  productions: number;
  upcoming: number;
  achievements: number;
  photos: number;
  videos: number;
  unread_messages: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [membersRes, officersRes, prodsRes, upcomingRes, achieveRes, photosRes, videosRes, msgsRes] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }),
        supabase.from('officers').select('id', { count: 'exact', head: true }),
        supabase.from('productions').select('id', { count: 'exact', head: true }),
        supabase.from('productions').select('id', { count: 'exact', head: true }).eq('status', 'coming_soon'),
        supabase.from('achievements').select('id', { count: 'exact', head: true }),
        supabase.from('photos').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
      ]);
      setStats({
        members: membersRes.count || 0,
        officers: officersRes.count || 0,
        productions: prodsRes.count || 0,
        upcoming: upcomingRes.count || 0,
        achievements: achieveRes.count || 0,
        photos: photosRes.count || 0,
        videos: videosRes.count || 0,
        unread_messages: msgsRes.count || 0,
      });
    } catch (_err) {
      setStats({ members: 0, officers: 0, productions: 0, upcoming: 0, achievements: 0, photos: 0, videos: 0, unread_messages: 0 });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Members', value: stats?.members ?? 0, icon: Users, path: '/admin/members', color: 'bg-blue-50 text-blue-600' },
    { label: 'Officers', value: stats?.officers ?? 0, icon: UserCheck, path: '/admin/officers', color: 'bg-purple-50 text-purple-600' },
    { label: 'Productions', value: stats?.productions ?? 0, icon: Film, path: '/admin/productions', color: 'bg-[#FFF5EE] text-[#8B0000]' },
    { label: 'Upcoming Shows', value: stats?.upcoming ?? 0, icon: Film, path: '/admin/productions', color: 'bg-amber-50 text-amber-600' },
    { label: 'Achievements', value: stats?.achievements ?? 0, icon: Award, path: '/admin/achievements', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Photos', value: stats?.photos ?? 0, icon: Image, path: '/admin/photos', color: 'bg-green-50 text-green-600' },
    { label: 'Videos', value: stats?.videos ?? 0, icon: Video, path: '/admin/videos', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Unread Messages', value: stats?.unread_messages ?? 0, icon: Mail, path: '/admin/messages', color: stats?.unread_messages ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600' },
  ];

  const quickLinks = [
    { label: 'Add Member', path: '/admin/members' },
    { label: 'Add Production', path: '/admin/productions' },
    { label: 'Upload Photos', path: '/admin/photos' },
    { label: 'Add Video', path: '/admin/videos' },
    { label: 'View Messages', path: '/admin/messages' },
    { label: 'Site Settings', path: '/admin/settings' },
    { label: 'Press Reviews', path: '/admin/press' },
    { label: 'Achievements', path: '/admin/achievements' },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's an overview of your website.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.path}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all hover:border-[#D2B48C]/50"
          >
            <div className={`inline-flex p-2 rounded-lg ${card.color} mb-3`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#8B0000]" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.path + link.label}
              to={link.path}
              className="text-center py-3 px-3 bg-[#FFF5EE] border border-[#D2B48C]/30 rounded-lg text-sm text-[#5C3D2E] hover:bg-[#F5DEB3] hover:border-[#A0522D]/50 transition-all font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
