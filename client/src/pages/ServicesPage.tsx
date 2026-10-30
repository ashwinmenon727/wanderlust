import React, { useState } from 'react';
import {
  Compass,
  Plane,
  Anchor,
  Home,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { InquiryModal } from '../components/InquiryModal';
import { SEO } from '../components/SEO';

export const ServicesPage: React.FC = () => {
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  const services = [
    {
      icon: Compass,
      title: 'Bespoke Itinerary Architecture',
      description: 'Zero standardized templates. Each expedition is designed from scratch around your passions, dietary wishes, mobility preferences, and milestone celebrations.',
      features: [
        'Dedicated senior travel director assigned to your family',
        'Private licensed scholars, art historians, and naturalists',
        'Fully customizable pace and daily scheduling flexibility'
      ]
    },
    {
      icon: Plane,
      title: 'Private Aviation & Helicopter Transfers',
      description: 'Skip congested international hubs. We arrange direct private jet charters and helicopter hops straight to cliffside helipads and savannah strips.',
      features: [
        'Direct tarmac car-to-aircraft escort service',
        'Global fleet access (Gulfstream G650, Global 7500, Citation X)',
        'Point-to-point remote landing clearance authorizations'
      ]
    },
    {
      icon: Anchor,
      title: 'Superyacht & Catamaran Charters',
      description: 'From 50ft luxury catamarans in the Cyclades to 150ft expedition superyachts in the Galápagos and Norwegian fjords.',
      features: [
        'Experienced captains, marine biologists, and private chefs',
        'State-of-the-art watersports gear, seabobs, and tender boats',
        'Custom secluded anchorage routes away from commercial cruisers'
      ]
    },
    {
      icon: Home,
      title: 'Private Villa & Atoll Buyouts',
      description: 'Complete privacy with full hospitality staff. We secure exclusive use of historic Italian palazzos, Alpine chalets, and private South Pacific atolls.',
      features: [
        'Full household staff: private chef, butler, and housekeeper',
        'Pre-arrival pantry stocking according to your custom cellar list',
        'Guaranteed perimeter privacy and secluded grounds'
      ]
    },
    {
      icon: Shield,
      title: '24/7 On-Ground Concierge & Security',
      description: 'Peace of mind wherever you roam. A local concierge is on standby around the clock, accompanied by diplomatic-grade protection details when required.',
      features: [
        'Direct encrypted telephone and WhatsApp communications',
        'Real-time flight monitoring and proactive schedule rebooking',
        'Discreet close-protection details for high-profile travelers'
      ]
    },
    {
      icon: Sparkles,
      title: 'Exclusive Access & Milestone Celebrations',
      description: 'We orchestrate private dinners inside 15th-century Renaissance chapels, fireworks displays over private coves, and Paddock Club hospitality.',
      features: [
        'After-hours private viewings of world-renowned art galleries',
        'Bespoke milestone ceremonies and destination celebrations',
        'Access to members-only golf clubs and private wine cellars'
      ]
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      <SEO
        title="Bespoke Private Concierge Services"
        description="Private aviation, superyacht charters, secluded villa buyouts, and 24/7 on-ground concierge assistance for elite journeys."
      />

      {/* Header */}
      <section className="relative py-24 bg-navy-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs uppercase tracking-widest text-gold-400 font-bold block">
            The Private Concierge Suite
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold">
            Services Tailored Without Compromise
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            From the moment your idea forms until you return to your doorstep, our team orchestrates every element with effortless luxury.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-luxury border border-ivory-300 hover:border-gold-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600 mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-navy-950 mb-3">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-navy-700 leading-relaxed mb-6">
                    {svc.description}
                  </p>
                  <ul className="space-y-2.5 mb-6">
                    {svc.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-navy-800">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-ivory-200">
                  <button
                    onClick={() => setInquiryModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-ivory-100 hover:bg-gold-500 text-navy-950 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Request This Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reusable Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />
    </div>
  );
};
