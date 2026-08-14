import { useState, useEffect } from 'react';
import { ExternalLink, BookOpen, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PressReview } from '../../types';
import SafeImage from '../../components/ui/SafeImage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function PressReviewsPage() {
  const [reviews, setReviews] = useState<PressReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('press_reviews')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      setReviews(data || []);
    } catch (_err) {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-[#FFF5EE]">
      <div className="bg-[#2C1810] py-16 px-4 text-center">
        <h1 className="font-playfair text-4xl md:text-5xl text-white mb-4">Press Reviews</h1>
        <p className="text-[#D2B48C] max-w-xl mx-auto">What critics and publications say about our work</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-12 bg-[#A0522D]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#D2B48C]" />
          <div className="h-px w-12 bg-[#A0522D]" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {reviews.length === 0 ? (
          <EmptyState icon={BookOpen} title="No press reviews available" description="Press reviews and articles will appear here." />
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#D2B48C]/20 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row">
                  {review.featured_image && (
                    <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0">
                      <SafeImage
                        src={review.featured_image}
                        alt={review.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-[#D2B48C] text-[#D2B48C]" />
                      ))}
                    </div>
                    <h3 className="font-playfair text-xl text-[#2C1810] mb-1">{review.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-[#8B0000] font-medium text-sm">{review.publication}</span>
                      {review.author && <span className="text-[#A0522D] text-sm">by {review.author}</span>}
                      {review.date && (
                        <span className="text-[#A0522D]/70 text-xs">
                          {new Date(review.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    {review.description && (
                      <p className="text-[#5C3D2E] text-sm leading-relaxed line-clamp-4 mb-4">
                        {review.description}
                      </p>
                    )}
                    {review.article_url && (
                      <a
                        href={review.article_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#8B0000] text-sm font-medium hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Read Full Article
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
