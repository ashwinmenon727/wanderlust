import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Copy, Check, X, Compass, Calendar, Users, ArrowRight } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: {
    reference: string;
    customerName: string;
    destination?: { name: string; country: string } | null;
    package?: { title: string; price: number } | null;
    departureDate: string;
    returnDate: string;
    adults: number;
    children: number;
    status: string;
  } | null;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, inquiry }) => {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      // Focus the close button or first focusable element
      setTimeout(() => {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) {
          focusable[0].focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }

        // Trap focus inside modal
        if (e.key === 'Tab' && modalRef.current) {
          const focusables = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
        if (previouslyFocusedElement.current) {
          previouslyFocusedElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !inquiry) return null;

  const copyReference = () => {
    navigator.clipboard.writeText(inquiry.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReturnHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-950/80 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-xl bg-ivory-50 rounded-2xl shadow-2xl border border-gold-500/20 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-teal-500 via-gold-500 to-teal-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-navy-700 hover:text-navy-950 hover:bg-ivory-200 focus:outline-none focus:ring-2 focus:ring-gold-500 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto mb-4 text-teal-600 shadow-teal-glow">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2
            id="success-modal-title"
            className="text-2xl sm:text-3xl font-serif text-center text-navy-900 font-bold mb-2"
          >
            Voyage Inquiry Received
          </h2>
          <p className="text-center text-navy-700 text-sm sm:text-base mb-6">
            Thank you, <strong className="text-navy-900">{inquiry.customerName}</strong>. Your bespoke travel request has been safely cataloged with our private concierge team.
          </p>

          {/* Reference Badge */}
          <div className="bg-white rounded-xl p-4 border border-ivory-300 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-navy-600 font-semibold block">
                Unique Inquiry Reference
              </span>
              <span className="font-mono text-xl font-bold text-teal-700 tracking-wide">
                {inquiry.reference}
              </span>
            </div>
            <button
              onClick={copyReference}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-navy-800 bg-ivory-100 hover:bg-ivory-200 border border-ivory-300 transition-colors"
              aria-label="Copy inquiry reference code"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-teal-600" />
                  <span className="text-teal-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-navy-700" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Summary Box */}
          <div className="bg-white/80 rounded-xl p-4 border border-ivory-300 space-y-2.5 text-xs sm:text-sm text-navy-800 mb-6">
            {inquiry.destination && (
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-gold-600 flex-shrink-0" />
                <span>
                  <strong>Destination:</strong> {inquiry.destination.name}, {inquiry.destination.country}
                </span>
              </div>
            )}
            {inquiry.package && (
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>
                  <strong>Selected Package:</strong> {inquiry.package.title}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-navy-600 flex-shrink-0" />
              <span>
                <strong>Dates:</strong> {inquiry.departureDate} &rarr; {inquiry.returnDate}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-navy-600 flex-shrink-0" />
              <span>
                <strong>Travelers:</strong> {inquiry.adults} Adults{inquiry.children > 0 ? `, ${inquiry.children} Children` : ''}
              </span>
            </div>
          </div>

          {/* Important Explicit Reservation Notice */}
          <div className="bg-amber-50 border-l-4 border-gold-600 p-3.5 rounded-r-lg mb-6 text-xs text-amber-900 leading-relaxed">
            <strong>Please Note:</strong> This inquiry is a personalized request and does not constitute a confirmed reservation. A private travel advisor will contact you within <strong>24 business hours</strong> with a verified itinerary proposal and availability.
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
            <button
              onClick={handleReturnHome}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl text-sm font-semibold text-navy-800 bg-white border border-ivory-300 hover:bg-ivory-100 transition-colors text-center"
            >
              Return to Home
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>Continue Exploring</span>
              <ArrowRight className="w-4 h-4 text-gold-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
