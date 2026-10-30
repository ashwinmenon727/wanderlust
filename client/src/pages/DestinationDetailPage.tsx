import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Compass,
  Calendar,
  Languages,
  Coins,
  Star,
  CheckCircle2,
  Shield,
  Loader2,
  Hotel,
  BedDouble
} from 'lucide-react';
import type { Destination, TourPackage } from '@shared/types';
import { api } from '../services/api';
import { PackageCard } from '../components/PackageCard';
import { InquiryModal } from '../components/InquiryModal';
import { SEO } from '../components/SEO';

export const DestinationDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [destination, setDestination] = useState<(Destination & { packages: TourPackage[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getDestinationBySlug(slug)
      .then((res) => {
        if (res.success) setDestination(res.data);
      })
      .catch((err) => console.error('Failed to load destination details:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
        <p className="text-xs text-navy-700">Loading sanctuary dossier...</p>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-serif text-2xl font-bold text-navy-950 mb-2">Destination Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The requested travel destination dossier does not exist or has been archived.</p>
        <Link to="/destinations" className="px-6 py-2.5 rounded-xl bg-navy-900 text-gold-400 text-xs font-semibold">
          Return to Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      <SEO
        title={`${destination.name}, ${destination.country}`}
        description={destination.description.slice(0, 160)}
      />

      {/* Hero Header */}
      <section className="relative h-[65vh] min-h-[450px] bg-navy-950 overflow-hidden flex items-end">
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full text-white">
          <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
            <Link to="/destinations" className="text-slate-300 hover:text-white">
              Destinations
            </Link>
            <span className="text-slate-500">/</span>
            <span className="text-gold-400 font-semibold">{destination.continent}</span>
            <span className="text-slate-500">/</span>
            <span className="text-white">{destination.country}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white mb-2">
            {destination.name}
          </h1>
          <p className="text-base sm:text-lg text-gold-300 font-serif italic max-w-2xl mb-6">
            "{destination.tagline}"
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setInquiryModalOpen(true)}
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-navy-950 bg-gold-400 hover:bg-gold-300 shadow-gold-glow transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Inquire About {destination.name}</span>
            </button>
            <span className="text-sm font-medium text-slate-300">
              Expeditions from <strong className="text-white font-bold">${destination.startingPrice.toLocaleString()}</strong> / guest
            </span>
          </div>
        </div>
      </section>

      {/* Quick Specs Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-luxury border border-ivory-300 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center text-gold-600 flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-navy-600 block">Best Season</span>
              <span className="text-xs font-semibold text-navy-950">{destination.bestTimeToVisit}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-navy-600 block">Language</span>
              <span className="text-xs font-semibold text-navy-950">{destination.language}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center text-navy-900 flex-shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-navy-600 block">Currency</span>
              <span className="text-xs font-semibold text-navy-950">{destination.currency}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center text-gold-600 flex-shrink-0">
              <Star className="w-5 h-5 fill-gold-500" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-navy-600 block">Client Rating</span>
              <span className="text-xs font-semibold text-navy-950">
                {destination.rating.toFixed(2)} ({destination.reviewsCount} verified reviews)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Overview & Key Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-950">
            About The Destination
          </h2>
          <p className="text-navy-800 text-sm sm:text-base leading-relaxed">
            {destination.description}
          </p>

          {/* Photo Gallery Grid */}
          <div className="pt-6">
            <h3 className="font-serif text-xl font-bold text-navy-950 mb-4">
              Sanctuary Gallery
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {destination.gallery.map((img: string, i: number) => (
                <div
                  key={i}
                  onClick={() => setSelectedGalleryImg(img)}
                  className="h-44 rounded-xl overflow-hidden cursor-pointer group relative border border-ivory-300 shadow-sm"
                >
                  <img
                    src={img}
                    alt={`${destination.name} photo ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-navy-950/20 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Highlights Side Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-luxury border border-ivory-300">
            <h3 className="font-serif text-lg font-bold text-navy-950 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gold-600" />
              <span>Bespoke Highlights</span>
            </h3>
            <ul className="space-y-3">
              {destination.highlights.map((h: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-navy-800 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-ivory-200">
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="w-full py-3 rounded-xl bg-navy-900 text-gold-400 hover:bg-navy-850 text-xs font-bold transition-colors cursor-pointer"
              >
                Plan Journey to {destination.name}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Hotels & Luxury Sanctuaries */}
      {destination.hotels && destination.hotels.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-700 bg-gold-50 px-2.5 py-1 rounded-md border border-gold-200 inline-block mb-2">
              Verified Partner Sanctuaries
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-950">
              Luxury Hotels & Heritage Retreats in {destination.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Hand-inspected partner accommodations featuring verified amenities and bespoke suites.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {destination.hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-2xl border border-ivory-300 overflow-hidden shadow-luxury hover:shadow-xl transition-all flex flex-col"
              >
                {hotel.photos && hotel.photos[0] && (
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={hotel.photos[0]}
                      alt={hotel.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-navy-950/80 backdrop-blur-md px-3 py-1 rounded-full text-gold-400 text-xs font-bold border border-gold-500/30">
                      {hotel.verifiedStarClass ? `${hotel.verifiedStarClass}-Star Verified` : 'Boutique Luxury'}
                    </div>
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif text-xl font-bold text-navy-950">{hotel.name}</h3>
                    <p className="text-xs text-slate-500">{hotel.address}</p>
                    <p className="text-xs text-navy-800 line-clamp-3 leading-relaxed">{hotel.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {hotel.amenities.slice(0, 5).map((am, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2.5 py-0.5 rounded-full bg-ivory-100 text-navy-800 border border-ivory-300"
                        >
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>

                  {hotel.roomTypes && hotel.roomTypes.length > 0 && (
                    <div className="pt-4 border-t border-ivory-200 space-y-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                        Featured Suites
                      </span>
                      <div className="space-y-2">
                        {hotel.roomTypes.slice(0, 2).map((rt) => (
                          <div
                            key={rt.id}
                            className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-navy-950 block">{rt.name}</span>
                              <span className="text-[10px] text-slate-500">Max {rt.maxOccupancy} Guests • {rt.bedConfiguration}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-teal-800 block">
                                ${((rt.priceCents || 0) / 100).toLocaleString()}
                              </span>
                              <span className="text-[9px] text-slate-400">per night</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => setInquiryModalOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-bold transition-all text-center"
                    >
                      Inquire About {hotel.name}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Available Tour Packages for this Destination */}
      {destination.packages && destination.packages.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-950 mb-8">
            Curated Packages in {destination.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destination.packages.map((pkg: TourPackage) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Image Preview Modal */}
      {selectedGalleryImg && (
        <div
          className="fixed inset-0 z-50 bg-navy-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedGalleryImg(null)}
        >
          <img
            src={selectedGalleryImg}
            alt="Expanded gallery view"
            className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}

      {/* Reusable Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        initialDestinationId={destination.id}
      />
    </div>
  );
};
