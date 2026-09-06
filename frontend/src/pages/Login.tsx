import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  X,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { useTravelSettings } from '../context/TravelSettingsContext';

export const Login: React.FC = () => {
  const { t } = useTravelSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    if (res.success) {
      navigate(redirect);
    } else {
      setError(res.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  const handleFillDemo = (role: 'demo' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@trippilot.ai');
      setPassword('Admin@123456');
    } else {
      setEmail('demo@trippilot.ai');
      setPassword('Demo@123456');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);
    try {
      const res = await authService.forgotPassword(forgotEmail);
      if (res.success !== false) {
        setForgotSuccess(true);
        // In demo mode, show the reset token directly
        if (res.data?.demo_reset_token) {
          setDemoToken(res.data.demo_reset_token);
        }
      } else {
        setForgotError((res as any).message || 'Failed to send reset email.');
      }
    } catch (err: any) {
      // Even on failure, show success to avoid email enumeration
      setForgotSuccess(true);
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotEmail('');
    setForgotError(null);
    setForgotSuccess(false);
    setDemoToken(null);
  };

  return (
    <>
      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900">{t('auth.forgot_title', 'Forgot Password')}</h2>
                  <p className="text-xs text-slate-500">{t('auth.forgot_sub', 'Reset via email link')}</p>
                </div>
              </div>
              <button onClick={closeForgot} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {forgotSuccess ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-14 h-14 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">{t('auth.check_inbox', 'Check Your Inbox')}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      If <strong>{forgotEmail}</strong> is registered, you'll receive a reset link within a few minutes.
                    </p>
                  </div>
                  {demoToken && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-left">
                      <p className="text-[10px] font-bold text-amber-800 uppercase mb-1">🧪 Demo Mode — Reset Link</p>
                      <p className="text-[10px] text-amber-700 break-all">
                        In a real app, the reset link would be sent by email. For demo purposes, use this token:
                      </p>
                      <Link
                        to={`/reset-password?token=${demoToken}`}
                        onClick={closeForgot}
                        className="mt-2 block text-[10px] font-mono font-bold text-blue-600 hover:underline break-all"
                      >
                        /reset-password?token={demoToken}
                      </Link>
                    </div>
                  )}
                  <button
                    onClick={closeForgot}
                    className="btn-secondary text-xs py-2 px-4 font-bold w-full"
                  >
                    {t('auth.back_to_login', 'Back to Login')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-slate-600">
                    {t('auth.forgot_desc', "Enter the email address associated with your TripPilot account and we'll send you a password reset link.")}
                  </p>

                  {forgotError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {forgotError}
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">{t('auth.email_label', 'Email Address')}</label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 focus-within:bg-white transition-colors">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="bg-transparent text-xs text-slate-900 w-full focus:outline-none placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={closeForgot} className="btn-secondary flex-1 text-xs py-2.5 font-bold">
                      {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="btn-primary flex-1 text-xs py-2.5 font-bold flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('common.sending', 'Sending...')}</>
                      ) : (
                        t('auth.send_reset_link', 'Send Reset Link')
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md surface-card p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 bg-white">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto shadow-sm text-white">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('auth.welcome_back', 'Welcome Back to TripPilot')}</h2>
            <p className="text-xs text-slate-500">{t('auth.sign_in_sub', 'Sign in to access your saved trips, vouchers, and fares.')}</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                {t('auth.email_label', 'Email Address')}
              </label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 focus-within:bg-white transition-colors">
                <Mail className="w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="bg-transparent text-xs text-slate-900 w-full focus:outline-none placeholder-slate-400"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">{t('auth.password_label', 'Password')}</label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-[11px] text-blue-600 hover:underline font-semibold"
                >
                  {t('auth.forgot_password', 'Forgot password?')}
                </button>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 focus-within:bg-white transition-colors">
                <Lock className="w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent text-xs text-slate-900 w-full focus:outline-none placeholder-slate-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-xs font-bold shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {t('auth.signing_in', 'Signing in...')}</>
              ) : (
                <><span>{t('auth.sign_in', 'Sign In')}</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo Quick Fill */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">{t('auth.quick_demo', 'Quick Demo Logins:')}</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('demo')}
                className="py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors"
              >
                {t('auth.demo_traveller', 'Demo Traveller')}
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-blue-700 transition-colors"
              >
                {t('auth.admin_console', 'Admin Console')}
              </button>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500">
            {t('auth.no_account', "Don't have an account?")}{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              {t('auth.sign_up_free', 'Sign up for free')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
