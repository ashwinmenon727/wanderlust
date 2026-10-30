import React from 'react';
import { Shield, Lock, Eye, Trash2 } from 'lucide-react';
import { SEO } from '../components/SEO';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-20">
      <SEO
        title="Privacy Policy & Data Protection"
        description="Learn how Wanderlust Luxury Travel protects client confidentiality, personal data, and complies with GDPR and CCPA standards."
      />

      <div className="space-y-4">
        <span className="text-xs uppercase tracking-widest text-gold-600 font-bold block">
          Confidentiality & Compliance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-navy-950">
          Privacy Policy
        </h1>
        <p className="text-xs text-navy-600">
          Last revised and effective: October 2026
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-luxury border border-ivory-300 space-y-8 text-xs sm:text-sm text-navy-800 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-navy-950 flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            <span>1. Commitment to Client Discretion</span>
          </h2>
          <p>
            Wanderlust Luxury Travel Inc. ("Wanderlust", "we", "us", or "our") considers client confidentiality an essential cornerstone of luxury service. This Privacy Policy details our procedures regarding the collection, storage, encryption, and destruction of information provided through our website, consultation forms, and private concierge channels.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-navy-950 flex items-center gap-2">
            <Eye className="w-5 h-5 text-gold-600" />
            <span>2. Information We Collect</span>
          </h2>
          <p>When you submit a consultation request, register for communications, or liaise with a concierge director, we may collect:</p>
          <ul className="list-disc pl-6 space-y-1.5 text-navy-700">
            <li><strong>Identity & Contact:</strong> Full legal name, preferred salutation, email address, telephone numbers, and residential billing address.</li>
            <li><strong>Voyage Parameters:</strong> Intended travel dates, preferred destinations, hotel and suite tier preferences, party count, and travel style.</li>
            <li><strong>Specialized Requirements:</strong> Dietary restrictions, medical considerations, private aviation tarmac requirements, or milestone details provided voluntarily to ensure seamless hospitality.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-navy-950 flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-600" />
            <span>3. Purpose of Processing & Security Architecture</span>
          </h2>
          <p>
            We process personal data exclusively to prepare bespoke travel proposals, coordinate reservations with verified luxury suppliers (e.g., luxury villa estates, private aviation carriers), and provide 24/7 on-ground assistance.
          </p>
          <p>
            All records stored within our PostgreSQL database are subject to strict role-based access control, cryptographic password hashing (bcrypt/argon2), SSL/TLS in-transit encryption, and strict perimeter firewalls. We never sell, lease, or monetize client data under any circumstances.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-navy-950 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-gold-600" />
            <span>4. Data Retention & Your Rights (GDPR & CCPA)</span>
          </h2>
          <p>
            Consultation inquiry records are retained for the duration of the trip planning lifecycle and an archival period necessary to satisfy accounting and legal obligations. Under GDPR and CCPA, clients possess the right to:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-navy-700">
            <li>Request a full export of personal data held on record.</li>
            <li>Request immediate erasure ("Right to be Forgotten") where no overriding statutory retention applies.</li>
            <li>Withdraw consent for marketing dispatches at any time.</li>
          </ul>
          <p className="pt-2">
            To submit a privacy inquiry or exercise data rights, contact our Data Protection Officer at: <strong className="text-navy-950">privacy@wanderlust-luxury-travel.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};
