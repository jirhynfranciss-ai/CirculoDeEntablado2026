import { useSiteSettings } from '../../hooks/useSiteSettings';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Target, Eye } from 'lucide-react';

export default function MissionVisionPage() {
  const { settings, loading } = useSiteSettings();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <div className="bg-[#2C1810] py-16 px-4 text-center">
        <h1 className="font-playfair text-4xl md:text-5xl text-white mb-4">Mission & Vision</h1>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-[#A0522D]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#D2B48C]" />
          <div className="h-px w-12 bg-[#A0522D]" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#D2B48C]/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#8B0000]/10 rounded-xl">
                <Target className="h-6 w-6 text-[#8B0000]" />
              </div>
              <h2 className="font-playfair text-2xl text-[#8B0000]">Our Mission</h2>
            </div>
            {settings.mission ? (
              <div>
                {settings.mission.split('\n').map((para, idx) => (
                  para.trim() ? (
                    <p key={idx} className="text-[#5C3D2E] leading-relaxed mb-3">{para}</p>
                  ) : <br key={idx} />
                ))}
              </div>
            ) : (
              <p className="text-[#A0522D]/70 text-sm italic">Mission statement not yet added.</p>
            )}
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#D2B48C]/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#A0522D]/10 rounded-xl">
                <Eye className="h-6 w-6 text-[#A0522D]" />
              </div>
              <h2 className="font-playfair text-2xl text-[#A0522D]">Our Vision</h2>
            </div>
            {settings.vision ? (
              <div>
                {settings.vision.split('\n').map((para, idx) => (
                  para.trim() ? (
                    <p key={idx} className="text-[#5C3D2E] leading-relaxed mb-3">{para}</p>
                  ) : <br key={idx} />
                ))}
              </div>
            ) : (
              <p className="text-[#A0522D]/70 text-sm italic">Vision statement not yet added.</p>
            )}
          </div>
        </div>

        {/* Values */}
        <div className="mt-12 bg-[#2C1810] rounded-2xl p-8 text-center">
          <h2 className="font-playfair text-2xl text-white mb-6">Our Core Values</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Artistry', 'Integrity', 'Community', 'Excellence'].map((value) => (
              <div key={value} className="bg-[#3d1f14] rounded-xl p-4">
                <p className="text-[#D2B48C] font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
