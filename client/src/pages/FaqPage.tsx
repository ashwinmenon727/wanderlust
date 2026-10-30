import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { SEO } from '../components/SEO';

export const FaqPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const faqs = [
    {
      id: 1,
      category: 'Booking & Consultation',
      question: 'How does the bespoke inquiry and design process work?',
      answer: 'After you submit your consultation request, a dedicated senior travel director reviews your destination desires, party size, and dates. Within 24 business hours, we schedule a brief confidential phone call or video conference to present an initial bespoke itinerary draft. Once perfected, a formal proposal is confirmed.'
    },
    {
      id: 2,
      category: 'Booking & Consultation',
      question: 'Is my initial inquiry a confirmed reservation or binding contract?',
      answer: 'No. An inquiry is strictly a request for consultation and design. No charges occur, and no commitments are established until you review and formally sign your finalized bespoke travel agreement.'
    },
    {
      id: 3,
      category: 'Private Aviation & Logistics',
      question: 'Can Wanderlust arrange private jet tarmac transfers and helicopter connections?',
      answer: 'Yes. We partner directly with premier Part 135 air carriers and private operators worldwide. We coordinate ramp-side vehicle transfers directly to aircraft stairs and can arrange point-to-point helicopter charters to secluded villas, yacht helipads, and alpine peaks.'
    },
    {
      id: 4,
      category: 'Pricing & Payments',
      question: 'What is included in the quoted investment?',
      answer: 'Our turnkey itineraries typically include private suite or villa accommodations, all internal flights and chauffeured transfers, private licensed guides and historians, daily gourmet breakfasts, selected signature degustation dinners, and round-the-clock concierge support. International long-haul airfare is customized separately.'
    },
    {
      id: 5,
      category: 'Cancellations & Flexibility',
      question: 'What is your cancellation and date change policy?',
      answer: 'Because all arrangements are bespoke and involve exclusive lodge and yacht buyouts, specific cancellation schedules vary by supplier. However, every agreement outlines transparent date-change windows and flexible rebooking options. We also provide comprehensive cancellation travel insurance policies.'
    },
    {
      id: 6,
      category: 'Safety & Discretion',
      question: 'How do you safeguard privacy for high-profile voyagers?',
      answer: 'We maintain strict non-disclosure protocols. Guests may travel under confidential pseudonyms, villa perimeters are vetted for privacy, and private aviation manifests are protected. We also provide diplomatic-grade close protection details upon request.'
    }
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20">
      <SEO
        title="Frequently Asked Questions"
        description="Find answers to common questions about our bespoke booking process, private charters, cancellations, and guest privacy."
      />

      <div className="text-center space-y-4">
        <span className="text-xs uppercase tracking-widest text-gold-600 font-bold block">
          Voyager Guidance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-navy-950">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-navy-700 leading-relaxed max-w-2xl mx-auto">
          Clear answers regarding our bespoke consultation process, private logistics, and guest standards.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-xl mx-auto">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by topic, e.g. 'cancellation', 'aviation', 'inquiry'..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-ivory-300 bg-white shadow-sm text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
      </div>

      {/* Accordions */}
      <div className="space-y-4">
        {filteredFaqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          return (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-ivory-300 shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                aria-expanded={isExpanded}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block mb-1">
                    {faq.category}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-navy-950">
                    {faq.question}
                  </h3>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gold-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 pt-1 border-t border-ivory-100 text-xs sm:text-sm text-navy-800 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
