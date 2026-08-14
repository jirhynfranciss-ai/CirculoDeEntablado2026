import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Award, Users, ChevronRight, Play, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Production, Member, Achievement, Photo, Video, PressReview } from '../../types';
import SafeImage from '../../components/ui/SafeImage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-10">
      <h2 className="font-playfair text-3xl md:text-4xl text-[#8B0000] mb-3">{title}</h2>
      {subtitle && <p className="text-[#A0522D] text-base max-w-xl mx-auto">{subtitle}</p>}
      <div className="flex items-center justify-center gap-3 mt-4">
        <div className="h-px w-12 bg-[#D2B48C]" />
        <div className="h-1.5 w-1.5 rounded-full bg-[#A0522D]" />
        <div className="h-px w-12 bg-[#D2B48C]" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { settings } = useSiteSettings();
  const [currentProductions, setCurrentProductions] = useState<Production[]>([]);
  const [comingSoon, setComingSoon] = useState<Production[]>([]);
  const [featuredMembers, setFeaturedMembers] = useState<Member[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [pressReviews, setPressReviews] = useState<PressReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [prodRes, comingRes, membersRes, achieveRes, photosRes, videosRes, pressRes] = await Promise.all([
        supabase.from('productions').select('*').eq('status', 'current').order('created_at', { ascending: false }).limit(3),
        supabase.from('productions').select('*').eq('status', 'coming_soon').order('date', { ascending: true }).limit(3),
        supabase.from('members').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(6),
        supabase.from('achievements').select('*').order('year', { ascending: false }).limit(3),
        supabase.from('photos').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(4),
        supabase.from('press_reviews').select('*').order('date', { ascending: false }).limit(3),
      ]);
      setCurrentProductions(prodRes.data || []);
      setComingSoon(comingRes.data || []);
      setFeaturedMembers(membersRes.data || []);
      setAchievements(achieveRes.data || []);
      setPhotos(photosRes.data || []);
      setVideos(videosRes.data || []);
      setPressReviews(pressRes.data || []);
    } catch (_err) {
      // silently fail, empty states will show
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeEmbedId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {settings.hero_image ? (
          <div className="absolute inset-0">
            <img src={settings.hero_image} alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#2C1810]/70 via-[#2C1810]/50 to-[#2C1810]/80" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#2C1810] via-[#8B0000]/90 to-[#2C1810]">
            {/* Decorative curtain elements */}
            <div className="absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-[#1a0d08] to-transparent" />
            <div className="absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-[#1a0d08] to-transparent" />
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 40px,
                  rgba(212,180,140,0.3) 40px,
                  rgba(212,180,140,0.3) 41px
                )`
              }}
            />
          </div>
        )}

        {/* Spotlight effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D2B48C]/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {settings.logo_url && (
            <div className="mb-6 flex justify-center">
              <img
                src={settings.logo_url}
                alt="Círculo De Entablado"
                className="h-20 w-20 md:h-28 md:w-28 object-contain drop-shadow-2xl"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
          <div className="inline-flex items-center gap-2 bg-[#D2B48C]/20 border border-[#D2B48C]/30 rounded-full px-4 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D2B48C]" />
            <span className="text-[#D2B48C] text-xs tracking-widest uppercase">Theatre Organization</span>
          </div>
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl text-white mb-4 leading-tight">
            {settings.hero_title || 'Círculo De Entablado'}
          </h1>
          <p className="text-[#D2B48C] text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            {settings.hero_subtitle || 'Where stories come alive on stage'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shows/current"
              className="px-8 py-3 bg-[#8B0000] text-white rounded font-medium hover:bg-[#6d0000] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm tracking-wide"
            >
              Current Season
            </Link>
            <Link
              to="/about/our-story"
              className="px-8 py-3 border border-[#D2B48C]/50 text-[#D2B48C] rounded font-medium hover:bg-[#D2B48C]/10 transition-all text-sm tracking-wide"
            >
              Our Story
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 border-2 border-[#D2B48C]/50 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-[#D2B48C]/70 rounded-full" />
          </div>
        </div>
      </section>

      {/* Organization Introduction */}
      {settings.our_story && (
        <section className="py-16 bg-[#FFF5EE]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="relative">
              <div className="text-[#D2B48C]/20 font-playfair text-8xl absolute -top-6 left-0 leading-none select-none">"</div>
              <p className="text-[#5C3D2E] text-lg leading-relaxed relative z-10 font-light">
                {settings.our_story.substring(0, 300)}{settings.our_story.length > 300 ? '...' : ''}
              </p>
              <div className="text-[#D2B48C]/20 font-playfair text-8xl absolute -bottom-10 right-0 leading-none select-none rotate-180">"</div>
            </div>
            <div className="mt-8">
              <Link to="/about/our-story"
                className="inline-flex items-center gap-2 text-[#8B0000] hover:text-[#6d0000] font-medium text-sm transition-colors">
                Read Our Full Story <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Current Season */}
      {currentProductions.length > 0 && (
        <section className="py-16 bg-[#F5DEB3]/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle title="Current Season" subtitle="Our productions currently on stage" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProductions.map((prod) => (
                <Link key={prod.id} to={`/shows/current`}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="relative h-48 bg-[#F5DEB3]">
                    <SafeImage
                      src={prod.poster}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#8B0000] text-white text-xs px-2 py-1 rounded-full font-medium">
                        On Stage
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-playfair text-lg text-[#2C1810] mb-2 group-hover:text-[#8B0000] transition-colors">
                      {prod.title}
                    </h3>
                    {prod.date && (
                      <div className="flex items-center gap-1.5 text-xs text-[#A0522D] mb-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(prod.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                    {prod.venue && (
                      <div className="flex items-center gap-1.5 text-xs text-[#A0522D]">
                        <MapPin className="h-3.5 w-3.5" />
                        {prod.venue}
                      </div>
                    )}
                    {prod.description && (
                      <p className="text-[#5C3D2E] text-sm mt-3 line-clamp-2 leading-relaxed">{prod.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/shows/current"
                className="inline-flex items-center gap-2 text-[#8B0000] border border-[#8B0000] px-6 py-2.5 rounded hover:bg-[#8B0000] hover:text-white transition-all text-sm font-medium">
                View All Current Shows <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon */}
      {comingSoon.length > 0 && (
        <section className="py-16 bg-[#FFF5EE]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle title="Coming Soon" subtitle="Upcoming productions to look forward to" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoon.map((prod) => (
                <Link key={prod.id} to={`/shows/coming-soon`}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-[#D2B48C]/20">
                  <div className="relative h-48 bg-[#F5DEB3]">
                    <SafeImage
                      src={prod.poster}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/50 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#A0522D] text-white text-xs px-2 py-1 rounded-full font-medium">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-playfair text-lg text-[#2C1810] mb-2 group-hover:text-[#8B0000] transition-colors">
                      {prod.title}
                    </h3>
                    {prod.date && (
                      <div className="flex items-center gap-1.5 text-xs text-[#A0522D] mb-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(prod.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                    {prod.venue && (
                      <div className="flex items-center gap-1.5 text-xs text-[#A0522D]">
                        <MapPin className="h-3.5 w-3.5" />
                        {prod.venue}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/shows/coming-soon"
                className="inline-flex items-center gap-2 text-[#8B0000] border border-[#8B0000] px-6 py-2.5 rounded hover:bg-[#8B0000] hover:text-white transition-all text-sm font-medium">
                View All Upcoming Shows <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest Achievements */}
      {achievements.length > 0 && (
        <section className="py-16 bg-[#2C1810]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="font-playfair text-3xl md:text-4xl text-white mb-3">Latest Achievements</h2>
              <p className="text-[#D2B48C] text-base max-w-xl mx-auto">Celebrating our milestones and recognition</p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="h-px w-12 bg-[#A0522D]" />
                <div className="h-1.5 w-1.5 rounded-full bg-[#D2B48C]" />
                <div className="h-px w-12 bg-[#A0522D]" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div key={achievement.id}
                  className="bg-[#3d1f14] border border-[#5C3D2E] rounded-xl p-6 hover:border-[#A0522D]/50 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#8B0000]/30 rounded-lg">
                      <Award className="h-5 w-5 text-[#D2B48C]" />
                    </div>
                    <span className="text-[#D2B48C] text-sm font-medium">{achievement.year}</span>
                  </div>
                  <h3 className="font-playfair text-lg text-white mb-2">{achievement.title}</h3>
                  {achievement.organization && (
                    <p className="text-[#A0522D] text-sm mb-2">{achievement.organization}</p>
                  )}
                  {achievement.description && (
                    <p className="text-[#D2B48C]/70 text-sm line-clamp-3 leading-relaxed">{achievement.description}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/about/achievements"
                className="inline-flex items-center gap-2 text-[#D2B48C] border border-[#D2B48C]/50 px-6 py-2.5 rounded hover:bg-[#D2B48C]/10 transition-all text-sm font-medium">
                View All Achievements <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Members */}
      {featuredMembers.length > 0 && (
        <section className="py-16 bg-[#FFF5EE]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle title="Our Members" subtitle="The talented individuals who bring our productions to life" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredMembers.map((member) => (
                <Link key={member.id} to="/about/members"
                  className="group text-center">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-[#F5DEB3] mb-3 ring-2 ring-transparent group-hover:ring-[#8B0000] transition-all">
                    <SafeImage
                      src={member.profile_picture}
                      alt={member.full_name}
                      className="w-full h-full object-cover"
                      fallback={
                        <div className="w-full h-full flex items-center justify-center bg-[#D2B48C]">
                          <Users className="h-8 w-8 text-[#8B0000]" />
                        </div>
                      }
                    />
                  </div>
                  <p className="text-sm font-medium text-[#2C1810] group-hover:text-[#8B0000] transition-colors leading-tight">
                    {member.full_name}
                  </p>
                  <p className="text-xs text-[#A0522D] mt-0.5">{member.role}</p>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/about/members"
                className="inline-flex items-center gap-2 text-[#8B0000] border border-[#8B0000] px-6 py-2.5 rounded hover:bg-[#8B0000] hover:text-white transition-all text-sm font-medium">
                Meet All Members <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent Photos */}
      {photos.length > 0 && (
        <section className="py-16 bg-[#F5DEB3]/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle title="Recent Photos" subtitle="Capturing moments on and off the stage" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((photo) => (
                <Link key={photo.id} to="/media/photos"
                  className="group relative aspect-square rounded-lg overflow-hidden bg-[#D2B48C]">
                  <SafeImage
                    src={photo.url}
                    alt={photo.caption || 'Photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs line-clamp-2">{photo.caption}</p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/media/photos"
                className="inline-flex items-center gap-2 text-[#8B0000] border border-[#8B0000] px-6 py-2.5 rounded hover:bg-[#8B0000] hover:text-white transition-all text-sm font-medium">
                View Full Gallery <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent Videos */}
      {videos.length > 0 && (
        <section className="py-16 bg-[#FFF5EE]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle title="Recent Videos" subtitle="Watch our performances and behind-the-scenes moments" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {videos.map((video) => {
                const embedId = getYoutubeEmbedId(video.video_url);
                return (
                  <Link key={video.id} to="/media/videos"
                    className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all">
                    <div className="relative aspect-video bg-[#2C1810]">
                      {embedId ? (
                        <img
                          src={`https://img.youtube.com/vi/${embedId}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <SafeImage src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-[#8B0000]/90 rounded-full p-3 group-hover:scale-110 transition-transform">
                          <Play className="h-5 w-5 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-[#2C1810] line-clamp-2 group-hover:text-[#8B0000] transition-colors">
                        {video.title}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link to="/media/videos"
                className="inline-flex items-center gap-2 text-[#8B0000] border border-[#8B0000] px-6 py-2.5 rounded hover:bg-[#8B0000] hover:text-white transition-all text-sm font-medium">
                View All Videos <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest Press Reviews */}
      {pressReviews.length > 0 && (
        <section className="py-16 bg-[#F5DEB3]/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle title="Latest Press Reviews" subtitle="What critics and publications are saying" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pressReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm border border-[#D2B48C]/20 hover:shadow-md transition-all">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#D2B48C] text-[#D2B48C]" />
                    ))}
                  </div>
                  <p className="text-[#5C3D2E] text-sm leading-relaxed mb-4 line-clamp-3">
                    {review.description || review.title}
                  </p>
                  <div className="border-t border-[#F5DEB3] pt-3">
                    <p className="font-medium text-[#2C1810] text-sm">{review.title}</p>
                    <p className="text-[#A0522D] text-xs">{review.publication}</p>
                    {review.date && (
                      <p className="text-[#A0522D]/70 text-xs mt-1">
                        {new Date(review.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  {review.article_url && (
                    <a href={review.article_url} target="_blank" rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-[#8B0000] text-xs hover:underline">
                      Read Full Review <ChevronRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/media/press"
                className="inline-flex items-center gap-2 text-[#8B0000] border border-[#8B0000] px-6 py-2.5 rounded hover:bg-[#8B0000] hover:text-white transition-all text-sm font-medium">
                View All Press Reviews <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-[#8B0000]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-playfair text-3xl md:text-4xl text-white mb-4">
            Experience the Magic of Theatre
          </h2>
          <p className="text-[#D2B48C] text-lg mb-8 max-w-xl mx-auto">
            Join us for our upcoming productions and be part of the story.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/shows/current"
              className="px-8 py-3 bg-white text-[#8B0000] rounded font-medium hover:bg-[#F5DEB3] transition-all text-sm">
              See Current Shows
            </Link>
            <Link to="/contact"
              className="px-8 py-3 border border-white/50 text-white rounded font-medium hover:bg-white/10 transition-all text-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
