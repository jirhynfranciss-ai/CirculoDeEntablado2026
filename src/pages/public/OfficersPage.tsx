import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Officer } from '../../types';
import SafeImage from '../../components/ui/SafeImage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const { data, error } = await supabase
        .from('officers')
        .select('*')
        .order('year', { ascending: false });
      if (error) throw error;
      setOfficers(data || []);
      const uniqueYears = [...new Set((data || []).map((o: Officer) => o.year))].sort((a, b) => b - a);
      setYears(uniqueYears);
    } catch (_err) {
      setOfficers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = selectedYear === 'all' ? officers : officers.filter((o) => o.year === selectedYear);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <div className="bg-[#2C1810] py-16 px-4 text-center">
        <h1 className="font-playfair text-4xl md:text-5xl text-white mb-4">Officers</h1>
        <p className="text-[#D2B48C] max-w-xl mx-auto">The leadership team of Círculo De Entablado</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-12 bg-[#A0522D]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#D2B48C]" />
          <div className="h-px w-12 bg-[#A0522D]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Year Filter */}
        <div className="flex gap-2 flex-wrap mb-8">
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

        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No officers found" description="No officers have been added yet." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((officer) => (
              <div key={officer.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#D2B48C]/20 hover:shadow-md transition-all text-center">
                <div className="h-40 bg-gradient-to-b from-[#2C1810] to-[#5C3D2E] flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#D2B48C]/30">
                    <SafeImage
                      src={officer.profile_picture}
                      alt={officer.full_name}
                      className="w-full h-full object-cover"
                      fallback={
                        <div className="w-full h-full flex items-center justify-center bg-[#D2B48C]/20">
                          <Users className="h-10 w-10 text-[#D2B48C]" />
                        </div>
                      }
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-playfair text-base text-[#2C1810] mb-1">{officer.full_name}</h3>
                  <p className="text-[#8B0000] text-sm font-medium mb-1">{officer.position}</p>
                  <p className="text-[#A0522D] text-xs mb-2">{officer.term || officer.year}</p>
                  {officer.biography && (
                    <p className="text-[#5C3D2E] text-xs leading-relaxed line-clamp-3">{officer.biography}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
