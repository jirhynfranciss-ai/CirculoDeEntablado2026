import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Achievement } from '../../types';
import SafeImage from '../../components/ui/SafeImage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('year', { ascending: false });
      if (error) throw error;
      setAchievements(data || []);
      const uniqueYears = [...new Set((data || []).map((a: Achievement) => a.year))].sort((a, b) => b - a);
      setYears(uniqueYears);
    } catch (_err) {
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = selectedYear === 'all' ? achievements : achievements.filter((a) => a.year === selectedYear);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <div className="bg-[#2C1810] py-16 px-4 text-center">
        <h1 className="font-playfair text-4xl md:text-5xl text-white mb-4">Achievements</h1>
        <p className="text-[#D2B48C] max-w-xl mx-auto">Celebrating our milestones, awards, and recognitions</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-12 bg-[#A0522D]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#D2B48C]" />
          <div className="h-px w-12 bg-[#A0522D]" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Year Filter */}
        <div className="flex gap-2 flex-wrap mb-10">
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
          <EmptyState icon={Award} title="No achievements found" description="No achievements have been recorded yet." />
        ) : (
          <div className="space-y-6">
            {filtered.map((achievement, idx) => (
              <div key={achievement.id} className="relative pl-8">
                {/* Timeline line */}
                {idx < filtered.length - 1 && (
                  <div className="absolute left-3.5 top-8 bottom-0 w-px bg-[#D2B48C]/50" />
                )}
                {/* Timeline dot */}
                <div className="absolute left-0 top-2 w-7 h-7 bg-[#8B0000] rounded-full flex items-center justify-center">
                  <Award className="h-3.5 w-3.5 text-white" />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-[#D2B48C]/20 p-6 hover:shadow-md transition-all ml-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-playfair text-xl text-[#2C1810]">{achievement.title}</h3>
                      {achievement.organization && (
                        <p className="text-[#A0522D] text-sm mt-0.5">{achievement.organization}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[#8B0000] font-medium text-sm">{achievement.year}</span>
                      {achievement.date && (
                        <p className="text-[#A0522D]/70 text-xs mt-0.5">
                          {new Date(achievement.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  {achievement.award && (
                    <div className="inline-flex items-center gap-1.5 bg-[#F5DEB3] text-[#8B0000] text-xs px-3 py-1 rounded-full mb-3">
                      <Award className="h-3 w-3" />
                      {achievement.award}
                    </div>
                  )}
                  {achievement.description && (
                    <p className="text-[#5C3D2E] text-sm leading-relaxed">{achievement.description}</p>
                  )}
                  {achievement.images && achievement.images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4">
                      {achievement.images.slice(0, 4).map((img, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden bg-[#F5DEB3]">
                          <SafeImage src={img} alt={`Achievement ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
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
