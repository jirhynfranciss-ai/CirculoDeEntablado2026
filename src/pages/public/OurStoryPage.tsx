import { useSiteSettings } from '../../hooks/useSiteSettings';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { BookOpen } from 'lucide-react';

export default function OurStoryPage() {
  const { settings, loading } = useSiteSettings();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      {/* Header */}
      <div className="bg-[#2C1810] py-16 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-[#D2B48C]/20 border border-[#D2B48C]/30 rounded-full px-4 py-1.5 mb-4">
          <BookOpen className="h-3.5 w-3.5 text-[#D2B48C]" />
          <span className="text-[#D2B48C] text-xs tracking-widest uppercase">About Us</span>
        </div>
        <h1 className="font-playfair text-4xl md:text-5xl text-white mb-4">Our Story</h1>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-[#A0522D]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#D2B48C]" />
          <div className="h-px w-12 bg-[#A0522D]" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {settings.our_story ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#D2B48C]/20 p-8 md:p-12">
            <div className="text-[#D2B48C]/30 font-playfair text-7xl leading-none mb-4">"</div>
            <div className="prose prose-stone max-w-none">
              {settings.our_story.split('\n').map((para, idx) => (
                para.trim() ? (
                  <p key={idx} className="text-[#5C3D2E] leading-relaxed text-base mb-4">{para}</p>
                ) : <br key={idx} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-[#D2B48C]/20 p-12 text-center">
            <BookOpen className="h-12 w-12 text-[#D2B48C] mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-medium text-[#A0522D] mb-2">Our Story Coming Soon</h3>
            <p className="text-sm text-[#A0522D]/70">
              The history and background of Círculo De Entablado will be shared here soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
