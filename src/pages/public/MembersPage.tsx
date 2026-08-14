import { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Member } from '../../types';
import SafeImage from '../../components/ui/SafeImage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'active')
        .order('full_name', { ascending: true });
      if (error) throw error;
      setMembers(data || []);
      const uniqueYears = [...new Set((data || []).map((m: Member) => m.year))].sort((a, b) => b - a);
      setYears(uniqueYears);
    } catch (_err) {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = members.filter((m) => {
    const yearMatch = selectedYear === 'all' || m.year === selectedYear;
    const searchMatch = !search || m.full_name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase());
    return yearMatch && searchMatch;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <div className="bg-[#2C1810] py-16 px-4 text-center">
        <h1 className="font-playfair text-4xl md:text-5xl text-white mb-4">Members</h1>
        <p className="text-[#D2B48C] max-w-xl mx-auto">The talented individuals of Círculo De Entablado</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-12 bg-[#A0522D]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#D2B48C]" />
          <div className="h-px w-12 bg-[#A0522D]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0522D]" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-[#D2B48C]/50 rounded-lg bg-white text-[#2C1810] placeholder-[#A0522D]/50 focus:outline-none focus:border-[#8B0000] text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedYear === 'all' ? 'bg-[#8B0000] text-white' : 'bg-white border border-[#D2B48C]/50 text-[#A0522D] hover:border-[#8B0000]'
              }`}
            >
              All Years
            </button>
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedYear === year ? 'bg-[#8B0000] text-white' : 'bg-white border border-[#D2B48C]/50 text-[#A0522D] hover:border-[#8B0000]'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No members found" description="No members match your current search or filter." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filtered.map((member) => (
              <div key={member.id} className="group text-center bg-white rounded-xl p-4 shadow-sm border border-[#D2B48C]/20 hover:shadow-md hover:border-[#8B0000]/20 transition-all">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-[#F5DEB3] mb-3 ring-2 ring-[#D2B48C]/30 group-hover:ring-[#8B0000]/50 transition-all">
                  <SafeImage
                    src={member.profile_picture}
                    alt={member.full_name}
                    className="w-full h-full object-cover"
                    fallback={
                      <div className="w-full h-full flex items-center justify-center bg-[#D2B48C]/30">
                        <Users className="h-8 w-8 text-[#8B0000]" />
                      </div>
                    }
                  />
                </div>
                <p className="font-medium text-[#2C1810] text-sm leading-tight mb-1">{member.full_name}</p>
                <p className="text-xs text-[#8B0000] mb-1">{member.role}</p>
                <p className="text-xs text-[#A0522D]/70">{member.year}</p>
                {member.biography && (
                  <p className="text-xs text-[#5C3D2E]/70 mt-2 line-clamp-2 leading-relaxed">{member.biography}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
