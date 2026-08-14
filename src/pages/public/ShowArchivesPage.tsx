import { useState, useEffect } from 'react';
import { Search, Archive, Calendar, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Production } from '../../types';
import SafeImage from '../../components/ui/SafeImage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function ShowArchivesPage() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [years, setYears] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const { data, error } = await supabase
        .from('productions')
        .select('*')
        .order('year', { ascending: false });
      if (error) throw error;
      setProductions(data || []);
      const uniqueYears = [...new Set((data || []).map((p: Production) => p.year))].sort((a, b) => b - a);
      setYears(uniqueYears);
      const uniqueCats = [...new Set((data || []).filter((p: Production) => p.category).map((p: Production) => p.category as string))];
      setCategories(uniqueCats);
    } catch (_err) {
      setProductions([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = productions.filter((p) => {
    const yearMatch = selectedYear === 'all' || p.year === selectedYear;
    const catMatch = selectedCategory === 'all' || p.category === selectedCategory;
    const searchMatch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.director && p.director.toLowerCase().includes(search.toLowerCase()));
    return yearMatch && catMatch && searchMatch;
  });

  const statusLabel: Record<string, string> = {
    current: 'On Stage',
    coming_soon: 'Coming Soon',
    past: 'Past',
  };
  const statusColor: Record<string, string> = {
    current: 'bg-green-600',
    coming_soon: 'bg-[#A0522D]',
    past: 'bg-[#5C3D2E]',
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <div className="bg-[#2C1810] py-16 px-4 text-center">
        <h1 className="font-playfair text-4xl md:text-5xl text-white mb-4">Show Archives</h1>
        <p className="text-[#D2B48C] max-w-xl mx-auto">A complete archive of all Círculo De Entablado productions</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-12 bg-[#A0522D]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#D2B48C]" />
          <div className="h-px w-12 bg-[#A0522D]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search & Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#D2B48C]/20 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0522D]" />
              <input
                type="text"
                placeholder="Search productions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-[#D2B48C]/50 rounded-lg text-[#2C1810] placeholder-[#A0522D]/50 focus:outline-none focus:border-[#8B0000] text-sm"
              />
            </div>
            <select
              value={selectedYear === 'all' ? 'all' : String(selectedYear)}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="border border-[#D2B48C]/50 rounded-lg px-3 py-2.5 text-sm text-[#2C1810] focus:outline-none focus:border-[#8B0000] bg-white"
            >
              <option value="all">All Years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-[#D2B48C]/50 rounded-lg px-3 py-2.5 text-sm text-[#2C1810] focus:outline-none focus:border-[#8B0000] bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Archive} title="No productions found" description="No productions match your search criteria." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((prod) => (
              <div key={prod.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#D2B48C]/10 hover:shadow-md transition-all">
                <div className="relative h-44 bg-[#F5DEB3]">
                  <SafeImage src={prod.poster} alt={prod.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <span className={`${statusColor[prod.status]} text-white text-xs px-2 py-0.5 rounded-full`}>
                      {statusLabel[prod.status]}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-playfair text-base text-[#2C1810] mb-1 leading-tight">{prod.title}</h3>
                  {prod.director && <p className="text-[#A0522D] text-xs mb-2">Dir. {prod.director}</p>}
                  <div className="space-y-1">
                    {prod.date && (
                      <div className="flex items-center gap-1.5 text-xs text-[#A0522D]/80">
                        <Calendar className="h-3 w-3" />
                        {prod.year}
                      </div>
                    )}
                    {prod.venue && (
                      <div className="flex items-center gap-1.5 text-xs text-[#A0522D]/80">
                        <MapPin className="h-3 w-3" />
                        {prod.venue}
                      </div>
                    )}
                  </div>
                  {prod.category && (
                    <span className="mt-2 inline-block text-xs bg-[#F5DEB3] text-[#8B0000] px-2 py-0.5 rounded">
                      {prod.category}
                    </span>
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
