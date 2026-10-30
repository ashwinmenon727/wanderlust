import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, MapPin, ArrowLeft } from 'lucide-react';
import { SEO } from '../components/SEO';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 text-center">
      <SEO
        title="404 - Page Not Found"
        description="The requested page could not be found. Return to Wanderlust Luxury Travel's curated destinations."
      />

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-luxury border border-ivory-300">
        <div className="w-20 h-20 rounded-full bg-navy-950 flex items-center justify-center mx-auto text-gold-400 shadow-gold-glow">
          <Compass className="w-10 h-10 animate-spin-slow stroke-[2]" />
        </div>

        <div className="space-y-3">
          <span className="text-xs uppercase tracking-widest text-gold-600 font-bold block">
            Navigation Chart Uncharted
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-950">
            Lost In The Voyage (404)
          </h1>
          <p className="text-xs sm:text-sm text-navy-700 leading-relaxed">
            The coordinate or dossier you are attempting to reach has drifted beyond our charts. Allow our navigational instruments to guide you back.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Link
            to="/"
            className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-navy-950 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 hover:from-gold-300 hover:to-gold-400 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-navy-950" />
            <span>Return To Home Harbor</span>
          </Link>

          <Link
            to="/destinations"
            className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-navy-800 bg-ivory-100 hover:bg-ivory-200 border border-ivory-300 transition-colors flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>Browse Active Destinations</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
