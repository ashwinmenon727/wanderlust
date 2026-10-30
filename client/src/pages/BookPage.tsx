import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Compass,
  Calendar,
  Users,
  CreditCard,
  Mail,
  Phone,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import type { Destination, TourPackage, TravelType, AccommodationPref, PreferredContact } from '@shared/types';
import { api } from '../services/api';
import { SuccessModal } from '../components/SuccessModal';
import { ErrorModal } from '../components/ErrorModal';
import { SEO } from '../components/SEO';

export const BookPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Form States (Preserved on error!)
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [destinationId, setDestinationId] = useState(searchParams.get('destination') || '');
  const [packageId, setPackageId] = useState(searchParams.get('package') || '');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [travelType, setTravelType] = useState<TravelType>('LUXURY');
  const [budget, setBudget] = useState('$10,000 - $20,000');
  const [accommodationPref, setAccommodationPref] = useState<AccommodationPref>('FIVE_STAR_LUXURY');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [preferredContact, setPreferredContact] = useState<PreferredContact>('EMAIL');
  const [privacyConsent, setPrivacyConsent] = useState(false);

  // Validation & UI State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback Modals
  const [successInquiry, setSuccessInquiry] = useState<any | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<Array<{ field: string; message: string }> | undefined>(undefined);

  useEffect(() => {
    Promise.all([api.getDestinations(), api.getPackages()])
      .then(([destRes, pkgRes]) => {
        if (destRes.success) setDestinations(destRes.data);
        if (pkgRes.success) setPackages(pkgRes.data);
      })
      .catch((err) => console.error('Failed to load booking options:', err))
      .finally(() => setIsLoadingOptions(false));
  }, []);

  const filteredPackages = destinationId
    ? packages.filter((p) => p.destinationId === destinationId)
    : packages;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      errs.customerName = 'Please enter your full name (minimum 2 characters)';
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please provide a valid email address';
    }

    if (!phone.trim() || phone.trim().length < 7) {
      errs.phone = 'Please provide a valid contact phone number with country code';
    }

    if (!departureDate) {
      errs.departureDate = 'Departure date is required';
    }

    if (!returnDate) {
      errs.returnDate = 'Return date is required';
    } else if (departureDate && new Date(returnDate) < new Date(departureDate)) {
      errs.returnDate = 'Return date must be on or after departure date';
    }

    if (adults < 1) {
      errs.adults = 'At least 1 adult traveler is required';
    }

    if (!privacyConsent) {
      errs.privacyConsent = 'You must agree to the Privacy Policy to proceed';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setServerFieldErrors(undefined);

    try {
      const response = await api.submitInquiry({
        customerName: customerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        destinationId: destinationId || undefined,
        packageId: packageId || undefined,
        departureDate,
        returnDate,
        adults: Number(adults),
        children: Number(children),
        travelType,
        budget,
        accommodationPref,
        additionalRequirements: additionalRequirements.trim() || undefined,
        preferredContact,
        privacyConsent,
      });

      if (response.success && response.inquiry) {
        setSuccessInquiry(response.inquiry);
        setIsSuccessOpen(true);
        // Reset inputs upon confirmed success
        setCustomerName('');
        setEmail('');
        setPhone('');
        setAdditionalRequirements('');
        setPrivacyConsent(false);
      } else {
        throw new Error(response.message || 'Submission could not be completed.');
      }
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while saving your inquiry. Your details have been preserved.');
      setServerFieldErrors(err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20">
      <SEO
        title="Bespoke Voyage Consultation"
        description="Submit your bespoke travel request to Wanderlust Luxury Travel. Our private concierge curates tailored expeditions with complete discretion."
      />

      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs uppercase tracking-widest text-gold-600 font-bold block">
          Private Consultation
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-navy-950">
          Design Your Bespoke Expedition
        </h1>
        <p className="text-sm sm:text-base text-navy-700 leading-relaxed max-w-2xl mx-auto">
          Complete your travel parameters below. A dedicated concierge director will examine suite availability, private charters, and curations to present your customized dossier within <strong>24 business hours</strong>.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl shadow-luxury border border-ivory-300 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-teal-500 via-gold-500 to-teal-500" />

        <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10" noValidate>
          {/* Guest Contact Information */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-800 flex items-center gap-2 pb-2 border-b border-ivory-200">
              <Users className="w-4 h-4 text-teal-600" />
              <span>1. Guest & Contact Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label htmlFor="book-name" className="block text-xs font-semibold text-navy-900 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="book-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName) setErrors({ ...errors, customerName: '' });
                  }}
                  placeholder="e.g. Countess Sophia Laurent"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-ivory-50 text-navy-900 focus:ring-2 focus:ring-gold-500 ${
                    errors.customerName ? 'border-red-500 bg-red-50/30' : 'border-ivory-300'
                  }`}
                />
                {errors.customerName && <p className="text-red-600 text-xs mt-1">{errors.customerName}</p>}
              </div>

              <div>
                <label htmlFor="book-email" className="block text-xs font-semibold text-navy-900 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="book-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder="sophia@residence.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-ivory-50 text-navy-900 focus:ring-2 focus:ring-gold-500 ${
                    errors.email ? 'border-red-500 bg-red-50/30' : 'border-ivory-300'
                  }`}
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="book-phone" className="block text-xs font-semibold text-navy-900 mb-1">
                  Phone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  id="book-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  placeholder="+1 (555) 234-5678"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-ivory-50 text-navy-900 focus:ring-2 focus:ring-gold-500 ${
                    errors.phone ? 'border-red-500 bg-red-50/30' : 'border-ivory-300'
                  }`}
                />
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Destination & Package Selection */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-800 flex items-center gap-2 pb-2 border-b border-ivory-200">
              <Compass className="w-4 h-4 text-teal-600" />
              <span>2. Destination & Package Preference</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="book-destination" className="block text-xs font-semibold text-navy-900 mb-1">
                  Sanctuary Destination
                </label>
                <select
                  id="book-destination"
                  value={destinationId}
                  onChange={(e) => {
                    setDestinationId(e.target.value);
                    setPackageId('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">-- Fully Custom / Multi-Country Journey --</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}, {d.country} ({d.continent})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="book-package" className="block text-xs font-semibold text-navy-900 mb-1">
                  Curated Tour Package (Optional)
                </label>
                <select
                  id="book-package"
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">-- Bespoke Private Itinerary --</option>
                  {filteredPackages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (${p.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dates & Party Size */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-800 flex items-center gap-2 pb-2 border-b border-ivory-200">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>3. Target Dates & Travelers</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div>
                <label htmlFor="book-departure" className="block text-xs font-semibold text-navy-900 mb-1">
                  Departure Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="book-departure"
                  type="date"
                  required
                  value={departureDate}
                  onChange={(e) => {
                    setDepartureDate(e.target.value);
                    if (errors.departureDate) setErrors({ ...errors, departureDate: '' });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-ivory-50 text-navy-900 focus:ring-2 focus:ring-gold-500 ${
                    errors.departureDate ? 'border-red-500 bg-red-50/30' : 'border-ivory-300'
                  }`}
                />
                {errors.departureDate && <p className="text-red-600 text-xs mt-1">{errors.departureDate}</p>}
              </div>

              <div>
                <label htmlFor="book-return" className="block text-xs font-semibold text-navy-900 mb-1">
                  Return Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="book-return"
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => {
                    setReturnDate(e.target.value);
                    if (errors.returnDate) setErrors({ ...errors, returnDate: '' });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-ivory-50 text-navy-900 focus:ring-2 focus:ring-gold-500 ${
                    errors.returnDate ? 'border-red-500 bg-red-50/30' : 'border-ivory-300'
                  }`}
                />
                {errors.returnDate && <p className="text-red-600 text-xs mt-1">{errors.returnDate}</p>}
              </div>

              <div>
                <label htmlFor="book-adults" className="block text-xs font-semibold text-navy-900 mb-1">
                  Adults (18+) <span className="text-red-500">*</span>
                </label>
                <input
                  id="book-adults"
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label htmlFor="book-children" className="block text-xs font-semibold text-navy-900 mb-1">
                  Children (0-17)
                </label>
                <input
                  id="book-children"
                  type="number"
                  min="0"
                  max="20"
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Travel Style & Budget */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-800 flex items-center gap-2 pb-2 border-b border-ivory-200">
              <CreditCard className="w-4 h-4 text-teal-600" />
              <span>4. Voyage Style & Accommodation Tier</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label htmlFor="book-type" className="block text-xs font-semibold text-navy-900 mb-1">
                  Travel Category
                </label>
                <select
                  id="book-type"
                  value={travelType}
                  onChange={(e) => setTravelType(e.target.value as TravelType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 focus:ring-2 focus:ring-gold-500"
                >
                  <option value="LUXURY">Bespoke Ultra-Luxury</option>
                  <option value="HONEYMOON">Romance & Honeymoon</option>
                  <option value="ADVENTURE">Expedition & Safari</option>
                  <option value="CULTURAL">Heritage & Fine Arts</option>
                  <option value="FAMILY">Private Family Retreat</option>
                  <option value="WELLNESS">Holistic Wellness & Spa</option>
                </select>
              </div>

              <div>
                <label htmlFor="book-budget" className="block text-xs font-semibold text-navy-900 mb-1">
                  Target Budget Range
                </label>
                <select
                  id="book-budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 focus:ring-2 focus:ring-gold-500"
                >
                  <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                  <option value="$10,000 - $20,000">$10,000 - $20,000</option>
                  <option value="$20,000 - $35,000">$20,000 - $35,000</option>
                  <option value="$35,000 - $50,000">$35,000 - $50,000</option>
                  <option value="$50,000+ (Ultra-Bespoke)">$50,000+ (Ultra-Bespoke)</option>
                </select>
              </div>

              <div>
                <label htmlFor="book-accommodation" className="block text-xs font-semibold text-navy-900 mb-1">
                  Accommodation Tier
                </label>
                <select
                  id="book-accommodation"
                  value={accommodationPref}
                  onChange={(e) => setAccommodationPref(e.target.value as AccommodationPref)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 focus:ring-2 focus:ring-gold-500"
                >
                  <option value="FIVE_STAR_LUXURY">5-Star Luxury Palaces / Suites</option>
                  <option value="PRIVATE_VILLA">Exclusive Private Villa with Staff</option>
                  <option value="BOUTIQUE_HOTEL">Historic Boutique & Relais</option>
                  <option value="ECO_LODGE">Ultra-Luxury Safari Tent / Eco-Lodge</option>
                  <option value="FOUR_STAR_PREMIUM">Premium 4-Star Comfort</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Notes & Consent */}
          <div className="space-y-6">
            <div>
              <label htmlFor="book-requirements" className="block text-xs font-semibold text-navy-900 mb-1">
                Special Requests, Milestone Celebrations or Aviation Preferences
              </label>
              <textarea
                id="book-requirements"
                rows={3}
                value={additionalRequirements}
                onChange={(e) => setAdditionalRequirements(e.target.value)}
                placeholder="Mention private aviation tarmac transfers, anniversary surprises, private yacht days, dietary restrictions..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-2">
                  Preferred Contact Method
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-navy-800 cursor-pointer">
                    <input
                      type="radio"
                      name="bookContact"
                      value="EMAIL"
                      checked={preferredContact === 'EMAIL'}
                      onChange={() => setPreferredContact('EMAIL')}
                      className="text-gold-600 focus:ring-gold-500"
                    />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-navy-800 cursor-pointer">
                    <input
                      type="radio"
                      name="bookContact"
                      value="PHONE"
                      checked={preferredContact === 'PHONE'}
                      onChange={() => setPreferredContact('PHONE')}
                      className="text-gold-600 focus:ring-gold-500"
                    />
                    <span>Telephone</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-navy-800 cursor-pointer">
                    <input
                      type="radio"
                      name="bookContact"
                      value="WHATSAPP"
                      checked={preferredContact === 'WHATSAPP'}
                      onChange={() => setPreferredContact('WHATSAPP')}
                      className="text-gold-600 focus:ring-gold-500"
                    />
                    <span>WhatsApp</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    id="book-privacyConsent"
                    type="checkbox"
                    required
                    checked={privacyConsent}
                    onChange={(e) => {
                      setPrivacyConsent(e.target.checked);
                      if (errors.privacyConsent) setErrors({ ...errors, privacyConsent: '' });
                    }}
                    className="mt-0.5 rounded border-ivory-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs text-navy-700 leading-tight">
                    I agree to the{' '}
                    <Link to="/privacy-policy" target="_blank" className="text-teal-700 underline font-medium">
                      Privacy Policy
                    </Link>{' '}
                    and authorize Wanderlust to process my travel preferences. <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.privacyConsent && <p className="text-red-600 text-xs mt-1">{errors.privacyConsent}</p>}
              </div>
            </div>
          </div>

          {/* Submission Button */}
          <div className="pt-6 border-t border-ivory-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-navy-700">
              <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Inquiry request only. No immediate payment required.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-navy-900 hover:from-teal-700 hover:to-navy-950 text-white text-sm font-semibold shadow-luxury flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                  <span>Securing Itinerary...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-gold-400" />
                  <span>Submit Bespoke Consultation Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          setSuccessInquiry(null);
        }}
        inquiry={successInquiry}
      />

      <ErrorModal
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        message={errorMessage || ''}
        errors={serverFieldErrors}
      />
    </div>
  );
};
