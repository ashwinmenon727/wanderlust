import React from 'react';
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SEO } from '../components/SEO';

export const TermsPage: React.FC = () => {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-20">
      <SEO
        title="Terms & Conditions of Service"
        description="Review the terms and conditions governing bespoke consultation requests and travel arrangements with Wanderlust Luxury Travel."
      />

      <div className="space-y-4">
        <span className="text-xs uppercase tracking-widest text-gold-600 font-bold block">
          Legal Framework
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-navy-950">
          Terms & Conditions
        </h1>
        <p className="text-xs text-navy-600">
          Last revised and effective: October 2026
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-luxury border border-ivory-300 space-y-8 text-xs sm:text-sm text-navy-800 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-navy-950 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>1. Scope & Nature of Inquiry Requests</span>
          </h2>
          <p>
            Submission of an inquiry through this website, electronic mail, or telephonic consultation represents a preliminary request for proposal. <strong>It does not create a binding travel contract or guarantee inventory availability.</strong>
          </p>
          <p>
            A confirmed reservation occurs only upon the execution of a written Bespoke Travel Agreement by both parties and the receipt of the initial deposit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-navy-950 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-gold-600" />
            <span>2. Quotations & Pricing Integrity</span>
          </h2>
          <p>
            Bespoke itineraries are quoted in United States Dollars (USD) or Euros (EUR) as specified in each proposal. All customized quotations remain valid for fourteen (14) calendar days from issuance, after which rates remain subject to fluctuations in foreign exchange rates and private air charter fuel surcharges.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-navy-950 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>3. Cancellations & Supplier Terms</span>
          </h2>
          <p>
            Due to the exclusivity of private island buyouts, safari lodges, and private aviation, cancellations are governed by the underlying supplier terms referenced in your final agreement. We strongly advise all voyagers to obtain comprehensive Cancel For Any Reason (CFAR) travel insurance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-navy-950 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>4. Limitation of Liability & Force Majeure</span>
          </h2>
          <p>
            Wanderlust acts as a luxury travel curator and agent for vetted independent transportation, accommodation, and guide providers. We shall not be held liable for delays, mechanical charter diversions, weather phenomena, or force majeure events outside our reasonable operational control.
          </p>
        </section>
      </div>
    </div>
  );
};
