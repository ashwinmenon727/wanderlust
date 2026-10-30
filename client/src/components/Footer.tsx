import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, Phone, MapPin, CheckCircle2, Shield, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-teal-500 flex items-center justify-center">
                <Compass className="w-6 h-6 text-navy-950" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-wider text-white block leading-none">
                  WANDERLUST
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-gold-400 font-medium block mt-1">
                  Luxury Expeditions
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Architects of extraordinary bespoke travel. We curate secluded sanctuaries, private aviation, and peerless cultural immersion for the world’s most discerning voyagers.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold-400 block mb-2">
                Join The Private Voyagers Journal
              </span>
              {newsletterSubscribed ? (
                <div className="flex items-center gap-2 text-teal-400 text-xs bg-teal-900/30 border border-teal-700/50 p-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Welcome. Exclusive private dispatches will be delivered.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter private email..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 2: Journeys & Collections */}
          <div>
            <h4 className="text-white font-serif font-bold text-sm uppercase tracking-wider mb-4">
              Destinations
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/destinations/santorini-greece" className="hover:text-gold-400 transition-colors">
                  Santorini & Cyclades
                </Link>
              </li>
              <li>
                <Link to="/destinations/kyoto-japan" className="hover:text-gold-400 transition-colors">
                  Kyoto & Mount Fuji
                </Link>
              </li>
              <li>
                <Link to="/destinations/serengeti-tanzania" className="hover:text-gold-400 transition-colors">
                  Serengeti Safari
                </Link>
              </li>
              <li>
                <Link to="/destinations/swiss-alps-zermatt" className="hover:text-gold-400 transition-colors">
                  Swiss Alps & Zermatt
                </Link>
              </li>
              <li>
                <Link to="/destinations/bora-bora-polynesia" className="hover:text-gold-400 transition-colors">
                  Bora Bora & Tetiaroa
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="text-gold-400 font-semibold hover:underline">
                  View All Destinations &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: The Maison */}
          <div>
            <h4 className="text-white font-serif font-bold text-sm uppercase tracking-wider mb-4">
              Wanderlust
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/about" className="hover:text-gold-400 transition-colors">
                  Our Heritage & Team
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-gold-400 transition-colors">
                  Private Concierge Services
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="hover:text-gold-400 transition-colors">
                  Client Reviews & Stories
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-gold-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-400 transition-colors">
                  Direct Contact & Offices
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-gold-400 transition-colors">
                  Privacy Policy (GDPR)
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gold-400 transition-colors">
                  Booking Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Global Private Desks */}
          <div className="space-y-3">
            <h4 className="text-white font-serif font-bold text-sm uppercase tracking-wider mb-4">
              Private Concierge
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
              <span>48 Berkeley Square, Mayfair, London W1J 5AW</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
              <span>767 Fifth Avenue, Manhattan, NY 10153</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300 pt-1">
              <Phone className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>+1 (800) 555-9637</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>concierge@wanderlust-luxury-travel.com</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Trust Seals */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-gold-400" />
              <span>Virtuoso Member #84920</span>
            </span>
            <span>•</span>
            <span>IATA Validated Agency #96-2481</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>256-Bit SSL Encrypted Booking</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span>&copy; {new Date().getFullYear()} Wanderlust Luxury Travel Inc. All rights reserved.</span>
            <Link
              to="/admin/login"
              className="text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1"
              aria-label="Staff and Concierge Portal Login"
            >
              <Lock className="w-3 h-3" />
              <span>Concierge Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
