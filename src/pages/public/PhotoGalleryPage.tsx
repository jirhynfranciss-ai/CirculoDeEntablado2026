import { useState, useEffect, useCallback } from 'react';
import { Image, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Photo } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function PhotoGalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPhotos(data || []);
      const cats = [...new Set((data || []).filter((p: Photo) => p.category).map((p: Photo) => p.category as string))];
      setCategories(cats);
    } catch (_err) {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = selectedCategory === 'all' ? photos : photos.filter((p) => p.category === selectedCategory);

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const prevPhoto = useCallback(() => {
    if (lightboxIdx !== null) setLightboxIdx((lightboxIdx - 1 + filtered.length) % filtered.length);
  }, [lightboxIdx, filtered.length]);
  const nextPhoto = useCallback(() => {
    if (lightboxIdx !== null) setLightboxIdx((lightboxIdx + 1) % filtered.length);
  }, [lightboxIdx, filtered.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIdx === null) return;
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIdx, prevPhoto, nextPhoto]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <div className="bg-[#2C1810] py-16 px-4 text-center">
        <h1 className="font-playfair text-4xl md:text-5xl text-white mb-4">Photo Gallery</h1>
        <p className="text-[#D2B48C] max-w-xl mx-auto">Capturing moments from our productions and events</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-12 bg-[#A0522D]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#D2B48C]" />
          <div className="h-px w-12 bg-[#A0522D]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all' ? 'bg-[#8B0000] text-white' : 'bg-white border border-[#D2B48C]/50 text-[#A0522D] hover:border-[#8B0000]'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat ? 'bg-[#8B0000] text-white' : 'bg-white border border-[#D2B48C]/50 text-[#A0522D] hover:border-[#8B0000]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState icon={Image} title="No photos available" description="No photos have been uploaded yet. Check back soon!" />
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {filtered.map((photo, idx) => (
              <div
                key={photo.id}
                onClick={() => openLightbox(idx)}
                className="group break-inside-avoid rounded-lg overflow-hidden bg-[#D2B48C] cursor-pointer relative"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || 'Photo'}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                  {photo.caption && (
                    <p className="text-white text-xs p-3 line-clamp-2">{photo.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && filtered[lightboxIdx] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={prevPhoto}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors p-2"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors p-2"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center gap-3">
            <img
              src={filtered[lightboxIdx].url}
              alt={filtered[lightboxIdx].caption || 'Photo'}
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
            {filtered[lightboxIdx].caption && (
              <p className="text-white/80 text-sm text-center">{filtered[lightboxIdx].caption}</p>
            )}
            <p className="text-white/40 text-xs">{lightboxIdx + 1} / {filtered.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
