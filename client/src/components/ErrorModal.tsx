import React, { useEffect, useRef } from 'react';
import { AlertCircle, X, RotateCcw } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title = 'Inquiry Submission Incomplete',
  message,
  errors,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-950/80 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="h-2 bg-red-600" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          aria-label="Close error notice"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 text-red-600">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h3 id="error-modal-title" className="text-xl sm:text-2xl font-serif text-center text-slate-900 font-bold mb-2">
            {title}
          </h3>
          <p className="text-center text-slate-600 text-sm mb-4 leading-relaxed">
            {message}
          </p>

          {errors && errors.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-xs text-red-900 space-y-1.5 max-h-48 overflow-y-auto">
              <span className="font-semibold block mb-1">Please review the following requirements:</span>
              <ul className="list-disc pl-4 space-y-1">
                {errors.map((err, idx) => (
                  <li key={idx}>
                    <strong className="capitalize">{err.field.replace('.', ' ')}:</strong> {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-3 mb-6 text-xs text-slate-600 text-center">
            Your entered itinerary details and preferences have been preserved.
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Review & Correct Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
