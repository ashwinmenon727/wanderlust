import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { SEO } from '../components/SEO';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Consultation');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const offices = [
    {
      city: 'London',
      address: '48 Berkeley Square, Mayfair, London W1J 5AW',
      phone: '+44 20 7946 0991',
      hours: 'Mon - Fri: 8:00 AM - 8:00 PM GMT (24/7 Emergency Desk)',
    },
    {
      city: 'New York',
      address: '767 Fifth Avenue, 28th Floor, New York, NY 10153',
      phone: '+1 (212) 555-0199',
      hours: 'Mon - Fri: 9:00 AM - 7:00 PM EST (24/7 Emergency Desk)',
    },
    {
      city: 'Singapore',
      address: 'Marina Bay Financial Centre, Tower 1, Singapore 018981',
      phone: '+65 6789 0123',
      hours: 'Mon - Fri: 9:00 AM - 6:00 PM SGT',
    },
    {
      city: 'Dubai',
      address: 'DIFC Gate Village, Building 03, Dubai, UAE',
      phone: '+971 4 312 9000',
      hours: 'Sun - Thu: 9:00 AM - 6:00 PM GST',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }, 800);
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-20">
      <SEO
        title="Contact Private Concierge Desk"
        description="Connect with Wanderlust Luxury Travel in London, New York, Singapore, or Dubai for private travel design."
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest text-gold-600 font-bold block">
          Private Assistance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-navy-950">
          Connect With A Travel Director
        </h1>
        <p className="text-sm sm:text-base text-navy-700 leading-relaxed">
          Whether you require confidential advice on an upcoming voyage or need immediate on-ground support, our global desks are at your service.
        </p>
      </div>

      {/* Contact Form & Primary Desk Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 sm:p-10 shadow-luxury border border-ivory-300">
          <h2 className="font-serif text-2xl font-bold text-navy-950 mb-2">
            Send A Confidential Message
          </h2>
          <p className="text-xs text-navy-600 mb-8">
            A senior concierge advisor will respond within <strong>2 business hours</strong>.
          </p>

          {isSent ? (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mx-auto text-teal-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-teal-950">
                Message Received
              </h3>
              <p className="text-xs sm:text-sm text-teal-800 max-w-md mx-auto">
                Thank you for contacting Wanderlust. Your message has been routed to our private concierge team.
              </p>
              <button
                onClick={() => setIsSent(false)}
                className="mt-4 px-6 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-navy-900 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lord Julian Sterling"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-navy-900 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="julian@residence.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact-phone" className="block text-xs font-semibold text-navy-900 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (800) 555-0199"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-semibold text-navy-900 mb-1">
                    Topic of Inquiry
                  </label>
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="General Consultation">General Voyage Consultation</option>
                    <option value="Private Aviation">Private Jet or Yacht Charter</option>
                    <option value="Villa Buyout">Private Island or Estate Buyout</option>
                    <option value="Active Itinerary Support">Active Guest Assistance</option>
                    <option value="Media & Partnerships">Press & Strategic Partnerships</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-navy-900 mb-1">
                  How May We Assist You? <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail your requirements, travel windows, or specific destinations under consideration..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-navy-900 hover:bg-navy-850 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                ) : (
                  <>
                    <Send className="w-4 h-4 text-gold-400" />
                    <span>Send Message to Concierge Desk</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* 24/7 Desk Highlights */}
        <div className="space-y-6">
          <div className="bg-navy-950 text-white rounded-2xl p-8 space-y-6 border border-white/10 shadow-xl">
            <span className="text-xs uppercase tracking-widest text-gold-400 font-bold block">
              24/7 Emergency Line
            </span>
            <h3 className="font-serif text-2xl font-bold">
              Immediate Concierge Support
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              For active travelers currently abroad or urgent last-minute private jet bookings, our senior duty officer is reached immediately.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <a
                href="tel:+18005559637"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Phone className="w-4 h-4 text-gold-400" />
                <span className="font-bold">+1 (800) 555-WNDR</span>
              </a>
              <a
                href="mailto:concierge@wanderlust-luxury-travel.com"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Mail className="w-4 h-4 text-teal-400" />
                <span>concierge@wanderlust-luxury-travel.com</span>
              </a>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-white/10">
              <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>Full end-to-end encrypted communication</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Offices */}
      <div className="space-y-6">
        <h2 className="font-serif text-2xl font-bold text-navy-950 text-center">
          Our Global Private Desks
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {offices.map((office, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-luxury border border-ivory-300 space-y-3"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-600" />
                <h3 className="font-serif text-base font-bold text-navy-950">{office.city}</h3>
              </div>
              <p className="text-xs text-navy-700 leading-relaxed">{office.address}</p>
              <p className="text-xs font-semibold text-teal-800">{office.phone}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-navy-600 pt-2 border-t border-ivory-200">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{office.hours}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
