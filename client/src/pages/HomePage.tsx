import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Shield,
  Plane,
  Sparkles,
  Award,
  Globe2,
  Calendar,
  MapPin,
  Star,
  Quote,
  CheckCircle2,
  Search
} from 'lucide-react';
import type { Destination, TourPackage, Testimonial } from '@shared/types';
import { api } from '../services/api';
import { DestinationCard } from '../components/DestinationCard';
import { PackageCard } from '../components/PackageCard';
import { InquiryModal } from '../components/InquiryModal';
import { SEO } from '../components/SEO';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  // Quick Search Bar state
  const [searchDestination, setSearchDestination] = useState('');
  const [searchCategory, setSearchCategory] = useState('ALL');
  const [searchBudget, setSearchBudget] = useState('ALL');

  useEffect(() => {
    Promise.all([
      api.getDestinations({ featured: true }),
      api.getPackages({ featured: true }),
      api.getTestimonials(true),
    ])
      .then(([destRes, pkgRes, testRes]) => {
        if (destRes.success) setDestinations(destRes.data);
        if (pkgRes.success) setPackages(pkgRes.data);
        if (testRes.success) setTestimonials(testRes.data);
      })
      .catch((err) => console.error('Failed to load homepage data:', err));
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchDestination.trim()) params.append('search', searchDestination.trim());
    if (searchCategory !== 'ALL') params.append('category', searchCategory);
    navigate(`/packages?${params.toString()}`);
  };

  return (
    <div className="space-y-24 pb-20">
      <SEO
        title="Bespoke Expeditions & Elite Voyages"
        description="Curators of transcendent luxury travel. Private island buyouts, superyacht charters, and bespoke itineraries tailored to discerning voyagers."
      />

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-navy-950 overflow-hidden">
        {/* Background Image with parallax overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85"
            alt="Ultra-luxury tropical paradise lagoon at sunrise"
            className="w-full h-full object-cover opacity-40 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/50 to-navy-950" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white flex flex-col items-center">
          {/* Subtle Distinction Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 text-xs uppercase tracking-widest text-gold-400 font-semibold shadow-gold-glow animate-in fade-in duration-700">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Curators of Transcendent Luxury Expeditions</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1] mb-6">
            Voyages Beyond Imagination, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-teal-300 to-gold-400">
              Crafted For The Few
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-200 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            From secluded Aegean cliffside villas to private Singita savannahs and Kyoto Zen sanctums, experience the world with uncompromised discretion and absolute mastery.
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full max-w-md">
            <button
              onClick={() => setInquiryModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-navy-950 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 hover:from-gold-300 hover:to-gold-400 shadow-gold-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Design Your Itinerary</span>
              <ArrowRight className="w-4 h-4 text-navy-950" />
            </button>
            <Link
              to="/destinations"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all text-center"
            >
              Explore Destinations
            </Link>
          </div>

          {/* Interactive Fast Discovery Search Bar */}
          <form
            onSubmit={handleQuickSearch}
            className="w-full max-w-4xl bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-2xl border border-gold-500/20 grid grid-cols-1 sm:grid-cols-4 gap-3 text-left"
          >
            <div className="px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
              <label htmlFor="hero-search-dest" className="block text-[10px] font-bold uppercase tracking-wider text-navy-600 mb-0.5">
                Where to?
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <input
                  id="hero-search-dest"
                  type="text"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  placeholder="e.g. Greece, Kyoto, Alps"
                  className="w-full text-xs font-semibold text-navy-900 bg-transparent placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
              <label htmlFor="hero-search-type" className="block text-[10px] font-bold uppercase tracking-wider text-navy-600 mb-0.5">
                Voyage Style
              </label>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-gold-600 flex-shrink-0" />
                <select
                  id="hero-search-type"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full text-xs font-semibold text-navy-900 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Travel Styles</option>
                  <option value="LUXURY">Bespoke Ultra-Luxury</option>
                  <option value="HONEYMOON">Romance & Honeymoon</option>
                  <option value="ADVENTURE">Safari & Expedition</option>
                  <option value="CULTURAL">Heritage & Fine Arts</option>
                  <option value="FAMILY">Family Odyssey</option>
                </select>
              </div>
            </div>

            <div className="px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
              <label htmlFor="hero-search-budget" className="block text-[10px] font-bold uppercase tracking-wider text-navy-600 mb-0.5">
                Budget Tier
              </label>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <select
                  id="hero-search-budget"
                  value={searchBudget}
                  onChange={(e) => setSearchBudget(e.target.value)}
                  className="w-full text-xs font-semibold text-navy-900 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Any Tier</option>
                  <option value="10k">Under $10,000</option>
                  <option value="20k">$10,000 - $20,000</option>
                  <option value="35k">$20,000 - $35,000</option>
                  <option value="50k">$35,000+</option>
                </select>
              </div>
            </div>

            <div className="p-1 flex items-center">
              <button
                type="submit"
                className="w-full h-full py-3 sm:py-0 px-6 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-gold-400" />
                <span>Search Journeys</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold-600 font-bold block mb-2">
              Curated Sanctuaries
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-950">
              Unrivaled Global Destinations
            </h2>
          </div>
          <Link
            to="/destinations"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 group"
          >
            <span>Explore All 24+ Destinations</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.slice(0, 3).map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      </section>

      {/* Signature Tour Packages */}
      <section className="bg-ivory-100 py-20 border-y border-ivory-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-gold-600 font-bold block mb-2">
                Turnkey Itineraries
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-950">
                Signature Tour Expeditions
              </h2>
            </div>
            <Link
              to="/packages"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 group"
            >
              <span>View All Tour Packages</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.slice(0, 3).map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </div>
      </section>

      {/* The Wanderlust Distinction (Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-gold-600 font-bold block mb-2">
            The Wanderlust Standard
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-950 mb-4">
            Why Discerning Travelers Entrust Us
          </h2>
          <p className="text-navy-700 text-sm sm:text-base leading-relaxed">
            True luxury is not merely five-star amenities—it is access to the unreachable, effortless fluidity, and the absolute luxury of complete peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-luxury border border-ivory-300 hover:border-gold-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600 mb-6">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-navy-950 mb-2">
              Private Aviation & Charters
            </h3>
            <p className="text-xs text-navy-700 leading-relaxed">
              Direct ramp-side transfers, private Cessna bush flights into deep reserves, and superyacht charters with dedicated captains and chefs.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-luxury border border-ivory-300 hover:border-gold-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-navy-950 mb-2">
              Unrestricted VIP Access
            </h3>
            <p className="text-xs text-navy-700 leading-relaxed">
              After-hours private museum tours, closed Kyoto Zen sanctuaries, and private vineyard cellars hosted personally by master winemakers.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-luxury border border-ivory-300 hover:border-gold-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-navy-100 border border-navy-300 flex items-center justify-center text-navy-900 mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-navy-950 mb-2">
              24/7 Dedicated Concierge
            </h3>
            <p className="text-xs text-navy-700 leading-relaxed">
              A personal travel manager assigned exclusively to your itinerary, available at all hours via direct telephone and WhatsApp.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-luxury border border-ivory-300 hover:border-gold-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600 mb-6">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-navy-950 mb-2">
              Carbon-Neutral Stewardship
            </h3>
            <p className="text-xs text-navy-700 leading-relaxed">
              Every expedition includes 100% certified Gold Standard carbon offsetting and direct financial support for regional wildlife sanctuaries.
            </p>
          </div>
        </div>
      </section>

      {/* Guest Testimonials Spotlight */}
      <section className="bg-navy-950 py-24 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-gold-400 font-bold block mb-2">
              Verified Client Stories
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
              Words From Our Discerning Voyagers
            </h2>
            <div className="flex items-center justify-center gap-1 text-gold-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gold-400" />
              ))}
              <span className="text-xs text-slate-300 ml-2">4.97 / 5.0 Global Satisfaction</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((test) => (
              <div
                key={test.id}
                className="bg-navy-900/90 border border-white/10 rounded-2xl p-8 relative flex flex-col justify-between"
              >
                <Quote className="w-8 h-8 text-gold-500/30 absolute top-6 right-6" />
                <div>
                  <div className="flex gap-1 text-gold-400 mb-4">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed italic mb-6">
                    "{test.reviewText}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <img
                    src={test.avatarUrl}
                    alt={test.customerName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-gold-500"
                  />
                  <div>
                    <h4 className="text-white text-sm font-bold font-serif">{test.customerName}</h4>
                    <span className="text-xs text-slate-400 block">{test.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/testimonials"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-400 hover:text-gold-300"
            >
              <span>Read All Verified Guest Reviews</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-navy-900 via-navy-800 to-teal-900 p-8 sm:p-16 text-center text-white shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Your Expedition Awaits
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
              Begin Curating Your Bespoke Journey
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Whether you are envisioning a private yacht charter in the Mediterranean or a secluded family safari under African skies, our senior concierges are ready to transform your ambition into flawless reality.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-navy-950 bg-gold-400 hover:bg-gold-300 shadow-gold-glow transition-all"
              >
                Submit Consultation Request
              </button>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-center"
              >
                Contact Private Desk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Modal */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />
    </div>
  );
};
