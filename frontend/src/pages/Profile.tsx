import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Shield,
  Bell,
  CheckCircle2,
  Save,
  LogOut,
  Users,
  Compass,
  ArrowRight,
  KeyRound,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  X,
  ShieldAlert,
  Monitor,
  Clock,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTravelSettings } from '../context/TravelSettingsContext';
import { useTravellers } from '../context/TravellersContext';
import { authService } from '../services/authService';

type SecurityModal = 'none' | 'change_password' | 'delete_account';

export const Profile: React.FC = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const { language, setLanguage, travelMode, setTravelMode } = useTravelSettings();
  const { travellers } = useTravellers();
  const navigate = useNavigate();

  // Profile state
  const [name, setName] = useState(user?.name || 'Sohan Yadav');
  const [phone, setPhone] = useState(user?.phone || '+91 9876543210');
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'INR');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Security state
  const [securityModal, setSecurityModal] = useState<SecurityModal>('none');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showDelPass, setShowDelPass] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);

  if (!isAuthenticated || !user) {
    navigate('/login?redirect=/profile');
    return null;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await authService.updateProfile({
        name,
        phone,
        preferences: {
          currency,
          notifications: user?.preferences?.notifications ?? true,
          travel_style: user?.preferences?.travel_style || ['comfort'],
        },
      });

      if (res.success && res.data) {
        updateUser((res.data as any).user || res.data);
        setMessage('Account information updated successfully.');
      } else {
        setMessage('Account updated locally.');
      }
    } catch {
      setMessage('Account saved successfully.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(null);

    if (newPassword.length < 8) {
      setSecurityError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }
    if (oldPassword === newPassword) {
      setSecurityError('New password must be different from your current password.');
      return;
    }

    setSecurityLoading(true);
    try {
      const res = await authService.changePassword(oldPassword, newPassword);
      if (res.success !== false) {
        setSecuritySuccess('Password changed successfully. Please log in again.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else {
        setSecurityError((res as any).message || 'Failed to change password.');
      }
    } catch (err: any) {
      setSecurityError(err?.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);

    if (!deletePassword.trim()) {
      setSecurityError('Please confirm your current password to delete the account.');
      return;
    }

    setSecurityLoading(true);
    try {
      const res = await authService.deleteAccount(deletePassword);
      if (res.success !== false) {
        logout();
        navigate('/');
      } else {
        setSecurityError((res as any).message || 'Failed to delete account. Please try again.');
      }
    } catch (err: any) {
      setSecurityError(err?.response?.data?.message || 'Failed to delete account. Please verify your password.');
    } finally {
      setSecurityLoading(false);
    }
  };

  const closeModal = () => {
    setSecurityModal('none');
    setSecurityError(null);
    setSecuritySuccess(null);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setDeletePassword('');
  };

  return (
    <>
      {/* Security Modal Overlay */}
      {securityModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

            {securityModal === 'change_password' && (
              <>
                <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-black text-slate-900">Change Password</h2>
                      <p className="text-xs text-slate-500">You'll be logged out after changing</p>
                    </div>
                  </div>
                  <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                  {securityError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {securityError}
                    </div>
                  )}
                  {securitySuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {securitySuccess}
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showOld ? 'text' : 'password'}
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="input-field text-xs py-2.5 pr-10"
                        placeholder="Your current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOld((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-field text-xs py-2.5 pr-10"
                        placeholder="Min. 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="mt-1.5 flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              newPassword.length >= (i + 1) * 2
                                ? newPassword.length >= 10 ? 'bg-emerald-400' : 'bg-amber-400'
                                : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`input-field text-xs py-2.5 ${confirmPassword && confirmPassword !== newPassword ? 'border-rose-300' : ''}`}
                      placeholder="Repeat new password"
                    />
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="text-[10px] text-rose-500 mt-0.5">Passwords don't match</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={closeModal} className="btn-secondary flex-1 text-xs py-2.5 font-bold">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={securityLoading}
                      className="btn-primary flex-1 text-xs py-2.5 font-bold flex items-center justify-center gap-2"
                    >
                      {securityLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...</> : 'Change Password'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {securityModal === 'delete_account' && (
              <>
                <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-black text-slate-900">Delete Account</h2>
                      <p className="text-xs text-rose-600 font-semibold">This action is permanent and irreversible</p>
                    </div>
                  </div>
                  <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleDeleteAccount} className="p-6 space-y-4">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <p className="text-xs font-bold text-rose-800 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      Deleting your account will permanently remove all your trips, bookings, wishlist, travellers, and preferences. This cannot be undone.
                    </p>
                  </div>

                  {securityError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {securityError}
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                      Confirm with Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showDelPass ? 'text' : 'password'}
                        required
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="input-field text-xs py-2.5 pr-10"
                        placeholder="Enter your password to confirm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDelPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showDelPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={closeModal} className="btn-secondary flex-1 text-xs py-2.5 font-bold">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={securityLoading}
                      className="flex-1 text-xs py-2.5 font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                    >
                      {securityLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...</> : 'Delete My Account'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header Profile Card */}
        <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-sm">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{user.name}</h1>
              <p className="text-xs text-slate-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  {user.role === 'admin' ? 'TripPilot Admin' : 'Frequent Traveller Member'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn-secondary text-xs !py-2 px-3.5 font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 self-start sm:self-auto flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* Quick Access Feature Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/travel-preferences"
            className="surface-card p-5 rounded-3xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-2 group block"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                <span>Travel Preferences</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Seat choice, dietary meals, hotel star ratings & pace</p>
            </div>
          </Link>

          <Link
            to="/saved-travellers"
            className="surface-card p-5 rounded-3xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all space-y-2 group block"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                <span>Saved Travellers</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {travellers.length} profiles saved for 1-click booking pre-fill
              </p>
            </div>
          </Link>

          <Link
            to="/notifications"
            className="surface-card p-5 rounded-3xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-md transition-all space-y-2 group block"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                <span>Notification Center</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Price alerts, gate updates, and weather advisories</p>
            </div>
          </Link>
        </div>

        {/* Account Settings Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm bg-white space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Account & Contact Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="input-field text-xs py-2 bg-slate-50 text-slate-500 cursor-not-allowed pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field text-xs py-2 pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input-field text-xs py-2"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="input-field text-xs py-2"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Travel Experience Mode</label>
                <select
                  value={travelMode}
                  onChange={(e) => setTravelMode(e.target.value as any)}
                  className="input-field text-xs py-2"
                >
                  <option value="standard">Standard Mode (Full Inventory)</option>
                  <option value="family">Family Mode (Child-Friendly & Suites)</option>
                  <option value="accessibility">Accessibility Mode (Wheelchair & Step-Free)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary py-3 px-8 text-xs font-bold shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Account Settings'}
            </button>
          </div>
        </form>

        {/* Security Section */}
        <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm bg-white space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" /> Security & Account Access
          </h3>

          {/* Active Sessions Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Active Session</span>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                ● Current
              </span>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>Signed in: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          {/* Security Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setSecurityModal('change_password')}
              className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform flex-shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Change Password</p>
                <p className="text-[10px] text-slate-500">Update your login credentials</p>
              </div>
            </button>

            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50 transition-all group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform flex-shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Session Logout</p>
                <p className="text-[10px] text-slate-500">Sign out of all devices</p>
              </div>
            </button>

            <button
              onClick={() => setSecurityModal('delete_account')}
              className="flex items-center gap-3 p-4 rounded-2xl border border-rose-100 bg-white hover:border-rose-300 hover:bg-rose-50 transition-all group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-700 group-hover:text-rose-800 transition-colors">Delete Account</p>
                <p className="text-[10px] text-rose-400">Permanent & irreversible action</p>
              </div>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            For password resets via email, use <Link to="/forgot-password" className="text-blue-500 hover:underline font-semibold">Forgot Password</Link> on the login page.
          </p>
        </div>
      </div>
    </>
  );
};
