import React, { useEffect, useState } from 'react';
import { Star, Quote, CheckCircle2, Shield, RefreshCw } from 'lucide-react';
import type { Testimonial } from '@shared/types';
import { api } from '../services/api';
import { SEO } from '../components/SEO';

export const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTestimonials()
      .then((res) => {
        if (res.success) setTestimonials(res.data);
      })
      .catch((err) => console.error('Failed to load testimonials:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <SEO
        title="Guest Testimonials & Client Reviews"
        description="Read authentic experiences and reviews from discerning travelers who explored the globe with Wanderlust Luxury Travel."
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest text-gold-600 font-bold block">
          Client Reflections
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-navy-950">
          Stories From The World's Discerning Voyagers
        </h1>
        <p className="text-sm sm:text-base text-navy-700 leading-relaxed">
          The true measure of our craft lives in the memories of those who have traveled with us. Here are candid reflections from our private guests.
        </p>
      </div>

      {/* Trust Stats Bar */}
      <div className="bg-navy-950 text-white rounded-3xl p-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center shadow-xl">
        <div>
          <span className="font-serif text-3xl sm:text-4xl font-bold text-gold-400 block mb-1">
            4.98 / 5.0
          </span>
          <span className="text-xs text-slate-300 uppercase tracking-wider">
            Average Traveler Rating Across 850+ Journeys
          </span>
        </div>

        <div>
          <span className="font-serif text-3xl sm:text-4xl font-bold text-teal-400 block mb-1">
            94%
          </span>
          <span className="text-xs text-slate-300 uppercase tracking-wider">
            Repeat & Referral Client Rate
          </span>
        </div>

        <div>
          <span className="font-serif text-3xl sm:text-4xl font-bold text-gold-400 block mb-1">
            100%
          </span>
          <span className="text-xs text-slate-300 uppercase tracking-wider">
            Verified Travel Discretion & Privacy
          </span>
        </div>
      </div>

      {/* Testimonials Grid */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-3" />
          <p className="text-xs text-navy-700">Loading guest reviews...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl p-8 shadow-luxury border border-ivory-300 relative flex flex-col justify-between"
            >
              <Quote className="w-10 h-10 text-gold-500/20 absolute top-6 right-6" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-gold-500">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold-500" />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-teal-600" />
                    <span>Verified Voyager</span>
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-navy-950 mb-2">
                  {test.tripTitle}
                </h3>
                <p className="text-xs text-navy-600 mb-4">{test.tripDate}</p>

                <p className="text-sm text-navy-800 leading-relaxed italic mb-8">
                  "{test.reviewText}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-ivory-200">
                <img
                  src={test.avatarUrl}
                  alt={test.customerName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gold-500"
                />
                <div>
                  <h4 className="font-serif text-sm font-bold text-navy-950">
                    {test.customerName}
                  </h4>
                  <span className="text-xs text-navy-600 block">{test.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
