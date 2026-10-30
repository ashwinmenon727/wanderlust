import React, { useState, useEffect } from 'react';
import {
  X,
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
import { SuccessModal } from './SuccessModal';
import { ErrorModal } from './ErrorModal';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDestinationId?: string;
  initialPackageId?: string;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  initialDestinationId,
  initialPackageId,
}) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Form State (Preserved on error!)
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [destinationId, setDestinationId] = useState(initialDestinationId || '');
  const [packageId, setPackageId] = useState(initialPackageId || '');
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

  // Modal feedback states
  const [successInquiry, setSuccessInquiry] = useState<any | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<Array<{ field: string; message: string }> | undefined>(undefined);

  // Load destinations & packages when opened
  useEffect(() => {
    if (isOpen) {
      setIsLoadingOptions(true);
      Promise.all([api.getDestinations(), api.getPackages()])
        .then(([destRes, pkgRes]) => {
          if (destRes.success) setDestinations(destRes.data);
          if (pkgRes.success) setPackages(pkgRes.data);
        })
        .catch((err) => console.error('Failed to load inquiry options:', err))
        .finally(() => setIsLoadingOptions(false));
    }
  }, [isOpen]);

  // Sync initial props if they change
  useEffect(() => {
    if (initialDestinationId) setDestinationId(initialDestinationId);
    if (initialPackageId) setPackageId(initialPackageId);
  }, [initialDestinationId, initialPackageId]);

  if (!isOpen) {
    return (
      <>
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
      </>
    );
  }

  // Filter packages based on selected destination
  const filteredPackages = destinationId
    ? packages.filter((p) => p.destinationId === destinationId)
    : packages;

  // Client-side validation
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

    if (!validate()) {
      return;
    }

    if (isSubmitting) return; // Prevent duplicate submission

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
        // Success: Close inquiry modal and trigger success modal
        setSuccessInquiry(response.inquiry);
        setIsSuccessOpen(true);
        onClose();

        // Reset fields after confirmed success
        setCustomerName('');
        setEmail('');
        setPhone('');
        setAdditionalRequirements('');
        setPrivacyConsent(false);
      } else {
        throw new Error(response.message || 'Submission could not be completed.');
      }
    } catch (err: any) {
      console.error('Inquiry submission error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while saving your inquiry. Your details have been preserved.');
      setServerFieldErrors(err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-md overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-modal-title"
      >
        <div className="relative w-full max-w-3xl bg-ivory-50 rounded-2xl shadow-2xl border border-gold-500/30 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Bar */}
          <div className="bg-navy-900 text-white p-6 sm:p-8 relative">
            <div className="flex items-center gap-2 text-gold-400 text-xs font-semibold uppercase tracking-widest mb-1">
              <Compass className="w-4 h-4" />
              <span>Bespoke Voyage Consultation</span>
            </div>
            <h2 id="inquiry-modal-title" className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Design Your Private Expedition
            </h2>
            <p className="text-navy-100 text-xs sm:text-sm mt-1 max-w-xl">
              Complete the consultation form below. A dedicated private concierge will curate your personalized itinerary proposal.
            </p>

            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full text-navy-100 hover:text-white hover:bg-navy-800 transition-colors focus:ring-2 focus:ring-gold-400"
              aria-label="Close consultation modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8" noValidate>
            {/* Section 1: Contact & Guest Details */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-800 flex items-center gap-2 mb-4 pb-2 border-b border-ivory-200">
                <Users className="w-4 h-4 text-teal-600" />
                <span>1. Guest & Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label htmlFor="modal-customerName" className="block text-xs font-semibold text-navy-900 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-customerName"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) setErrors({ ...errors, customerName: '' });
                    }}
                    placeholder="e.g. Lady Eleanor Vance"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:ring-2 focus:ring-gold-500 transition-all ${
                      errors.customerName ? 'border-red-500 bg-red-50/30' : 'border-ivory-300'
                    }`}
                  />
                  {errors.customerName && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor="modal-email" className="block text-xs font-semibold text-navy-900 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    placeholder="eleanor@estate.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:ring-2 focus:ring-gold-500 transition-all ${
                      errors.email ? 'border-red-500 bg-red-50/30' : 'border-ivory-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor="modal-phone" className="block text-xs font-semibold text-navy-900 mb-1">
                    Phone / Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    placeholder="+1 (555) 019-2834"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:ring-2 focus:ring-gold-500 transition-all ${
                      errors.phone ? 'border-red-500 bg-red-50/30' : 'border-ivory-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Destination & Tour Package */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-800 flex items-center gap-2 mb-4 pb-2 border-b border-ivory-200">
                <Compass className="w-4 h-4 text-teal-600" />
                <span>2. Desired Destination & Itinerary</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-destination" className="block text-xs font-semibold text-navy-900 mb-1">
                    Selected Destination
                  </label>
                  <select
                    id="modal-destination"
                    value={destinationId}
                    onChange={(e) => {
                      setDestinationId(e.target.value);
                      setPackageId(''); // reset package when destination changes
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-white text-sm focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="">-- Custom / Multi-Destination Journey --</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}, {d.country} ({d.continent})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-package" className="block text-xs font-semibold text-navy-900 mb-1">
                    Selected Tour Package (Optional)
                  </label>
                  <select
                    id="modal-package"
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-white text-sm focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="">-- Fully Bespoke Custom Itinerary --</option>
                    {filteredPackages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} (${p.price.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Schedule & Party Size */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-800 flex items-center gap-2 mb-4 pb-2 border-b border-ivory-200">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>3. Dates & Party Size</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="modal-departureDate" className="block text-xs font-semibold text-navy-900 mb-1">
                    Departure Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-departureDate"
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => {
                      setDepartureDate(e.target.value);
                      if (errors.departureDate) setErrors({ ...errors, departureDate: '' });
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:ring-2 focus:ring-gold-500 ${
                      errors.departureDate ? 'border-red-500 bg-red-50/30' : 'border-ivory-300'
                    }`}
                  />
                  {errors.departureDate && (
                    <p className="text-red-600 text-xs mt-1">{errors.departureDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="modal-returnDate" className="block text-xs font-semibold text-navy-900 mb-1">
                    Return Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-returnDate"
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => {
                      setReturnDate(e.target.value);
                      if (errors.returnDate) setErrors({ ...errors, returnDate: '' });
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:ring-2 focus:ring-gold-500 ${
                      errors.returnDate ? 'border-red-500 bg-red-50/30' : 'border-ivory-300'
                    }`}
                  />
                  {errors.returnDate && (
                    <p className="text-red-600 text-xs mt-1">{errors.returnDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="modal-adults" className="block text-xs font-semibold text-navy-900 mb-1">
                    Adults (18+) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-adults"
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-white text-sm focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label htmlFor="modal-children" className="block text-xs font-semibold text-navy-900 mb-1">
                    Children (0-17)
                  </label>
                  <input
                    id="modal-children"
                    type="number"
                    min="0"
                    max="20"
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-white text-sm focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Travel Style & Accommodation */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-800 flex items-center gap-2 mb-4 pb-2 border-b border-ivory-200">
                <CreditCard className="w-4 h-4 text-teal-600" />
                <span>4. Voyage Style & Preferences</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="modal-travelType" className="block text-xs font-semibold text-navy-900 mb-1">
                    Travel Type
                  </label>
                  <select
                    id="modal-travelType"
                    value={travelType}
                    onChange={(e) => setTravelType(e.target.value as TravelType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-white text-sm focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="LUXURY">Bespoke Ultra-Luxury</option>
                    <option value="HONEYMOON">Romance & Honeymoon</option>
                    <option value="ADVENTURE">Expedition & Safari</option>
                    <option value="CULTURAL">Heritage & Fine Arts</option>
                    <option value="FAMILY">Private Family Retreat</option>
                    <option value="WELLNESS">Holistic Wellness & Spa</option>
                    <option value="SOLO">Solo Discovery</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-budget" className="block text-xs font-semibold text-navy-900 mb-1">
                    Target Budget Range
                  </label>
                  <select
                    id="modal-budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-white text-sm focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                    <option value="$10,000 - $20,000">$10,000 - $20,000</option>
                    <option value="$20,000 - $35,000">$20,000 - $35,000</option>
                    <option value="$35,000 - $50,000">$35,000 - $50,000</option>
                    <option value="$50,000+ (Ultra-Bespoke)">$50,000+ (Ultra-Bespoke)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-accommodation" className="block text-xs font-semibold text-navy-900 mb-1">
                    Accommodation Tier
                  </label>
                  <select
                    id="modal-accommodation"
                    value={accommodationPref}
                    onChange={(e) => setAccommodationPref(e.target.value as AccommodationPref)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-white text-sm focus:ring-2 focus:ring-gold-500"
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

            {/* Section 5: Additional Requirements & Contact Preference */}
            <div>
              <div className="mb-4">
                <label htmlFor="modal-requirements" className="block text-xs font-semibold text-navy-900 mb-1">
                  Special Requirements, Flight Preferences or Milestone Celebrations
                </label>
                <textarea
                  id="modal-requirements"
                  rows={3}
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  placeholder="Tell us about dietary preferences, private aviation needs, anniversary celebrations, or specific activities you wish to experience..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 bg-white text-sm focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-2">
                    Preferred Communication Channel
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-navy-800 cursor-pointer">
                      <input
                        type="radio"
                        name="preferredContact"
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
                        name="preferredContact"
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
                        name="preferredContact"
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
                  <label className="flex items-start gap-2.5 cursor-pointer mt-1">
                    <input
                      id="modal-privacyConsent"
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
                      I have read and consent to the{' '}
                      <a href="/privacy-policy" target="_blank" className="text-teal-700 underline font-medium">
                        Privacy Policy
                      </a>{' '}
                      and authorize Wanderlust to process my travel request. <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.privacyConsent && (
                    <p className="text-red-600 text-xs mt-1">{errors.privacyConsent}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submission Status & Disclaimer */}
            <div className="bg-ivory-100 rounded-xl p-4 text-xs text-navy-700 border border-ivory-200">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>No Immediate Payment Required:</strong> Submitting this inquiry initiates a private travel consultation. No credit card is required today. All itineraries are bespoke and subject to your final written approval.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-ivory-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-ivory-300 bg-white text-sm font-semibold text-navy-800 hover:bg-ivory-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-navy-900 hover:from-teal-700 hover:to-navy-950 text-white text-sm font-semibold shadow-luxury flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                    <span>Securing Itinerary...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-gold-400" />
                    <span>Submit Travel Inquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
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
    </>
  );
};
