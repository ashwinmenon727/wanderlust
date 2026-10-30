import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Key, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect immediately
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await login({ email: email.trim(), password });
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid administrator email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-ivory-50">
      <SEO
        title="Concierge Portal Login"
        description="Secure administrator portal for Wanderlust Luxury Travel management."
      />

      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-luxury border border-ivory-300 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-navy-950 flex items-center justify-center mx-auto text-gold-400 shadow-md">
            <Lock className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-950">
            Concierge Portal
          </h1>
          <p className="text-xs text-navy-600">
            Authorized staff and travel director access only.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold text-navy-900 mb-1">
              Administrator Email
            </label>
            <div className="relative">
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wanderlust.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 focus:ring-2 focus:ring-gold-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label htmlFor="admin-pass" className="block text-xs font-semibold text-navy-900 mb-1">
              Secret Password
            </label>
            <div className="relative">
              <input
                id="admin-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 focus:ring-2 focus:ring-gold-500"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-navy-900 hover:bg-navy-850 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
            ) : (
              <>
                <span>Authenticate Session</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-ivory-200 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-navy-600">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Rate-limited & protected endpoint</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Default credentials configured via <code>npm run admin:create</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
