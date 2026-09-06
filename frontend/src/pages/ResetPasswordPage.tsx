import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { authService } from '../services/authService';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const getStrength = (pw: string) => {
    if (pw.length === 0) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthColors = ['bg-rose-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-400'];
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Strong'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }
    if (!token) {
      setError('Invalid reset token. Please request a new password reset link.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(token, newPassword);
      if (res.success !== false) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError((res as any).message || 'Failed to reset password. The link may have expired.');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to reset password. The reset link may be invalid or expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-lg">
            TP
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">TripPilot</h1>
          <p className="text-xs text-slate-500 mt-0.5">AI-Powered Travel Platform</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Set New Password</h2>
                <p className="text-xs text-slate-500">Create a strong, unique password</p>
              </div>
            </div>

            {success ? (
              <div className="text-center space-y-4 py-6">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Password Reset Successful!</h3>
                  <p className="text-xs text-slate-500 mt-1">Redirecting you to the login page in a few seconds...</p>
                </div>
                <Link to="/login" className="btn-primary inline-flex items-center gap-2 text-xs px-6 py-2.5 font-bold">
                  <ShieldCheck className="w-4 h-4" /> Go to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {!token && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                    No reset token found in the URL. Please click the link from your email again.
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="input-field text-xs py-3 pr-10 w-full"
                      disabled={!token}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i < strength ? strengthColors[strength - 1] : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Strength: <span className="font-bold">{strengthLabels[strength - 1] || 'Too weak'}</span>
                        {' · '}Use uppercase, numbers & symbols for stronger security.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      className={`input-field text-xs py-3 pr-10 w-full ${
                        confirmPassword && confirmPassword !== newPassword ? 'border-rose-300' : ''
                      }`}
                      disabled={!token}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-[10px] text-rose-500 mt-0.5">Passwords don't match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full btn-primary py-3 text-sm font-black shadow-sm flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Resetting Password...</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Set New Password</>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          Password reset links expire after 1 hour for security.
        </p>
      </div>
    </div>
  );
};
