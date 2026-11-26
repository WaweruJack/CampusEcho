import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, Eye, EyeOff, GraduationCap, Lock, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPasswordChecks, validateStrongPassword } from '../lib/validation';

export default function ResetPasswordPage() {
  const { user, loading, isPasswordRecovery, updatePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState(false);

  const urlParams = new URLSearchParams(
    (location.hash ? location.hash.replace(/^#/, '') : '') || location.search
  );
  const linkError = urlParams.get('error_description');

  const passwordChecks = getPasswordChecks(newPassword);
  const allChecksPass = Object.values(passwordChecks).every(Boolean);
  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  // Allow password update only when Supabase recovery session or authenticated user session is active
  const hasValidRecoverySession = !linkError && Boolean(isPasswordRecovery || user);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const passErr = validateStrongPassword(newPassword);
    if (passErr) {
      setError(passErr);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const res = await updatePassword(newPassword);
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    setUpdated(true);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Login</span>
        </Link>

        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900 dark:bg-indigo-600 text-white">
              <GraduationCap className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
              CampusEcho
            </span>
          </div>

          <p className="text-xs font-medium text-indigo-700 dark:text-cyan-400 mt-3">
            Update Password · Meru University of Science and Technology
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Set a new password
          </h1>

          {loading ? (
            <div className="mt-6 py-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Verifying your password reset link...
            </div>
          ) : updated ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Password Updated</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  Your CampusEcho account password has been updated. You can now continue into your student portal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(user ? '/dashboard' : '/login', { replace: true })}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                {user ? 'Go to Student Dashboard' : 'Continue to Login'}
              </button>
            </div>
          ) : !hasValidRecoverySession ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {linkError
                  ? `${linkError}. Please request a fresh reset link to your @students.must.ac.ke email.`
                  : 'This password reset link is missing or has expired. Please request a fresh reset link to your @students.must.ac.ke email.'}
              </div>
              <Link
                to="/forgot-password"
                className="block w-full text-center py-2.5 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                Request New Reset Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {user?.email && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Updating password for{' '}
                  <span className="font-semibold text-slate-900 dark:text-white font-mono-nums">
                    {user.email}
                  </span>
                </p>
              )}

              <div>
                <label htmlFor="reset-new-pass" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="reset-new-pass"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Create a strong new password"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reset-confirm-pass" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  id="reset-confirm-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Re-enter your new password"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {passwordMismatch && (
                  <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                    Passwords do not match.
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                {[
                  { ok: passwordChecks.minLength, label: 'At least 8 characters' },
                  { ok: passwordChecks.hasUpper, label: 'One uppercase letter (A–Z)' },
                  { ok: passwordChecks.hasLower, label: 'One lowercase letter (a–z)' },
                  { ok: passwordChecks.hasNumber, label: 'One number (0–9)' },
                  { ok: passwordChecks.hasSpecial, label: 'One special character (!@#$)' },
                ].map((rule) => (
                  <span
                    key={rule.label}
                    className={`flex items-center gap-1.5 ${
                      rule.ok ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {rule.ok ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
                    <span>{rule.label}</span>
                  </span>
                ))}
              </div>

              {error && (
                <div className="rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !allChecksPass || passwordMismatch}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
