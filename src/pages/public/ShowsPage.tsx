import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Production, ProductionCast, ProductionTeam } from '../../types';
import SafeImage from '../../components/ui/SafeImage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

interface ShowsPageProps {
  statusFilter: 'current' | 'coming_soon' | 'past';
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeColor: string;
}

interface ProductionDetail extends Production {
  cast?: ProductionCast[];
  team?: ProductionTeam[];
}

export default function ShowsPage({ statusFilter, title, subtitle, badgeLabel, badgeColor }: ShowsPageProps) {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProd, setSelectedProd] = useState<ProductionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchProductions();
  }, [statusFilter]);

  const fetchProductions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('productions')
        .select('*')
        .eq('status', statusFilter)
        .order('date', { ascending: statusFilter !== 'past' });
      if (error) throw error;
      setProductions(data || []);
    } catch (_err) {
      setProductions([]);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (prod: Production) => {
    setSelectedProd(prod);
    setDetailLoading(true);
    try {
      const [castRes, teamRes] = await Promise.all([
        supabase.from('production_cast').select('*').eq('production_id', prod.id).order('order_index'),
        supabase.from('production_team').select('*').eq('production_id', prod.id).order('order_index'),
      ]);
      setSelectedProd({ ...prod, cast: castRes.data || [], team: teamRes.data || [] });
    } catch (_err) {
      // proceed without cast/team
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <div className="bg-[#2C1810] py-16 px-4 text-center">
        <h1 className="font-playfair text-4xl md:text-5xl text-white mb-4">{title}</h1>
        <p className="text-[#D2B48C] max-w-xl mx-auto">{subtitle}</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-12 bg-[#A0522D]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#D2B48C]" />
          <div className="h-px w-12 bg-[#A0522D]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {productions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={`No ${title.toLowerCase()} available`}
            description="Check back soon for updates on our upcoming productions."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productions.map((prod) => (
              <div
                key={prod.id}
                onClick={() => openDetail(prod)}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border border-[#D2B48C]/10"
              >
                <div className="relative h-56 bg-[#F5DEB3]">
                  <SafeImage
                    src={prod.poster}
                    alt={prod.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-3 left-3">
                    <span className={`${badgeColor} text-white text-xs px-2.5 py-1 rounded-full font-medium`}>
                      {badgeLabel}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-playfair text-lg text-[#2C1810] mb-3 group-hover:text-[#8B0000] transition-colors">
                    {prod.title}
                  </h3>
                  <div className="space-y-1.5 mb-3">
                    {prod.date && (
                      <div className="flex items-center gap-2 text-xs text-[#A0522D]">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(prod.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                    {prod.time && (
                      <div className="flex items-center gap-2 text-xs text-[#A0522D]">
                        <Clock className="h-3.5 w-3.5" />
                        {prod.time}
                      </div>
                    )}
                    {prod.venue && (
                      <div className="flex items-center gap-2 text-xs text-[#A0522D]">
                        <MapPin className="h-3.5 w-3.5" />
                        {prod.venue}
                      </div>
                    )}
                    {prod.director && (
                      <div className="flex items-center gap-2 text-xs text-[#A0522D]">
                        <Users className="h-3.5 w-3.5" />
                        Dir. {prod.director}
                      </div>
                    )}
                  </div>
                  {prod.description && (
                    <p className="text-[#5C3D2E] text-sm line-clamp-2 leading-relaxed">{prod.description}</p>
                  )}
                  <button className="mt-4 text-xs text-[#8B0000] hover:underline font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Production Detail Modal */}
      {selectedProd && (
        <Modal isOpen={!!selectedProd} onClose={() => setSelectedProd(null)} title={selectedProd.title} size="xl">
          <div className="space-y-5">
            {selectedProd.poster && (
              <div className="h-64 rounded-lg overflow-hidden bg-[#F5DEB3]">
                <SafeImage src={selectedProd.poster} alt={selectedProd.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {selectedProd.date && (
                <div className="flex items-center gap-2 text-[#A0522D]">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedProd.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              )}
              {selectedProd.time && (
                <div className="flex items-center gap-2 text-[#A0522D]">
                  <Clock className="h-4 w-4" />
                  {selectedProd.time}
                </div>
              )}
              {selectedProd.venue && (
                <div className="flex items-center gap-2 text-[#A0522D]">
                  <MapPin className="h-4 w-4" />
                  {selectedProd.venue}
                </div>
              )}
              {selectedProd.director && (
                <div className="flex items-center gap-2 text-[#A0522D]">
                  <Users className="h-4 w-4" />
                  Directed by {selectedProd.director}
                </div>
              )}
            </div>
            {selectedProd.description && (
              <div>
                <h4 className="font-medium text-[#2C1810] mb-2">About</h4>
                <p className="text-[#5C3D2E] text-sm leading-relaxed">{selectedProd.description}</p>
              </div>
            )}
            {selectedProd.ticket_info && (
              <div className="bg-[#FFF5EE] rounded-lg p-4">
                <h4 className="font-medium text-[#2C1810] mb-1">Ticket Information</h4>
                <p className="text-[#5C3D2E] text-sm">{selectedProd.ticket_info}</p>
              </div>
            )}
            {detailLoading && <div className="py-4"><LoadingSpinner /></div>}
            {!detailLoading && selectedProd.cast && selectedProd.cast.length > 0 && (
              <div>
                <h4 className="font-medium text-[#2C1810] mb-3">Cast</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedProd.cast.map((c) => (
                    <div key={c.id} className="flex justify-between text-sm border-b border-[#F5DEB3] pb-1">
                      <span className="font-medium text-[#2C1810]">{c.actor_name}</span>
                      {c.character_name && <span className="text-[#A0522D]">{c.character_name}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!detailLoading && selectedProd.team && selectedProd.team.length > 0 && (
              <div>
                <h4 className="font-medium text-[#2C1810] mb-3">Production Team</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedProd.team.map((t) => (
                    <div key={t.id} className="flex justify-between text-sm border-b border-[#F5DEB3] pb-1">
                      <span className="font-medium text-[#2C1810]">{t.name}</span>
                      <span className="text-[#A0522D]">{t.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedProd.images && selectedProd.images.length > 0 && (
              <div>
                <h4 className="font-medium text-[#2C1810] mb-3">Production Photos</h4>
                <div className="grid grid-cols-3 gap-2">
                  {selectedProd.images.map((img, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-[#F5DEB3]">
                      <SafeImage src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
