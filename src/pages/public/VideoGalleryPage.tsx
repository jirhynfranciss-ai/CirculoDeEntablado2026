import { useState, useEffect } from 'react';
import { Play, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Video as VideoType } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import SafeImage from '../../components/ui/SafeImage';
import Modal from '../../components/ui/Modal';

export default function VideoGalleryPage() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [activeVideo, setActiveVideo] = useState<VideoType | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVideos(data || []);
      const cats = [...new Set((data || []).filter((v: VideoType) => v.category).map((v: VideoType) => v.category as string))];
      setCategories(cats);
    } catch (_err) {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const getEmbedUrl = (url: string) => {
    const ytId = getYoutubeId(url);
    if (ytId) return `https://www.youtube.com/embed/${ytId}?autoplay=1`;
    return url;
  };

  const filtered = selectedCategory === 'all' ? videos : videos.filter((v) => v.category === selectedCategory);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <div className="bg-[#2C1810] py-16 px-4 text-center">
        <h1 className="font-playfair text-4xl md:text-5xl text-white mb-4">Video Gallery</h1>
        <p className="text-[#D2B48C] max-w-xl mx-auto">Watch our performances and behind-the-scenes moments</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-12 bg-[#A0522D]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#D2B48C]" />
          <div className="h-px w-12 bg-[#A0522D]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
              <button key={cat} onClick={() => setSelectedCategory(cat)}
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
          <EmptyState icon={Video} title="No videos available" description="No videos have been added yet. Check back soon!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((video) => {
              const ytId = getYoutubeId(video.video_url);
              return (
                <div
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm border border-[#D2B48C]/20 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
                >
                  <div className="relative aspect-video bg-[#2C1810]">
                    {ytId ? (
                      <img
                        src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <SafeImage src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="bg-[#8B0000]/90 rounded-full p-3 group-hover:scale-110 transition-transform shadow-lg">
                        <Play className="h-5 w-5 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-[#2C1810] text-sm line-clamp-2 leading-tight mb-1">
                      {video.title}
                    </h3>
                    {video.category && (
                      <span className="text-xs text-[#A0522D] bg-[#F5DEB3] px-2 py-0.5 rounded">{video.category}</span>
                    )}
                    {video.year && <p className="text-xs text-[#A0522D]/70 mt-1">{video.year}</p>}
                    {video.description && (
                      <p className="text-xs text-[#5C3D2E] mt-2 line-clamp-2 leading-relaxed">{video.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <Modal
          isOpen={!!activeVideo}
          onClose={() => setActiveVideo(null)}
          title={activeVideo.title}
          size="xl"
        >
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={getEmbedUrl(activeVideo.video_url)}
                title={activeVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {activeVideo.description && (
              <p className="text-[#5C3D2E] text-sm leading-relaxed">{activeVideo.description}</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
