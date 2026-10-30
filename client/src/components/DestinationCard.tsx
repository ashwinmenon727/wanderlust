import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ArrowRight } from 'lucide-react';
import type { Destination } from '@shared/types';
import { InquiryModal } from './InquiryModal';

interface DestinationCardProps {
  destination: Destination;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ destination }) => {
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  return (
    <>
      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-luxury hover:shadow-luxury-hover border border-ivory-300 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden">
          <img
            src={destination.heroImage}
            alt={`${destination.name}, ${destination.country} luxury travel destination`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent" />

          {/* Continent Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-navy-950/70 text-white backdrop-blur-md border border-white/20">
              {destination.continent}
            </span>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-navy-900 text-xs font-bold backdrop-blur-md shadow-sm">
            <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
            <span>{destination.rating.toFixed(1)}</span>
            <span className="text-navy-600 font-normal">({destination.reviewsCount})</span>
          </div>

          {/* Location & Name Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-1.5 text-gold-400 text-xs font-medium mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{destination.country}</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white group-hover:text-gold-300 transition-colors">
              {destination.name}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs text-navy-700 italic font-serif line-clamp-2 mb-3">
              "{destination.tagline}"
            </p>

            {/* Highlights chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {destination.highlights.slice(0, 2).map((h: string, i: number) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-ivory-100 text-navy-800 border border-ivory-300 line-clamp-1"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Footer Price & Action */}
          <div className="pt-4 border-t border-ivory-200 flex items-center justify-between mt-auto">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium block">
                Sample Starting From
              </span>
              <span className="text-lg font-bold text-navy-950">
                ${((destination.startingPriceCents ? destination.startingPriceCents / 100 : destination.startingPrice)).toLocaleString()}{' '}
                <span className="text-xs font-normal text-navy-600">/ guest</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                aria-label={`Inquire about ${destination.name}`}
              >
                Inquire
              </button>
              <Link
                to={`/destinations/${destination.slug}`}
                className="p-2 rounded-xl text-navy-900 bg-ivory-100 hover:bg-gold-500 hover:text-navy-950 transition-colors focus:ring-2 focus:ring-gold-500"
                aria-label={`View details for ${destination.name}`}
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        initialDestinationId={destination.id}
      />
    </>
  );
};
