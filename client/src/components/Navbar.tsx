import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Menu, X, Phone, Shield } from 'lucide-react';
import { InquiryModal } from './InquiryModal';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navLinks = [
    { label: 'Destinations', path: '/destinations' },
    { label: 'Tour Packages', path: '/packages' },
    { label: 'Services', path: '/services' },
    { label: 'About Us', path: '/about' },
    { label: 'Testimonials', path: '/testimonials' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full transition-all duration-300 glass-navy border-b border-white/10 shadow-lg">
        {/* Top VIP Concierge Ribbon */}
        <div className="bg-navy-950 text-navy-100 text-[11px] py-1.5 px-4 sm:px-8 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-gold-400 font-medium">
              <Shield className="w-3 h-3 text-gold-400" />
              <span>Virtuoso Luxe & IATA Accredited</span>
            </span>
            <span className="hidden md:inline text-navy-100/60">|</span>
            <span className="hidden md:inline">24/7 Global Private Concierge Desk</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="tel:+18005559637"
              className="flex items-center gap-1.5 hover:text-gold-400 transition-colors"
            >
              <Phone className="w-3 h-3 text-teal-400" />
              <span>+1 (800) 555-WNDR</span>
            </a>
            {isAuthenticated && (
              <Link
                to="/admin/dashboard"
                className="text-teal-400 hover:text-teal-300 font-semibold underline"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Main Nav Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-gold-400 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-teal-500 flex items-center justify-center shadow-gold-glow group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-navy-950 stroke-[2.2]" />
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

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-gold-400 bg-white/5 font-semibold'
                    : 'text-slate-200 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA & Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setInquiryModalOpen(true)}
              className="relative inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold text-navy-950 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 hover:from-gold-300 hover:to-gold-400 shadow-gold-glow hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Inquire Now</span>
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setInquiryModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-navy-950 bg-gold-400 hover:bg-gold-300"
            >
              Inquire
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gold-400"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-navy-950 border-t border-white/10 px-4 pt-4 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-gold-400 bg-white/10 font-bold'
                    : 'text-slate-200 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setInquiryModalOpen(true);
                }}
                className="w-full py-3 rounded-xl text-center text-sm font-semibold text-navy-950 bg-gold-400 hover:bg-gold-300"
              >
                Start Bespoke Inquiry
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Reusable Inquiry Modal accessible globally */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />
    </>
  );
};
