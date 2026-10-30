import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  Users,
  Compass,
  Check,
  X as XIcon,
  Calendar,
  ChevronDown,
  ChevronUp,
  Star,
  Shield,
  Loader2,
  Hotel,
  BedDouble,
  Info,
  Utensils,
  MapPin,
  Car
} from 'lucide-react';
import type { TourPackage, Destination, DayItinerary, ItineraryEntry } from '@shared/types';
import { api } from '../services/api';
import { InquiryModal } from '../components/InquiryModal';
import { SEO } from '../components/SEO';

export const PackageDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pkg, setPkg] = useState<(TourPackage & { destination: Destination }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getPackageBySlug(slug)
      .then((res) => {
        if (res.success) setPkg(res.data);
      })
      .catch((err) => console.error('Failed to load package details:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
        <p className="text-xs text-navy-700">Loading expedition dossier...</p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-serif text-2xl font-bold text-navy-950 mb-2">Expedition Package Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The requested tour itinerary has been moved or retired.</p>
        <Link to="/packages" className="px-6 py-2.5 rounded-xl bg-navy-900 text-gold-400 text-xs font-semibold">
          Return to Tour Packages
        </Link>
      </div>
    );
  }

  const toggleDay = (dayNum: number) => {
    setExpandedDay(expandedDay === dayNum ? null : dayNum);
  };

  const itineraryList = (pkg.itineraryEntries && pkg.itineraryEntries.length > 0
    ? pkg.itineraryEntries.map((e) => ({
        day: e.dayNumber,
        title: e.title,
        description: e.description,
        locations: e.locations || [],
        activities: e.activities || [],
        mealsIncluded: e.mealsIncluded,
        accommodation: e.accommodation || undefined,
      }))
    : ((pkg.itinerary || []) as any[]).map((d) => ({
        day: d.day || d.dayNumber,
        title: d.title,
        description: d.description,
        locations: d.locations || [],
        activities: d.activities || [],
        mealsIncluded: d.mealsIncluded,
        accommodation: d.accommodation || undefined,
      }))) as (DayItinerary & { locations?: string[] })[];

  return (
    <div className="space-y-16 pb-20">
      <SEO
        title={pkg.title}
        description={pkg.overview.slice(0, 160)}
      />

      {/* Hero Header */}
      <section className="relative h-[60vh] min-h-[420px] bg-navy-950 overflow-hidden flex items-end">
        <img
          src={pkg.heroImage}
          alt={pkg.title}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full text-white">
          <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
            <Link to="/packages" className="text-slate-300 hover:text-white">
              Expeditions
            </Link>
            <span className="text-slate-500">/</span>
            <Link to={`/destinations/${pkg.destination.slug}`} className="text-gold-400 font-semibold hover:underline">
              {pkg.destination.name}
            </Link>
            <span className="text-slate-500">/</span>
            <span className="text-slate-200">{pkg.category}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4 max-w-4xl">
            {pkg.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-200">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
              <Users className="w-4 h-4 text-gold-400" />
              <span>Max {pkg.maxGroupSize} Guests</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
              <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
              <span>{pkg.rating.toFixed(2)} ({pkg.reviewsCount} verified reviews)</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Grid: Itinerary & Booking Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left 2 Cols: Overview & Day-by-Day Itinerary */}
        <div className="lg:col-span-2 space-y-10">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-950 mb-4">
              Itinerary Overview
            </h2>
            <p className="text-navy-800 text-sm sm:text-base leading-relaxed">
              {pkg.overview}
            </p>
          </div>

          {/* Interactive Day-by-Day Accordion */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold text-navy-950">
                Detailed Expedition Itinerary
              </h2>
              <button
                onClick={() => setExpandedDay(expandedDay ? null : 1)}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                {expandedDay ? 'Collapse Active Day' : 'Expand Itinerary'}
              </button>
            </div>

            <div className="space-y-4">
              {itineraryList.map((dayItem: DayItinerary) => {
                const isExpanded = expandedDay === dayItem.day;
                return (
                  <div
                    key={dayItem.day}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isExpanded
                        ? 'border-gold-500/50 bg-white shadow-luxury'
                        : 'border-ivory-300 bg-white hover:border-ivory-400'
                    }`}
                  >
                    <button
                      onClick={() => toggleDay(dayItem.day)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            isExpanded
                              ? 'bg-navy-900 text-gold-400'
                              : 'bg-ivory-100 text-navy-800 border border-ivory-300'
                          }`}
                        >
                          Day {dayItem.day}
                        </span>
                        <div>
                          <h3 className="font-serif text-base sm:text-lg font-bold text-navy-950">
                            {dayItem.title}
                          </h3>
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gold-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-ivory-100 space-y-4 text-xs sm:text-sm text-navy-800">
                        {dayItem.locations && dayItem.locations.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-teal-800 bg-teal-50/80 px-2.5 py-1 rounded-lg border border-teal-200/70 inline-flex">
                            <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                            <span><strong>Key Locations:</strong> {dayItem.locations.join(' • ')}</span>
                          </div>
                        )}

                        <p className="leading-relaxed text-navy-700">
                          {dayItem.description}
                        </p>

                        {dayItem.activities && dayItem.activities.length > 0 && (
                          <div>
                            <span className="font-semibold text-navy-900 block mb-2">Key Activities:</span>
                            <div className="flex flex-wrap gap-2">
                              {dayItem.activities.map((act: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs"
                                >
                                  {act}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                          <div className="flex items-center gap-2 text-navy-700">
                            <Utensils className="w-4 h-4 text-gold-600" />
                            <span><strong>Meals:</strong> {dayItem.mealsIncluded}</span>
                          </div>
                          {dayItem.accommodation && (
                            <div className="flex items-center gap-2 text-navy-700">
                              <Hotel className="w-4 h-4 text-teal-600" />
                              <span><strong>Stay:</strong> {dayItem.accommodation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="bg-teal-50/50 border border-teal-200 rounded-2xl p-6">
              <h3 className="font-serif text-lg font-bold text-teal-900 mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-teal-600" />
                <span>What Is Included</span>
              </h3>
              <ul className="space-y-2.5">
                {pkg.includes.map((inc: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-teal-950 leading-relaxed">
                    <Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="font-serif text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <XIcon className="w-5 h-5 text-slate-500" />
                <span>What Is Excluded</span>
              </h3>
              <ul className="space-y-2.5">
                {pkg.excludes.map((exc: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                    <XIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Curated Partner Stays & Suites */}
          {pkg.hotels && pkg.hotels.length > 0 && (
            <div className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-950 flex items-center gap-2">
                    <Hotel className="w-6 h-6 text-gold-600" />
                    <span>Curated Luxury Accommodations</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Verified properties and room suites selected for this expedition stage.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {pkg.hotels.map((ph, idx) => {
                  const hotel = ph.hotel;
                  if (!hotel) return null;
                  return (
                    <div
                      key={ph.id || idx}
                      className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm hover:shadow-luxury transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row gap-5 items-start">
                        {hotel.photos && hotel.photos[0] && (
                          <img
                            src={hotel.photos[0]}
                            alt={hotel.name}
                            className="w-full sm:w-48 h-32 object-cover rounded-xl border border-ivory-300 flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              {ph.stageName && (
                                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 inline-block mb-1">
                                  {ph.stageName} • {ph.nights} {ph.nights === 1 ? 'Night' : 'Nights'}
                                </span>
                              )}
                              <h4 className="font-serif text-lg font-bold text-navy-950">
                                {hotel.name}
                              </h4>
                              <p className="text-xs text-slate-500">{hotel.address}</p>
                            </div>
                            {hotel.verifiedStarClass ? (
                              <div className="flex items-center gap-1 bg-gold-50 border border-gold-200 px-2.5 py-1 rounded-lg">
                                <span className="text-xs font-bold text-gold-800">
                                  {hotel.verifiedStarClass}-Star Verified
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">Boutique Luxury</span>
                            )}
                          </div>
                          <p className="text-xs text-navy-800 line-clamp-2">{hotel.description}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {hotel.amenities.slice(0, 5).map((am, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded bg-ivory-100 text-navy-800 border border-ivory-300"
                              >
                                {am}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Room types preview */}
                      {hotel.roomTypes && hotel.roomTypes.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-ivory-200">
                          <h5 className="text-xs font-bold text-navy-900 mb-3 flex items-center gap-1.5">
                            <BedDouble className="w-4 h-4 text-teal-600" />
                            <span>Available Suite Configurations:</span>
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {hotel.roomTypes.map((rt) => (
                              <div
                                key={rt.id}
                                className="p-3 rounded-xl border border-ivory-200 bg-ivory-50/50 text-xs space-y-1.5"
                              >
                                <div className="flex items-center justify-between font-bold text-navy-950">
                                  <span>{rt.name}</span>
                                  <span className="text-teal-800">
                                    ${((rt.priceCents || 0) / 100).toLocaleString()} <span className="text-[10px] font-normal text-slate-500">/nt</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-navy-700">
                                  <span>Max {rt.maxOccupancy} Guests</span>
                                  <span>•</span>
                                  <span>{rt.bedConfiguration}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-ivory-200">
                                  <span>Inventory: {rt.inventoryCount > 0 ? `${rt.inventoryCount} suites left` : 'On Request'}</span>
                                  <span className="text-teal-700 font-medium">
                                    {rt.availabilityStatus === 'AVAILABLE' ? 'Verified Available' : rt.availabilityStatus}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancellation Policy */}
          <div className="pt-2">
            <div className="bg-ivory-100/70 border border-ivory-300 rounded-2xl p-5 flex items-start gap-3">
              <Info className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-1">
                  Cancellation & Flexibility Guarantee
                </h4>
                <p className="text-xs text-navy-700 leading-relaxed">
                  {pkg.cancellationPolicy || 'Complimentary cancellation up to 30 days prior to departure.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Booking Card */}
        <div>
          <div className="sticky top-28 bg-white rounded-2xl shadow-luxury border border-ivory-300 p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-navy-600 block">
                  All-Inclusive Investment
                </span>
                {pkg.isSamplePrice && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gold-100 text-gold-900 border border-gold-300">
                    Sample Guide Price
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif font-bold text-navy-950">
                  {pkg.currency === 'EUR' ? '€' : pkg.currency === 'GBP' ? '£' : pkg.currency === 'JPY' ? '¥' : pkg.currency === 'AUD' ? 'A$' : pkg.currency === 'CAD' ? 'C$' : '$'}
                  {(pkg.discountPriceCents ? (pkg.discountPriceCents / 100) : pkg.priceCents ? (pkg.priceCents / 100) : (pkg.discountPrice || pkg.price)).toLocaleString()}
                </span>
                {(pkg.discountPriceCents || pkg.discountPrice) && (
                  <span className="text-sm text-navy-600 line-through">
                    {pkg.currency === 'EUR' ? '€' : pkg.currency === 'GBP' ? '£' : pkg.currency === 'JPY' ? '¥' : pkg.currency === 'AUD' ? 'A$' : pkg.currency === 'CAD' ? 'C$' : '$'}
                    {(pkg.priceCents ? (pkg.priceCents / 100) : pkg.price).toLocaleString()}
                  </span>
                )}
                <span className="text-xs text-navy-600">/ {pkg.pricingBasis ? pkg.pricingBasis.replace('_', ' ') : 'traveler'}</span>
              </div>
              {pkg.isSamplePrice && (
                <p className="text-[10px] text-slate-500 mt-1 italic">
                  *Sample price based on standard seasonal rates. Final quotation tailored to your chosen suites & travel dates.
                </p>
              )}
            </div>

            {/* Upcoming Departure Dates */}
            <div>
              <span className="text-xs font-bold text-navy-900 block mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold-600" />
                <span>Upcoming Departure Dates</span>
              </span>
              <div className="space-y-2">
                {pkg.departureDates.map((dateStr: string, i: number) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl border border-ivory-300 text-xs font-mono font-medium text-navy-800 flex items-center justify-between"
                  >
                    <span>{dateStr}</span>
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      Private Slots Open
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Booking CTA */}
            <div className="pt-2 space-y-3">
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="w-full py-4 rounded-xl text-sm font-bold text-navy-950 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 hover:from-gold-300 hover:to-gold-400 shadow-gold-glow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-navy-950" />
                <span>Inquire About This Package</span>
              </button>
              <p className="text-[11px] text-center text-slate-500 leading-normal">
                Submitting is a personalized consultation request. No immediate charge applies.
              </p>
            </div>

            <div className="pt-4 border-t border-ivory-200 space-y-2 text-xs text-navy-700">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600" />
                <span>Complimentary 24/7 dedicated concierge</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                <span>100% bespoke date & flight customization</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        initialDestinationId={pkg.destinationId}
        initialPackageId={pkg.id}
      />
    </div>
  );
};
