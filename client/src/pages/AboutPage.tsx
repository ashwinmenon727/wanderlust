import React from 'react';
import { Compass, Shield, Award, Users, Globe2, HeartHandshake } from 'lucide-react';
import { SEO } from '../components/SEO';

export const AboutPage: React.FC = () => {
  const team = [
    {
      name: 'Julian Sterling',
      role: 'Founder & Chief Executive',
      bio: 'Former expedition leader and private family office advisor with 20+ years curating secluded travel for diplomats and visionaries.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Charlotte de Montmirail',
      role: 'Director of European Estates & Charters',
      bio: 'Brought up between Paris and Positano. Directs our private villa, castle buyouts, and Mediterranean yacht partnerships.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Dr. Kenji Takahashi',
      role: 'Cultural Heritage Scholar & Asia Lead',
      bio: 'Kyoto-born cultural anthropologist securing private permits to ancient Zen temple gardens and living artisan sanctuaries.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Amara Kiprono',
      role: 'Head of African Wildlife Conservation Safaris',
      bio: 'Lifelong naturalist and Singita veteran ensuring all savannah expeditions directly fund anti-poaching and habitat reserves.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      <SEO
        title="About Us & Our Heritage"
        description="Learn about Wanderlust Luxury Travel, our founders, private travel directors, and dedication to conservation and rare cultural access."
      />

      {/* Hero Banner */}
      <section className="relative py-24 bg-navy-950 text-white overflow-hidden text-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80"
            alt="Scenic mountain journey"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/60 to-navy-950" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-xs uppercase tracking-widest text-gold-400 font-bold block">
            Our Heritage & Philosophy
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold leading-tight">
            Architects of Transcendent Expeditions
          </h1>
          <p className="text-slate-300 text-sm sm:text-lg leading-relaxed font-light">
            Founded on the belief that genuine luxury is intimate, unhurried, and transformative. We do not sell vacations; we design private chapters of a life well-lived.
          </p>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-widest text-gold-600 font-bold block">
            The Wanderlust Origin
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-950 leading-tight">
            Born From A Desire For Truly Rare Experiences
          </h2>
          <p className="text-navy-800 text-sm sm:text-base leading-relaxed">
            In an era when the entire world can be browsed on a screen, true rarity has become precious. The crowded tour buses and cookie-cutter resorts of mainstream luxury have diluted what it means to discover our planet.
          </p>
          <p className="text-navy-800 text-sm sm:text-base leading-relaxed">
            Wanderlust was born in 2014 to serve a bespoke community of voyagers who seek intimacy, seamless precision, and private access. By cultivating personal friendships with estate owners, tribal elders, private aviation founders, and Michelin-starred chefs, we unlock doors that remain permanently closed to the public.
          </p>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-ivory-300">
          <img
            src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80"
            alt="Scenic secluded sailing"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Four Guiding Principles */}
      <section className="bg-ivory-100 py-20 border-y border-ivory-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-gold-600 font-bold block mb-2">
              Our Core Principles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-950">
              The Code That Governs Every Itinerary
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-luxury border border-ivory-300">
              <Shield className="w-8 h-8 text-gold-600 mb-4" />
              <h3 className="font-serif text-xl font-bold text-navy-950 mb-2">
                Absolute Discretion
              </h3>
              <p className="text-xs text-navy-700 leading-relaxed">
                From private aviation tarmac manifests to private villa check-ins under alias, we honor the confidentiality and security of our guests without compromise.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-luxury border border-ivory-300">
              <Compass className="w-8 h-8 text-teal-600 mb-4" />
              <h3 className="font-serif text-xl font-bold text-navy-950 mb-2">
                Unmatched Precision
              </h3>
              <p className="text-xs text-navy-700 leading-relaxed">
                A seamlessly orchestrated journey requires obsessive logistics. Every helicopter connection, luggage transfer, and chilled vintage champagne bottle is synchronized.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-luxury border border-ivory-300">
              <Globe2 className="w-8 h-8 text-navy-900 mb-4" />
              <h3 className="font-serif text-xl font-bold text-navy-950 mb-2">
                Positive Conservation
              </h3>
              <p className="text-xs text-navy-700 leading-relaxed">
                We believe that elite exploration must protect what it celebrates. Every dollar invested directly supports community conservancies and environmental regeneration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Executive & Concierge Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-gold-600 font-bold block mb-2">
            The Concierge Masters
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-950">
            Meet Your Private Journey Curators
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-luxury border border-ivory-300 group flex flex-col"
            >
              <div className="h-64 overflow-hidden relative">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-navy-950">{member.name}</h3>
                  <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider block mb-3">
                    {member.role}
                  </span>
                  <p className="text-xs text-navy-700 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
