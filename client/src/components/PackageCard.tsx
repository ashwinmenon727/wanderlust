import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, ArrowRight, Check } from 'lucide-react';
import type { TourPackage } from '@shared/types';
import { InquiryModal } from './InquiryModal';

interface PackageCardProps {
  pkg: TourPackage;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg }) => {
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  return (
    <>
      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-luxury hover:shadow-luxury-hover border border-ivory-300 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative h-60 w-full overflow-hidden">
          <img
            src={pkg.heroImage}
            alt={pkg.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent" />

          {/* Badges Top */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-gold-500 text-navy-950 shadow-sm font-sans">
              {pkg.category}
            </span>
            {pkg.discountPrice && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-600 text-white shadow-sm font-sans">
                Save ${(pkg.price - pkg.discountPrice).toLocaleString()}
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-navy-900 text-xs font-bold backdrop-blur-md">
            <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
            <span>{pkg.rating.toFixed(2)}</span>
          </div>

          {/* Bottom Duration info */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-1.5 bg-navy-950/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>
                {pkg.durationDays} Days / {pkg.durationNights} Nights
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-navy-950/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              <Users className="w-3.5 h-3.5 text-gold-400" />
              <span>Max {pkg.maxGroupSize} Guests</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            {pkg.destination && (
              <span className="text-xs uppercase tracking-wider text-teal-700 font-semibold block mb-1">
                {pkg.destination.name}, {pkg.destination.country}
              </span>
            )}
            <h3 className="font-serif text-xl font-bold text-navy-950 group-hover:text-gold-600 transition-colors line-clamp-2 mb-2">
              {pkg.title}
            </h3>
            <p className="text-xs text-navy-700 line-clamp-2 leading-relaxed mb-4">
              {pkg.overview}
            </p>

            {/* Inclusions summary */}
            <div className="space-y-1.5 mb-4">
              {pkg.includes.slice(0, 2).map((inc: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs text-navy-800">
                  <Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                  <span className="line-clamp-1">{inc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="pt-4 border-t border-ivory-200 flex items-center justify-between mt-auto">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium block">
                Sample Guide Price
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-navy-950">
                  ${((pkg.priceCents ? pkg.priceCents / 100 : (pkg.discountPrice || pkg.price))).toLocaleString()}
                </span>
                <span className="text-xs text-navy-600 font-normal">/ {pkg.pricingBasis ? pkg.pricingBasis.replace('_', ' ') : 'guest'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 transition-colors cursor-pointer"
                aria-label={`Inquire about ${pkg.title}`}
              >
                Inquire
              </button>
              <Link
                to={`/packages/${pkg.slug}`}
                className="p-2 rounded-xl text-navy-900 bg-ivory-100 hover:bg-gold-500 hover:text-navy-950 transition-colors"
                aria-label={`View itinerary for ${pkg.title}`}
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
        initialDestinationId={pkg.destinationId}
        initialPackageId={pkg.id}
      />
    </>
  );
};
